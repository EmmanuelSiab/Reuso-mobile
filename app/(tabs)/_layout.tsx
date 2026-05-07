import { Tabs } from "expo-router";
import { Text } from "react-native";
import { useLanguage } from "../../src/context/LanguageContext";
import { theme } from "../../src/styles/theme";

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ color: focused ? theme.colors.primary : theme.colors.muted, fontSize: 16, fontWeight: "900" }}>
      {label}
    </Text>
  );
}

export default function TabLayout() {
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 76,
          paddingTop: 8,
          paddingBottom: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "900",
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("home"), tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="H" /> }} />
      <Tabs.Screen name="explore" options={{ title: t("explore"), tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="E" /> }} />
      <Tabs.Screen name="create" options={{ title: t("sell"), tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="+" /> }} />
      <Tabs.Screen name="messages" options={{ title: t("chat"), tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="C" /> }} />
      <Tabs.Screen name="profile" options={{ title: t("profile"), tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="P" /> }} />
      <Tabs.Screen name="settings" options={{ title: t("settings"), tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="S" /> }} />
    </Tabs>
  );
}
