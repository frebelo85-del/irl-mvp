import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { MissionShareStep } from "@/components/mission/MissionShareStep";
import { PrimaryButton } from "@/components/onboarding/PrimaryButton";
import { theme } from "@/constants/theme";
import {
  formatReturnTime,
  PostponeSheet,
} from "@/components/mission/PostponeSheet";
import { trackEvent } from "@/lib/analytics";
import {
  acceptDelivery,
  completeDelivery,
  fetchMissionDetail,
  markDeliveryOpened,
  postponeDelivery,
  reopenDelivery,
  saveMissionReflection,
  setDeliveryHelpful,
  skipDelivery,
} from "@/lib/deliveries";
import { getSupabase } from "@/lib/supabase";
import type { MissionDetail } from "@/types/mission";

export default function MissionScreen() {
  const { id: missionId, deliveryId } = useLocalSearchParams<{
    id: string;
    deliveryId: string;
  }>();

  const [detail, setDetail] = useState<MissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPostpone, setShowPostpone] = useState(false);
  const [shareStepDone, setShareStepDone] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!missionId || !deliveryId) {
      setError("Missing mission or delivery.");
      setLoading(false);
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setError("Supabase client unavailable.");
      setLoading(false);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) {
      setError("No active session.");
      setLoading(false);
      return;
    }

    try {
      const { openedNow } = await markDeliveryOpened(userId, deliveryId);
      if (openedNow) {
        await trackEvent(userId, "mission_opened", {
          delivery_id: deliveryId,
          mission_id: missionId,
        });
      }

      const next = await fetchMissionDetail(userId, deliveryId, missionId);
      setDetail(next);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not load mission.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [missionId, deliveryId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  useEffect(() => {
    if (detail?.response?.reflection_text) {
      setShareStepDone(true);
    }
  }, [detail?.response?.reflection_text]);

  async function runAction(
    fn: (userId: string, deliveryId: string) => Promise<void>,
    analyticsEvent?: Parameters<typeof trackEvent>[1],
  ) {
    if (!deliveryId) return;

    const supabase = getSupabase();
    const userId = (await supabase?.auth.getSession())?.data.session?.user?.id;
    if (!userId) {
      setError("No active session.");
      return;
    }

    setActing(true);
    setError(null);
    try {
      await fn(userId, deliveryId);
      if (analyticsEvent) {
        await trackEvent(userId, analyticsEvent, {
          delivery_id: deliveryId,
          mission_id: missionId,
        });
      }
      await loadDetail();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Action failed.";
      setError(message);
    } finally {
      setActing(false);
    }
  }

  async function handleTerminalAction(
    fn: (userId: string, deliveryId: string) => Promise<void>,
    analyticsEvent: Parameters<typeof trackEvent>[1],
  ) {
    if (!deliveryId) return;

    const supabase = getSupabase();
    const userId = (await supabase?.auth.getSession())?.data.session?.user?.id;
    if (!userId) {
      setError("No active session.");
      return;
    }

    setActing(true);
    setError(null);
    try {
      await fn(userId, deliveryId);
      await trackEvent(userId, analyticsEvent, {
        delivery_id: deliveryId,
        mission_id: missionId,
      });
      router.replace("/(main)/inbox");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Action failed.";
      setError(message);
      setActing(false);
    }
  }

  async function handlePostponeConfirm(picked: Date) {
    if (!deliveryId) return;

    const supabase = getSupabase();
    const userId = (await supabase?.auth.getSession())?.data.session?.user?.id;
    if (!userId) {
      setError("No active session.");
      return;
    }

    setActing(true);
    setError(null);
    try {
      await postponeDelivery(userId, deliveryId, picked);
      await trackEvent(userId, "mission_postponed", {
        delivery_id: deliveryId,
        mission_id: missionId,
        postponed_until: picked.toISOString(),
      });
      setShowPostpone(false);
      router.replace("/(main)/inbox");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not postpone.";
      setError(message);
      setActing(false);
    }
  }

  async function handleShareStepContinue(
    reflection: string,
    didShare: boolean,
    hasPhoto: boolean,
  ) {
    if (!deliveryId) return;

    const supabase = getSupabase();
    const userId = (await supabase?.auth.getSession())?.data.session?.user?.id;
    if (!userId) {
      setError("No active session.");
      return;
    }

    setActing(true);
    setError(null);
    try {
      await saveMissionReflection(userId, deliveryId, reflection);
      if (didShare) {
        await trackEvent(userId, "mission_shared", {
          delivery_id: deliveryId,
          mission_id: missionId,
          has_reflection: reflection.trim().length > 0,
          has_photo: hasPhoto,
        });
      }
      setShareStepDone(true);
      await loadDetail();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not save your note.";
      setError(message);
    } finally {
      setActing(false);
    }
  }

  async function handleHelpful(helpful: boolean) {
    if (!deliveryId) return;

    const supabase = getSupabase();
    const userId = (await supabase?.auth.getSession())?.data.session?.user?.id;
    if (!userId) return;

    setActing(true);
    setError(null);
    try {
      await setDeliveryHelpful(userId, deliveryId, helpful);
      await trackEvent(
        userId,
        helpful ? "feedback_helpful_yes" : "feedback_helpful_no",
        { delivery_id: deliveryId, mission_id: missionId },
      );
      router.replace("/(main)/inbox");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save feedback.";
      setError(message);
      setActing(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error && !detail) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <PrimaryButton
          label="Back to Inbox"
          onPress={() => router.replace("/(main)/inbox")}
          style={styles.backButton}
        />
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Mission not found.</Text>
        <PrimaryButton
          label="Back to Inbox"
          onPress={() => router.replace("/(main)/inbox")}
          style={styles.backButton}
        />
      </View>
    );
  }

  const { delivery, mission, response } = detail;
  const status = delivery.status;
  const showActions = status === "delivered" || status === "opened";
  const showComplete = status === "accepted";
  const showShareStep =
    status === "completed" &&
    response != null &&
    response.helpful === null &&
    !shareStepDone;
  const showFeedback =
    status === "completed" &&
    response != null &&
    response.helpful === null &&
    shareStepDone;
  const showReopen = status === "postponed" || status === "skipped";
  const isTerminal =
    status === "completed" && response?.helpful != null;

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.category}>{mission.category}</Text>
      <Text style={styles.title}>{mission.title}</Text>
      <Text style={styles.body}>{mission.body}</Text>

      {error ? <Text style={styles.inlineError}>{error}</Text> : null}

      {showActions ? (
        <View style={styles.actions}>
          <PrimaryButton
            label="Accept"
            loading={acting}
            onPress={() =>
              void runAction(acceptDelivery, "mission_accepted")
            }
          />
          <Pressable
            accessibilityRole="button"
            disabled={acting}
            onPress={() => setShowPostpone(true)}
            style={({ pressed }) => [
              styles.secondaryButton,
              acting && styles.secondaryDisabled,
              pressed && !acting && styles.secondaryPressed,
            ]}
          >
            <Text style={styles.secondaryLabel}>Later</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={acting}
            onPress={() => void handleTerminalAction(skipDelivery, "mission_skipped")}
            style={({ pressed }) => [
              styles.ghostButton,
              acting && styles.secondaryDisabled,
              pressed && !acting && styles.secondaryPressed,
            ]}
          >
            <Text style={styles.ghostLabel}>Skip</Text>
          </Pressable>
        </View>
      ) : null}

      {showComplete ? (
        <PrimaryButton
          label="I did it"
          loading={acting}
          onPress={() =>
            void runAction(completeDelivery, "mission_completed")
          }
          style={styles.completeButton}
        />
      ) : null}

      {showShareStep ? (
        <MissionShareStep
          mission={mission}
          initialReflection={response?.reflection_text ?? ""}
          loading={acting}
          onContinueAfterShare={handleShareStepContinue}
        />
      ) : null}

      {showFeedback ? (
        <View style={styles.feedbackBlock}>
          <Text style={styles.feedbackPrompt}>Was this helpful?</Text>
          <View style={styles.feedbackRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Yes, helpful"
              disabled={acting}
              onPress={() => void handleHelpful(true)}
              style={({ pressed }) => [
                styles.feedbackButton,
                pressed && styles.secondaryPressed,
              ]}
            >
              <Text style={styles.feedbackEmoji}>👍</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="No, not helpful"
              disabled={acting}
              onPress={() => void handleHelpful(false)}
              style={({ pressed }) => [
                styles.feedbackButton,
                pressed && styles.secondaryPressed,
              ]}
            >
              <Text style={styles.feedbackEmoji}>👎</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {showReopen ? (
        <View style={styles.doneBlock}>
          <Text style={styles.doneText}>
            {status === "postponed"
              ? delivery.postponed_until
                ? `Scheduled for ${formatReturnTime(delivery.postponed_until)}. Ready sooner? Pick it up now.`
                : "Set aside for later. You can pick it up whenever you're ready."
              : "Skipped earlier — still interested? You can pick it up now."}
          </Text>
          <PrimaryButton
            label="Pick up now"
            loading={acting}
            onPress={() =>
              void runAction(reopenDelivery, "mission_resumed")
            }
          />
          <Pressable
            accessibilityRole="button"
            disabled={acting}
            onPress={() => router.replace("/(main)/inbox")}
            style={styles.backLink}
          >
            <Text style={styles.ghostLabel}>Back to Inbox</Text>
          </Pressable>
        </View>
      ) : null}

      {isTerminal ? (
        <View style={styles.doneBlock}>
          <Text style={styles.doneText}>
            Thanks for sharing. See you in the inbox.
          </Text>
          <PrimaryButton
            label="Back to Inbox"
            onPress={() => router.replace("/(main)/inbox")}
          />
        </View>
      ) : null}

      <PostponeSheet
        visible={showPostpone}
        loading={acting}
        onClose={() => setShowPostpone(false)}
        onConfirm={(date) => void handlePostponeConfirm(date)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    padding: theme.spacing.screenLarge,
    paddingBottom: 40,
    backgroundColor: theme.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.screenLarge,
    backgroundColor: theme.background,
  },
  category: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.primaryStrong,
    textTransform: "capitalize",
    marginBottom: 8,
  },
  title: {
    ...theme.typography.pageTitle,
    color: theme.text,
    marginBottom: 16,
  },
  body: {
    fontSize: 17,
    lineHeight: 26,
    color: theme.textBody,
    marginBottom: 24,
  },
  actions: {
    gap: 12,
  },
  secondaryButton: {
    borderRadius: theme.radius,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderStrong,
  },
  secondaryDisabled: {
    opacity: 0.5,
  },
  secondaryPressed: {
    opacity: 0.85,
  },
  secondaryLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
  },
  ghostButton: {
    borderRadius: theme.radius,
    paddingVertical: 12,
    alignItems: "center",
  },
  ghostLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.textSecondary,
  },
  completeButton: {
    marginTop: 8,
  },
  feedbackBlock: {
    marginTop: 8,
    padding: 20,
    borderRadius: theme.radius,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  feedbackPrompt: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 16,
    textAlign: "center",
  },
  feedbackRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  feedbackButton: {
    padding: 12,
    borderRadius: theme.radius,
    backgroundColor: theme.primaryMuted,
  },
  feedbackEmoji: {
    fontSize: 32,
  },
  doneBlock: {
    marginTop: 16,
    gap: 12,
  },
  backLink: {
    paddingVertical: 12,
    alignItems: "center",
  },
  doneText: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.textBody,
    textAlign: "center",
  },
  errorText: {
    fontSize: 15,
    color: theme.errorDark,
    textAlign: "center",
    marginBottom: 16,
  },
  inlineError: {
    fontSize: 14,
    color: theme.error,
    marginBottom: 12,
  },
  backButton: {
    marginTop: 8,
  },
});
