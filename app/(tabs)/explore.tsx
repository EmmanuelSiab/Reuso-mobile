import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ListingCard } from "../../src/components/ListingCard";
import { useAuth } from "../../src/context/AuthContext";
import { useLanguage } from "../../src/context/LanguageContext";
import { categories, categoryDisplayLabel, isMissingSizeColumn, Listing, listingSelect, listingSelectWithoutSize, localShowcase } from "../../src/lib/listings";
import { supabase } from "../../src/lib/supabase";
import { shared, theme } from "../../src/styles/theme";
import { Button } from "../../src/components/Button";

export default function ExploreScreen() {
  const params = useLocalSearchParams<{ category?: string; query?: string }>();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [listings, setListings] = useState<Listing[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("moda");

  useEffect(() => {
    if (typeof params.query === "string") setQuery(params.query);
    if (typeof params.category === "string" && categories.some((item) => item.value === params.category)) {
      setCategory(params.category);
    }
  }, [params.category, params.query]);

  const loadListings = useCallback(async () => {
    setLoading(true);
    const listingsResult = await supabase
      .from("listings")
      .select(listingSelect)
      .order("created_at", { ascending: false });
    let data: any = listingsResult.data;
    let error: any = listingsResult.error;

    if (error && isMissingSizeColumn(error)) {
      const retry = await supabase
        .from("listings")
        .select(listingSelectWithoutSize)
        .order("created_at", { ascending: false });
      data = retry.data;
      error = retry.error;
    }

    if (error || !Array.isArray(data) || data.length === 0) {
      if (error) console.error("Explore listings load failed:", error);
      setListings(localShowcase);
    } else {
      setListings(data as Listing[]);
    }
    setLoading(false);
  }, []);

  const loadFavorites = useCallback(async () => {
    if (!user?.id) {
      setFavoriteIds(new Set());
      return;
    }

    const { data } = await supabase.from("favorites").select("listing_id").eq("user_id", user.id);
    setFavoriteIds(new Set((data || []).map((row: any) => String(row.listing_id))));
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadListings();
      loadFavorites();
    }, [loadFavorites, loadListings])
  );

  async function toggleFavorite(listingId: string) {
    if (!user?.id) return;
    const listing = listings.find((item) => String(item.id) === String(listingId));
    if (listing?.user_id && listing.user_id === user.id) {
      Alert.alert("Favoritos", "No puedes guardar tus propios anuncios.");
      return;
    }
    const isFavorite = favoriteIds.has(listingId);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFavorite) next.delete(listingId);
      else next.add(listingId);
      return next;
    });

    const favoritesQuery = supabase.from("favorites");
    const { error } = isFavorite
      ? await favoritesQuery.delete().eq("user_id", user.id).eq("listing_id", listingId)
      : await addFavorite(user.id, listingId);

    if (error) {
      Alert.alert("Favoritos", error.message || "No se pudo actualizar el favorito.");
      loadFavorites();
    }
  }

  async function addFavorite(userId: string, listingId: string) {
    const existing = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", userId)
      .eq("listing_id", listingId)
      .maybeSingle();

    if (existing.error) return { error: existing.error };
    if (existing.data) return { error: null };

    return supabase.from("favorites").insert({ user_id: userId, listing_id: listingId });
  }

  const visibleListings = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings
      .filter((item) => String(item.category || "") === category)
      .filter((item) => {
        if (!q) return true;
        return [item.title, item.description, item.city, item.condition, item.size, item.seller_name]
          .join(" ")
          .toLowerCase()
          .includes(q);
      });
  }, [category, listings, query]);

  return (
    <ScrollView
      style={shared.screen}
      contentContainerStyle={shared.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadListings} tintColor={theme.colors.primary} />}
    >
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <Text style={shared.eyebrow}>Reuso CDMX</Text>
          <Text style={shared.h1}>{t("exploreTitle")}</Text>
          <Text style={shared.body}>{t("exploreBody")}</Text>
        </View>
        <View style={styles.pulse}>
          <Text style={styles.pulseNumber}>{visibleListings.length}</Text>
          <Text style={styles.pulseLabel}>{t("pieces")}</Text>
        </View>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={t("search")}
        placeholderTextColor="rgba(21,17,17,0.38)"
        style={shared.input}
      />

      <View style={styles.categoryGrid}>
        {categories.map((item) => (
          <Button
            key={item.value}
            label={categoryDisplayLabel(item.value, language)}
            variant={category === item.value ? "primary" : "secondary"}
            onPress={() => setCategory(item.value)}
            style={styles.categoryButton}
          />
        ))}
      </View>

      {loading ? (
        <View style={styles.statusCard}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={shared.muted}>{t("loadingListings")}</Text>
        </View>
      ) : null}

      {!loading && visibleListings.length === 0 ? (
        <View style={styles.statusCard}>
          <Text style={styles.emptyTitle}>{t("noListingsTitle")}</Text>
          <Text style={shared.muted}>{t("noListingsBody")}</Text>
        </View>
      ) : null}

      <View style={{ marginTop: 8 }}>
        {visibleListings.map((item) => (
          <ListingCard
            key={item.id}
            item={item}
            isFavorite={item.user_id !== user?.id && favoriteIds.has(String(item.id))}
            onToggleFavorite={user?.id && item.user_id !== user.id ? toggleFavorite : undefined}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-end",
    marginBottom: 16,
  },
  pulse: {
    minWidth: 82,
    padding: 12,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
  },
  pulseNumber: {
    color: theme.colors.primary,
    fontSize: 32,
    lineHeight: 34,
    fontWeight: "900",
  },
  pulseLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "900",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 14,
  },
  categoryButton: {
    minHeight: 40,
    paddingHorizontal: 14,
  },
  statusCard: {
    ...shared.card,
    padding: 16,
    gap: 8,
    marginBottom: 14,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 16,
  },
});
