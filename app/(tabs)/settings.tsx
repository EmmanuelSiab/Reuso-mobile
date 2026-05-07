import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../src/components/Button";
import { LogoHeader } from "../../src/components/LogoHeader";
import { useAuth } from "../../src/context/AuthContext";
import { useLanguage } from "../../src/context/LanguageContext";
import { shared, theme } from "../../src/styles/theme";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();

  return (
    <ScrollView style={shared.screen} contentContainerStyle={shared.content}>
      <LogoHeader compact subtitle={language === "en" ? "App settings" : "Ajustes de la app"} />

      <View style={styles.head}>
        <Text style={shared.h1}>{language === "en" ? "Settings" : "Ajustes"}</Text>
        <Text style={shared.body}>
          {language === "en"
            ? "Language, account access, and the essentials for using Reuso on mobile."
            : "Idioma, acceso de cuenta y lo esencial para usar Reuso en movil."}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{language === "en" ? "Language" : "Idioma"}</Text>
        <View style={styles.row}>
          <Button label="Español" variant={language === "es" ? "primary" : "secondary"} onPress={() => setLanguage("es")} style={{ flex: 1 }} />
          <Button label="English" variant={language === "en" ? "primary" : "secondary"} onPress={() => setLanguage("en")} style={{ flex: 1 }} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{language === "en" ? "Account" : "Cuenta"}</Text>
        <Text style={shared.muted}>{user?.email || (language === "en" ? "Not logged in" : "Sin sesion iniciada")}</Text>
        {user ? (
          <Button
            label={language === "en" ? "Log out" : "Cerrar sesion"}
            variant="secondary"
            onPress={async () => {
              await logout();
              router.replace("/");
            }}
          />
        ) : (
          <Button label={language === "en" ? "Log in" : "Entrar"} onPress={() => router.push("/auth")} />
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{language === "en" ? "Safety" : "Seguridad"}</Text>
        <Text style={shared.muted}>
          {language === "en"
            ? "Reuso keeps seller emails private. Message first, meet locally, and report anything suspicious."
            : "Reuso mantiene privados los emails. Mensaje primero, entrega local y reporta cualquier cosa sospechosa."}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  head: {
    marginTop: 22,
    gap: 10,
    marginBottom: 18,
  },
  card: {
    ...shared.card,
    padding: 16,
    gap: 12,
    marginBottom: 14,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
});
