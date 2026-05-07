import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { ListingCard } from "../src/components/ListingCard";
import { useAuth } from "../src/context/AuthContext";
import { Listing, publicSellerName } from "../src/lib/listings";
import { supabase } from "../src/lib/supabase";
import { shared, theme } from "../src/styles/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, initializing, needsEmailVerification, needsOnboarding, logout } = useAuth();
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

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
        if (alive) {
          setMyListings(Array.isArray(data) ? (data as Listing[]) : []);
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

      <View style={styles.sectionHead}>
        <Text style={shared.h2}>Mis anuncios</Text>
        <Text style={shared.muted}>{loading ? "Cargando..." : `${myListings.length} anuncios`}</Text>
      </View>

      {myListings.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.emptyTitle}>Aun no publicas piezas.</Text>
          <Text style={shared.muted}>Sube tu primera prenda, mueble o hallazgo local.</Text>
        </View>
      ) : (
        myListings.map((item) => <ListingCard key={item.id} item={item} />)
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
