import { Image, StyleSheet, Text, View } from "react-native";
import { theme } from "../styles/theme";

type Props = {
  compact?: boolean;
  subtitle?: string;
};

export function LogoHeader({ compact = false, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <Image
        source={require("../../assets/reuso-logo-transparent.png")}
        style={[styles.logo, compact && styles.logoCompact]}
        resizeMode="contain"
      />
      <View style={{ flex: 1 }}>
        <Text style={[styles.wordmark, compact && styles.wordmarkCompact]}>Reuso</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: theme.radius,
    backgroundColor: theme.colors.surface,
  },
  logoCompact: {
    width: 42,
    height: 42,
  },
  wordmark: {
    color: theme.colors.text,
    fontSize: 32,
    lineHeight: 34,
    fontWeight: "900",
  },
  wordmarkCompact: {
    fontSize: 22,
    lineHeight: 24,
  },
  subtitle: {
    marginTop: 2,
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
});
