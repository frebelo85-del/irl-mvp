import { Pressable, StyleSheet, Text } from "react-native";

import type { MissionCategory } from "@/types/preferences";

type CategoryChipProps = {
  label: string;
  value: MissionCategory;
  selected: boolean;
  onToggle: (value: MissionCategory) => void;
};

export function CategoryChip({ label, value, selected, onToggle }: CategoryChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onToggle(value)}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.chipPressed,
      ]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
  },
  chipSelected: {
    borderColor: "#111827",
    backgroundColor: "#111827",
  },
  chipPressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#374151",
  },
  labelSelected: {
    color: "#fff",
  },
});
