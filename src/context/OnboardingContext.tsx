import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_ONBOARDING_DRAFT,
  type FrequencyTier,
  type OnboardingDraft,
} from "@/types/preferences";

type OnboardingContextValue = {
  draft: OnboardingDraft;
  setActiveHourStart: (hour: number) => void;
  setActiveHourEnd: (hour: number) => void;
  setFrequency: (frequency: FrequencyTier) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setAnalyticsConsent: (consent: boolean) => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>(DEFAULT_ONBOARDING_DRAFT);

  const setActiveHourStart = useCallback((hour: number) => {
    setDraft((prev) => ({ ...prev, activeHourStart: hour }));
  }, []);

  const setActiveHourEnd = useCallback((hour: number) => {
    setDraft((prev) => ({ ...prev, activeHourEnd: hour }));
  }, []);

  const setFrequency = useCallback((frequency: FrequencyTier) => {
    setDraft((prev) => ({ ...prev, frequency }));
  }, []);

  const setNotificationsEnabled = useCallback((enabled: boolean) => {
    setDraft((prev) => ({ ...prev, notificationsEnabled: enabled }));
  }, []);

  const setAnalyticsConsent = useCallback((consent: boolean) => {
    setDraft((prev) => ({ ...prev, analyticsConsent: consent }));
  }, []);

  const value = useMemo(
    () => ({
      draft,
      setActiveHourStart,
      setActiveHourEnd,
      setFrequency,
      setNotificationsEnabled,
      setAnalyticsConsent,
    }),
    [
      draft,
      setActiveHourStart,
      setActiveHourEnd,
      setFrequency,
      setNotificationsEnabled,
      setAnalyticsConsent,
    ],
  );

  return (
    <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return ctx;
}
