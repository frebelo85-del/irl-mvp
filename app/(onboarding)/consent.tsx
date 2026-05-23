import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import { OnboardingScreen } from "@/components/onboarding/OnboardingScreen";
import { useOnboarding } from "@/context/OnboardingContext";
import { completeOnboarding } from "@/lib/onboarding";
import { getSupabase } from "@/lib/supabase";

export default function ConsentScreen() {
  const {
    draft,
    setNotificationsEnabled,
    setAnalyticsConsent,
  } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFinish() {
    setError(null);
    setLoading(true);

    try {
      const supabase = getSupabase();
      if (!supabase) {
        throw new Error("Supabase client unavailable.");
      }

      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id;
      if (!userId) {
        throw new Error("No active session. Restart the app.");
      }

      await completeOnboarding(userId, draft);
      router.replace("/(main)/inbox");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not finish onboarding.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingScreen
      step={3}
      title="Stay in the loop — on your terms"
      subtitle="We won't spam you. Sometimes you may not hear from us for a day or two — that's intentional."
      ctaLabel="Get started"
      ctaLoading={loading}
      onContinue={() => void handleFinish()}
    >
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Notifications</Text>
            <Text style={styles.rowBody}>
              Short teasers only — open the app for the full mission.
            </Text>
          </View>
          <Switch
            value={draft.notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            disabled={loading}
          />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Analytics</Text>
            <Text style={styles.rowBody}>
              Help us improve IRL with anonymous usage data. Optional and separate from
              notifications.
            </Text>
          </View>
          <Switch
            value={draft.analyticsConsent}
            onValueChange={setAnalyticsConsent}
            disabled={loading}
          />
        </View>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  rowBody: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    fontSize: 14,
    color: "#991b1b",
    lineHeight: 20,
  },
});
