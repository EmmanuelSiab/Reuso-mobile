import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "../../src/components/Button";
import { useAuth } from "../../src/context/AuthContext";
import { useLanguage } from "../../src/context/LanguageContext";
import { isMissingSizeColumn } from "../../src/lib/listings";
import { supabase } from "../../src/lib/supabase";
import { shared, theme } from "../../src/styles/theme";

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at?: string;
};

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { language } = useLanguage();
  const listRef = useRef<FlatList<Message>>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [listing, setListing] = useState<any>(null);
  const [otherProfile, setOtherProfile] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const canSend = useMemo(() => Boolean(user?.id && id && body.trim() && !sending), [body, id, sending, user?.id]);
  const otherName = String(otherProfile?.business_name || otherProfile?.display_name || (language === "en" ? "Seller" : "Vendedor"));

  useEffect(() => {
    if (!user?.id || !id) return;
    let alive = true;

    async function load() {
      setLoading(true);
      const { data: convo, error } = await supabase
        .from("conversations")
        .select("id, listing_id, buyer_id, seller_id, created_at, last_message_at")
        .eq("id", id)
        .single();

      if (error || !convo) {
        router.replace("/messages");
        return;
      }

      const otherId = convo.buyer_id === user!.id ? convo.seller_id : convo.buyer_id;
      let listingResult = await supabase.from("listings").select("id, title, price, city, image_url, image_urls, size").eq("id", convo.listing_id).maybeSingle();
      if (listingResult.error && isMissingSizeColumn(listingResult.error)) {
        listingResult = await supabase.from("listings").select("id, title, price, city, image_url, image_urls").eq("id", convo.listing_id).maybeSingle();
      }

      const [{ data: profileData }, { data: messageData }] = await Promise.all([
        supabase.from("profiles").select("id, display_name, business_name").eq("id", otherId).maybeSingle(),
        supabase
          .from("messages")
          .select("id, conversation_id, sender_id, body, created_at")
          .eq("conversation_id", id)
          .order("created_at", { ascending: true })
          .limit(500),
      ]);

      if (alive) {
        setConversation(convo);
        setListing(listingResult.data || null);
        setOtherProfile(profileData || null);
        setMessages(Array.isArray(messageData) ? (messageData as Message[]) : []);
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [id, router, user]);

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`mobile-messages:${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        (payload) => {
          const row = payload.new as Message;
          if (!row?.id) return;
          setMessages((prev) => (prev.some((item) => item.id === row.id) ? prev : [...prev, row]));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  async function send() {
    if (!canSend || !user?.id || !conversation?.id) return;
    const text = body.trim();
    setBody("");
    setSending(true);
    const { data, error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversation.id, sender_id: user.id, body: text })
      .select("id, conversation_id, sender_id, body, created_at")
      .single();

    if (!error && data) {
      setMessages((prev) => (prev.some((item) => item.id === data.id) ? prev : [...prev, data as Message]));
    }
    setSending(false);
  }

  if (!user) {
    return (
      <View style={[shared.screen, shared.content, styles.center]}>
        <Text style={shared.h2}>{language === "en" ? "Log in to chat." : "Entra para chatear."}</Text>
        <Button label={language === "en" ? "Log in" : "Entrar"} onPress={() => router.push("/auth")} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={shared.screen} behavior={Platform.select({ ios: "padding", android: undefined })}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>{language === "en" ? "Back" : "Volver"}</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={styles.title}>{otherName}</Text>
          <Text numberOfLines={1} style={shared.muted}>{listing?.title || (language === "en" ? "Listing" : "Anuncio")}</Text>
        </View>
      </View>

      {loading ? (
        <View style={[shared.content, { flex: 1 }]}>
          <Text style={shared.body}>{language === "en" ? "Loading chat..." : "Cargando chat..."}</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const mine = item.sender_id === user.id;
            return (
              <View style={[styles.messageRow, mine && styles.messageRowMine]}>
                <View style={[styles.bubble, mine && styles.bubbleMine]}>
                  <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{item.body}</Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>{language === "en" ? "Start the conversation." : "Empieza la conversacion."}</Text>
              <Text style={shared.muted}>{language === "en" ? "Ask if it is available or arrange pickup." : "Pregunta si esta disponible o acuerda entrega."}</Text>
            </View>
          }
        />
      )}

      <View style={styles.composer}>
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder={language === "en" ? "Write a message..." : "Escribe un mensaje..."}
          placeholderTextColor="rgba(21,17,17,0.38)"
          style={styles.input}
          multiline
        />
        <Button label={language === "en" ? "Send" : "Enviar"} disabled={!canSend} loading={sending} onPress={send} style={styles.send} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: "center",
    gap: 14,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  back: {
    color: theme.colors.primaryDark,
    fontWeight: "900",
  },
  title: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  list: {
    padding: 16,
    paddingBottom: 24,
  },
  messageRow: {
    alignItems: "flex-start",
    marginBottom: 10,
  },
  messageRowMine: {
    alignItems: "flex-end",
  },
  bubble: {
    maxWidth: "82%",
    padding: 12,
    borderRadius: theme.radius,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bubbleMine: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  bubbleText: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  bubbleTextMine: {
    color: "#ffffff",
  },
  empty: {
    ...shared.card,
    padding: 16,
    gap: 7,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 110,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  send: {
    minHeight: 46,
    paddingHorizontal: 14,
  },
});
