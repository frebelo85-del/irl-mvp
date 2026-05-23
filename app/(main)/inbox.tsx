import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { getSupabase } from "@/lib/supabase";

/** Stub until Phase G (mission list + deliveries). */
export default function InboxStubScreen() {
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
      <Text style={styles.title}>Inbox</Text>
      <Text style={styles.lead}>Phase G will list mission deliveries here.</Text>
      {userPreview ? (
        <View style={styles.card}>
          <Text style={styles.label}>Session preview</Text>
          <Text selectable style={styles.mono}>
            user id {userPreview}
          </Text>
        </View>
      ) : null}
      <Text style={styles.note}>
        You landed here because <Text style={styles.monoInline}>onboarding_completed</Text> is true in{" "}
        <Text style={styles.monoInline}>public.profiles</Text> (set manually in Phase C test, then Phase D
        from the app).
      </Text>
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
  monoInline: { fontFamily: "monospace", fontSize: 13 },
  note: {
    marginTop: 16,
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 18,
  },
});
