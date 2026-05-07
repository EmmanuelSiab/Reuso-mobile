import { Link } from "expo-router";
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from "react-native";
import { formatMXN, Listing, listingImages } from "../lib/listings";
import { shared, theme } from "../styles/theme";

function coverSource(item: Listing): ImageSourcePropType | null {
  if (item.localImage) return item.localImage;
  const url = listingImages(item)[0];
  return url ? { uri: url } : null;
}

export function ListingCard({ item }: { item: Listing }) {
  const source = coverSource(item);
  const isSold = String(item.status || "").toLowerCase() === "sold" || Boolean(item.sold_at);
  const href = item.previewOnly ? "/explore" : (`/listing/${item.id}` as const);

  return (
    <Link href={href} asChild>
      <Pressable style={[styles.card, isSold && styles.sold]}>
        <View style={styles.media}>
          {source ? (
            <Image source={source} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.empty}>
              <Image source={require("../../assets/reuso-logo-transparent.png")} style={styles.emptyLogo} resizeMode="contain" />
            </View>
          )}
          <View style={styles.pricePill}>
            <Text style={styles.priceText}>{formatMXN(item.price)}</Text>
          </View>
          {isSold ? (
            <View style={styles.soldPill}>
              <Text style={styles.soldText}>Vendido</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.body}>
          <Text numberOfLines={2} style={styles.title}>
            {item.title || "Sin titulo"}
          </Text>
          <Text numberOfLines={1} style={shared.muted}>
            {item.city || "CDMX"} · {item.condition || item.category || "Reuso"}
          </Text>
          {item.description ? (
            <Text numberOfLines={2} style={styles.description}>
              {item.description}
            </Text>
          ) : null}
          <View style={styles.footer}>
            <Text numberOfLines={1} style={styles.seller}>
              {item.seller_name || "Vendedor local"}
            </Text>
            <Text style={styles.cta}>{item.previewOnly ? "Vista previa" : "Ver"}</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    ...shared.card,
    overflow: "hidden",
    marginBottom: 14,
  },
  sold: {
    opacity: 0.58,
  },
  media: {
    position: "relative",
    aspectRatio: 3 / 4,
    backgroundColor: theme.colors.surfaceSoft,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyLogo: {
    width: 96,
    height: 96,
    opacity: 0.36,
  },
  pricePill: {
    position: "absolute",
    left: 10,
    top: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(21,17,17,0.82)",
  },
  priceText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },
  soldPill: {
    position: "absolute",
    right: 10,
    top: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  soldText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },
  body: {
    padding: 12,
    gap: 7,
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 19,
    fontWeight: "900",
  },
  description: {
    color: theme.colors.softText,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    marginTop: 4,
    paddingTop: 10,
    borderTopColor: "rgba(210,42,35,0.1)",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  seller: {
    flex: 1,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  cta: {
    color: theme.colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
  },
});
