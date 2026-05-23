import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerTitle: "IRL", headerBackVisible: false }}>
      <Stack.Screen name="index" options={{ title: "Get started" }} />
    </Stack>
  );
}
