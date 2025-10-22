import { create } from "zustand";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../config/supabase";

interface AuthState {
  user: User | null;
  session: Session | null;
  role: string | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error?: Error | null }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error?: Error | null }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  setRole: (role: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: false,
  role: null,
  setUser: (user: User | null) => set({ user }),
  setSession: (session: Session | null) => set({ session }),
 setRole: (role: string | null) => set({ role }),

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error && data) {
      const { data: roleData, error: roleError } = await supabase
        .from("role")
        .select("role_name")
        .eq("user_id", data.user.id)
        .single();

      set({
        user: data.user ?? null,
        session: data.session ?? null,
        role: roleData?.role_name ?? null,
      });
    }

    return { error };
  },

  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (!error && data) {
      set({ user: data.user ?? null, session: data.session ?? null });
    }
    return { error };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  initialize: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null });
  },
}));
