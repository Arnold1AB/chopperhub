import { StyleSheet } from "react-native";

export const colors = {
  // Brand System
  primary: "#FFFFFF",
  secondary: "#35A7FF",
  accent: "#FFE74C",

  // Background System
  background: "#0F172A",
  surface: "#1E293B",
  surfaceElevated: "#273449",

  // Highlight Cards
  surfaceBlue: "#1E40AF",
  surfaceAccent: "#8A6A00",

  // Text
  text: "#FFFFFF",
  textMuted: "#CBD5E1",

  // Utility
  border: "#334155",

  success: "#22C55E",
  danger: "#EF4444",

  warning: "#F59E0B",
  overlay: "rgba(15, 23, 42, 0.72)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 18,
  pill: 999,
};

export const typography = {
  screenTitle: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: colors.primary,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  muted: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 34,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: -0.8,
  },

  date: {
    marginTop: 6,
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: "500",
  },

  link: {
    color: colors.secondary,
    fontSize: 17,
    fontWeight: "700",
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },

  cardBlue: {
    backgroundColor: colors.surfaceBlue,
    borderRadius: 18,
    padding: 18,
    marginTop: 16,
  },

  cardAccent: {
    backgroundColor: colors.surfaceAccent,
    borderRadius: 18,
    padding: 18,
    marginTop: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 8,
  },

  textMuted: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },

  button: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
  },

  buttonText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 16,
  },

  badge: {
    backgroundColor: colors.accent,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
});
