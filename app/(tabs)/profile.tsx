import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../src/components/Button";
import { ListingCard } from "../../src/components/ListingCard";
import { useAuth } from "../../src/context/AuthContext";
import { Listing, publicSellerName } from "../../src/lib/listings";
import { supabase } from "../../src/lib/supabase";
import { shared, theme } from "../../src/styles/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, initializing, needsEmailVerification, needsOnboarding, logout } = useAuth();
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"listings" | "favorites">("listings");

  const publicName = publicSellerName(profile, user?.email || "--");
  const accountLabel = profile?.account_type === "business" ? "Tienda" : "Vendedor personal";

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      let alive = true;
      async function load() {
        setLoading(true);
        const { data } = await supabase
          .from("listings")
          .select("id, created_at, title, price, image_url, image_urls, city, category, condition, description, user_id, seller_name, status, sold_at")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false });

        const { data: favoriteData } = await supabase
          .from("favorites")
          .select("listing_id, listings(id, created_at, title, price, image_url, image_urls, city, category, condition, description, user_id, seller_name, status, sold_at)")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false });

        if (alive) {
          setMyListings(Array.isArray(data) ? (data as Listing[]) : []);
          setFavorites(
            Array.isArray(favoriteData)
              ? favoriteData.map((row: any) => row.listings).filter(Boolean)
              : []
          );
          setLoading(false);
        }
      }
      load();
      return () => {
        alive = false;
      };
    }, [user])
  );

  const stats = useMemo(() => {
    const sold = myListings.filter((item) => String(item.status || "") === "sold").length;
    return [
      { label: "Activos", value: myListings.length - sold },
      { label: "Vendidos", value: sold },
      { label: "Total", value: myListings.length },
    ];
  }, [myListings]);

  if (initializing) {
    return (
      <View style={[shared.screen, shared.content]}>
        <Text style={shared.body}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[shared.screen, shared.content]}>
        <View style={styles.card}>
          <Text style={shared.h2}>Entra para ver tu cuenta.</Text>
          <Text style={shared.body}>Desde aqui puedes publicar piezas, revisar tus anuncios y salir de sesion.</Text>
          <Button label="Entrar o crear cuenta" onPress={() => router.push("/auth")} />
        </View>
      </View>
    );
  }

  if (needsEmailVerification || needsOnboarding) {
    return (
      <View style={[shared.screen, shared.content]}>
        <View style={styles.card}>
          <Text style={shared.h2}>Tu cuenta necesita un paso mas.</Text>
          <Text style={shared.body}>
            {needsEmailVerification ? "Confirma tu email antes de publicar." : "Completa tu tipo de cuenta y nombre publico."}
          </Text>
          <Button label={needsEmailVerification ? "Ir a auth" : "Completar perfil"} onPress={() => router.push(needsEmailVerification ? "/auth" : "/account-type")} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={shared.screen} contentContainerStyle={shared.content}>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{publicName.slice(0, 1).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{publicName}</Text>
          <Text style={shared.muted}>{accountLabel}</Text>
        </View>
      </View>

      <View style={styles.stats}>
        {stats.map((stat) => (
          <View style={styles.stat} key={stat.label}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button label="Publicar pieza" onPress={() => router.push("/create")} style={{ flex: 1 }} />
        <Button label="Explorar" variant="secondary" onPress={() => router.push("/explore")} style={{ flex: 1 }} />
      </View>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === "listings" && styles.tabActive]}
          onPress={() => setActiveTab("listings")}
        >
          <Text style={[styles.tabText, activeTab === "listings" && styles.tabTextActive]}>Mis anuncios</Text>
          <Text style={[styles.tabCount, activeTab === "listings" && styles.tabTextActive]}>{myListings.length}</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "favorites" && styles.tabActive]}
          onPress={() => setActiveTab("favorites")}
        >
          <Text style={[styles.tabText, activeTab === "favorites" && styles.tabTextActive]}>Favoritos</Text>
          <Text style={[styles.tabCount, activeTab === "favorites" && styles.tabTextActive]}>{favorites.length}</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHead}>
        <Text style={shared.h2}>{activeTab === "listings" ? "Mis anuncios" : "Favoritos"}</Text>
        <Text style={shared.muted}>{loading ? "Cargando..." : activeTab === "listings" ? `${myListings.length} anuncios` : `${favorites.length} guardados`}</Text>
      </View>

      {activeTab === "listings" && myListings.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.emptyTitle}>Aun no publicas piezas.</Text>
          <Text style={shared.muted}>Sube tu primera prenda, mueble o hallazgo local.</Text>
        </View>
      ) : null}

      {activeTab === "favorites" && favorites.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.emptyTitle}>Todavia no guardas favoritos.</Text>
          <Text style={shared.muted}>Toca el corazon en un anuncio para guardarlo aqui.</Text>
        </View>
      ) : null}

      {activeTab === "listings" ? (
        myListings.map((item) => <ListingCard key={item.id} item={item} />)
      ) : (
        favorites.map((item) => <ListingCard key={item.id} item={item} />)
      )}

      <Button
        label="Cerrar sesion"
        variant="secondary"
        onPress={async () => {
          await logout();
          router.replace("/");
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    ...shared.card,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    marginBottom: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: theme.radius,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "900",
  },
  name: {
    color: theme.colors.text,
    fontSize: 32,
    lineHeight: 34,
    fontWeight: "900",
  },
  stats: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  stat: {
    flex: 1,
    ...shared.card,
    padding: 12,
  },
  statValue: {
    color: theme.colors.primary,
    fontSize: 28,
    fontWeight: "900",
  },
  statLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "900",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  tabs: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.text,
    fontWeight: "900",
  },
  tabCount: {
    color: theme.colors.muted,
    fontWeight: "900",
  },
  tabTextActive: {
    color: "#ffffff",
  },
  card: {
    ...shared.card,
    padding: 16,
    gap: 10,
    marginBottom: 14,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
});
