import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { OnboardingScreen } from "@/components/onboarding/OnboardingScreen";
import { useOnboarding } from "@/context/OnboardingContext";
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

  const canContinue = draft.activeHourStart !== draft.activeHourEnd;

  return (
    <OnboardingScreen
      step={2}
      title="When should we reach you?"
      subtitle="Nudges only land between these hours — your local time."
      ctaLabel="Continue"
      ctaDisabled={!canContinue}
      onContinue={() => router.push("/(onboarding)/consent")}
    >
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
  pickerBlock: {
    marginBottom: 8,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
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
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  hourChipSelected: {
    borderColor: "#111827",
    backgroundColor: "#111827",
  },
  hourText: {
    fontSize: 13,
    color: "#374151",
  },
  hourTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  freqBlock: {
    marginTop: 8,
    gap: 10,
  },
  freqOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  freqOptionSelected: {
    borderColor: "#111827",
    backgroundColor: "#f3f4f6",
  },
  freqLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  freqLabelSelected: {
    color: "#111827",
  },
  freqDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
});
