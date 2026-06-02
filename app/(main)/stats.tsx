import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { theme } from "@/constants/theme";
import { fetchMissionStats } from "@/lib/stats";
import { getSupabase } from "@/lib/supabase";
import type { MissionStats } from "@/types/stats";

export default function StatsScreen() {
  const [stats, setStats] = useState<MissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      if (!supabase) {
        throw new Error("Supabase client unavailable.");
      }
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) {
        throw new Error("No active session.");
      }
      setStats(await fetchMissionStats(userId));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not load stats.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!stats || stats.totalCompleted === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No stats yet</Text>
        <Text style={styles.emptyBody}>
          Complete a mission to see your real-life moments here.
        </Text>
        <Text style={styles.hint}>More insights coming later.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryValue}>{stats.totalCompleted}</Text>
        <Text style={styles.summaryLabel}>
          mission{stats.totalCompleted === 1 ? "" : "s"} completed
        </Text>
        {stats.inProgress > 0 ? (
          <Text style={styles.inProgress}>
            {stats.inProgress} in progress
          </Text>
        ) : null}
      </View>

      {stats.byCategory.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>By category</Text>
          {stats.byCategory.map((row) => (
            <View key={row.category} style={styles.row}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowCount}>{row.count}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <Text style={styles.footer}>More insights coming later.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    padding: theme.spacing.screen,
    paddingBottom: 32,
    backgroundColor: theme.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.screenLarge,
    backgroundColor: theme.background,
  },
  summaryCard: {
    backgroundColor: theme.surface,
    borderRadius: theme.radius,
    padding: theme.spacing.screenLarge,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 16,
  },
  summaryValue: {
    fontSize: 48,
    fontWeight: "700",
    color: theme.primaryStrong,
  },
  summaryLabel: {
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 4,
  },
  inProgress: {
    fontSize: 14,
    color: theme.textBody,
    marginTop: 12,
  },
  section: {
    backgroundColor: theme.surface,
    borderRadius: theme.radius,
    padding: theme.spacing.screen,
    borderWidth: 1,
    borderColor: theme.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.textSecondary,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  rowLabel: {
    fontSize: 16,
    color: theme.text,
  },
  rowCount: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
  },
  footer: {
    marginTop: 20,
    fontSize: 13,
    color: theme.textTertiary,
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.textSecondary,
    textAlign: "center",
    marginBottom: 12,
  },
  hint: {
    fontSize: 13,
    color: theme.textTertiary,
    textAlign: "center",
  },
  error: {
    fontSize: 15,
    color: theme.error,
    textAlign: "center",
  },
});
