import { Link, useRouter } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { LogoHeader } from "../src/components/LogoHeader";
import { shared, theme } from "../src/styles/theme";

const picks = [
  { image: require("../assets/reuso-listings/denim-jacket.avif"), title: "Denim vintage", meta: "Roma Norte" },
  { image: require("../assets/reuso-listings/botas.jpg"), title: "Botas piel", meta: "Juarez" },
  { image: require("../assets/reuso-listings/hemd.webp"), title: "Camisa relax", meta: "Condesa" },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={shared.screen} contentContainerStyle={styles.content}>
      <LogoHeader subtitle="Marketplace circular en CDMX" />

      <View style={styles.hero}>
        <Text style={shared.eyebrow}>Reuso CDMX</Text>
        <Text style={styles.title}>Compra y vende piezas con otra vida.</Text>
        <Text style={styles.claim}>Vintage, segunda mano y hallazgos locales, sin perder el estilo Reuso.</Text>
        <View style={styles.actions}>
          <Button label="Explorar anuncios" onPress={() => router.push("/explore")} />
          <Button label="Publicar pieza" variant="secondary" onPress={() => router.push("/create")} />
        </View>
      </View>

      <View style={styles.pickRail}>
        {picks.map((pick) => (
          <Link href="/explore" asChild key={pick.title}>
            <Pressable style={styles.pick}>
              <Image source={pick.image} style={styles.pickImage} resizeMode="cover" />
              <View>
                <Text style={styles.pickTitle}>{pick.title}</Text>
                <Text style={shared.muted}>{pick.meta}</Text>
              </View>
            </Pressable>
          </Link>
        ))}
      </View>

      <View style={styles.signalStrip}>
        <View style={styles.signal}>
          <Text style={styles.signalTitle}>CDMX primero</Text>
          <Text style={shared.muted}>Roma, Condesa, Juarez, Coyoacan</Text>
        </View>
        <View style={styles.signal}>
          <Text style={styles.signalTitle}>Closets + tiendas</Text>
          <Text style={shared.muted}>Vendedores privados y tiendas vintage</Text>
        </View>
        <View style={styles.signal}>
          <Text style={styles.signalTitle}>Entrega local</Text>
          <Text style={shared.muted}>Encuentra piezas cerca de tu ruta</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingTop: 58,
    paddingBottom: 36,
  },
  hero: {
    marginTop: 28,
    gap: 12,
  },
  title: {
    color: theme.colors.text,
    fontSize: 52,
    lineHeight: 50,
    fontWeight: "900",
  },
  claim: {
    color: theme.colors.softText,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "800",
  },
  actions: {
    marginTop: 8,
    gap: 10,
  },
  pickRail: {
    marginTop: 24,
    gap: 12,
  },
  pick: {
    ...shared.card,
    minHeight: 116,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 14,
    padding: 10,
  },
  pickImage: {
    width: 96,
    height: 96,
    borderRadius: theme.radius,
    backgroundColor: theme.colors.surfaceSoft,
  },
  pickTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  signalStrip: {
    marginTop: 18,
    borderRadius: theme.radius,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  signal: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  signalTitle: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 15,
    marginBottom: 4,
  },
});
