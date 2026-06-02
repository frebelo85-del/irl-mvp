/** Alica brand tokens — single source for UI colors, spacing, radii. */
export const theme = {
  primary: "#FFA652",
  primaryStrong: "#E07A1A",
  primaryMuted: "#FFF4E8",

  background: "#FAFAF9",
  surface: "#FFFFFF",

  text: "#111827",
  textSecondary: "#6b7280",
  textTertiary: "#9ca3af",
  textBody: "#374151",

  border: "#e5e7eb",
  borderStrong: "#d1d5db",

  success: "#059669",
  error: "#b91c1c",
  errorDark: "#991b1b",
  errorBg: "#fef2f2",
  errorBorder: "#fecaca",
  errorText: "#451a1a",

  disabled: "#d1d5db",
  onPrimary: "#FFFFFF",

  radius: 12,
  spacing: {
    screen: 16,
    screenLarge: 24,
  },

  typography: {
    step: { fontSize: 13, fontWeight: "600" as const },
    pageTitle: { fontSize: 26, fontWeight: "700" as const, lineHeight: 32 },
    sectionTitle: { fontSize: 18, fontWeight: "700" as const },
    body: { fontSize: 15, lineHeight: 22 },
    button: { fontSize: 16, fontWeight: "600" as const },
  },
} as const;
