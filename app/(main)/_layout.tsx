import { Stack } from "expo-router";

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerTitle: "IRL" }}>
      <Stack.Screen name="inbox" options={{ title: "Inbox" }} />
    </Stack>
  );
}
