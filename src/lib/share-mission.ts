import type { RefObject } from "react";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import type { View } from "react-native";
import { captureRef } from "react-native-view-shot";

export async function captureAndShareMissionCard(
  cardRef: RefObject<View | null>,
): Promise<boolean> {
  if (Platform.OS === "web") {
    throw new Error("Sharing is not available on web.");
  }

  if (!cardRef.current) {
    throw new Error("Share card is not ready yet.");
  }

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error("Sharing is not available on this device.");
  }

  const uri = await captureRef(cardRef, {
    format: "png",
    quality: 1,
    result: "tmpfile",
  });

  await Sharing.shareAsync(uri, {
    mimeType: "image/png",
    UTI: "public.png",
    dialogTitle: "Share your moment",
  });

  return true;
}
