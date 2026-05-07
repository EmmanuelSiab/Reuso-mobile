import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components/Button";
import { Field } from "../../src/components/Field";
import { useAuth } from "../../src/context/AuthContext";
import { useLanguage } from "../../src/context/LanguageContext";
import { categories, categoryDisplayLabel, categoryNeedsSize, conditions, isMissingSizeColumn, publicSellerName, standardSizes } from "../../src/lib/listings";
import { supabase } from "../../src/lib/supabase";
import { shared, theme } from "../../src/styles/theme";

const BUCKET = "listing-images";

function parseMXN(input: string) {
  const raw = input.trim();
  if (!raw) return null;
  const n = Number(raw.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? Math.round(n) : NaN;
}

function extFromUri(uri: string) {
  const ext = uri.split("?")[0].split(".").pop()?.toLowerCase();
  if (ext && ["jpg", "jpeg", "png", "webp", "heic"].includes(ext)) return ext === "jpeg" ? "jpg" : ext;
  return "jpg";
}

function contentTypeFromExt(ext: string) {
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "heic") return "image/heic";
  return "image/jpeg";
}

async function uploadImage(uri: string, userId: string) {
  const ext = extFromUri(uri);
  const contentType = contentTypeFromExt(ext);
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error("No se pudo leer la imagen seleccionada. Elige otra foto e intenta de nuevo.");
  }
  const body = await response.arrayBuffer();
  if (!body.byteLength) {
    throw new Error("La imagen seleccionada esta vacia. Elige otra foto e intenta de nuevo.");
  }
  const path = `${userId}/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    contentType,
    upsert: false,
  });
  if (error) throw error;

  const { error: downloadError } = await supabase.storage.from(BUCKET).download(path);
  if (downloadError) {
    throw new Error(`La imagen se subio, pero no se pudo verificar en Storage: ${downloadError.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data.publicUrl) {
    throw new Error("No se pudo generar la URL publica de la imagen.");
  }

  const publicCheck = await fetch(data.publicUrl, { method: "GET" });
  if (!publicCheck.ok) {
    throw new Error("La imagen se subio, pero no es publica. Revisa que el bucket listing-images sea publico.");
  }

  return data.publicUrl;
}

export default function CreateScreen() {
  const router = useRouter();
  const { user, profile, initializing, needsEmailVerification, needsOnboarding } = useAuth();
  const { language, t } = useLanguage();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("Ciudad de Mexico");
  const [category, setCategory] = useState("moda");
  const [size, setSize] = useState("M");
  const [customSize, setCustomSize] = useState("");
  const [condition, setCondition] = useState("Buen estado");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishedId, setPublishedId] = useState<string | null>(null);

  const sellerName = publicSellerName(profile, "");
  const needsSize = categoryNeedsSize(category);
  const finalSize = needsSize ? (size === "Otro" ? customSize.trim() : size) : "";
  const priceNumber = useMemo(() => parseMXN(price), [price]);
  const canSubmit =
    Boolean(user?.id) &&
    title.trim().length >= 3 &&
    description.trim().length >= 10 &&
    sellerName.trim().length >= 2 &&
    imageUri &&
    (!needsSize || finalSize.length >= 1) &&
    (priceNumber === null || Number.isFinite(priceNumber)) &&
    !saving;

  useEffect(() => {
    if (initializing) return;
    if (!user) router.replace("/auth");
    else if (needsEmailVerification) router.replace("/auth");
    else if (needsOnboarding) router.replace("/account-type");
  }, [initializing, needsEmailVerification, needsOnboarding, router, user]);

  useEffect(() => {
    if (needsSize && !size) setSize("M");
    if (!needsSize) {
      setSize("");
      setCustomSize("");
    }
  }, [needsSize, size]);

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tus fotos para subir una imagen.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.86,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setImageUri(result.assets[0].uri);
      setPublishedId(null);
    }
  }

  function resetForm() {
    setTitle("");
    setPrice("");
    setCity("Ciudad de Mexico");
    setCategory("moda");
    setSize("M");
    setCustomSize("");
    setCondition("Buen estado");
    setDescription("");
    setImageUri("");
    setPublishedId(null);
  }

  async function submit() {
    if (!user?.id) return;
    if (!imageUri) {
      Alert.alert("Falta la foto", "Elige una imagen antes de publicar. Reuso no crea anuncios sin foto.");
      return;
    }
    if (!canSubmit) return;
    setSaving(true);
    try {
      const imageUrl = await uploadImage(imageUri, user.id);
      const payload = {
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        size: finalSize || null,
        condition,
        city: city.trim(),
        price: priceNumber === null ? null : priceNumber,
        image_url: imageUrl,
        image_urls: [imageUrl],
        seller_name: sellerName.trim(),
      };

      let { data, error } = await supabase.from("listings").insert(payload).select("id").single();
      let savedWithoutSize = false;
      if (error && isMissingSizeColumn(error)) {
        const { size: _size, ...payloadWithoutSize } = payload;
        const retry = await supabase.from("listings").insert(payloadWithoutSize).select("id").single();
        data = retry.data;
        error = retry.error;
        savedWithoutSize = !retry.error;
      }
      if (error) throw error;
      if (!data?.id) throw new Error("El anuncio se creo, pero no pudimos obtener su ID.");
      setPublishedId(String(data.id));
      Alert.alert(
        "Anuncio publicado",
        savedWithoutSize
          ? "Tu pieza ya aparece en Reuso. Nota: la talla no se guardo porque falta aplicar la migracion de Supabase."
          : "Tu pieza ya aparece en Reuso."
      );
    } catch (error: any) {
      Alert.alert("No se pudo publicar", error?.message || "Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={shared.screen} behavior={Platform.select({ ios: "padding", android: undefined })}>
      <SafeAreaView style={shared.screen} edges={["bottom"]}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[shared.content, styles.content]}
      >
        <View style={styles.head}>
          <Text style={shared.h1}>{t("publishTitle")}</Text>
          <Text style={shared.body}>{t("publishBody")}</Text>
        </View>

        {publishedId ? (
          <View style={styles.successCard}>
            <Text style={styles.successTitle}>{t("publishedTitle")}</Text>
            <Text style={shared.muted}>{t("publishedBody")}</Text>
            <View style={styles.successActions}>
              <Button label={t("viewMyListings")} onPress={() => router.push("/profile")} style={{ flex: 1 }} />
              <Button label={t("publishAnother")} variant="secondary" onPress={resetForm} style={{ flex: 1 }} />
            </View>
          </View>
        ) : null}

        <View style={styles.form}>
          <Field label={`${t("title")} *`} value={title} onChangeText={setTitle} maxLength={60} placeholder="Chamarra denim vintage" />
          <Field label={t("priceMXN")} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="720" />
          <Field label={t("city")} value={city} onChangeText={setCity} />

          <View style={styles.optionBlock}>
            <Text style={styles.optionLabel}>{t("category")}</Text>
            <View style={styles.chipGrid}>
              {categories.map((item) => (
                <Pressable
                  key={item.value}
                  onPress={() => setCategory(item.value)}
                  style={[styles.chip, category === item.value && styles.chipActive]}
                >
                  <Text style={[styles.chipText, category === item.value && styles.chipTextActive]}>{categoryDisplayLabel(item.value, language)}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {needsSize ? (
            <View style={styles.optionBlock}>
              <Text style={styles.optionLabel}>
                {category === "accesorios" ? t("sizeOrMeasure") : t("size")}
              </Text>
              <View style={styles.chipGrid}>
                {standardSizes.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => setSize(item)}
                    style={[styles.chip, size === item && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, size === item && styles.chipTextActive]}>{item}</Text>
                  </Pressable>
                ))}
              </View>
              {size === "Otro" ? (
                <Field
                  label={t("customMeasure")}
                  value={customSize}
                  onChangeText={setCustomSize}
                  maxLength={40}
                  placeholder={category === "accesorios" ? "Ej. cinturon 90 cm, anillo 7" : "Ej. talla 28, W32 L30"}
                />
              ) : null}
              <Text style={shared.muted}>
                {language === "en"
                  ? category === "accesorios"
                    ? "For belts, rings, or other accessories, use Other and write the measurement."
                    : "If XS-XXXL does not apply, use Other and write the real measurement."
                  : category === "accesorios"
                  ? "Para cinturones, anillos u otros accesorios usa Otro y escribe la medida."
                  : "Si no aplica XS-XXXL, usa Otro y escribe la medida real."}
              </Text>
            </View>
          ) : null}

          <View style={styles.optionBlock}>
            <Text style={styles.optionLabel}>{t("condition")}</Text>
            <View style={styles.chipGrid}>
              {conditions.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setCondition(item)}
                  style={[styles.chip, condition === item && styles.chipActive]}
                >
                  <Text style={[styles.chipText, condition === item && styles.chipTextActive]}>{item}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Field
            label={`${t("description")} *`}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={400}
            placeholder={language === "en" ? "Share size, condition, pickup, and visible brand details." : "Cuenta detalles de talla, estado, entrega y cualquier marca visible."}
          />

          <View style={styles.optionBlock}>
            <Text style={styles.optionLabel}>{t("photo")} *</Text>
            <Pressable style={styles.imagePicker} onPress={pickImage}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
              ) : (
                <Text style={styles.imagePickerText}>{t("chooseImage")}</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.identity}>
            <Text style={styles.identityTitle}>{t("publicIdentity")}</Text>
            <Text style={shared.muted}>
              {language === "en"
                ? `Shown as ${sellerName || "--"}. Your email does not appear on the listing.`
                : `Se mostrara como ${sellerName || "--"}. Tu email no aparece en el anuncio.`}
            </Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.stickyBar}>
        <Button label={publishedId ? t("viewMyListings") : t("publish")} loading={saving} disabled={!publishedId && !canSubmit} onPress={publishedId ? () => router.push("/profile") : submit} />
      </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 220,
  },
  head: {
    gap: 10,
    marginBottom: 18,
  },
  form: {
    gap: 14,
  },
  optionBlock: {
    gap: 8,
  },
  optionLabel: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "900",
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
  },
  chipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  imagePicker: {
    ...shared.card,
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  imagePickerText: {
    color: theme.colors.primaryDark,
    fontWeight: "900",
  },
  preview: {
    width: "100%",
    height: 280,
  },
  identity: {
    padding: 14,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: 5,
  },
  identityTitle: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 16,
  },
  successCard: {
    ...shared.card,
    padding: 16,
    gap: 12,
    marginBottom: 16,
    backgroundColor: theme.colors.successSoft,
    borderColor: "rgba(22,122,74,0.18)",
  },
  successTitle: {
    color: theme.colors.success,
    fontSize: 20,
    fontWeight: "900",
  },
  successActions: {
    flexDirection: "row",
    gap: 10,
  },
  stickyBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 92,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: "rgba(255,247,246,0.96)",
    borderTopWidth: 1,
    borderTopColor: "rgba(210,42,35,0.1)",
  },
});
