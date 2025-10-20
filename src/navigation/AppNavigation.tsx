import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
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
import { TouchableOpacity } from "react-native";
import AddTransaction from "../screens/AddTransaction";
import ProductScreen from "../screens/ProductScreen";

const Tab = createBottomTabNavigator<RootStackParamList>();

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
                left: 30,
                right: 30,
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

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigation() {
  const initialize = useAuthStore((state) => state.initialize);
  const session = useAuthStore((state) => state.session);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
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
              <Stack.Screen name="Main" component={Tabs} />
              <Stack.Screen
                name="Notifications"
                component={NotificationScreen}
                options={{
                  title: "Notifications",
                  headerShown: true,
                  headerRight: () => (
                    <TouchableOpacity style={{ marginRight: 0 }}>
                      <Ionicons name="notifications" size={24} color="#fff" />
                    </TouchableOpacity>
                  ),
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
