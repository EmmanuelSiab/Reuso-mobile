import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../src/context/AuthContext";
import { theme } from "../src/styles/theme";

export default function RootLayout() {
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
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="explore" options={{ title: "Explorar" }} />
        <Stack.Screen name="listing/[id]" options={{ title: "Detalle" }} />
        <Stack.Screen name="create" options={{ title: "Publicar" }} />
        <Stack.Screen name="profile" options={{ title: "Perfil" }} />
        <Stack.Screen name="auth" options={{ title: "Entrar" }} />
        <Stack.Screen name="account-type" options={{ title: "Tu cuenta" }} />
      </Stack>
    </AuthProvider>
  );
}
