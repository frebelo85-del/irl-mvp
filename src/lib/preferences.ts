import { AuthConfigError } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import type {
  FrequencyTier,
  MissionCategory,
  OnboardingDraft,
  UserPreferences,
} from "@/types/preferences";

export type UserPreferencesSummary = {
  notifications_enabled: boolean;
};

function validateScheduleDraft(draft: OnboardingDraft): void {
  if (draft.activeHourStart === draft.activeHourEnd) {
    throw new Error("Start and end hour must differ.");
  }
}

export async function getUserPreferences(
  userId: string,
): Promise<UserPreferencesSummary | null> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthConfigError("Supabase client unavailable.");
  }

  const { data, error } = await supabase
    .from("user_preferences")
    .select("notifications_enabled")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) return null;

  return {
    notifications_enabled: data.notifications_enabled,
  };
}

export async function getFullUserPreferences(
  userId: string,
): Promise<UserPreferences | null> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthConfigError("Supabase client unavailable.");
  }

  const { data, error } = await supabase
    .from("user_preferences")
    .select(
      "user_id, categories, active_hour_start, active_hour_end, frequency, notifications_enabled, analytics_consent",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) return null;

  return {
    user_id: data.user_id,
    categories: data.categories as MissionCategory[],
    active_hour_start: data.active_hour_start,
    active_hour_end: data.active_hour_end,
    frequency: data.frequency as FrequencyTier,
    notifications_enabled: data.notifications_enabled,
    analytics_consent: data.analytics_consent,
  };
}

export function preferencesToDraft(prefs: UserPreferences): OnboardingDraft {
  return {
    categories: prefs.categories,
    activeHourStart: prefs.active_hour_start,
    activeHourEnd: prefs.active_hour_end,
    frequency: prefs.frequency,
    notificationsEnabled: prefs.notifications_enabled,
    analyticsConsent: prefs.analytics_consent,
  };
}

export async function updateUserPreferences(
  userId: string,
  draft: OnboardingDraft,
): Promise<void> {
  validateScheduleDraft(draft);

  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthConfigError("Supabase client unavailable.");
  }

  const { error } = await supabase
    .from("user_preferences")
    .update({
      active_hour_start: draft.activeHourStart,
      active_hour_end: draft.activeHourEnd,
      frequency: draft.frequency,
    })
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function setNotificationsEnabled(
  userId: string,
  enabled: boolean,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthConfigError("Supabase client unavailable.");
  }

  const { error } = await supabase
    .from("user_preferences")
    .update({ notifications_enabled: enabled })
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function setAnalyticsConsent(
  userId: string,
  consent: boolean,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthConfigError("Supabase client unavailable.");
  }

  const { error } = await supabase
    .from("user_preferences")
    .update({ analytics_consent: consent })
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}
