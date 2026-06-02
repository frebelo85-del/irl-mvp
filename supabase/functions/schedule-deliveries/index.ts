import { isAuthorizedCron, unauthorizedResponse } from "../_shared/auth.ts";
import {
  countDeliveriesInRollingWindow,
  isUnderWeeklyCap,
  meetsMinGap,
  missionIdsWithinCooldown,
  pickMissionId,
  pickRandomSlotTodayOrTomorrow,
  shouldSendImmediately,
  type DeliveryRow,
  type FrequencyTier,
} from "../_shared/scheduler.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";

type EligibleUser = {
  id: string;
  timezone: string;
  user_preferences: {
    categories: string[];
    active_hour_start: number;
    active_hour_end: number;
    frequency: FrequencyTier;
    notifications_enabled: boolean;
  };
  push_tokens: { expo_push_token: string }[];
};

type ScheduleResult = {
  processed: number;
  scheduled: number;
  skipped: number;
  pushesTriggered: number;
  reactivated: number;
  errors: string[];
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const cronSecret = Deno.env.get("CRON_SECRET") ?? "";
  if (!cronSecret) {
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!isAuthorizedCron(req, cronSecret)) {
    return unauthorizedResponse();
  }

  const supabase = createAdminClient();
  const now = new Date();
  const result: ScheduleResult = {
    processed: 0,
    scheduled: 0,
    skipped: 0,
    pushesTriggered: 0,
    reactivated: 0,
    errors: [],
  };

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  const { data: duePostponed, error: postponedError } = await supabase
    .from("mission_deliveries")
    .select("id")
    .eq("status", "postponed")
    .not("postponed_until", "is", null)
    .lte("postponed_until", now.toISOString());

  if (postponedError) {
    result.errors.push(`postponed: ${postponedError.message}`);
  } else {
    for (const row of duePostponed ?? []) {
      const { error: clearResponseError } = await supabase
        .from("mission_responses")
        .delete()
        .eq("delivery_id", row.id);

      if (clearResponseError) {
        result.errors.push(`${row.id}: clear response: ${clearResponseError.message}`);
        continue;
      }

      const { error: reactivateError } = await supabase
        .from("mission_deliveries")
        .update({
          status: "scheduled",
          scheduled_at: now.toISOString(),
          postponed_until: null,
        })
        .eq("id", row.id)
        .eq("status", "postponed");

      if (reactivateError) {
        result.errors.push(`${row.id}: ${reactivateError.message}`);
        continue;
      }

      result.reactivated += 1;
      const pushed = await invokeSendPush(
        supabaseUrl,
        cronSecret,
        serviceRoleKey,
        row.id,
      );
      if (pushed) {
        result.pushesTriggered += 1;
      } else {
        result.errors.push(`${row.id}: send-push after postpone failed`);
      }
    }
  }

  const { data: users, error: usersError } = await supabase
    .from("profiles")
    .select(
      `
      id,
      timezone,
      user_preferences!inner(
        categories,
        active_hour_start,
        active_hour_end,
        frequency,
        notifications_enabled
      ),
      push_tokens(expo_push_token)
    `,
    )
    .eq("onboarding_completed", true)
    .eq("user_preferences.notifications_enabled", true);

  if (usersError) {
    return new Response(JSON.stringify({ error: usersError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const eligible = (users ?? []).filter(
    (u) => Array.isArray(u.push_tokens) && u.push_tokens.length > 0,
  ) as EligibleUser[];

  for (const user of eligible) {
    result.processed += 1;
    const prefs = user.user_preferences;

    try {
      const window7d = new Date(
        now.getTime() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const window30d = new Date(
        now.getTime() - 30 * 24 * 60 * 60 * 1000,
      ).toISOString();

      const { data: deliveries7d, error: del7Error } = await supabase
        .from("mission_deliveries")
        .select("id, created_at, scheduled_at, mission_id, status")
        .eq("user_id", user.id)
        .gte("created_at", window7d)
        .order("scheduled_at", { ascending: false });

      if (del7Error) {
        result.errors.push(`${user.id}: ${del7Error.message}`);
        result.skipped += 1;
        continue;
      }

      const { data: deliveries30d, error: del30Error } = await supabase
        .from("mission_deliveries")
        .select("created_at, scheduled_at, mission_id")
        .eq("user_id", user.id)
        .gte("created_at", window30d);

      if (del30Error) {
        result.errors.push(`${user.id}: ${del30Error.message}`);
        result.skipped += 1;
        continue;
      }

      const deliveryRows: DeliveryRow[] = (deliveries7d ?? []).map((d) => ({
        created_at: d.created_at,
        scheduled_at: d.scheduled_at,
        mission_id: d.mission_id,
      }));

      const cooldownRows: DeliveryRow[] = (deliveries30d ?? []).map((d) => ({
        created_at: d.created_at,
        scheduled_at: d.scheduled_at,
        mission_id: d.mission_id,
      }));

      const weeklyCount = countDeliveriesInRollingWindow(deliveryRows, now, 7);
      if (!isUnderWeeklyCap(weeklyCount, prefs.frequency)) {
        result.skipped += 1;
        continue;
      }

      const lastScheduled = deliveries7d?.[0]?.scheduled_at ?? null;
      if (!meetsMinGap(lastScheduled, now)) {
        result.skipped += 1;
        continue;
      }

      const { data: missions, error: missionError } = await supabase
        .from("missions")
        .select("id, category")
        .eq("locale", "en")
        .eq("is_active", true);

      if (missionError) {
        result.errors.push(`${user.id}: ${missionError.message}`);
        result.skipped += 1;
        continue;
      }

      const categorySet = new Set(prefs.categories);
      const eligibleMissionIds = (missions ?? [])
        .filter((m) => categorySet.has(m.category))
        .map((m) => m.id);

      const recentMissionIds = missionIdsWithinCooldown(cooldownRows, now);
      const missionId = pickMissionId(eligibleMissionIds, recentMissionIds);
      if (!missionId) {
        result.skipped += 1;
        continue;
      }

      const scheduledAt = pickRandomSlotTodayOrTomorrow({
        now,
        timeZone: user.timezone || "UTC",
        activeHourStart: prefs.active_hour_start,
        activeHourEnd: prefs.active_hour_end,
      });

      const { data: inserted, error: insertError } = await supabase
        .from("mission_deliveries")
        .insert({
          user_id: user.id,
          mission_id: missionId,
          scheduled_at: scheduledAt.toISOString(),
          status: "scheduled",
        })
        .select("id")
        .single();

      if (insertError || !inserted) {
        result.errors.push(`${user.id}: ${insertError?.message ?? "insert failed"}`);
        result.skipped += 1;
        continue;
      }

      result.scheduled += 1;

      if (shouldSendImmediately(scheduledAt, now)) {
        const pushed = await invokeSendPush(
          supabaseUrl,
          cronSecret,
          serviceRoleKey,
          inserted.id,
        );
        if (pushed) {
          result.pushesTriggered += 1;
        } else {
          result.errors.push(`${user.id}: send-push failed for ${inserted.id}`);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown error";
      result.errors.push(`${user.id}: ${message}`);
      result.skipped += 1;
    }
  }

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

async function invokeSendPush(
  supabaseUrl: string,
  cronSecret: string,
  serviceRoleKey: string,
  deliveryId: string,
): Promise<boolean> {
  const url = `${supabaseUrl.replace(/\/$/, "")}/functions/v1/send-push`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cronSecret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ deliveryId }),
  });

  if (!res.ok) {
    console.error("[schedule-deliveries] send-push", deliveryId, await res.text());
    return false;
  }

  const json = (await res.json()) as { delivered?: boolean; sent?: number; skipped?: boolean };
  return Boolean(json.delivered || (json.sent ?? 0) > 0);
}
