import { createUserClient } from "../_shared/user-client.ts";

function maskToken(token: string): string {
  if (token.length <= 8) return "…";
  return `…${token.slice(-8)}`;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const client = createUserClient(req);
  if (!client) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = userData.user.id;

  const [
    profileRes,
    prefsRes,
    tokensRes,
    deliveriesRes,
    responsesRes,
    analyticsRes,
  ] = await Promise.all([
    client.from("profiles").select("*").eq("id", userId).maybeSingle(),
    client.from("user_preferences").select("*").eq("user_id", userId).maybeSingle(),
    client.from("push_tokens").select("*").eq("user_id", userId),
    client.from("mission_deliveries").select("*").eq("user_id", userId),
    client.from("mission_responses").select("*").eq("user_id", userId),
    client.from("analytics_events").select("*").eq("user_id", userId),
  ]);

  const firstError =
    profileRes.error ??
    prefsRes.error ??
    tokensRes.error ??
    deliveriesRes.error ??
    responsesRes.error ??
    analyticsRes.error;

  if (firstError) {
    return new Response(JSON.stringify({ error: firstError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const push_tokens = (tokensRes.data ?? []).map((row) => ({
    ...row,
    expo_push_token: maskToken(row.expo_push_token as string),
  }));

  const payload = {
    exported_at: new Date().toISOString(),
    profile: profileRes.data,
    user_preferences: prefsRes.data,
    push_tokens,
    mission_deliveries: deliveriesRes.data ?? [],
    mission_responses: responsesRes.data ?? [],
    analytics_events: analyticsRes.data ?? [],
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
