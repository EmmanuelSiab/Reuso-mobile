import { Tabs } from "expo-router";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useLanguage } from "../../src/context/LanguageContext";
import { theme } from "../../src/styles/theme";

type IconName = "home" | "search" | "plus" | "chat" | "profile";

function LineIcon({ name, focused }: { name: IconName; focused: boolean }) {
  const color = focused ? theme.colors.primary : theme.colors.text;
  const opacity = focused ? 1 : 0.72;

  if (name === "home") {
    return (
      <View style={[styles.iconBox, { opacity }]}>
        <View style={[styles.homeRoof, { borderColor: color }]} />
        <View style={[styles.homeBase, { borderColor: color }]} />
      </View>
    );
  }

  if (name === "search") {
    return (
      <View style={[styles.iconBox, { opacity }]}>
        <View style={[styles.searchCircle, { borderColor: color }]} />
        <View style={[styles.searchHandle, { backgroundColor: color }]} />
      </View>
    );
  }

  if (name === "chat") {
    return (
      <View style={[styles.iconBox, { opacity }]}>
        <View style={[styles.chatBubble, { borderColor: color }]} />
        <View style={[styles.chatTail, { borderColor: color }]} />
      </View>
    );
  }

  return (
    <View style={[styles.iconBox, { opacity }]}>
      <View style={[styles.profileHead, { borderColor: color }]} />
      <View style={[styles.profileBody, { borderColor: color }]} />
    </View>
  );
}

function TabIcon({ name, focused, featured = false }: { name: IconName; focused: boolean; featured?: boolean }) {
  if (featured) {
    return (
      <View
        style={{
          width: 58,
          height: 58,
          marginTop: -24,
          borderRadius: 29,
          backgroundColor: theme.colors.primary,
          borderWidth: 6,
          borderColor: theme.colors.surface,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: theme.colors.primary,
          shadowOpacity: 0.32,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 34, lineHeight: 36, fontWeight: "400" }}>+</Text>
      </View>
    );
  }

  return <LineIcon name={name} focused={focused} />;
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
          borderTopColor: "rgba(21,17,17,0.08)",
          height: 92,
          paddingTop: 10,
          paddingBottom: Platform.OS === "ios" ? 22 : 14,
          paddingHorizontal: 8,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          position: "absolute",
          shadowColor: "#151111",
          shadowOpacity: 0.08,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: -8 },
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("home"), tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="home" /> }} />
      <Tabs.Screen name="explore" options={{ title: t("explore"), tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="search" /> }} />
      <Tabs.Screen name="create" options={{ title: t("uploadItem"), tabBarIcon: ({ focused }) => <TabIcon focused={focused} featured name="plus" /> }} />
      <Tabs.Screen name="messages" options={{ title: t("chats"), tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="chat" /> }} />
      <Tabs.Screen name="profile" options={{ title: t("profile"), tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="profile" /> }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    width: 31,
    height: 31,
    alignItems: "center",
    justifyContent: "center",
  },
  homeRoof: {
    position: "absolute",
    top: 5,
    width: 18,
    height: 18,
    borderLeftWidth: 2.4,
    borderTopWidth: 2.4,
    transform: [{ rotate: "45deg" }],
  },
  homeBase: {
    position: "absolute",
    bottom: 5,
    width: 19,
    height: 15,
    borderLeftWidth: 2.4,
    borderRightWidth: 2.4,
    borderBottomWidth: 2.4,
    borderTopWidth: 0,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  searchCircle: {
    width: 20,
    height: 20,
    borderWidth: 2.4,
    borderRadius: 10,
  },
  searchHandle: {
    position: "absolute",
    right: 5,
    bottom: 4,
    width: 11,
    height: 2.6,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }],
  },
  chatBubble: {
    width: 23,
    height: 20,
    borderWidth: 2.4,
    borderRadius: 11,
  },
  chatTail: {
    position: "absolute",
    right: 7,
    bottom: 5,
    width: 8,
    height: 8,
    borderRightWidth: 2.4,
    borderBottomWidth: 2.4,
    transform: [{ rotate: "20deg" }],
  },
  profileHead: {
    width: 12,
    height: 12,
    borderWidth: 2.4,
    borderRadius: 6,
    marginBottom: 2,
  },
  profileBody: {
    width: 22,
    height: 13,
    borderWidth: 2.4,
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    borderBottomWidth: 0,
  },
});
