import type { Session } from "@supabase/supabase-js";

import type { Profile } from "@/types/profile";
import { getSupabaseEnv } from "@/constants/env";
import { getSupabase } from "@/lib/supabase";

export class AuthConfigError extends Error {
  readonly name = "AuthConfigError";
}

export async function delay(ms: number): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Reads persisted session first; signs in anonymously if missing.
 */
export async function ensureAnonymousSession(): Promise<Session> {
  const env = getSupabaseEnv();
  if (!env.configured) {
    throw new AuthConfigError(
      "Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthConfigError(
      "Supabase client unavailable (missing environment variables).",
    );
  }

  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();
  if (sessionError) {
    throw new Error(sessionError.message);
  }

  if (sessionData.session) {
    return sessionData.session;
  }

  const { data: anonData, error: anonError } =
    await supabase.auth.signInAnonymously();
  if (anonError) {
    throw new Error(
      `${anonError.message}\nHint: Enable Anonymous Sign-Ins in Supabase Dashboard (Authentication → Providers).`,
    );
  }
  if (!anonData.session) {
    throw new Error(
      "Anonymous sign-in returned no session. Check Anonymous Sign-Ins on your Supabase project.",
    );
  }
  return anonData.session;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthConfigError("Supabase client unavailable.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, timezone, onboarding_completed, account_linked_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) return null;

  return {
    id: data.id,
    timezone: data.timezone,
    onboarding_completed: data.onboarding_completed,
    account_linked_at: data.account_linked_at,
  };
}

/** Waits briefly for trigger `handle_new_user` row (Postgres eventual consistency negligible; safety for cold path). */
export async function ensureProfile(userId: string): Promise<Profile> {
  const maxAttempts = 4;
  for (let i = 0; i < maxAttempts; i += 1) {
    const row = await getProfile(userId);
    if (row) return row;
    await delay(150 * (i + 1));
  }
  throw new Error(
    "Could not load profile row after anonymous sign-in. Check trigger handle_new_user on auth.users.",
  );
}
