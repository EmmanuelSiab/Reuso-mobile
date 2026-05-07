import { StyleSheet } from "react-native";

export const theme = {
  colors: {
    background: "#fff7f6",
    surface: "#ffffff",
    surfaceSoft: "#fff0ee",
    text: "#151111",
    muted: "rgba(21,17,17,0.62)",
    softText: "rgba(21,17,17,0.76)",
    border: "rgba(210,42,35,0.14)",
    primary: "#ff3b30",
    primaryDark: "#d9251b",
    success: "#167a4a",
    successSoft: "#edf8f1",
  },
  radius: 8,
  shadow: {
    shadowColor: "#781410",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
};

export const shared = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 132,
  },
  eyebrow: {
    color: theme.colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  h1: {
    color: theme.colors.text,
    fontSize: 42,
    lineHeight: 42,
    fontWeight: "900",
  },
  h2: {
    color: theme.colors.text,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900",
  },
  body: {
    color: theme.colors.softText,
    fontSize: 15,
    lineHeight: 22,
  },
  muted: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius,
    ...theme.shadow,
  },
  button: {
    minHeight: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 15,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 15,
  },
  input: {
    minHeight: 48,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.96)",
    paddingHorizontal: 13,
    color: theme.colors.text,
    fontSize: 15,
  },
});
