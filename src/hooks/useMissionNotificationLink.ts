import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useRef } from "react";

import { parseMissionDeepLink } from "@/lib/mission-link";
import { missionDetailHref } from "@/lib/routes";

function navigateFromNotificationUrl(url: string | undefined): void {
  if (!url || typeof url !== "string") return;

  const parsed = parseMissionDeepLink(url);
  if (!parsed) return;

  router.push(missionDetailHref(parsed.missionId, parsed.deliveryId));
}

export function useMissionNotificationLink(): void {
  const handledColdStart = useRef(false);

  useEffect(() => {
    if (!handledColdStart.current) {
      handledColdStart.current = true;
      void Notifications.getLastNotificationResponseAsync().then((response) => {
        if (!response) return;
        const url = response.notification.request.content.data?.url;
        navigateFromNotificationUrl(
          typeof url === "string" ? url : undefined,
        );
      });
    }

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const url = response.notification.request.content.data?.url;
        navigateFromNotificationUrl(
          typeof url === "string" ? url : undefined,
        );
      },
    );

    return () => subscription.remove();
  }, []);
}
