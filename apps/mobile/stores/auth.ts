import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Profile, UserSubscription, SubscriptionTier } from "@/types";

interface AuthState {
  user: Profile | null;
  session: any | null;
  subscription: UserSubscription | null;
  tiers: SubscriptionTier[];
  isLoading: boolean;
  isAuthenticated: boolean;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  fetchTiers: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  subscription: null,
  tiers: [],
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        set({
          session,
          user: profile,
          isAuthenticated: true,
          isLoading: false,
        });

        // Load subscription in background
        get().refreshSubscription();
      } else {
        set({ isLoading: false });
      }

      // Fetch tiers regardless of auth state
      get().fetchTiers();

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          set({ session, user: profile, isAuthenticated: true });
          get().refreshSubscription();
        } else {
          set({
            session: null,
            user: null,
            subscription: null,
            isAuthenticated: false,
          });
        }
      });
    } catch (error) {
      console.error("Auth initialization error:", error);
      set({ isLoading: false });
    }
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };
    return {};
  },

  signUp: async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) return { error: error.message };
    return {};
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      session: null,
      subscription: null,
      isAuthenticated: false,
    });
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { error: error.message };
    return {};
  },

  refreshProfile: async () => {
    const { session } = get();
    if (!session?.user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profile) set({ user: profile });
  },

  refreshSubscription: async () => {
    const { session } = get();
    if (!session?.user) return;

    const { data } = await supabase
      .from("user_subscriptions")
      .select("*, subscription_tiers(*)")
      .eq("user_id", session.user.id)
      .in("status", ["active", "trial"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      set({
        subscription: {
          id: data.id,
          user_id: data.user_id,
          tier_id: data.tier_id,
          status: data.status,
          provider: data.provider,
          provider_subscription_id: data.provider_subscription_id,
          billing_cycle: data.billing_cycle,
          period_start: data.period_start,
          period_end: data.period_end,
          cancel_at_period_end: data.cancel_at_period_end,
        },
      });
    }
  },

  fetchTiers: async () => {
    const { data } = await supabase
      .from("subscription_tiers")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (data) set({ tiers: data });
  },
}));
