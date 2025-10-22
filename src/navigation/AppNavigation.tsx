import React, { useEffect } from "react";

import Ionicons from "@expo/vector-icons/Ionicons";

// Zustand stores
import { RootStackParamList } from "../types/index";

import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useAuthStore } from "../stores/authStore";
import { Colors } from "../constants/Colors";
import { TouchableOpacity } from "react-native";

// SCREEN
import LoginScreen from "../screens/LoginScreen";
import NotificationScreen from "../screens/NotificationScreen";
import AccountScreen from "../screens/AccountScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import ProductScreen from "../screens/ProductScreen";
import AddTransaction from "../screens/AddTransaction";
import ProductListScreen from "../screens/ProductListScreen";
import CartScreen from "../screens/CartScreen";
import TransactionScreen from "../screens/TransactionScreen";

// Notification
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "../services/notificationService";

// Navigation
import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAudioPlayer } from "expo-audio";

export const navigationRef =
  React.createRef<NavigationContainerRef<RootStackParamList>>();
export function navigate(name: keyof RootStackParamList, params?: any) {
  navigationRef.current?.navigate(name, params);
}

const Tab = createBottomTabNavigator<RootStackParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false, // Menentukan apakah sistem harus memutar suara notifikasi saat notifikasi diterima (baik saat foreground maupun background).
    shouldSetBadge: true, //Menentukan apakah sistem harus mengubah angka (badge) pada ikon aplikasi di homescreen perangkat.

    shouldShowBanner: true, // Untuk menampilkan notifikasi sebagai banner/toast (Android & iOS)
    shouldShowList: true, // Untuk menampilkan di daftar notifikasi saat app dibuka (hanya iOS)
  }),
});

const AUDIO = require("../../assets/sound/happy-bells.wav");

const AppNavigation: React.FC = () => {
  const initialize = useAuthStore((state) => state.initialize);
  const session = useAuthStore((state) => state.session);
  const userId = useAuthStore((state) => state.user?.id);
  const player = useAudioPlayer(AUDIO);

  useEffect(() => {
    console.log("Setting up notification listeners...");
    registerForPushNotificationsAsync(userId || "");

    // Listener ketika notifikasi diterima (saat app sedang aktif)
    const notificationSub = Notifications.addNotificationReceivedListener(
      (notification) => {
        player.seekTo(0);
        player.play();
        console.log("Notification received:", notification);
      }
    );

    // Listener ketika user tap notifikasi
    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const screen = response?.notification?.request?.content?.data
          ?.screen as string | undefined;

        if (screen) {
          navigate(screen as keyof RootStackParamList);
        } else {
          console.log("No screen data found in notification payload");
        }
      }
    );

    return () => {
      notificationSub.remove();
      responseSub.remove();
    };
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const Tabs = () => {
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
  };

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
};

export default AppNavigation;
