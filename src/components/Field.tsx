import { Text, TextInput, TextInputProps, View } from "react-native";
import { shared, theme } from "../styles/theme";

type Props = TextInputProps & {
  label: string;
  hint?: string;
};

export function Field({ label, hint, style, ...props }: Props) {
  return (
    <View style={{ gap: 7 }}>
      <Text style={{ color: theme.colors.muted, fontSize: 13, fontWeight: "900" }}>{label}</Text>
      <TextInput
        placeholderTextColor="rgba(21,17,17,0.38)"
        style={[shared.input, props.multiline && { minHeight: 112, paddingTop: 12, textAlignVertical: "top" }, style]}
        {...props}
      />
      {hint ? <Text style={shared.muted}>{hint}</Text> : null}
    </View>
  );
}
