import { type ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/onboarding/PrimaryButton";
import { theme } from "@/constants/theme";

type OnboardingScreenProps = {
  step: 1 | 2;
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
        <Text style={styles.step}>Step {step} of 2</Text>
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
    backgroundColor: theme.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.screenLarge,
    paddingTop: 8,
    paddingBottom: 24,
  },
  step: {
    ...theme.typography.step,
    color: theme.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    ...theme.typography.pageTitle,
    color: theme.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.textBody,
    lineHeight: theme.typography.body.lineHeight,
    marginBottom: 20,
  },
  body: {
    flexGrow: 1,
    gap: 12,
  },
  footer: {
    paddingHorizontal: theme.spacing.screenLarge,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.background,
  },
});
