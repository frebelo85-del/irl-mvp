import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { formatReturnTime } from "@/components/mission/PostponeSheet";
import { theme } from "@/constants/theme";
import { fetchInboxItems } from "@/lib/deliveries";
import { missionDetailHref } from "@/lib/routes";
import { getSupabase } from "@/lib/supabase";
import type { DeliveryStatus, InboxItem } from "@/types/mission";

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  scheduled: "Scheduled",
  delivered: "New",
  opened: "Opened",
  accepted: "In progress",
  postponed: "Set aside",
  skipped: "Skipped",
  completed: "Done",
};

type StatusBadgeStyle = { backgroundColor: string; color: string };

function statusBadgeStyle(status: DeliveryStatus): StatusBadgeStyle {
  switch (status) {
    case "delivered":
    case "opened":
      return { backgroundColor: theme.primaryMuted, color: theme.primaryStrong };
    case "completed":
      return { backgroundColor: "#ecfdf5", color: theme.success };
    case "postponed":
    case "skipped":
      return { backgroundColor: "#f3f4f6", color: theme.textSecondary };
    case "accepted":
      return { backgroundColor: theme.primaryMuted, color: theme.text };
    default:
      return { backgroundColor: "#f3f4f6", color: theme.textSecondary };
  }
}

function formatScheduledAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function inboxLineTitle(item: InboxItem): string {
  const openedPlus: DeliveryStatus[] = [
    "opened",
    "accepted",
    "completed",
    "postponed",
    "skipped",
  ];
  if (openedPlus.includes(item.status)) {
    return item.mission.title;
  }
  return item.mission.teaser;
}

export default function InboxScreen() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInbox = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
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

      const rows = await fetchInboxItems(userId);
      setItems(rows);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not load inbox.";
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadInbox();
    }, [loadInbox]),
  );

  function openMission(item: InboxItem) {
    router.push(missionDetailHref(item.mission_id, item.id));
  }

  if (loading && items.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={[
          styles.list,
          items.length === 0 && styles.listEmpty,
        ]}
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadInbox(true)}
            tintColor={theme.primary}
          />
        }
        ListHeaderComponent={
          error ? (
            <Text style={styles.errorBanner}>{error}</Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptyBody}>
              Missions arrive when the moment fits — gaps are normal.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const badge = statusBadgeStyle(item.status);
          return (
            <Pressable
              accessibilityRole="button"
              onPress={() => openMission(item)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardCategory}>{item.mission.category}</Text>
                <View style={[styles.statusBadge, { backgroundColor: badge.backgroundColor }]}>
                  <Text style={[styles.cardStatus, { color: badge.color }]}>
                    {STATUS_LABELS[item.status]}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>{inboxLineTitle(item)}</Text>
              <Text style={styles.cardMeta}>
                {item.status === "postponed" && item.postponed_until
                  ? `Returns ${formatReturnTime(item.postponed_until)}`
                  : formatScheduledAt(item.scheduled_at)}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.background,
  },
  list: {
    padding: theme.spacing.screen,
    paddingBottom: 32,
  },
  listEmpty: {
    flexGrow: 1,
  },
  errorBanner: {
    fontSize: 14,
    color: theme.error,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: theme.radius,
    padding: theme.spacing.screen,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardCategory: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.textSecondary,
    textTransform: "capitalize",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cardStatus: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
    lineHeight: 22,
    marginBottom: 6,
  },
  cardMeta: {
    fontSize: 12,
    color: theme.textTertiary,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.screenLarge,
    paddingTop: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyBody: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.textSecondary,
    textAlign: "center",
  },
});
