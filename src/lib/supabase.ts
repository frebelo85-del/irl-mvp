import "react-native-url-polyfill/auto";

import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { getSupabaseEnv } from "@/constants/env";

function createPersistence() {
  if (Platform.OS === "web") {
    return {
      getItem: (key: string) =>
        Promise.resolve(
          typeof globalThis !== "undefined" &&
            typeof (globalThis as { localStorage?: Storage }).localStorage !==
              "undefined"
            ? ((globalThis as { localStorage: Storage }).localStorage.getItem(key) ??
                null)
            : null,
        ),
      setItem: (key: string, value: string) => {
        if (
          typeof globalThis !== "undefined" &&
          typeof (globalThis as { localStorage?: Storage }).localStorage !==
            "undefined"
        ) {
          (globalThis as { localStorage: Storage }).localStorage.setItem(key, value);
        }
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        if (
          typeof globalThis !== "undefined" &&
          typeof (globalThis as { localStorage?: Storage }).localStorage !==
            "undefined"
        ) {
          (globalThis as { localStorage: Storage }).localStorage.removeItem(key);
        }
        return Promise.resolve();
      },
    };
  }

  return {
    getItem: (key: string) => SecureStore.getItemAsync(key),
    setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
    removeItem: (key: string) => SecureStore.deleteItemAsync(key),
  };
}

let client: SupabaseClient | null | undefined;

/**
 * Returns null if env not configured (Phase A dev screen still mounts).
 */
export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) {
    return client;
  }
  const env = getSupabaseEnv();
  if (!env.configured) {
    client = null;
    return null;
  }
  client = createClient(env.url, env.anonKey, {
    auth: {
      storage: createPersistence(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return client;
}

export async function getSessionSafe(): Promise<{
  session: Session | null;
  error: string | null;
}> {
  const sb = getSupabase();
  if (!sb) {
    return { session: null, error: "Supabase client not configured (missing env)" };
  }
  const { data, error } = await sb.auth.getSession();
  if (error) {
    return { session: null, error: error.message };
  }
  return { session: data.session ?? null, error: null };
}
