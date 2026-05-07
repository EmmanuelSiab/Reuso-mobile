import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "../../src/context/LanguageContext";
import { shared, theme } from "../../src/styles/theme";

const picks = [
  {
    image: require("../../assets/reuso-listings/denim-jacket.avif"),
    title: "Denim vintage",
    meta: "Roma Norte",
    tag: "Vintage",
    price: "$680",
  },
  {
    image: require("../../assets/reuso-listings/botas.jpg"),
    title: "Botas piel",
    meta: "Juarez",
    tag: "Piel",
    price: "$1,250",
  },
  {
    image: require("../../assets/reuso-listings/hemd.webp"),
    title: "Camisa rayas",
    meta: "Condesa",
    tag: "Clasico",
    price: "$450",
  },
];

const categories = [
  { label: "Moda", icon: "▢", category: "moda", query: "" },
  { label: "Accesorios", icon: "◉", category: "accesorios", query: "" },
  { label: "Muebles", icon: "⌑", category: "muebles", query: "" },
  { label: "Electrónica", icon: "▦", category: "electronica", query: "" },
];

export default function HomeScreen() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [query, setQuery] = useState("");

  function openExplore(next?: { category?: string; query?: string }) {
    router.push({
      pathname: "/explore",
      params: {
        category: next?.category || "moda",
        query: next?.query || "",
      },
    });
  }

  function submitSearch() {
    openExplore({ query: query.trim(), category: "moda" });
  }

  return (
    <SafeAreaView style={shared.screen} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image source={require("../../assets/reuso-logo-transparent.png")} style={styles.logo} resizeMode="contain" />
            <View style={styles.brandCopy}>
              <Text style={styles.wordmark}>Reuso</Text>
              <Text style={styles.subtitle}>{t("marketplaceSubtitle")}</Text>
            </View>
          </View>

          <Pressable style={styles.bell} onPress={() => router.push("/messages")}>
            <Text style={styles.bellIcon}>♢</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.search}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={submitSearch}
            returnKeyType="search"
            placeholder={t("homeSearchPlaceholder")}
            placeholderTextColor="rgba(21,17,17,0.48)"
            style={styles.searchInput}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {categories.map((item, index) => (
            <Pressable
              key={item.label}
              style={[styles.categoryChip, index === 0 && styles.categoryChipActive]}
              onPress={() => openExplore({ category: item.category, query: item.query || "" })}
            >
              <Text style={[styles.categoryIcon, index === 0 && styles.categoryActiveText]}>{item.icon}</Text>
              <Text style={[styles.categoryText, index === 0 && styles.categoryActiveText]}>
                {language === "en"
                  ? item.category === "moda"
                    ? "Fashion"
                    : item.category === "accesorios"
                      ? "Accessories"
                      : item.category === "muebles"
                        ? "Furniture"
                        : "Electronics"
                  : item.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.heroCard}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>{t("heroTitle")}</Text>
            <Text style={styles.heroText}>{t("heroBody")}</Text>
            <Pressable style={styles.primaryCta} onPress={() => openExplore()}>
              <Text style={styles.primaryCtaText}>{t("exploreListings")}</Text>
              <Text style={styles.ctaIcon}>→</Text>
            </Pressable>
            <Pressable style={styles.secondaryCta} onPress={() => router.push("/create")}>
              <Text style={styles.secondaryCtaText}>{t("publishPiece")}</Text>
              <Text style={styles.secondaryCtaText}>＋</Text>
            </Pressable>
          </View>

          <View style={styles.heroMedia}>
            <View style={styles.heroBlob} />
            <Image source={require("../../assets/reuso-listings/botas.jpg")} style={styles.heroImageLarge} resizeMode="cover" />
            <Image source={require("../../assets/reuso-listings/hemd.webp")} style={styles.heroImageSmall} resizeMode="cover" />
          </View>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{t("featuredNearYou")}</Text>
          <Pressable onPress={() => openExplore()}>
            <Text style={styles.seeAll}>{t("seeAll")}  ›</Text>
          </Pressable>
        </View>

        <View style={styles.pickGrid}>
          {picks.map((pick) => (
            <Pressable style={styles.pickCard} key={pick.title} onPress={() => openExplore({ query: pick.title })}>
              <View style={styles.pickMedia}>
                <Image source={pick.image} style={styles.pickImage} resizeMode="cover" />
                <Text style={styles.heart}>♡</Text>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>✦ {pick.tag}</Text>
                </View>
              </View>
              <Text numberOfLines={1} style={styles.pickTitle}>{pick.title}</Text>
              <Text numberOfLines={1} style={styles.pickMeta}>⌖ {pick.meta}</Text>
              <Text style={styles.pickPrice}>{pick.price}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.signalStrip}>
          <View style={styles.signal}>
            <Text style={styles.signalIcon}>♧</Text>
            <View style={styles.signalCopy}>
              <Text style={styles.signalTitle}>{t("circular")}</Text>
              <Text style={styles.signalText}>{t("circularText")}</Text>
            </View>
          </View>
          <View style={styles.signalDivider} />
          <View style={styles.signal}>
            <Text style={styles.signalIcon}>▱</Text>
            <View style={styles.signalCopy}>
              <Text style={styles.signalTitle}>{t("trusted")}</Text>
              <Text style={styles.signalText}>{t("trustedText")}</Text>
            </View>
          </View>
          <View style={styles.signalDivider} />
          <View style={styles.signal}>
            <Text style={styles.signalIcon}>⌖</Text>
            <View style={styles.signalCopy}>
              <Text style={styles.signalTitle}>{t("local")}</Text>
              <Text style={styles.signalText}>{t("localText")}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 112,
  },
  header: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 18,
  },
  brand: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 56,
    height: 56,
  },
  brandCopy: {
    flex: 1,
    minWidth: 0,
  },
  wordmark: {
    color: theme.colors.text,
    fontSize: 28,
    lineHeight: 31,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 1,
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  bell: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(21,17,17,0.08)",
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow,
  },
  bellIcon: {
    color: theme.colors.text,
    fontSize: 25,
    lineHeight: 27,
    transform: [{ rotate: "45deg" }],
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },
  search: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(21,17,17,0.1)",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  searchIcon: {
    color: theme.colors.text,
    opacity: 0.72,
    fontSize: 28,
    lineHeight: 30,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "700",
    paddingVertical: 0,
  },
  categoryRow: {
    gap: 10,
    paddingBottom: 2,
  },
  categoryChip: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "rgba(21,17,17,0.09)",
    backgroundColor: "rgba(255,255,255,0.86)",
  },
  categoryChipActive: {
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: "rgba(255,59,48,0.06)",
  },
  categoryIcon: {
    color: theme.colors.muted,
    fontSize: 18,
    fontWeight: "900",
  },
  categoryText: {
    color: theme.colors.softText,
    fontSize: 14,
    fontWeight: "800",
  },
  categoryActiveText: {
    color: theme.colors.primary,
  },
  heroCard: {
    minHeight: 214,
    marginTop: 20,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(210,42,35,0.1)",
    backgroundColor: theme.colors.surface,
    flexDirection: "row",
    ...theme.shadow,
  },
  heroCopy: {
    flex: 1.08,
    padding: 18,
    justifyContent: "center",
  },
  heroTitle: {
    color: theme.colors.text,
    fontSize: 27,
    lineHeight: 31,
    fontWeight: "900",
  },
  heroText: {
    marginTop: 10,
    color: theme.colors.softText,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  primaryCta: {
    minHeight: 44,
    marginTop: 18,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  primaryCtaText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  ctaIcon: {
    color: "#fff",
    fontSize: 23,
    lineHeight: 24,
  },
  secondaryCta: {
    minHeight: 42,
    marginTop: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(255,255,255,0.74)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  secondaryCtaText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  heroMedia: {
    flex: 0.82,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  heroBlob: {
    position: "absolute",
    right: -44,
    top: -12,
    width: 210,
    height: 260,
    borderRadius: 34,
    backgroundColor: "#fff1ed",
  },
  heroImageLarge: {
    width: 142,
    height: 142,
    borderRadius: 18,
    transform: [{ rotate: "-2deg" }],
  },
  heroImageSmall: {
    position: "absolute",
    right: 12,
    bottom: 14,
    width: 54,
    height: 54,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: "#fff",
  },
  sectionHead: {
    marginTop: 22,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "900",
  },
  seeAll: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  pickGrid: {
    flexDirection: "row",
    gap: 12,
  },
  pickCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: "rgba(210,42,35,0.08)",
    ...theme.shadow,
  },
  pickMedia: {
    position: "relative",
    aspectRatio: 0.9,
    backgroundColor: theme.colors.surfaceSoft,
  },
  pickImage: {
    width: "100%",
    height: "100%",
  },
  heart: {
    position: "absolute",
    top: 8,
    right: 8,
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowRadius: 4,
  },
  tag: {
    position: "absolute",
    left: 8,
    bottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.94)",
  },
  tagText: {
    color: theme.colors.text,
    fontSize: 10,
    fontWeight: "800",
  },
  pickTitle: {
    marginTop: 9,
    paddingHorizontal: 9,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  pickMeta: {
    marginTop: 3,
    paddingHorizontal: 9,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: "700",
  },
  pickPrice: {
    paddingHorizontal: 9,
    paddingTop: 3,
    paddingBottom: 10,
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  signalStrip: {
    marginTop: 22,
    minHeight: 76,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(210,42,35,0.1)",
    backgroundColor: theme.colors.surface,
    flexDirection: "row",
    ...theme.shadow,
  },
  signal: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
  },
  signalDivider: {
    width: 1,
    marginVertical: 18,
    backgroundColor: "rgba(21,17,17,0.1)",
  },
  signalIcon: {
    color: theme.colors.primary,
    fontSize: 28,
    fontWeight: "900",
  },
  signalCopy: {
    flex: 1,
    minWidth: 0,
  },
  signalTitle: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 12,
  },
  signalText: {
    marginTop: 2,
    color: theme.colors.muted,
    fontSize: 10,
    lineHeight: 13,
  },
});
