import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { Field } from "../src/components/Field";
import { LogoHeader } from "../src/components/LogoHeader";
import { useAuth } from "../src/context/AuthContext";
import { supabase } from "../src/lib/supabase";
import { shared } from "../src/styles/theme";

export default function AccountTypeScreen() {
  const router = useRouter();
  const { user, profile, refreshProfile, initializing, needsEmailVerification } = useAuth();
  const [accountType, setAccountType] = useState<"personal" | "business">("personal");
  const [displayName, setDisplayName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (initializing) return;
    if (!user) router.replace("/auth");
    if (needsEmailVerification) router.replace("/auth");
  }, [initializing, needsEmailVerification, router, user]);

  useEffect(() => {
    if (!profile) return;
    setAccountType(profile.account_type === "business" ? "business" : "personal");
    setDisplayName(profile.display_name || "");
    setBusinessName(profile.business_name || "");
    setBusinessCategory(profile.business_category || "");
  }, [profile]);

  const canSave = useMemo(() => {
    if (accountType === "business") return businessName.trim().length >= 2 && !saving;
    return displayName.trim().length >= 2 && !saving;
  }, [accountType, businessName, displayName, saving]);

  async function save() {
    if (!user?.id || !canSave) return;
    setSaving(true);
    setMessage("");
    try {
      const payload: Record<string, string | null> =
        accountType === "business"
          ? {
              id: user.id,
              account_type: "business",
              business_name: businessName.trim(),
              business_category: businessCategory.trim() || null,
              display_name: null,
            }
          : {
              id: user.id,
              account_type: "personal",
              display_name: displayName.trim(),
              business_name: null,
              business_category: null,
            };

      const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
      if (error) throw error;
      await refreshProfile(user.id);
      router.replace("/explore");
    } catch (error: any) {
      setMessage(error?.message || "No se pudo guardar tu perfil.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={shared.screen} contentContainerStyle={shared.content}>
      <LogoHeader compact subtitle="Perfil publico" />
      <View style={styles.head}>
        <Text style={shared.h1}>Completa tu cuenta.</Text>
        <Text style={shared.body}>Elige si vendes como persona o tienda. Este nombre sera publico; tu email no se muestra.</Text>
      </View>

      <View style={styles.toggle}>
        <Button label="Persona" variant={accountType === "personal" ? "primary" : "secondary"} onPress={() => setAccountType("personal")} style={styles.toggleButton} />
        <Button label="Tienda" variant={accountType === "business" ? "primary" : "secondary"} onPress={() => setAccountType("business")} style={styles.toggleButton} />
      </View>

      <View style={styles.card}>
        {accountType === "business" ? (
          <>
            <Field label="Nombre de la tienda" value={businessName} onChangeText={setBusinessName} placeholder="Casa Circula" />
            <Field label="Categoria del negocio" value={businessCategory} onChangeText={setBusinessCategory} placeholder="Vintage, muebles, accesorios" />
          </>
        ) : (
          <Field label="Nombre publico" value={displayName} onChangeText={setDisplayName} placeholder="Tu nombre o alias" />
        )}
        <Button label="Guardar y continuar" loading={saving} disabled={!canSave} onPress={save} />
        {message ? <Text style={shared.muted}>{message}</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  head: {
    marginTop: 22,
    gap: 10,
  },
  toggle: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 16,
  },
  toggleButton: {
    flex: 1,
  },
  card: {
    ...shared.card,
    padding: 16,
    gap: 12,
  },
});
