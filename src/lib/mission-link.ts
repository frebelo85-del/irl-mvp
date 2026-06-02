/** Parses `irl://mission/<missionId>?deliveryId=<uuid>` from push payload. */
export function parseMissionDeepLink(
  url: string,
): { missionId: string; deliveryId: string } | null {
  try {
    const normalized = url.trim();
    const withoutScheme = normalized.replace(/^irl:\/\//i, "");
    const [pathPart, queryPart = ""] = withoutScheme.split("?");
    const segments = pathPart.split("/").filter(Boolean);
    const missionIndex = segments.indexOf("mission");
    const missionId =
      missionIndex >= 0 ? segments[missionIndex + 1] : segments[0];
    if (!missionId) return null;

    const params = new URLSearchParams(queryPart);
    const deliveryId = params.get("deliveryId");
    if (!deliveryId) return null;

    return { missionId, deliveryId };
  } catch {
    return null;
  }
}
