import { Stack } from "expo-router";

import { usePushRegistration } from "@/hooks/usePushRegistration";

export default function MainLayout() {
  usePushRegistration();

  return (
    <Stack screenOptions={{ headerTitle: "IRL" }}>
      <Stack.Screen name="inbox" options={{ title: "Inbox" }} />
    </Stack>
  );
}
