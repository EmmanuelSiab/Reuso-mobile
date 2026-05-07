import { Link, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../src/components/Button";
import { useAuth } from "../../src/context/AuthContext";
import { useLanguage } from "../../src/context/LanguageContext";
import { formatMXN } from "../../src/lib/listings";
import { supabase } from "../../src/lib/supabase";
import { shared, theme } from "../../src/styles/theme";

type ConversationRow = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at?: string;
  last_message_at?: string;
};

function displayName(profile: any, fallback = "Reuso") {
  return String(profile?.business_name || profile?.display_name || fallback).trim();
}

function when(value?: string) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("es-MX", { month: "short", day: "2-digit" });
  } catch {
    return "";
  }
}

export default function MessagesScreen() {
  const router = useRouter();
  const { user, initializing } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [lastMessages, setLastMessages] = useState<Record<string, any>>({});
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [listings, setListings] = useState<Record<string, any>>({});

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      let alive = true;

      async function load() {
        setLoading(true);
        const { data: convoData } = await supabase
          .from("conversations")
          .select("id, listing_id, buyer_id, seller_id, created_at, last_message_at")
          .or(`buyer_id.eq.${user!.id},seller_id.eq.${user!.id}`)
          .order("last_message_at", { ascending: false });

        const rows = Array.isArray(convoData) ? (convoData as ConversationRow[]) : [];
        const conversationIds = rows.map((row) => row.id);
        const listingIds = Array.from(new Set(rows.map((row) => row.listing_id).filter(Boolean)));
        const otherIds = Array.from(
          new Set(rows.map((row) => (row.buyer_id === user!.id ? row.seller_id : row.buyer_id)).filter(Boolean))
        );

        let lastByConversation: Record<string, any> = {};
        if (conversationIds.length) {
          const { data: messageData } = await supabase
            .from("messages")
            .select("conversation_id, body, created_at")
            .in("conversation_id", conversationIds)
            .order("created_at", { ascending: false })
            .limit(500);
          for (const message of messageData || []) {
            if (!lastByConversation[message.conversation_id]) lastByConversation[message.conversation_id] = message;
          }
        }

        let profileMap: Record<string, any> = {};
        if (otherIds.length) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("id, display_name, business_name, account_type")
            .in("id", otherIds);
          for (const profile of profileData || []) profileMap[profile.id] = profile;
        }

        let listingMap: Record<string, any> = {};
        if (listingIds.length) {
          const { data: listingData } = await supabase
            .from("listings")
            .select("id, title, price, city, image_url, image_urls")
            .in("id", listingIds);
          for (const listing of listingData || []) listingMap[listing.id] = listing;
        }

        if (alive) {
          setConversations(rows);
          setLastMessages(lastByConversation);
          setProfiles(profileMap);
          setListings(listingMap);
          setLoading(false);
        }
      }

      load();
      return () => {
        alive = false;
      };
    }, [user])
  );

  const rows = useMemo(
    () =>
      conversations.map((conversation) => {
        const otherId = conversation.buyer_id === user?.id ? conversation.seller_id : conversation.buyer_id;
        const listing = listings[conversation.listing_id];
        const image = Array.isArray(listing?.image_urls) ? listing.image_urls[0] : listing?.image_url;
        return {
          id: conversation.id,
          otherName: displayName(profiles[otherId], language === "en" ? "Seller" : "Vendedor"),
          listingTitle: listing?.title || (language === "en" ? "Listing" : "Anuncio"),
          listingMeta: [formatMXN(listing?.price), listing?.city].filter(Boolean).join(" / "),
          image,
          lastText: lastMessages[conversation.id]?.body || (language === "en" ? "No messages yet" : "Sin mensajes todavia"),
          when: when(lastMessages[conversation.id]?.created_at || conversation.last_message_at),
        };
      }),
    [conversations, language, lastMessages, listings, profiles, user?.id]
  );

  if (!initializing && !user) {
    return (
      <View style={[shared.screen, shared.content, styles.center]}>
        <Text style={shared.h2}>{language === "en" ? "Log in to use chat." : "Entra para usar el chat."}</Text>
        <Text style={shared.body}>
          {language === "en" ? "Message sellers and keep pickup details inside Reuso." : "Escribe a vendedores y guarda detalles de entrega en Reuso."}
        </Text>
        <Button label={language === "en" ? "Log in" : "Entrar"} onPress={() => router.push("/auth")} />
      </View>
    );
  }

  return (
    <ScrollView style={shared.screen} contentContainerStyle={shared.content}>
      <View style={styles.head}>
        <Text style={shared.eyebrow}>Reuso chat</Text>
        <Text style={shared.h1}>{language === "en" ? "Messages" : "Mensajes"}</Text>
        <Text style={shared.body}>
          {language === "en" ? "Conversations about listings, pickup, and local handoff." : "Conversaciones sobre anuncios, entrega y punto de encuentro."}
        </Text>
      </View>

      {loading ? <Text style={shared.muted}>{language === "en" ? "Loading..." : "Cargando..."}</Text> : null}

      {!loading && rows.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{language === "en" ? "No chats yet." : "Aun no tienes chats."}</Text>
          <Text style={shared.muted}>{language === "en" ? "Open a listing and contact the seller." : "Abre un anuncio y contacta al vendedor."}</Text>
          <Button label={language === "en" ? "Explore listings" : "Explorar anuncios"} onPress={() => router.push("/explore")} />
        </View>
      ) : null}

      {rows.map((row) => (
        <Link href={`/chat/${row.id}`} asChild key={row.id}>
          <Pressable style={styles.thread}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{row.otherName.slice(0, 1).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1, gap: 7 }}>
              <View style={styles.threadTop}>
                <Text numberOfLines={1} style={styles.threadName}>{row.otherName}</Text>
                <Text style={shared.muted}>{row.when}</Text>
              </View>
              <View style={styles.listingMini}>
                {row.image ? <Image source={{ uri: row.image }} style={styles.listingImage} /> : <View style={styles.listingImage} />}
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={styles.listingTitle}>{row.listingTitle}</Text>
                  <Text numberOfLines={1} style={shared.muted}>{row.listingMeta}</Text>
                </View>
              </View>
              <Text numberOfLines={1} style={styles.preview}>{row.lastText}</Text>
            </View>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: "center",
    gap: 14,
  },
  head: {
    gap: 8,
    marginBottom: 18,
  },
  empty: {
    ...shared.card,
    padding: 16,
    gap: 12,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  thread: {
    ...shared.card,
    flexDirection: "row",
    gap: 12,
    padding: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: theme.radius,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
  },
  threadTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  threadName: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  listingMini: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    padding: 8,
    borderRadius: theme.radius,
    backgroundColor: theme.colors.surfaceSoft,
  },
  listingImage: {
    width: 44,
    height: 44,
    borderRadius: theme.radius,
    backgroundColor: theme.colors.surface,
  },
  listingTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  preview: {
    color: theme.colors.softText,
    fontSize: 14,
  },
});
