import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { Field } from "../src/components/Field";
import { useAuth } from "../src/context/AuthContext";
import { categories, conditions, publicSellerName } from "../src/lib/listings";
import { supabase } from "../src/lib/supabase";
import { shared, theme } from "../src/styles/theme";

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
  const blob = await response.blob();
  const path = `${userId}/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType,
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export default function CreateScreen() {
  const router = useRouter();
  const { user, profile, initializing, needsEmailVerification, needsOnboarding } = useAuth();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("Ciudad de Mexico");
  const [category, setCategory] = useState("moda");
  const [condition, setCondition] = useState("Buen estado");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [saving, setSaving] = useState(false);

  const sellerName = publicSellerName(profile, "");
  const priceNumber = useMemo(() => parseMXN(price), [price]);
  const canSubmit =
    Boolean(user?.id) &&
    title.trim().length >= 3 &&
    description.trim().length >= 10 &&
    sellerName.trim().length >= 2 &&
    imageUri &&
    (priceNumber === null || Number.isFinite(priceNumber)) &&
    !saving;

  useEffect(() => {
    if (initializing) return;
    if (!user) router.replace("/auth");
    else if (needsEmailVerification) router.replace("/auth");
    else if (needsOnboarding) router.replace("/account-type");
  }, [initializing, needsEmailVerification, needsOnboarding, router, user]);

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
    }
  }

  async function submit() {
    if (!user?.id || !canSubmit) return;
    setSaving(true);
    try {
      const imageUrl = await uploadImage(imageUri, user.id);
      const payload = {
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        condition,
        city: city.trim(),
        price: priceNumber === null ? null : priceNumber,
        image_url: imageUrl,
        image_urls: [imageUrl],
        seller_name: sellerName.trim(),
      };

      const { data, error } = await supabase.from("listings").insert(payload).select("id").single();
      if (error) throw error;
      router.replace(`/listing/${data.id}`);
    } catch (error: any) {
      Alert.alert("No se pudo publicar", error?.message || "Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={shared.screen} behavior={Platform.select({ ios: "padding", android: undefined })}>
      <ScrollView contentContainerStyle={shared.content}>
        <View style={styles.head}>
          <Text style={shared.h1}>Publica una pieza.</Text>
          <Text style={shared.body}>Sube una foto clara, precio honesto y detalles utiles para venta local.</Text>
        </View>

        <View style={styles.form}>
          <Field label="Titulo *" value={title} onChangeText={setTitle} maxLength={60} placeholder="Chamarra denim vintage" />
          <Field label="Precio MXN" value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="720" />
          <Field label="Ciudad" value={city} onChangeText={setCity} />

          <View style={styles.optionBlock}>
            <Text style={styles.optionLabel}>Categoria</Text>
            <View style={styles.chipGrid}>
              {categories.map((item) => (
                <Pressable
                  key={item.value}
                  onPress={() => setCategory(item.value)}
                  style={[styles.chip, category === item.value && styles.chipActive]}
                >
                  <Text style={[styles.chipText, category === item.value && styles.chipTextActive]}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.optionBlock}>
            <Text style={styles.optionLabel}>Condicion</Text>
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
            label="Descripcion *"
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={400}
            placeholder="Cuenta detalles de talla, estado, entrega y cualquier marca visible."
          />

          <View style={styles.optionBlock}>
            <Text style={styles.optionLabel}>Foto *</Text>
            <Pressable style={styles.imagePicker} onPress={pickImage}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
              ) : (
                <Text style={styles.imagePickerText}>Elegir imagen</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.identity}>
            <Text style={styles.identityTitle}>Identidad publica</Text>
            <Text style={shared.muted}>Se mostrara como {sellerName || "--"}. Tu email no aparece en el anuncio.</Text>
          </View>

          <Button label="Publicar anuncio" loading={saving} disabled={!canSubmit} onPress={submit} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
});
