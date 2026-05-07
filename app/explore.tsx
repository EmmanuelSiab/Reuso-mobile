import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ListingCard } from "../src/components/ListingCard";
import { categories, Listing, localShowcase } from "../src/lib/listings";
import { supabase } from "../src/lib/supabase";
import { shared, theme } from "../src/styles/theme";
import { Button } from "../src/components/Button";

export default function ExploreScreen() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("moda");

  const loadListings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("id, created_at, title, price, image_url, city, description, condition, category, image_urls, user_id, seller_name, status, sold_at")
      .order("created_at", { ascending: false });

    if (error || !Array.isArray(data) || data.length === 0) {
      setListings(localShowcase);
    } else {
      setListings(data as Listing[]);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadListings();
    }, [loadListings])
  );

  const visibleListings = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings
      .filter((item) => String(item.category || "") === category)
      .filter((item) => {
        if (!q) return true;
        return [item.title, item.description, item.city, item.condition, item.seller_name]
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
          <Text style={shared.h1}>Explora piezas cerca de ti.</Text>
          <Text style={shared.body}>Busca por barrio, estilo o pieza. Moda circular, muebles y hallazgos locales.</Text>
        </View>
        <View style={styles.pulse}>
          <Text style={styles.pulseNumber}>{visibleListings.length}</Text>
          <Text style={styles.pulseLabel}>piezas</Text>
        </View>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar en Reuso"
        placeholderTextColor="rgba(21,17,17,0.38)"
        style={shared.input}
      />

      <View style={styles.categoryGrid}>
        {categories.map((item) => (
          <Button
            key={item.value}
            label={item.label}
            variant={category === item.value ? "primary" : "secondary"}
            onPress={() => setCategory(item.value)}
            style={styles.categoryButton}
          />
        ))}
      </View>

      {loading ? (
        <View style={styles.statusCard}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={shared.muted}>Cargando anuncios...</Text>
        </View>
      ) : null}

      {!loading && visibleListings.length === 0 ? (
        <View style={styles.statusCard}>
          <Text style={styles.emptyTitle}>No encontramos piezas aqui.</Text>
          <Text style={shared.muted}>Prueba otra categoria o limpia la busqueda.</Text>
        </View>
      ) : null}

      <View style={{ marginTop: 8 }}>
        {visibleListings.map((item) => (
          <ListingCard key={item.id} item={item} />
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
