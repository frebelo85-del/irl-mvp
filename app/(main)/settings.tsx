import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { PrimaryButton } from "@/components/onboarding/PrimaryButton";
import { switchThumbColor, switchTrackColors } from "@/constants/switch";
import { theme } from "@/constants/theme";
import { getProfile } from "@/lib/auth";
import {
  isAppleSignInAvailable,
  isGoogleSignInAvailable,
  linkWithApple,
  linkWithGoogle,
  restoreWithApple,
  restoreWithGoogle,
} from "@/lib/auth-link";
import {
  getFullUserPreferences,
  preferencesToDraft,
  setAnalyticsConsent,
  setNotificationsEnabled,
  updateUserPreferences,
} from "@/lib/preferences";
import { syncPushRegistration } from "@/lib/notifications";
import { deleteAccount, exportUserData } from "@/lib/user-data";
import { getSupabase } from "@/lib/supabase";
import type { OnboardingDraft } from "@/types/preferences";
import type { FrequencyTier } from "@/types/preferences";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(hour: number): string {
  const suffix = hour < 12 ? "am" : "pm";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}${suffix}`;
}

export default function SettingsScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [accountLinkedAt, setAccountLinkedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteInput, setShowDeleteInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);

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

      const prefs = await getFullUserPreferences(userId);
      if (!prefs) {
        throw new Error("Preferences not found.");
      }
      setDraft(preferencesToDraft(prefs));

      const profile = await getProfile(userId);
      setAccountLinkedAt(profile?.account_linked_at ?? null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not load settings.";
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

  async function getUserId(): Promise<string> {
    const supabase = getSupabase();
    const userId = (await supabase?.auth.getSession())?.data.session?.user?.id;
    if (!userId) {
      throw new Error("No active session.");
    }
    return userId;
  }

  async function handleSaveMissionPrefs() {
    if (!draft) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const userId = await getUserId();
      await updateUserPreferences(userId, draft);
      setMessage("Preferences saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleNotificationsToggle(enabled: boolean) {
    if (!draft) return;
    setDraft((prev) => (prev ? { ...prev, notificationsEnabled: enabled } : prev));
    setError(null);
    try {
      const userId = await getUserId();
      await setNotificationsEnabled(userId, enabled);
      if (enabled) {
        await syncPushRegistration(userId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update notifications.");
      setDraft((prev) =>
        prev ? { ...prev, notificationsEnabled: !enabled } : prev,
      );
    }
  }

  async function handleAnalyticsToggle(consent: boolean) {
    if (!draft) return;
    setDraft((prev) => (prev ? { ...prev, analyticsConsent: consent } : prev));
    setError(null);
    try {
      const userId = await getUserId();
      await setAnalyticsConsent(userId, consent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update analytics.");
      setDraft((prev) =>
        prev ? { ...prev, analyticsConsent: !consent } : prev,
      );
    }
  }

  async function handleExport() {
    setExporting(true);
    setError(null);
    try {
      await exportUserData();
      setMessage("Export ready — use the share sheet to save your data.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  }

  function promptDeleteAccount() {
    Alert.alert(
      "Delete account?",
      "This permanently removes your missions, preferences, and stats — including any Apple/Google link. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          style: "destructive",
          onPress: () => setShowDeleteInput(true),
        },
      ],
    );
  }

  async function runAuthAction(
    fn: () => Promise<void>,
    successMessage: string,
  ) {
    setLinking(true);
    setError(null);
    setMessage(null);
    try {
      await fn();
      await load();
      setMessage(successMessage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setLinking(false);
    }
  }

  async function runRestoreAction(
    fn: () => Promise<string>,
  ) {
    setLinking(true);
    setError(null);
    setMessage(null);
    try {
      const successMessage = await fn();
      Alert.alert("Restore", successMessage);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Restore failed.";
      if (msg.includes("cancelled")) {
        setMessage(msg);
      } else {
        setError(msg);
      }
    } finally {
      setLinking(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm.trim().toUpperCase() !== "DELETE") {
      setError('Type DELETE to confirm.');
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      await deleteAccount();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
      setDeleting(false);
    }
  }

  if (loading || !draft) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const scheduleValid = draft.activeHourStart !== draft.activeHourEnd;

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      {error ? <Text style={styles.errorBanner}>{error}</Text> : null}
      {message ? <Text style={styles.messageBanner}>{message}</Text> : null}

      <Text style={styles.sectionTitle}>Schedule</Text>

      <Text style={styles.fieldLabel}>Active hours</Text>
      <View style={styles.hourRow}>
        {HOURS.map((hour) => (
          <Pressable
            key={`start-${hour}`}
            onPress={() => setDraft((p) => (p ? { ...p, activeHourStart: hour } : p))}
            style={[
              styles.hourChip,
              draft.activeHourStart === hour && styles.hourChipSelected,
            ]}
          >
            <Text
              style={[
                styles.hourText,
                draft.activeHourStart === hour && styles.hourTextSelected,
              ]}
            >
              {formatHour(hour)}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.fieldLabel}>Until</Text>
      <View style={styles.hourRow}>
        {HOURS.map((hour) => (
          <Pressable
            key={`end-${hour}`}
            onPress={() => setDraft((p) => (p ? { ...p, activeHourEnd: hour } : p))}
            style={[
              styles.hourChip,
              draft.activeHourEnd === hour && styles.hourChipSelected,
            ]}
          >
            <Text
              style={[
                styles.hourText,
                draft.activeHourEnd === hour && styles.hourTextSelected,
              ]}
            >
              {formatHour(hour)}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Frequency</Text>
      {(["low", "medium"] as FrequencyTier[]).map((freq) => (
        <Pressable
          key={freq}
          onPress={() => setDraft((p) => (p ? { ...p, frequency: freq } : p))}
          style={[
            styles.freqOption,
            draft.frequency === freq && styles.freqOptionSelected,
          ]}
        >
          <Text style={styles.freqLabel}>{freq === "low" ? "Low" : "Medium"}</Text>
        </Pressable>
      ))}

      <PrimaryButton
        label="Save schedule"
        loading={saving}
        disabled={!scheduleValid}
        onPress={() => void handleSaveMissionPrefs()}
        style={styles.sectionButton}
      />

      <Text style={styles.sectionTitle}>Notifications</Text>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Mission nudges</Text>
        <Switch
          value={draft.notificationsEnabled}
          onValueChange={(v) => void handleNotificationsToggle(v)}
          trackColor={switchTrackColors}
          thumbColor={switchThumbColor}
        />
      </View>

      <Text style={styles.sectionTitle}>Analytics</Text>
      <Text style={styles.sectionLead}>
        Optional product analytics — separate from notifications.
      </Text>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Share anonymous usage</Text>
        <Switch
          value={draft.analyticsConsent}
          onValueChange={(v) => void handleAnalyticsToggle(v)}
          trackColor={switchTrackColors}
          thumbColor={switchThumbColor}
        />
      </View>

      <Text style={styles.sectionTitle}>Save progress</Text>
      <Text style={styles.sectionLead}>
        Link an account to keep your progress when you change devices.
      </Text>
      {accountLinkedAt ? (
        <Text style={styles.linkedNote}>
          Progress saved — linked{" "}
          {new Date(accountLinkedAt).toLocaleDateString()}.
        </Text>
      ) : null}

      {!accountLinkedAt ? (
        <>
          <Text style={styles.subheading}>Save progress (this device)</Text>
          {isAppleSignInAvailable() ? (
            <PrimaryButton
              label="Save with Apple"
              loading={linking}
              onPress={() =>
                void runAuthAction(
                  linkWithApple,
                  "Linked with Apple. Your progress is saved.",
                )
              }
              style={styles.sectionButton}
            />
          ) : null}
          {isGoogleSignInAvailable() ? (
            <PrimaryButton
              label="Save with Google"
              loading={linking}
              onPress={() =>
                void runAuthAction(
                  linkWithGoogle,
                  "Linked with Google. Your progress is saved.",
                )
              }
              style={styles.sectionButton}
            />
          ) : (
            <Text style={styles.comingSoon}>
              Google sign-in needs EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID and a new
              Dev Build after Phase H.
            </Text>
          )}
        </>
      ) : null}

      <Text style={styles.subheading}>Restore on a new device</Text>
      <Text style={styles.sectionLead}>
        After reinstalling, open Settings and sign in with the same account.
      </Text>
      {isAppleSignInAvailable() ? (
        <PrimaryButton
          label="Restore with Apple"
          loading={linking}
          onPress={() => void runRestoreAction(restoreWithApple)}
          style={styles.sectionButton}
        />
      ) : null}
      {isGoogleSignInAvailable() ? (
        <PrimaryButton
          label="Restore with Google"
          loading={linking}
          onPress={() => void runRestoreAction(restoreWithGoogle)}
          style={styles.sectionButton}
        />
      ) : null}

      <Text style={styles.sectionTitle}>Your data</Text>
      <PrimaryButton
        label="Export my data"
        loading={exporting}
        onPress={() => void handleExport()}
        style={styles.sectionButton}
      />
      <Pressable
        accessibilityRole="button"
        onPress={promptDeleteAccount}
        style={styles.destructiveButton}
      >
        <Text style={styles.destructiveLabel}>Delete account</Text>
      </Pressable>

      {showDeleteInput ? (
        <View style={styles.deleteBlock}>
          <Text style={styles.deleteHint}>Type DELETE to confirm.</Text>
          <TextInput
            autoCapitalize="characters"
            value={deleteConfirm}
            onChangeText={setDeleteConfirm}
            placeholder="DELETE"
            style={styles.deleteInput}
          />
          <PrimaryButton
            label="Permanently delete"
            loading={deleting}
            onPress={() => void handleDeleteAccount()}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    padding: theme.spacing.screen,
    paddingBottom: 40,
    backgroundColor: theme.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.background,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.text,
    marginTop: 20,
    marginBottom: 8,
  },
  sectionLead: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.textBody,
    marginBottom: 8,
    marginTop: 8,
  },
  hourRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  hourChip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
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
    fontSize: 12,
    color: theme.textBody,
  },
  hourTextSelected: {
    color: theme.text,
    fontWeight: "600",
  },
  freqOption: {
    padding: 14,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
    marginBottom: 8,
  },
  freqOptionSelected: {
    borderColor: theme.primary,
    backgroundColor: theme.primaryMuted,
  },
  freqLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
  },
  sectionButton: {
    marginTop: 12,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.surface,
    padding: theme.spacing.screen,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.border,
  },
  toggleLabel: {
    fontSize: 16,
    color: theme.text,
    flex: 1,
    marginRight: 12,
  },
  linkedNote: {
    fontSize: 14,
    color: theme.success,
    lineHeight: 20,
  },
  comingSoon: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    fontStyle: "italic",
  },
  subheading: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.textBody,
    marginTop: 8,
    marginBottom: 8,
  },
  destructiveButton: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.errorBorder,
    backgroundColor: theme.errorBg,
  },
  destructiveLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.error,
  },
  deleteBlock: {
    marginTop: 16,
    padding: theme.spacing.screen,
    backgroundColor: theme.surface,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.errorBorder,
  },
  deleteHint: {
    fontSize: 14,
    color: theme.errorText,
    marginBottom: 8,
  },
  deleteInput: {
    borderWidth: 1,
    borderColor: theme.borderStrong,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: theme.surface,
  },
  errorBanner: {
    fontSize: 14,
    color: theme.error,
    marginBottom: 8,
  },
  messageBanner: {
    fontSize: 14,
    color: theme.success,
    marginBottom: 8,
  },
});
