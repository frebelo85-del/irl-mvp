import {
  isAuthorizedServiceOrCron,
  unauthorizedResponse,
} from "../_shared/auth.ts";
import { buildMissionDeepLink } from "../_shared/scheduler.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

type SendPushBody = {
  deliveryId?: string;
};

type ExpoTicket = {
  status: "ok" | "error";
  id?: string;
  message?: string;
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const cronSecret = Deno.env.get("CRON_SECRET") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!cronSecret || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!isAuthorizedServiceOrCron(req, cronSecret, serviceRoleKey)) {
    return unauthorizedResponse();
  }

  let body: SendPushBody;
  try {
    body = (await req.json()) as SendPushBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const deliveryId = body.deliveryId?.trim();
  if (!deliveryId) {
    return new Response(JSON.stringify({ error: "deliveryId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createAdminClient();

  const { data: delivery, error: deliveryError } = await supabase
    .from("mission_deliveries")
    .select("id, user_id, mission_id, status, scheduled_at")
    .eq("id", deliveryId)
    .maybeSingle();

  if (deliveryError) {
    return new Response(JSON.stringify({ error: deliveryError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!delivery) {
    return new Response(JSON.stringify({ error: "Delivery not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: prefs } = await supabase
    .from("user_preferences")
    .select("notifications_enabled")
    .eq("user_id", delivery.user_id)
    .maybeSingle();

  if (!prefs?.notifications_enabled) {
    return jsonOk({ skipped: true, reason: "notifications_disabled" });
  }

  const { data: mission, error: missionError } = await supabase
    .from("missions")
    .select("id, teaser")
    .eq("id", delivery.mission_id)
    .maybeSingle();

  if (missionError || !mission) {
    return new Response(
      JSON.stringify({ error: missionError?.message ?? "Mission not found" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const { data: tokens, error: tokensError } = await supabase
    .from("push_tokens")
    .select("expo_push_token")
    .eq("user_id", delivery.user_id);

  if (tokensError) {
    return new Response(JSON.stringify({ error: tokensError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!tokens?.length) {
    return jsonOk({ skipped: true, reason: "no_push_tokens" });
  }

  const deepLink = buildMissionDeepLink(mission.id, delivery.id);
  const messages = tokens.map((row) => ({
    to: row.expo_push_token,
    title: mission.teaser,
    body: "",
    data: { url: deepLink },
    sound: "default",
  }));

  const expoHeaders: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const expoToken = Deno.env.get("EXPO_ACCESS_TOKEN");
  if (expoToken) {
    expoHeaders.Authorization = `Bearer ${expoToken}`;
  }

  const expoRes = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: expoHeaders,
    body: JSON.stringify(messages),
  });

  const expoJson = (await expoRes.json()) as { data?: ExpoTicket[] };
  if (!expoRes.ok) {
    return new Response(
      JSON.stringify({ error: "Expo push API failed", detail: expoJson }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  const tickets = expoJson.data ?? [];
  const okCount = tickets.filter((t) => t.status === "ok").length;

  if (okCount > 0 && delivery.status === "scheduled") {
    const { error: updateError } = await supabase
      .from("mission_deliveries")
      .update({
        status: "delivered",
        delivered_at: new Date().toISOString(),
      })
      .eq("id", delivery.id)
      .eq("status", "scheduled");

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return jsonOk({
    sent: okCount,
    tickets: tickets.length,
    deliveryId: delivery.id,
    delivered: okCount > 0,
  });
});

function jsonOk(payload: Record<string, unknown>): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
