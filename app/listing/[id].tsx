import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../src/components/Button";
import { formatMXN, Listing, listingImages, publicSellerName } from "../../src/lib/listings";
import { supabase } from "../../src/lib/supabase";
import { shared, theme } from "../../src/styles/theme";
import { useAuth } from "../../src/context/AuthContext";

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("listings")
        .select("id, created_at, title, price, image_url, city, description, condition, category, image_urls, user_id, seller_name, status, sold_at")
        .eq("id", id)
        .single();

      if (!alive) return;
      if (error || !data) {
        setListing(null);
        setLoading(false);
        return;
      }

      setListing(data as Listing);

      if (data.user_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, display_name, business_name, account_type")
          .eq("id", data.user_id)
          .maybeSingle();
        if (alive) setSellerProfile(profile || null);
      }
      setLoading(false);
    }

    load();
    return () => {
      alive = false;
    };
  }, [id]);

  const images = useMemo(() => listingImages(listing), [listing]);
  const sellerName = publicSellerName(sellerProfile, listing?.seller_name || "Vendedor local");
  const isOwner = Boolean(user?.id && listing?.user_id && user.id === listing.user_id);
  const isSold = String(listing?.status || "").toLowerCase() === "sold" || Boolean(listing?.sold_at);

  async function startChat() {
    if (!user?.id) {
      router.push("/auth");
      return;
    }
    if (!listing?.id || !listing.user_id || isOwner) return;
    setChatLoading(true);
    try {
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("listing_id", listing.id)
        .eq("buyer_id", user.id)
        .eq("seller_id", listing.user_id)
        .maybeSingle();

      const conversationId =
        existing?.id ||
        (
          await supabase
            .from("conversations")
            .insert({ listing_id: listing.id, buyer_id: user.id, seller_id: listing.user_id })
            .select("id")
            .single()
        ).data?.id;

      Alert.alert(
        "Chat listo",
        conversationId
          ? "Se creo o encontro la conversacion. La pantalla de chat movil queda como siguiente paso."
          : "No se pudo abrir el chat, intenta de nuevo."
      );
    } catch (error: any) {
      Alert.alert("No se pudo abrir el chat", error?.message || "Intenta de nuevo.");
    } finally {
      setChatLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={[shared.screen, shared.content]}>
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Cargando anuncio...</Text>
        </View>
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={[shared.screen, shared.content]}>
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>No encontramos este anuncio.</Text>
          <Button label="Volver a explorar" onPress={() => router.replace("/explore")} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={shared.screen} contentContainerStyle={shared.content}>
      <View style={styles.gallery}>
        {images[0] ? (
          <Image source={{ uri: images[0] }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={styles.emptyImage}>
            <Image source={require("../../assets/reuso-logo-transparent.png")} style={styles.emptyLogo} resizeMode="contain" />
          </View>
        )}
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.price}>{formatMXN(listing.price)}</Text>
        {isSold ? <Text style={styles.sold}>Vendido</Text> : null}
      </View>

      <Text style={shared.h1}>{listing.title || "Sin titulo"}</Text>
      <Text style={shared.muted}>
        {listing.city || "CDMX"} · {listing.category || "Reuso"} · {listing.condition || "Estado no especificado"}
      </Text>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Vendedor</Text>
        <Text style={shared.body}>{sellerName}</Text>
        <Text style={shared.muted}>Por privacidad, Reuso no muestra emails publicamente.</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Descripcion</Text>
        <Text style={shared.body}>{listing.description || "--"}</Text>
      </View>

      <View style={styles.safeNote}>
        <Text style={styles.safeTitle}>Mensaje primero, entrega local despues.</Text>
        <Text style={shared.muted}>Usa Reuso antes de acordar punto de entrega y reporta cualquier cosa rara.</Text>
      </View>

      {isOwner ? (
        <Button label="Este anuncio es tuyo" variant="secondary" disabled />
      ) : (
        <Button label={isSold ? "Vendido" : "Contactar por Reuso"} loading={chatLoading} disabled={isSold} onPress={startChat} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  gallery: {
    marginBottom: 16,
  },
  heroImage: {
    width: "100%",
    aspectRatio: 4 / 5,
    borderRadius: theme.radius,
    backgroundColor: theme.colors.surfaceSoft,
  },
  emptyImage: {
    width: "100%",
    aspectRatio: 4 / 5,
    borderRadius: theme.radius,
    borderColor: theme.colors.border,
    borderWidth: 1,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyLogo: {
    width: 128,
    height: 128,
    opacity: 0.36,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  price: {
    color: theme.colors.primaryDark,
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "900",
  },
  sold: {
    color: "#ffffff",
    backgroundColor: theme.colors.text,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "900",
  },
  panel: {
    ...shared.card,
    padding: 16,
    gap: 6,
    marginTop: 14,
  },
  panelTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  safeNote: {
    marginVertical: 14,
    padding: 14,
    borderRadius: theme.radius,
    backgroundColor: theme.colors.successSoft,
    borderColor: "rgba(22,122,74,0.14)",
    borderWidth: 1,
    gap: 5,
  },
  safeTitle: {
    color: theme.colors.success,
    fontWeight: "900",
  },
  statusCard: {
    ...shared.card,
    padding: 16,
    gap: 12,
  },
  statusTitle: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 18,
  },
});
