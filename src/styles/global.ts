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
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 20,
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
