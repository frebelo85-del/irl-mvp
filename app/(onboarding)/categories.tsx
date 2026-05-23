import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import { CategoryChip } from "@/components/onboarding/CategoryChip";
import { OnboardingScreen } from "@/components/onboarding/OnboardingScreen";
import { MISSION_CATEGORIES } from "@/constants/categories";
import { useOnboarding } from "@/context/OnboardingContext";

export default function CategoriesScreen() {
  const { draft, toggleCategory } = useOnboarding();
  const canContinue = draft.categories.length >= 2;

  return (
    <OnboardingScreen
      step={1}
      title="What kind of moments do you want?"
      subtitle="Pick at least 2 — we'll send small nudges to step into real life."
      ctaLabel="Continue"
      ctaDisabled={!canContinue}
      onContinue={() => router.push("/(onboarding)/hours")}
    >
      <View style={styles.grid}>
        {MISSION_CATEGORIES.map((option) => (
          <CategoryChip
            key={option.value}
            label={option.label}
            value={option.value}
            selected={draft.categories.includes(option.value)}
            onToggle={toggleCategory}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
