import { AuthConfigError } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

export type AnalyticsEventName =
  | "mission_opened"
  | "mission_accepted"
  | "mission_postponed"
  | "mission_resumed"
  | "mission_skipped"
  | "mission_completed"
  | "mission_shared"
  | "feedback_helpful_yes"
  | "feedback_helpful_no";

async function hasAnalyticsConsent(userId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthConfigError("Supabase client unavailable.");
  }

  const { data, error } = await supabase
    .from("user_preferences")
    .select("analytics_consent")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.analytics_consent === true;
}

export async function trackEvent(
  userId: string,
  event: AnalyticsEventName,
  payload: Record<string, unknown> = {},
): Promise<void> {
  const consent = await hasAnalyticsConsent(userId);
  if (!consent) return;

  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase.from("analytics_events").insert({
    user_id: userId,
    event,
    payload,
  });

  if (error && __DEV__) {
    console.warn("[analytics]", event, error.message);
  }
}
