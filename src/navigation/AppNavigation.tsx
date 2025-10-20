import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

// Screens
import ProductListScreen from "../screens/ProductListScreen";
import CartScreen from "../screens/CartScreen";
import TransactionScreen from "../screens/TransactionScreen";

// Zustand stores
import { RootStackParamList } from "../types/index";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useAuthStore } from "../stores/authStore";
import LoginScreen from "../screens/LoginScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NotificationScreen from "../screens/NotificationScreen";
import AccountScreen from "../screens/AccountScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import { Colors } from "../constants/Colors";
import { Platform, TouchableOpacity } from "react-native";
import AddTransaction from "../screens/AddTransaction";
import ProductScreen from "../screens/ProductScreen";

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { VALID_SCREENS, ValidScreenName } from "../constants/InitScreen";
import * as Asset from "expo-asset";

const Tab = createBottomTabNavigator<RootStackParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function Tabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.black,
        tabBarStyle: {
          paddingBottom: 10 + insets.bottom,
          height: insets.bottom + 45,
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontFamily: "MontserratRegular",
          fontSize: 12,
        },
        tabBarIcon: ({ color }) => {
          let iconName = "";
          if (route.name === "ProductList") iconName = "home-outline";
          else if (route.name === "Account") iconName = "person-outline";
          else if (route.name === "Transactions")
            iconName = "bag-handle-outline";

          return <Ionicons name={iconName as any} size={20} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionScreen}
        options={{
          tabBarButton: (props: any) => (
            <TouchableOpacity
              {...props}
              activeOpacity={0.9}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{
                top: -25,
                left: 0,
                right: 0,
                alignSelf: "center",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: Colors.primary,
                width: 60,
                height: 60,
                borderRadius: 30,
                shadowColor: Colors.black,
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
                elevation: 5,
              }}
            >
              <Ionicons name="bag-handle-outline" size={28} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

const registerForPushNotificationsAsync = async (userId: string) => {
  let token;
  if (!Device.isDevice) return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.error("Permission for notifications not granted");
    return;
  }

  token = (await Notifications.getExpoPushTokenAsync()).data;

  // --- SIMPAN TOKEN KE FIRESTORE ---
  if (token && userId) {
    try {
      const tokenRef = doc(db, "PushTokens", userId);
      await setDoc(
        tokenRef,
        {
          token: token,
          userId: userId,
          platform: Platform.OS,
          timestamp: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.error("Gagal menyimpan token ke Firestore:", e);
    }
  }
  return token;
};

const audioSource = require("../../assets/sound/happy-bells.wav");

export default function AppNavigation() {
  const initialize = useAuthStore((state) => state.initialize);
  const session = useAuthStore((state) => state.session);
  const user_id = useAuthStore((state) => state.user?.id);
  const navigationRef = useNavigationContainerRef<RootStackParamList>();

  let customSoundUri: string | null = null;
  async function setupNotifications() {
    if (Platform.OS === "android") {
      const asset = await Asset.Asset.fromModule(audioSource).downloadAsync();
      customSoundUri = asset.localUri ?? asset.uri;

      if (customSoundUri) {
        Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          importance: Notifications.AndroidImportance.MAX,
          sound: customSoundUri,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true, // Menentukan apakah sistem harus memutar suara notifikasi saat notifikasi diterima (baik saat foreground maupun background).
        shouldSetBadge: true, //Menentukan apakah sistem harus mengubah angka (badge) pada ikon aplikasi di homescreen perangkat.

        shouldShowBanner: true, // Untuk menampilkan notifikasi sebagai banner/toast (Android & iOS)
        shouldShowList: true, // Untuk menampilkan di daftar notifikasi saat app dibuka (hanya iOS)
      }),
    });
  }

  useEffect(() => {
    if (user_id) {
      registerForPushNotificationsAsync(user_id);
    }

    const receivedListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        const data = notification.request.content;
        console.log("Notifikasi diterima:", data.body);
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as {
          [key: string]: unknown;
        };

        const { screen } = data;

        if (typeof screen !== "string" || !navigationRef.isReady()) {
          alert("Sampaikan error ini ke tim pengembang!");
          return;
        }

        if (VALID_SCREENS.includes(screen as ValidScreenName)) {
          const targetScreen = screen as keyof RootStackParamList;

          navigationRef.navigate(targetScreen);
        } else {
          alert("Sampaikan error ini ke tim pengembang! #" + screen);
        }
      });

    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  }, [user_id, navigationRef]);

  useEffect(() => {
    setupNotifications();
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            headerStyle: {
              backgroundColor: Colors.primary, // warna utama UI
              // shadowColor: "transparent", // hilangkan shadow default iOS
              // elevation: 0, // hilangkan shadow Android
            },
            headerTintColor: Colors.white,
            headerTitleStyle: {
              fontWeight: "700",
              fontSize: 20,
            },
            headerTitleAlign: "center",
          }}
        >
          {!session ? (
            <Stack.Screen name="Login" component={LoginScreen} />
          ) : (
            <>
              <Stack.Screen
                name="Main"
                component={Tabs}
                options={{
                  title: "",
                }}
              />
              <Stack.Screen
                name="Notifications"
                component={NotificationScreen}
                options={{
                  title: "Notifications",
                  headerShown: true,
                }}
              />
              <Stack.Screen
                name="Cart"
                component={CartScreen}
                options={{ title: "My Cart", headerShown: true }}
              />
              <Stack.Screen name="Account" component={AccountScreen} />
              <Stack.Screen
                name="Checkout"
                component={CheckoutScreen}
                options={{ title: "Checkout", headerShown: true }}
              />
              <Stack.Screen
                name="AddTransaction"
                component={AddTransaction}
                options={{
                  title: "Add Transaction",
                  headerShown: true,
                }}
              />
              <Stack.Screen
                name="Products"
                component={ProductScreen}
                options={{
                  title: "Products",
                  headerShown: true,
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
