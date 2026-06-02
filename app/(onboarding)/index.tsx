import { Redirect } from "expo-router";

/** Entry from Phase C bootstrap — forwards to first onboarding step. */
export default function OnboardingIndexRedirect() {
  return <Redirect href="/(onboarding)/hours" />;
}
