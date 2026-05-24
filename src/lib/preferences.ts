import { AuthConfigError } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

export type UserPreferencesSummary = {
  notifications_enabled: boolean;
};

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
