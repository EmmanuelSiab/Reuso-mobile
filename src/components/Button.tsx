import { ActivityIndicator, Pressable, PressableProps, Text } from "react-native";
import { shared, theme } from "../styles/theme";

type Props = PressableProps & {
  label: string;
  variant?: "primary" | "secondary";
  loading?: boolean;
};

export function Button({ label, variant = "primary", loading, disabled, style, ...props }: Props) {
  const isPrimary = variant === "primary";
  return (
    <Pressable
      {...props}
      disabled={disabled || loading}
      style={({ pressed }) => [
        shared.button,
        isPrimary ? shared.primaryButton : shared.secondaryButton,
        (disabled || loading) && { opacity: 0.55 },
        pressed && { transform: [{ translateY: 1 }] },
        style as any,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#ffffff" : theme.colors.primary} />
      ) : (
        <Text style={isPrimary ? shared.primaryButtonText : shared.secondaryButtonText}>{label}</Text>
      )}
    </Pressable>
  );
}
