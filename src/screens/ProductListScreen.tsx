import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { RootStackParamList, Product } from "../types";
import { supabase } from "../config/supabase";
import { useCartStore } from "../stores/cartStore";
import ProductCard from "../components/ProductCard";
import { useNotificationStore } from "../stores/notificationStore";
import { useAudioPlayer } from "expo-audio";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import Loading from "../components/Loading";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useCashStore } from "../stores/cashStore";

// type Props = NativeStackScreenProps<RootStackParamList, "ProductList">;
type Props = BottomTabScreenProps<RootStackParamList, "ProductList">;

const audioSource = require("../../assets/sound/ya-allah-cantik-banget.mp3");

export default function ProductListScreen({ navigation }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const addToCart = useCartStore((state) => state.addToCart);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const totalItems = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const player = useAudioPlayer(audioSource);
  const [prevCount, setPrevCount] = useState(unreadCount);
  const [refreshing, setRefreshing] = useState(false);
  const fetchNotifications = useNotificationStore(
    (state) => state.fetchNotifications
  );
  const { fetchCash, cash, loading: loadingCash } = useCashStore();

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .gt("in_stock", 0);

    if (error) {
      console.error(error.message);
      return;
    }
    if (data) setProducts(data as Product[]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  useEffect(() => {
    // Ambil data awal
    fetchCash();
    fetchProducts();
    fetchNotifications();

    // Subscribe ke notifikasi
    const subscribe = useNotificationStore.getState().subscribeToNotifications;
    const unsubscribe = useNotificationStore.getState().unsubscribe;
    subscribe();

    // Cleanup saat unmount
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (unreadCount > prevCount) {
      player.seekTo(0);
      player.play();
    }
    setPrevCount(unreadCount);
  }, [unreadCount]);

  if (products.length < 1 && !refreshing) {
    return <Loading visible={true} onRequestClose={() => {}} />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <FontAwesome6 name="dollar" size={16} color={Colors.black} />
            <Text style={styles.buttonText}>
              {loadingCash ? (
                <ActivityIndicator size="small" color={Colors.black} />
              ) : (
                (cash[0]?.nominal || 0).toLocaleString("id-ID") || "0"
              )}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Notifications")}
              activeOpacity={0.9}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="notifications-outline"
                size={26}
                color={Colors.black}
              />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Cart")}
              activeOpacity={0.9}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="cart-outline" size={26} color={Colors.black} />
              {totalItems > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{totalItems}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ProductCard product={item} onAddToCart={addToCart} />
          )}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingBottom: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
  buttonText: {
    color: Colors.black,
    fontSize: 18,
    fontFamily: "MontserratRegular",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: -5,
    backgroundColor: Colors.red,
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: "MontserratBold",
  },
});
