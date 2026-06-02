import { router } from "expo-router";
import { Share } from "react-native";

import { ensureAnonymousSession, ensureProfile } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

export async function exportUserData(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Supabase client unavailable.");
  }

  const { data, error } = await supabase.functions.invoke("user-data-export", {
    method: "POST",
    body: {},
  });

  if (error) {
    throw new Error(error.message);
  }

  const json =
    typeof data === "string" ? data : JSON.stringify(data, null, 2);

  await Share.share({
    message: json,
    title: "Alica — my data export",
  });
}

export async function deleteAccount(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Supabase client unavailable.");
  }

  const { data, error } = await supabase.functions.invoke("delete-account", {
    method: "POST",
    body: {},
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data && typeof data === "object" && "error" in data) {
    throw new Error(String((data as { error: string }).error));
  }

  await supabase.auth.signOut();

  const session = await ensureAnonymousSession();
  const profile = await ensureProfile(session.user.id);

  if (profile.onboarding_completed) {
    router.replace("/(main)/inbox");
  } else {
    router.replace("/(onboarding)");
  }
}
