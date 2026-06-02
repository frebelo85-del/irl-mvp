import { theme } from "@/constants/theme";

/** Shared Switch colors for settings and onboarding. */
export const switchTrackColors = {
  false: theme.border,
  true: theme.primary,
} as const;

export const switchThumbColor = theme.surface;
