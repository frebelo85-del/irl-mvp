/** Values stored in `public.mission_category` enum (lowercase). */
export type MissionCategory =
  | "social"
  | "nature"
  | "curiosity"
  | "adventure"
  | "creativity"
  | "calm"
  | "learning";

export type FrequencyTier = "low" | "medium";

/** Row shape for `public.user_preferences`. */
export type UserPreferences = {
  user_id: string;
  categories: MissionCategory[];
  active_hour_start: number;
  active_hour_end: number;
  frequency: FrequencyTier;
  notifications_enabled: boolean;
  analytics_consent: boolean;
};

/** In-memory draft collected across onboarding screens before persist. */
export type OnboardingDraft = {
  categories: MissionCategory[];
  activeHourStart: number;
  activeHourEnd: number;
  frequency: FrequencyTier;
  notificationsEnabled: boolean;
  analyticsConsent: boolean;
};

export const DEFAULT_ONBOARDING_DRAFT: OnboardingDraft = {
  categories: [],
  activeHourStart: 9,
  activeHourEnd: 22,
  frequency: "low",
  notificationsEnabled: true,
  analyticsConsent: false,
};
