import { useEffect, useState } from "react";

import {
  AuthConfigError,
  ensureAnonymousSession,
  ensureProfile,
} from "@/lib/auth";

/** Expo Router destinations after bootstrap (typed routes compatible). */
export type BootstrapHref = "/(onboarding)" | "/(main)/inbox";

export type BootstrapState =
  | { status: "loading" }
  | { status: "error"; message: string; isConfig: boolean }
  | { status: "ready"; href: BootstrapHref };

export function useBootstrap(): BootstrapState {
  const [state, setState] = useState<BootstrapState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const session = await ensureAnonymousSession();
        const profile = await ensureProfile(session.user.id);

        const href: BootstrapHref = profile.onboarding_completed
          ? "/(main)/inbox"
          : "/(onboarding)";

        if (!cancelled) {
          setState({ status: "ready", href });
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown bootstrap error";
        const isConfig = err instanceof AuthConfigError;
        if (!cancelled) {
          setState({ status: "error", message, isConfig });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
