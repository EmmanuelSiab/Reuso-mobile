import { Session, User } from "@supabase/supabase-js";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Profile = {
  id: string;
  account_type?: "personal" | "business" | "private" | null;
  display_name?: string | null;
  business_name?: string | null;
  business_category?: string | null;
  is_verified?: boolean | null;
};

type AuthValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  initializing: boolean;
  profileLoading: boolean;
  isLoggedIn: boolean;
  isEmailVerified: boolean;
  needsEmailVerification: boolean;
  needsOnboarding: boolean;
  refreshProfile: (userId?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

function normalizeAccountType(value?: string | null) {
  const type = String(value || "").trim().toLowerCase();
  if (type === "private") return "personal";
  if (type === "personal" || type === "business") return type;
  return "";
}

function isProfileComplete(profile: Profile | null) {
  if (!profile) return false;
  const type = normalizeAccountType(profile.account_type);
  if (type === "business") return String(profile.business_name || "").trim().length >= 2;
  if (type === "personal") return String(profile.display_name || "").trim().length >= 2;
  return false;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const refreshProfile = useCallback(
    async (forUserId?: string) => {
      const userId = forUserId || user?.id;
      if (!userId) {
        setProfile(null);
        return;
      }

      setProfileLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, account_type, business_name, display_name, business_category, is_verified")
          .eq("id", userId)
          .maybeSingle();
        if (error) throw error;
        setProfile((data as Profile) || null);
      } finally {
        setProfileLoading(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    let alive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      const nextSession = data.session ?? null;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setInitializing(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);
      if (!nextSession?.user) setProfile(null);
      setInitializing(false);
    });

    return () => {
      alive = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user?.id) refreshProfile(user.id).catch(() => setProfile(null));
  }, [user?.id, refreshProfile]);

  const emailConfirmedAt = user?.email_confirmed_at || user?.confirmed_at || null;
  const isEmailVerified = Boolean(emailConfirmedAt);
  const needsEmailVerification = !initializing && Boolean(user?.id) && !isEmailVerified;
  const needsOnboarding =
    !initializing && !profileLoading && Boolean(user?.id) && isEmailVerified && !isProfileComplete(profile);

  const value = useMemo<AuthValue>(
    () => ({
      session,
      user,
      profile,
      initializing,
      profileLoading,
      isLoggedIn: Boolean(user),
      isEmailVerified,
      needsEmailVerification,
      needsOnboarding,
      refreshProfile,
      logout: async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
      },
    }),
    [
      session,
      user,
      profile,
      initializing,
      profileLoading,
      isEmailVerified,
      needsEmailVerification,
      needsOnboarding,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
