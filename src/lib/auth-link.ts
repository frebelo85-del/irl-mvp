import { router } from "expo-router";
import { Platform } from "react-native";

import { AuthConfigError, ensureAnonymousSession, ensureProfile } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

type GoogleSignInModule = {
  GoogleSignin: {
    configure: (opts: { webClientId: string }) => void;
    hasPlayServices: () => Promise<boolean>;
    signIn: () => Promise<{ data?: { idToken?: string | null } | null }>;
  };
  statusCodes: { SIGN_IN_CANCELLED: string };
};

let googleModuleCache: GoogleSignInModule | null | undefined;

/** Lazy load — avoids crash when Dev Build predates @react-native-google-signin. */
function getGoogleModule(): GoogleSignInModule | null {
  if (googleModuleCache !== undefined) {
    return googleModuleCache;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("@react-native-google-signin/google-signin") as GoogleSignInModule;
    googleModuleCache = mod;
    return mod;
  } catch {
    googleModuleCache = null;
    return null;
  }
}

export function getGoogleWebClientId(): string | null {
  const id = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
  return id && id.length > 0 ? id : null;
}

/** True when env is set AND native module is in the current binary. */
export function isGoogleSignInAvailable(): boolean {
  return getGoogleWebClientId() !== null && getGoogleModule() !== null;
}

function isAppleSignInCancelled(err: unknown): boolean {
  const code = (err as { code?: string })?.code;
  return code === "ERR_REQUEST_CANCELED";
}

async function getAppleAuth() {
  if (Platform.OS !== "ios") {
    return null;
  }
  try {
    return await import("expo-apple-authentication");
  } catch {
    return null;
  }
}

/** After restore/sign-in: go to inbox or onboarding with a clear message. */
export async function navigateAfterSessionRestore(): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthConfigError("Supabase client unavailable.");
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user?.id) {
    throw new Error(userError?.message ?? "No session after sign-in.");
  }

  const profile = await ensureProfile(userData.user.id);

  if (profile.onboarding_completed) {
    router.replace("/(main)/inbox");
    return "Welcome back — your progress is here.";
  }

  router.replace("/(onboarding)/hours");
  return (
    "Signed in, but this Apple/Google account has no saved progress in Alica. " +
    "If you used Delete account, your missions and stats were permanently removed and cannot be restored. " +
    "Continue setup below, or use another device where you still have the app installed without deleting."
  );
}

async function markAccountLinked(userId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthConfigError("Supabase client unavailable.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ account_linked_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

async function linkWithIdToken(
  provider: "apple" | "google",
  token: string,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthConfigError("Supabase client unavailable.");
  }

  const { data, error } = await supabase.auth.linkIdentity({
    provider,
    token,
  });

  if (error) {
    throw new Error(error.message);
  }

  const userId = data.user?.id;
  if (!userId) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user?.id) {
      throw new Error("Link succeeded but no user id returned.");
    }
    await markAccountLinked(userData.user.id);
    return;
  }

  await markAccountLinked(userId);
}

async function restoreWithIdToken(
  provider: "apple" | "google",
  token: string,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthConfigError("Supabase client unavailable.");
  }

  // Clear local anonymous session so signInWithIdToken can attach the linked account (PRD §8.3).
  const { error: signOutError } = await supabase.auth.signOut();
  if (signOutError) {
    throw new Error(signOutError.message);
  }

  const { error } = await supabase.auth.signInWithIdToken({
    provider,
    token,
  });

  if (error) {
    try {
      await ensureAnonymousSession();
    } catch {
      // Original sign-in error is more actionable for the user.
    }
    throw new Error(error.message);
  }
}

export async function linkWithApple(): Promise<void> {
  const AppleAuthentication = await getAppleAuth();
  if (!AppleAuthentication) {
    throw new Error(
      "Apple Sign In requires a new Dev Build with expo-apple-authentication.",
    );
  }

  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    throw new Error("Apple Sign In is not available on this device.");
  }

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      throw new Error("Apple Sign In did not return an identity token.");
    }

    await linkWithIdToken("apple", credential.identityToken);
  } catch (err) {
    if (isAppleSignInCancelled(err)) {
      throw new Error("Apple Sign In was cancelled.");
    }
    throw err;
  }
}

export async function restoreWithApple(): Promise<string> {
  const AppleAuthentication = await getAppleAuth();
  if (!AppleAuthentication) {
    throw new Error(
      "Apple Sign In requires a new Dev Build with expo-apple-authentication.",
    );
  }

  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    throw new Error("Apple Sign In is not available on this device.");
  }

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      throw new Error("Apple Sign In did not return an identity token.");
    }

    await restoreWithIdToken("apple", credential.identityToken);
  } catch (err) {
    if (isAppleSignInCancelled(err)) {
      throw new Error("Apple Sign In was cancelled.");
    }
    throw err;
  }

  return navigateAfterSessionRestore();
}

async function getGoogleIdToken(): Promise<string> {
  const mod = getGoogleModule();
  if (!mod) {
    throw new Error(
      "Google Sign In requires a new Dev Build. Run eas build --profile development --platform ios.",
    );
  }

  const webClientId = getGoogleWebClientId();
  if (!webClientId) {
    throw new AuthConfigError(
      "Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID for Google sign-in.",
    );
  }

  const { GoogleSignin, statusCodes } = mod;
  GoogleSignin.configure({ webClientId });

  try {
    if (Platform.OS === "android") {
      await GoogleSignin.hasPlayServices();
    }
    const response = await GoogleSignin.signIn();
    const token = response.data?.idToken;
    if (!token) {
      throw new Error("Google Sign In did not return an id token.");
    }
    return token;
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === statusCodes.SIGN_IN_CANCELLED) {
      throw new Error("Google Sign In was cancelled.");
    }
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("Google Sign In failed.");
  }
}

export async function linkWithGoogle(): Promise<void> {
  const token = await getGoogleIdToken();
  await linkWithIdToken("google", token);
}

export async function restoreWithGoogle(): Promise<string> {
  const token = await getGoogleIdToken();
  await restoreWithIdToken("google", token);
  return navigateAfterSessionRestore();
}

export function isAppleSignInAvailable(): boolean {
  return Platform.OS === "ios";
}

/** @deprecated Use isGoogleSignInAvailable */
export function isGoogleSignInConfigured(): boolean {
  return isGoogleSignInAvailable();
}
