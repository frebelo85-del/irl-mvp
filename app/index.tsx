import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  getSupabaseEnv,
  maskAnonKeyPreview,
  maskUrlPreview,
} from "@/constants/env";
import { getSessionSafe } from "@/lib/supabase";

export default function HomeScreen() {
  const [sessionLine, setSessionLine] = useState<string>("…");
  const [loading, setLoading] = useState(true);

  const env = getSupabaseEnv();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { session, error } = await getSessionSafe();
      if (cancelled) return;
      if (error) {
        setSessionLine(`API error: ${error}`);
      } else if (!session) {
        setSessionLine("No session (expected before Phase C anonymous sign-in).");
      } else {
        setSessionLine(`Session OK (user id: ${session.user.id.slice(0, 8)}…)`);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>IRL</Text>
      <Text style={styles.sub}>Phase A — scaffold + env</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Supabase configured</Text>
        <Text style={styles.value}>{env.configured ? "yes" : "no"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>EXPO_PUBLIC_SUPABASE_URL (preview)</Text>
        <Text style={styles.mono}>{maskUrlPreview(env.url)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>EXPO_PUBLIC_SUPABASE_ANON_KEY (preview)</Text>
        <Text style={styles.mono}>{maskAnonKeyPreview(env.anonKey)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>getSession()</Text>
        {loading ? (
          <ActivityIndicator style={styles.spinner} />
        ) : (
          <Text style={styles.value}>{sessionLine}</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 56,
    gap: 12,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
  },
  sub: {
    fontSize: 15,
    color: "#555",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  value: {
    fontSize: 15,
    color: "#111",
  },
  mono: {
    fontSize: 14,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
    color: "#111",
  },
  spinner: { marginVertical: 4 },
});
