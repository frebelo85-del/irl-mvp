import * as Localization from "expo-localization";

import { ALL_MISSION_CATEGORY_VALUES } from "@/constants/categories";
import { AuthConfigError } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import type { OnboardingDraft } from "@/types/preferences";

/** IANA timezone for `profiles.timezone` (scheduler uses local active hours). */
export function getDeviceTimezone(): string {
  const fromExpo = Localization.getCalendars()[0]?.timeZone;
  if (fromExpo && fromExpo.trim().length > 0) {
    return fromExpo;
  }

  try {
    const fromIntl = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (fromIntl && fromIntl.trim().length > 0) {
      return fromIntl;
    }
  } catch {
    // Intl unavailable on some runtimes
  }

  return "UTC";
}

function validateDraft(draft: OnboardingDraft): void {
  if (
    draft.activeHourStart < 0 ||
    draft.activeHourStart > 23 ||
    draft.activeHourEnd < 0 ||
    draft.activeHourEnd > 23
  ) {
    throw new Error("Active hours must be between 0 and 23.");
  }
  if (draft.activeHourStart === draft.activeHourEnd) {
    throw new Error("Start and end hour must differ.");
  }
}

/**
 * Persists onboarding: user_preferences → profiles (timezone + completed) → optional analytics.
 * Order is strict so onboarding_completed is never set without preferences row.
 */
export async function completeOnboarding(
  userId: string,
  draft: OnboardingDraft,
): Promise<void> {
  validateDraft(draft);

  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthConfigError("Supabase client unavailable.");
  }

  const timezone = getDeviceTimezone();

  const { error: prefsError } = await supabase.from("user_preferences").insert({
    user_id: userId,
    categories: ALL_MISSION_CATEGORY_VALUES,
    active_hour_start: draft.activeHourStart,
    active_hour_end: draft.activeHourEnd,
    frequency: draft.frequency,
    notifications_enabled: draft.notificationsEnabled,
    analytics_consent: draft.analyticsConsent,
  });

  if (prefsError) {
    throw new Error(prefsError.message);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      timezone,
      onboarding_completed: true,
    })
    .eq("id", userId);

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (draft.analyticsConsent) {
    const { error: analyticsError } = await supabase
      .from("analytics_events")
      .insert({
        user_id: userId,
        event: "onboarding_completed",
        payload: {},
      });

    if (analyticsError) {
      throw new Error(analyticsError.message);
    }
  }
}
