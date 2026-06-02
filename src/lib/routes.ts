import type { Href } from "expo-router";

/** Mission detail route (typed routes regenerate on `expo start`). */
export function missionDetailHref(
  missionId: string,
  deliveryId: string,
): Href {
  return `/mission/${missionId}?deliveryId=${deliveryId}` as Href;
}
