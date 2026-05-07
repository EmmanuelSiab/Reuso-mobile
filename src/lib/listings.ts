import { ImageSourcePropType } from "react-native";

export type Listing = {
  id: string;
  created_at?: string | null;
  title?: string | null;
  description?: string | null;
  price?: number | null;
  category?: string | null;
  condition?: string | null;
  size?: string | null;
  city?: string | null;
  image_url?: string | null;
  image_urls?: string[] | string | null;
  user_id?: string | null;
  seller_name?: string | null;
  status?: string | null;
  sold_at?: string | null;
  previewOnly?: boolean;
  localImage?: ImageSourcePropType;
};

export const categories = [
  { value: "moda", label: "Moda", hint: "Vintage, streetwear, basicos" },
  { value: "accesorios", label: "Accesorios", hint: "Bolsas, joyeria, cinturones" },
  { value: "muebles", label: "Muebles", hint: "Piezas para depa" },
  { value: "electronica", label: "Electronica", hint: "Gadgets verificados" },
];

export const categoryTranslations: Record<string, { es: string; en: string }> = {
  moda: { es: "Moda", en: "Fashion" },
  accesorios: { es: "Accesorios", en: "Accessories" },
  muebles: { es: "Muebles", en: "Furniture" },
  electronica: { es: "Electronica", en: "Electronics" },
};

export function categoryDisplayLabel(value?: string | null, language: "es" | "en" = "es") {
  const key = String(value || "").trim();
  return categoryTranslations[key]?.[language] || categoryLabel(value);
}

export const conditions = [
  "Nuevo",
  "Como nuevo",
  "Muy buen estado",
  "Buen estado",
  "Estado aceptable",
  "Aceptable",
];

export const standardSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Otro"];

export function categoryNeedsSize(category?: string | null) {
  return ["moda", "accesorios"].includes(String(category || "").trim());
}

export const listingSelect =
  "id, created_at, title, price, image_url, image_urls, city, category, condition, size, description, user_id, seller_name, status, sold_at";

export const listingSelectWithoutSize =
  "id, created_at, title, price, image_url, image_urls, city, category, condition, description, user_id, seller_name, status, sold_at";

export function isMissingSizeColumn(error: any) {
  const msg = String(error?.message || error?.details || "");
  return error?.code === "42703" || (msg.includes("size") && msg.toLowerCase().includes("column"));
}

export const localShowcase: Listing[] = [
  {
    id: "local-1",
    previewOnly: true,
    title: "Chamarra denim vintage",
    price: 720,
    city: "Roma Norte",
    condition: "Muy buen estado",
    size: "M",
    category: "moda",
    description: "Mezclilla pesada, corte relajado. Entrega cerca de Alvaro Obregon.",
    seller_name: "Casa Circula",
    localImage: require("../../assets/reuso-listings/denim-jacket.avif"),
  },
  {
    id: "local-2",
    previewOnly: true,
    title: "Botas cafe de piel",
    price: 980,
    city: "Juarez",
    condition: "Buen estado",
    size: "L",
    category: "moda",
    description: "Suela firme, look western discreto. Ideales para fin de semana.",
    seller_name: "Valeria",
    localImage: require("../../assets/reuso-listings/botas.jpg"),
  },
  {
    id: "local-3",
    previewOnly: true,
    title: "Camisa relaxed fit",
    price: 420,
    city: "Condesa",
    condition: "Como nuevo",
    size: "M",
    category: "moda",
    description: "Tela ligera, lista para usar. Sin detalles visibles.",
    seller_name: "Archivo Norte",
    localImage: require("../../assets/reuso-listings/hemd.webp"),
  },
  {
    id: "local-4",
    previewOnly: true,
    title: "Cinturon de piel",
    price: 280,
    city: "Coyoacan",
    condition: "Buen estado",
    size: "90 cm",
    category: "accesorios",
    description: "Hebilla metalica, piel suave, talla ajustable.",
    seller_name: "Mateo",
    localImage: require("../../assets/reuso-listings/guertel.jpg"),
  },
  {
    id: "local-5",
    previewOnly: true,
    title: "Hoodie gris oversized",
    price: 540,
    city: "Narvarte",
    condition: "Muy buen estado",
    size: "XL",
    category: "moda",
    description: "Algodon grueso, fit amplio, perfecto para capas.",
    seller_name: "Nadia",
    localImage: require("../../assets/reuso-listings/hoodie.webp"),
  },
];

export function formatMXN(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "--";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function listingImages(listing?: Listing | null) {
  if (!listing) return [];
  if (Array.isArray(listing.image_urls) && listing.image_urls.length > 0) {
    const urls = listing.image_urls.map((x) => String(x || "").trim()).filter(Boolean);
    if (urls.length) return urls;
  }
  if (typeof listing.image_urls === "string") {
    try {
      const parsed = JSON.parse(listing.image_urls);
      if (Array.isArray(parsed)) {
        const urls = parsed.map((x) => String(x || "").trim()).filter(Boolean);
        if (urls.length) return urls;
      }
    } catch {
      const raw = String(listing.image_urls || "").trim();
      if (raw) return [raw];
    }
  }
  const single = String(listing.image_url || "").trim();
  return single ? [single] : [];
}

export function categoryLabel(value?: string | null) {
  const hit = categories.find((item) => item.value === String(value || "").trim());
  return hit?.label || value || "Reuso";
}

export function publicSellerName(profile: any, fallback = "Vendedor local") {
  const businessName = String(profile?.business_name || "").trim();
  const displayName = String(profile?.display_name || "").trim();
  return businessName || displayName || fallback;
}
