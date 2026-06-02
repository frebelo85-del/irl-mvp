import { OnboardingProvider } from "@/context/OnboardingContext";
import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerTitle: "Alica" }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="hours"
          options={{ title: "Active hours", headerBackVisible: false }}
        />
        <Stack.Screen name="consent" options={{ title: "Notifications" }} />
      </Stack>
    </OnboardingProvider>
  );
}
