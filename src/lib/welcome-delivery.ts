import { getSupabase } from "@/lib/supabase";

export type WelcomeDeliveryResult = {
  created: boolean;
  deliveryId?: string;
  delivered?: boolean;
  pushed?: boolean;
  skipped?: boolean;
  reason?: string;
};

/**
 * Schedules the user's first mission right after onboarding (idempotent server-side).
 * Non-blocking for onboarding — failures are swallowed so the user still reaches inbox.
 */
export async function scheduleWelcomeDelivery(): Promise<WelcomeDeliveryResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return { created: false, skipped: true, reason: "no_client" };
  }

  const { data, error } = await supabase.functions.invoke("welcome-delivery", {
    method: "POST",
    body: {},
  });

  if (error) {
    console.warn("[welcome-delivery]", error.message);
    return { created: false, skipped: true, reason: "invoke_failed" };
  }

  if (data && typeof data === "object" && "error" in data) {
    console.warn("[welcome-delivery]", String((data as { error: string }).error));
    return { created: false, skipped: true, reason: "server_error" };
  }

  const result = data as WelcomeDeliveryResult | null;
  return result ?? { created: false, skipped: true, reason: "empty_response" };
}
