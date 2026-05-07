import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { Field } from "../src/components/Field";
import { LogoHeader } from "../src/components/LogoHeader";
import { useAuth } from "../src/context/AuthContext";
import { supabase } from "../src/lib/supabase";
import { shared, theme } from "../src/styles/theme";

export default function AuthScreen() {
  const router = useRouter();
  const { isLoggedIn, needsEmailVerification, profileLoading, needsOnboarding } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isLoggedIn || profileLoading) return;
    if (needsEmailVerification) return;
    router.replace(needsOnboarding ? "/account-type" : "/explore");
  }, [isLoggedIn, needsEmailVerification, needsOnboarding, profileLoading, router]);

  async function submit() {
    const cleanEmail = email.trim().toLowerCase();
    setMessage("");
    if (!cleanEmail || password.length < 6) {
      setMessage("Escribe un email y una contrasena de al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email: cleanEmail, password });
        if (error) throw error;
        setMessage("Cuenta creada. Revisa tu email para confirmar antes de publicar.");
        Alert.alert("Revisa tu email", "Confirma tu cuenta y vuelve a iniciar sesion en Reuso.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
      }
    } catch (error: any) {
      setMessage(error?.message || "No se pudo completar el acceso.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={shared.screen} behavior={Platform.select({ ios: "padding", android: undefined })}>
      <ScrollView contentContainerStyle={shared.content}>
        <LogoHeader subtitle="Tu cuenta Reuso" />
        <View style={styles.head}>
          <Text style={shared.h1}>{mode === "signup" ? "Crea tu cuenta" : "Entra a Reuso"}</Text>
          <Text style={shared.body}>
            Guarda anuncios, escribe a vendedores y publica piezas con tu identidad publica, no con tu email.
          </Text>
        </View>

        <View style={styles.toggle}>
          <Button label="Entrar" variant={mode === "login" ? "primary" : "secondary"} onPress={() => setMode("login")} style={styles.toggleButton} />
          <Button label="Registro" variant={mode === "signup" ? "primary" : "secondary"} onPress={() => setMode("signup")} style={styles.toggleButton} />
        </View>

        <View style={styles.card}>
          <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <Field label="Contrasena" value={password} onChangeText={setPassword} secureTextEntry />
          <Button
            label={mode === "signup" ? "Crear cuenta" : "Entrar"}
            loading={loading}
            onPress={submit}
          />
          {needsEmailVerification ? (
            <Text style={styles.notice}>Tu email todavia no esta confirmado. Revisa tu bandeja antes de continuar.</Text>
          ) : null}
          {message ? <Text style={shared.muted}>{message}</Text> : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  head: {
    marginTop: 24,
    gap: 10,
  },
  toggle: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 16,
  },
  toggleButton: {
    flex: 1,
  },
  card: {
    ...shared.card,
    padding: 16,
    gap: 12,
  },
  notice: {
    color: theme.colors.primaryDark,
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius,
    padding: 12,
    fontWeight: "800",
    lineHeight: 19,
  },
});
