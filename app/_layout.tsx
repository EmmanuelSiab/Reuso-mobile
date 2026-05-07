import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../src/context/AuthContext";
import { LanguageProvider, useLanguage } from "../src/context/LanguageContext";
import { theme } from "../src/styles/theme";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <RootStack />
    </LanguageProvider>
  );
}

function RootStack() {
  const { language, t } = useLanguage();

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: "900" },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="explore" options={{ headerShown: false }} />
        <Stack.Screen name="create" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="messages" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="listing/[id]" options={{ title: language === "en" ? "Detail" : "Detalle" }} />
        <Stack.Screen name="chat/[id]" options={{ title: t("chat") }} />
        <Stack.Screen name="auth" options={{ title: t("login") }} />
        <Stack.Screen name="account-type" options={{ title: language === "en" ? "Your account" : "Tu cuenta" }} />
      </Stack>
    </AuthProvider>
  );
}
