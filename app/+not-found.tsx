import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen does not exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Back home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.screenLarge,
    backgroundColor: theme.background,
  },
  title: { fontSize: 18, fontWeight: "600", color: theme.text },
  link: { marginTop: 16 },
  linkText: { fontSize: 16, color: theme.primaryStrong },
});
