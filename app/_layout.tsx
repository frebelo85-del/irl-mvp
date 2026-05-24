import "react-native-reanimated";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { configureNotifications } from "@/lib/notifications";

export default function RootLayout() {
  useEffect(() => {
    configureNotifications();
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          headerTitle: "IRL",
        }}
      >
        <Stack.Screen name="index" options={{ animation: "none" }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
