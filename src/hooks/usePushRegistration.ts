import { useEffect, useRef } from "react";

import { syncPushRegistration } from "@/lib/notifications";
import { getSupabase } from "@/lib/supabase";

/** Sync Expo push token once per app session when user enters main stack. */
export function usePushRegistration(): void {
  const syncedRef = useRef(false);

  useEffect(() => {
    if (syncedRef.current) return;
    syncedRef.current = true;

    let cancelled = false;

    void (async () => {
      const supabase = getSupabase();
      if (!supabase || cancelled) return;

      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id;
      if (!userId || cancelled) return;

      try {
        const result = await syncPushRegistration(userId);
        if (__DEV__ && result.status !== "registered") {
          console.log("[push] sync:", result.status, "reason" in result ? result.reason : "");
        }
      } catch (err) {
        if (__DEV__) {
          const message = err instanceof Error ? err.message : "sync failed";
          console.warn("[push] syncPushRegistration:", message);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);
}
