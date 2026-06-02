import type { ExpoConfig } from "expo/config";

/** Public EAS project UUID (@fil-rebelo/irl-mvp). Required for EAS CLI + getExpoPushTokenAsync. */
const EAS_PROJECT_ID = "8e6ab3d4-e205-4d94-b9dd-89e3cdd87862";

export default (): ExpoConfig => ({
  name: "Alica",
  slug: "irl-mvp",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "irl",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.filrebelo.irlmvp",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: "com.filrebelo.irlmvp",
    /** Required for Expo push on Android — see docs/android-fcm-setup.md */
    googleServicesFile: "./google-services.json",
    adaptiveIcon: {
      backgroundColor: "#FFF4E8",
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
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? EAS_PROJECT_ID,
    },
  },
  plugins: [
    "expo-router",
    "expo-dev-client",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#FFF4E8",
      },
    ],
    "expo-secure-store",
    "expo-localization",
    [
      "expo-notifications",
      {
        icon: "./assets/images/icon.png",
        color: "#FFA652",
      },
    ],
    "@react-native-community/datetimepicker",
    "expo-apple-authentication",
    "@react-native-google-signin/google-signin",
    [
      "expo-image-picker",
      {
        photosPermission:
          "Alica uses your photo library only when you choose to add an image to a mission share card.",
        cameraPermission:
          "Alica uses your camera only when you choose to add a photo to a mission share card.",
      },
    ],
  ],
});
