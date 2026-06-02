import { Tabs } from "expo-router";

import { theme } from "@/constants/theme";
import { usePushRegistration } from "@/hooks/usePushRegistration";

export default function MainLayout() {
  usePushRegistration();

  return (
    <Tabs
      screenOptions={{
        headerTitle: "Alica",
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textTertiary,
      }}
    >
      <Tabs.Screen
        name="inbox"
        options={{ title: "Inbox", tabBarLabel: "Inbox" }}
      />
      <Tabs.Screen
        name="stats"
        options={{ title: "Stats", tabBarLabel: "Stats" }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: "Settings", tabBarLabel: "Settings" }}
      />
    </Tabs>
  );
}
