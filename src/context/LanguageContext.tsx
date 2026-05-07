import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

type Language = "es" | "en";

type Dictionary = Record<string, { es: string; en: string }>;

const STORAGE_KEY = "reuso_language";

const dictionary: Dictionary = {
  home: { es: "Inicio", en: "Home" },
  explore: { es: "Explorar", en: "Explore" },
  sell: { es: "Vender", en: "Sell" },
  uploadItem: { es: "Publicar", en: "Upload" },
  chat: { es: "Chat", en: "Chat" },
  chats: { es: "Chats", en: "Chats" },
  profile: { es: "Perfil", en: "Profile" },
  settings: { es: "Ajustes", en: "Settings" },
  login: { es: "Entrar", en: "Log in" },
  logout: { es: "Cerrar sesion", en: "Log out" },
  save: { es: "Guardar y continuar", en: "Save and continue" },
  publish: { es: "Publicar anuncio", en: "Publish listing" },
  search: { es: "Buscar en Reuso", en: "Search Reuso" },
  favorites: { es: "Favoritos", en: "Favorites" },
  myListings: { es: "Mis anuncios", en: "My listings" },
  active: { es: "Activos", en: "Active" },
  sold: { es: "Vendidos", en: "Sold" },
  all: { es: "Todo", en: "All" },
  language: { es: "Idioma", en: "Language" },
  switchLanguage: { es: "Cambia el idioma de la app.", en: "Switch app language." },
  marketplaceSubtitle: { es: "Marketplace circular en CDMX", en: "Circular marketplace in Mexico City" },
  homeSearchPlaceholder: { es: "Que estas buscando?", en: "What are you looking for?" },
  heroTitle: { es: "Dale una segunda oportunidad.", en: "Give pieces a second life." },
  heroBody: {
    es: "Vintage, segunda mano y hallazgos locales, sin perder el estilo Reuso.",
    en: "Vintage, secondhand, and local finds without losing the Reuso style.",
  },
  exploreListings: { es: "Explorar anuncios", en: "Explore listings" },
  publishPiece: { es: "Publicar pieza", en: "List an item" },
  featuredNearYou: { es: "Destacados cerca de ti", en: "Featured near you" },
  seeAll: { es: "Ver todos", en: "See all" },
  circular: { es: "Circular", en: "Circular" },
  circularText: { es: "Menos desecho, mas futuro.", en: "Less waste, more future." },
  trusted: { es: "Confiable", en: "Trusted" },
  trustedText: { es: "Comunidad verificada y segura.", en: "Verified, safer community." },
  local: { es: "Local", en: "Local" },
  localText: { es: "Hecho en CDMX, para CDMX.", en: "Made in CDMX, for CDMX." },
  exploreTitle: { es: "Explora piezas cerca de ti.", en: "Explore pieces near you." },
  exploreBody: {
    es: "Busca por barrio, estilo o pieza. Moda circular, muebles y hallazgos locales.",
    en: "Search by neighborhood, style, or piece. Circular fashion, furniture, and local finds.",
  },
  pieces: { es: "piezas", en: "pieces" },
  loadingListings: { es: "Cargando anuncios...", en: "Loading listings..." },
  noListingsTitle: { es: "No encontramos piezas aqui.", en: "No pieces found here." },
  noListingsBody: { es: "Prueba otra categoria o limpia la busqueda.", en: "Try another category or clear the search." },
  publishTitle: { es: "Publica una pieza.", en: "List an item." },
  publishBody: {
    es: "Sube una foto clara, precio honesto y detalles utiles para venta local.",
    en: "Upload a clear photo, honest price, and useful local pickup details.",
  },
  publishedTitle: { es: "Anuncio publicado", en: "Listing published" },
  publishedBody: {
    es: "Tu pieza ya esta guardada con su foto. Puedes revisar tus anuncios o publicar otra pieza.",
    en: "Your item is saved with its photo. You can review your listings or publish another item.",
  },
  viewMyListings: { es: "Ver mis anuncios", en: "View my listings" },
  publishAnother: { es: "Publicar otro anuncio", en: "Publish another" },
  title: { es: "Titulo", en: "Title" },
  priceMXN: { es: "Precio MXN", en: "Price MXN" },
  city: { es: "Ciudad", en: "City" },
  category: { es: "Categoria", en: "Category" },
  size: { es: "Talla", en: "Size" },
  sizeOrMeasure: { es: "Talla o medida", en: "Size or measurement" },
  customMeasure: { es: "Medida personalizada", en: "Custom measurement" },
  condition: { es: "Condicion", en: "Condition" },
  description: { es: "Descripcion", en: "Description" },
  photo: { es: "Foto", en: "Photo" },
  chooseImage: { es: "Elegir imagen", en: "Choose image" },
  publicIdentity: { es: "Identidad publica", en: "Public identity" },
  noImage: { es: "Sin imagen", en: "No image" },
  soldLabel: { es: "Vendido", en: "Sold" },
  preview: { es: "Vista previa", en: "Preview" },
  view: { es: "Ver", en: "View" },
  localSeller: { es: "Vendedor local", en: "Local seller" },
  noTitle: { es: "Sin titulo", en: "No title" },
  contactViaReuso: { es: "Contactar por Reuso", en: "Contact via Reuso" },
  seller: { es: "Vendedor", en: "Seller" },
  privacySellerEmail: {
    es: "Por privacidad, Reuso no muestra emails publicamente.",
    en: "For privacy, Reuso does not show emails publicly.",
  },
  safetyTitle: { es: "Mensaje primero, entrega local despues.", en: "Message first, meet locally after." },
  safetyBody: {
    es: "Usa Reuso antes de acordar punto de entrega y reporta cualquier cosa rara.",
    en: "Use Reuso before agreeing on pickup details and report anything suspicious.",
  },
  ownListing: { es: "Este anuncio es tuyo", en: "This is your listing" },
  activeListings: { es: "Activos", en: "Active" },
  total: { es: "Total", en: "Total" },
  saved: { es: "guardados", en: "saved" },
  listingsCount: { es: "anuncios", en: "listings" },
  noFavoritesYet: { es: "Todavia no guardas favoritos.", en: "No favorites saved yet." },
  noFavoritesBody: { es: "Explora piezas y guarda las que quieras revisar despues.", en: "Explore pieces and save the ones you want to revisit." },
};

type LanguageValue = {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: string, fallback?: string) => string;
};

const LanguageContext = createContext<LanguageValue | null>(null);

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Language>("es");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value === "es" || value === "en") setLanguageState(value);
    });
  }, []);

  const value = useMemo<LanguageValue>(
    () => ({
      language,
      setLanguage: async (nextLanguage) => {
        setLanguageState(nextLanguage);
        await AsyncStorage.setItem(STORAGE_KEY, nextLanguage);
      },
      t: (key, fallback) => dictionary[key]?.[language] || fallback || key,
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
