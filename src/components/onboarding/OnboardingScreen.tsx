import { type ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/onboarding/PrimaryButton";

type OnboardingScreenProps = {
  step: 1 | 2 | 3;
  title: string;
  subtitle?: string;
  children: ReactNode;
  ctaLabel: string;
  ctaDisabled?: boolean;
  ctaLoading?: boolean;
  onContinue: () => void;
};

export function OnboardingScreen({
  step,
  title,
  subtitle,
  children,
  ctaLabel,
  ctaDisabled = false,
  ctaLoading = false,
  onContinue,
}: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.step}>Step {step} of 3</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.body}>{children}</View>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label={ctaLabel}
          disabled={ctaDisabled}
          loading={ctaLoading}
          onPress={onContinue}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  step: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 20,
  },
  body: {
    flexGrow: 1,
    gap: 12,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#f8f9fa",
  },
});
