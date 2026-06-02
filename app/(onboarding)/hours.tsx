import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { OnboardingScreen } from "@/components/onboarding/OnboardingScreen";
import { PrimaryButton } from "@/components/onboarding/PrimaryButton";
import { theme } from "@/constants/theme";
import { useOnboarding } from "@/context/OnboardingContext";
import {
  isAppleSignInAvailable,
  restoreWithApple,
} from "@/lib/auth-link";
import type { FrequencyTier } from "@/types/preferences";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(hour: number): string {
  const suffix = hour < 12 ? "am" : "pm";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}${suffix}`;
}

type HourPickerProps = {
  label: string;
  value: number;
  onChange: (hour: number) => void;
};

function HourPicker({ label, value, onChange }: HourPickerProps) {
  return (
    <View style={styles.pickerBlock}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <View style={styles.hourRow}>
        {HOURS.map((hour) => {
          const selected = hour === value;
          return (
            <Pressable
              key={hour}
              onPress={() => onChange(hour)}
              style={[styles.hourChip, selected && styles.hourChipSelected]}
            >
              <Text style={[styles.hourText, selected && styles.hourTextSelected]}>
                {formatHour(hour)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type FrequencyOptionProps = {
  value: FrequencyTier;
  label: string;
  description: string;
  selected: boolean;
  onSelect: (value: FrequencyTier) => void;
};

function FrequencyOption({
  value,
  label,
  description,
  selected,
  onSelect,
}: FrequencyOptionProps) {
  return (
    <Pressable
      onPress={() => onSelect(value)}
      style={[styles.freqOption, selected && styles.freqOptionSelected]}
    >
      <Text style={[styles.freqLabel, selected && styles.freqLabelSelected]}>{label}</Text>
      <Text style={styles.freqDescription}>{description}</Text>
    </Pressable>
  );
}

export default function HoursScreen() {
  const {
    draft,
    setActiveHourStart,
    setActiveHourEnd,
    setFrequency,
  } = useOnboarding();
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const canContinue = draft.activeHourStart !== draft.activeHourEnd;

  async function handleRestore() {
    setRestoring(true);
    setRestoreError(null);
    try {
      const message = await restoreWithApple();
      Alert.alert("Restore", message);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not restore progress.";
      if (msg.includes("cancelled")) {
        setRestoreError(null);
      } else {
        setRestoreError(msg);
      }
    } finally {
      setRestoring(false);
    }
  }

  return (
    <OnboardingScreen
      step={1}
      title="When should we reach you?"
      subtitle="Nudges only land between these hours — your local time."
      ctaLabel="Continue"
      ctaDisabled={!canContinue}
      ctaLoading={restoring}
      onContinue={() => router.push("/(onboarding)/consent")}
    >
      {isAppleSignInAvailable() ? (
        <View style={styles.restoreBlock}>
          <Text style={styles.restoreLead}>
            Already saved progress on another device?
          </Text>
          <PrimaryButton
            label="Restore with Apple"
            loading={restoring}
            onPress={() => void handleRestore()}
          />
          {restoreError ? (
            <Text style={styles.restoreError}>{restoreError}</Text>
          ) : null}
        </View>
      ) : null}
      <HourPicker
        label="From"
        value={draft.activeHourStart}
        onChange={setActiveHourStart}
      />
      <HourPicker
        label="Until"
        value={draft.activeHourEnd}
        onChange={setActiveHourEnd}
      />
      <View style={styles.freqBlock}>
        <Text style={styles.pickerLabel}>How often?</Text>
        <FrequencyOption
          value="low"
          label="Low"
          description="2–3 nudges per week — sparse and surprising."
          selected={draft.frequency === "low"}
          onSelect={setFrequency}
        />
        <FrequencyOption
          value="medium"
          label="Medium"
          description="A few more moments — still never daily spam."
          selected={draft.frequency === "medium"}
          onSelect={setFrequency}
        />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  restoreBlock: {
    marginBottom: 16,
    padding: 14,
    borderRadius: theme.radius,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 10,
  },
  restoreLead: {
    fontSize: 14,
    color: theme.textBody,
    lineHeight: 20,
  },
  restoreError: {
    fontSize: 13,
    color: theme.error,
  },
  pickerBlock: {
    marginBottom: 8,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.textBody,
    marginBottom: 8,
  },
  hourRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  hourChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
  },
  hourChipSelected: {
    borderColor: theme.primary,
    backgroundColor: theme.primaryMuted,
  },
  hourText: {
    fontSize: 13,
    color: theme.textBody,
  },
  hourTextSelected: {
    color: theme.text,
    fontWeight: "600",
  },
  freqBlock: {
    marginTop: 8,
    gap: 10,
  },
  freqOption: {
    padding: 16,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
  },
  freqOptionSelected: {
    borderColor: theme.primary,
    backgroundColor: theme.primaryMuted,
  },
  freqLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 4,
  },
  freqLabelSelected: {
    color: theme.text,
  },
  freqDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
});
