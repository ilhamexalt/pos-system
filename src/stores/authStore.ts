import { create } from "zustand";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../config/supabase";
// import * as Notifications from "expo-notifications";
// import * as Device from "expo-device";
// import { Platform } from "react-native";

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

// const registerForPushNotificationsAsync = async () => {
//   let token;
//   if (Device.isDevice) {
//     const { status: existingStatus } =
//       await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;

//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }

//     if (finalStatus !== "granted") {
//       throw new Error("Permission for notifications not granted");
//     }

//     token = (await Notifications.getExpoPushTokenAsync()).data;
//     console.log("Expo Push Token:", token);

//     // For Android: set notification channel
//     if (Platform.OS === "android") {
//       Notifications.setNotificationChannelAsync("default", {
//         name: "default",
//         importance: Notifications.AndroidImportance.MAX,
//         vibrationPattern: [0, 250, 250, 250],
//         lightColor: "#FF231F7C",
//       });
//     }
//   }

//   return token;
// };

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

      // const token = await registerForPushNotificationsAsync();

      // if (token) {
      //   await supabase.from("device_tokens").upsert(
      //     {
      //       user_id: data.user.id,
      //       token,
      //       platform: Device.osName ?? "unknown",
      //     },
      //     { onConflict: "user_id" }
      //   );
      // }

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
