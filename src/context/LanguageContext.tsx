import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

type Language = "es" | "en";

type Dictionary = Record<string, { es: string; en: string }>;

const STORAGE_KEY = "reuso_language";

const dictionary: Dictionary = {
  home: { es: "Inicio", en: "Home" },
  explore: { es: "Explorar", en: "Explore" },
  sell: { es: "Vender", en: "Sell" },
  chat: { es: "Chat", en: "Chat" },
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
