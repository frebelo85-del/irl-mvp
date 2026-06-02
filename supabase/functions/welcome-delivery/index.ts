import { pickMissionId } from "../_shared/scheduler.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { getUserIdFromRequest } from "../_shared/user-client.ts";

type WelcomeResult = {
  created: boolean;
  deliveryId?: string;
  delivered?: boolean;
  pushed?: boolean;
  skipped?: boolean;
  reason?: string;
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const cronSecret = Deno.env.get("CRON_SECRET") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  if (!cronSecret || !supabaseUrl) {
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const admin = createAdminClient();
  const now = new Date();

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("timezone, onboarding_completed")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    return jsonResponse({ error: profileError.message }, 500);
  }

  if (!profile?.onboarding_completed) {
    return jsonResponse(
      { created: false, skipped: true, reason: "onboarding_not_completed" },
      200,
    );
  }

  const { count: deliveryCount, error: countError } = await admin
    .from("mission_deliveries")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) {
    return jsonResponse({ error: countError.message }, 500);
  }

  if ((deliveryCount ?? 0) > 0) {
    return jsonResponse(
      { created: false, skipped: true, reason: "already_has_deliveries" },
      200,
    );
  }

  const { data: prefs, error: prefsError } = await admin
    .from("user_preferences")
    .select("categories, notifications_enabled")
    .eq("user_id", userId)
    .maybeSingle();

  if (prefsError) {
    return jsonResponse({ error: prefsError.message }, 500);
  }

  if (!prefs?.categories?.length) {
    return jsonResponse(
      { created: false, skipped: true, reason: "no_preferences" },
      200,
    );
  }

  const { data: missions, error: missionError } = await admin
    .from("missions")
    .select("id, category")
    .eq("locale", "en")
    .eq("is_active", true);

  if (missionError) {
    return jsonResponse({ error: missionError.message }, 500);
  }

  const categorySet = new Set(prefs.categories);
  const eligibleMissionIds = (missions ?? [])
    .filter((m) => categorySet.has(m.category))
    .map((m) => m.id);

  const missionId = pickMissionId(eligibleMissionIds, []);
  if (!missionId) {
    return jsonResponse(
      { created: false, skipped: true, reason: "no_mission_for_categories" },
      200,
    );
  }

  const scheduledAt = now.toISOString();
  const { data: inserted, error: insertError } = await admin
    .from("mission_deliveries")
    .insert({
      user_id: userId,
      mission_id: missionId,
      scheduled_at: scheduledAt,
      status: "scheduled",
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return jsonResponse(
      { error: insertError?.message ?? "insert failed" },
      500,
    );
  }

  let delivered = false;
  let pushed = false;

  if (prefs.notifications_enabled) {
    const { data: tokens } = await admin
      .from("push_tokens")
      .select("expo_push_token")
      .eq("user_id", userId);

    if (tokens?.length) {
      pushed = await invokeSendPush(supabaseUrl, cronSecret, inserted.id);
      if (pushed) {
        delivered = true;
      }
    }
  }

  if (!delivered) {
    const { error: deliverError } = await admin
      .from("mission_deliveries")
      .update({
        status: "delivered",
        delivered_at: scheduledAt,
      })
      .eq("id", inserted.id)
      .eq("status", "scheduled");

    if (deliverError) {
      return jsonResponse({ error: deliverError.message }, 500);
    }
    delivered = true;
  }

  const result: WelcomeResult = {
    created: true,
    deliveryId: inserted.id,
    delivered,
    pushed,
  };

  return jsonResponse(result, 200);
});

async function invokeSendPush(
  supabaseUrl: string,
  cronSecret: string,
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
    console.error("[welcome-delivery] send-push", deliveryId, await res.text());
    return false;
  }

  const json = (await res.json()) as {
    delivered?: boolean;
    sent?: number;
    skipped?: boolean;
  };
  return Boolean(json.delivered || (json.sent ?? 0) > 0);
}

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
