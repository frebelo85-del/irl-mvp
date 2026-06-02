import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { AuthConfigError } from "@/lib/auth";
import { getUserPreferences, setNotificationsEnabled } from "@/lib/preferences";
import { getSupabase } from "@/lib/supabase";
import type { PushPlatform, PushRegistrationResult } from "@/types/push-token";

let configured = false;

export function isNativePushSupported(): boolean {
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return false;
  }
  return Device.isDevice;
}

export function getEasProjectId(): string | null {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (typeof projectId === "string" && projectId.trim().length > 0) {
    return projectId.trim();
  }
  return null;
}

function getPushPlatform(): PushPlatform | null {
  if (Platform.OS === "ios") return "ios";
  if (Platform.OS === "android") return "android";
  return null;
}

/** Minimal foreground handler — full notification UX is Phase G. */
export function configureNotifications(): void {
  if (configured) return;
  configured = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function requestPushPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function fetchExpoPushToken(projectId: string): Promise<string> {
  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  if (!token.data) {
    throw new Error("Expo push token response was empty.");
  }
  return token.data;
}

export async function upsertPushToken(
  userId: string,
  token: string,
  platform: PushPlatform,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthConfigError("Supabase client unavailable.");
  }

  const { error } = await supabase.from("push_tokens").upsert(
    {
      user_id: userId,
      expo_push_token: token,
      platform,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "user_id,expo_push_token" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function registerPushToken(
  userId: string,
): Promise<PushRegistrationResult> {
  if (!isNativePushSupported()) {
    return {
      status: "skipped",
      reason:
        Platform.OS === "web"
          ? "Web does not support Expo push tokens."
          : "Push registration requires a physical iOS or Android device.",
    };
  }

  const projectId = getEasProjectId();
  if (!projectId) {
    return {
      status: "skipped",
      reason: "Missing EXPO_PUBLIC_EAS_PROJECT_ID.",
    };
  }

  const platform = getPushPlatform();
  if (!platform) {
    return { status: "skipped", reason: "Unsupported platform for push." };
  }

  try {
    const granted = await requestPushPermission();
    if (!granted) {
      await setNotificationsEnabled(userId, false);
      return { status: "denied" };
    }

    const token = await fetchExpoPushToken(projectId);
    await upsertPushToken(userId, token, platform);
    return { status: "registered", token };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Push registration failed.";
    if (__DEV__) {
      console.warn("[push] registerPushToken:", message);
    }
    return { status: "error", message };
  }
}

export async function syncPushRegistration(
  userId: string,
): Promise<PushRegistrationResult> {
  const prefs = await getUserPreferences(userId);
  if (!prefs?.notifications_enabled) {
    return { status: "skipped", reason: "Notifications disabled in preferences." };
  }

  return registerPushToken(userId);
}
