import type { ExpoConfig } from "expo/config";

export default (): ExpoConfig => ({
  name: "IRL",
  slug: "irl-mvp",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "irl",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    },
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
    "expo-secure-store",
    "expo-localization",
    [
      "expo-notifications",
      {
        icon: "./assets/images/icon.png",
        color: "#ffffff",
      },
    ],
  ],
});
