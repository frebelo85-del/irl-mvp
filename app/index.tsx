import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useBootstrap } from "@/hooks/useBootstrap";

export default function IndexGateScreen() {
  const state = useBootstrap();

  if (state.status === "loading") {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.caption}>Loading…</Text>
      </View>
    );
  }

  if (state.status === "error") {
    return (
      <View style={styles.errorBox}>
        <Text style={styles.errorTitle}>{state.isConfig ? "Configuration" : "Could not sign in"}</Text>
        <Text style={styles.errorBody}>{state.message}</Text>
      </View>
    );
  }

  return <Redirect href={state.href} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f8f9fa",
  },
  caption: { fontSize: 15, color: "#6b7280" },
  errorBox: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fef2f2",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#991b1b",
  },
  errorBody: {
    fontSize: 15,
    lineHeight: 22,
    color: "#451a1a",
  },
});
