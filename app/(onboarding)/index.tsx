import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { getSupabase } from "@/lib/supabase";

/** Placeholder until Phase D (categories → hours → consent). */
export default function OnboardingStubScreen() {
  const [userPreview, setUserPreview] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const sb = getSupabase();
      if (!sb || cancelled) return;
      const { data } = await sb.auth.getSession();
      if (!data.session?.user?.id || cancelled) return;
      const id = data.session.user.id;
      setUserPreview(`${id.slice(0, 8)}…`);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>Onboarding</Text>
      <Text style={styles.lead}>Phase D will add categories, hours, and consent here.</Text>
      {userPreview ? (
        <View style={styles.card}>
          <Text style={styles.label}>Signed in (preview)</Text>
          <Text selectable style={styles.mono}>
            user id {userPreview}
          </Text>
          <Text style={styles.note}>For debugging — do not screenshot with full id.</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 16,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111",
  },
  lead: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 16,
    lineHeight: 22,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  mono: {
    fontSize: 13,
    fontFamily: "monospace",
    color: "#111",
    marginBottom: 8,
  },
  note: { fontSize: 12, color: "#6b7280", fontStyle: "italic" },
});
