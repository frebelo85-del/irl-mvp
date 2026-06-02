import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type View as ViewType,
} from "react-native";

import { MissionShareCard } from "@/components/mission/MissionShareCard";
import { PrimaryButton } from "@/components/onboarding/PrimaryButton";
import { theme } from "@/constants/theme";
import { MAX_REFLECTION_LENGTH } from "@/lib/deliveries";
import { captureAndShareMissionCard } from "@/lib/share-mission";
import type { MissionSummary } from "@/types/mission";

type MissionShareStepProps = {
  mission: MissionSummary;
  initialReflection?: string;
  loading: boolean;
  onContinueAfterShare: (
    reflection: string,
    didShare: boolean,
    hasPhoto: boolean,
  ) => Promise<void>;
};

export function MissionShareStep({
  mission,
  initialReflection = "",
  loading,
  onContinueAfterShare,
}: MissionShareStepProps) {
  const cardRef = useRef<ViewType>(null);
  const [reflection, setReflection] = useState(initialReflection);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const busy = loading || sharing;
  const canShareNative = Platform.OS !== "web";

  async function pickPhoto() {
    setError(null);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setError("Photo access was denied. You can still share without a photo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function handleShare() {
    if (!canShareNative) {
      setError("Sharing is only available on iOS and Android.");
      return;
    }

    setSharing(true);
    setError(null);
    try {
      await captureAndShareMissionCard(cardRef);
      await onContinueAfterShare(reflection, true, photoUri != null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not share.";
      if (!message.toLowerCase().includes("cancel")) {
        setError(message);
      }
    } finally {
      setSharing(false);
    }
  }

  async function handleSkip() {
    setError(null);
    try {
      await onContinueAfterShare(reflection, false, false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not continue.");
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>How did it go?</Text>
      <Text style={styles.lead}>
        Optional — a few words about what you did. You can share a card to social apps
        afterward.
      </Text>

      <TextInput
        value={reflection}
        onChangeText={(text) =>
          setReflection(text.slice(0, MAX_REFLECTION_LENGTH))
        }
        placeholder="e.g. Called my sister — felt good."
        placeholderTextColor={theme.textTertiary}
        multiline
        editable={!busy}
        style={styles.input}
      />
      <Text style={styles.counter}>
        {reflection.length}/{MAX_REFLECTION_LENGTH}
      </Text>

      <View style={styles.photoRow}>
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={() => void pickPhoto()}
          style={({ pressed }) => [
            styles.photoButton,
            pressed && !busy && styles.photoPressed,
          ]}
        >
          <Text style={styles.photoLabel}>
            {photoUri ? "Change photo" : "Add photo (optional)"}
          </Text>
        </Pressable>
        {photoUri ? (
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={() => setPhotoUri(null)}
          >
            <Text style={styles.clearPhoto}>Remove</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.previewLabel}>Preview</Text>
      <View style={styles.previewFrame}>
        <MissionShareCard
          ref={cardRef}
          mission={mission}
          reflection={reflection}
          photoUri={photoUri}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {canShareNative ? (
        <PrimaryButton
          label="Share"
          loading={sharing}
          disabled={busy && !sharing}
          onPress={() => void handleShare()}
          style={styles.primary}
        />
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={() => void handleSkip()}
        style={({ pressed }) => [
          styles.skipButton,
          busy && styles.skipDisabled,
          pressed && !busy && styles.skipPressed,
        ]}
      >
        <Text style={styles.skipLabel}>
          {canShareNative ? "Not now" : "Continue"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    gap: 8,
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.text,
  },
  lead: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  input: {
    minHeight: 88,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
    padding: 14,
    fontSize: 16,
    color: theme.text,
    textAlignVertical: "top",
  },
  counter: {
    fontSize: 12,
    color: theme.textTertiary,
    textAlign: "right",
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 4,
  },
  photoButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderStrong,
  },
  photoPressed: {
    opacity: 0.9,
  },
  photoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.textBody,
  },
  clearPhoto: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.textSecondary,
    marginTop: 8,
  },
  previewFrame: {
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: theme.border,
    borderRadius: theme.radius,
  },
  error: {
    fontSize: 14,
    color: theme.error,
    lineHeight: 20,
  },
  primary: {
    marginTop: 8,
  },
  skipButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  skipDisabled: {
    opacity: 0.5,
  },
  skipPressed: {
    opacity: 0.85,
  },
  skipLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.textSecondary,
  },
});
