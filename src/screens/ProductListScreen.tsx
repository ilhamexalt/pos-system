import React, { useState, useEffect, useRef } from "react";
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
import { useCashStore } from "../stores/cashStore";
import { useAuthStore } from "../stores/authStore";
import Modal from "../components/Modal";
type Props = BottomTabScreenProps<RootStackParamList, "ProductList">;

const audioSource = require("../../assets/sound/ya-allah-cantik-banget.mp3");

export default function ProductListScreen({ navigation }: Props) {
  const id = useAuthStore((state) => state.user?.id);
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [lastReminderTime, setLastReminderTime] = useState<string | null>(null);

  // CART
  const addToCart = useCartStore((state) => state.addToCart);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const totalItems = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  // NOTIF
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const player = useAudioPlayer(audioSource);
  const [prevCount, setPrevCount] = useState(unreadCount);
  const fetchNotifications = useNotificationStore(
    (state) => state.fetchNotifications
  );
  const subscribeToNotifications = useNotificationStore(
    (state) => state.subscribeToNotifications
  );
  const unsubscribe = useNotificationStore((state) => state.unsubscribe);

  // CASH
  const { fetchCash, cash, loading: loadingCash } = useCashStore();

  // ROLE
  const { role, setRole } = useAuthStore();

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
    await fetchCash();
    await fetchProducts();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchNotifications();
    subscribeToNotifications();

    if (unreadCount > prevCount) {
      player.seekTo(0);
      player.play();
    }
    setPrevCount(unreadCount);

    return () => {
      unsubscribe();
    };
  }, [fetchNotifications, subscribeToNotifications, unsubscribe]);

  useEffect(() => {
    fetchCash();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (role !== "" && role !== null) {
      return;
    }

    const fetchRole = async () => {
      try {
        const { data: roleData, error } = await supabase
          .from("role")
          .select("role_name")
          .eq("user_id", id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching role:", error);
        }

        setRole(roleData?.role_name || null);
      } catch (error) {
        console.error("Fetch failed:", error);
      }
    };

    fetchRole();
  }, [id, setRole]);

  // Check time for reminder from 22:50 to 23:59
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const totalMinutes = hours * 60 + minutes;

      // 22:50 = 1370 minutes, 23:59 = 1439 minutes
      const startTime = 22 * 60 + 50; // 22:50
      const endTime = 23 * 60 + 59;   // 23:59

      const todayKey = now.toDateString();

      // Show reminder if within 22:50 - 23:59 and not shown today
      if (totalMinutes >= startTime && totalMinutes <= endTime) {
        if (lastReminderTime !== todayKey) {
          setShowReminder(true);
          setLastReminderTime(todayKey);
        }
      }
    };

    // Check immediately and then every minute
    checkTime();
    const interval = setInterval(checkTime, 60000);

    return () => clearInterval(interval);
  }, [lastReminderTime]);

  if (products.length < 1 && !refreshing) {
    return <Loading visible={true} onRequestClose={() => { }} />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            {loadingCash ? (
              <ActivityIndicator size="small" color={Colors.black} />
            ) : (
              <Text style={styles.cashOnHandText}>
                Rp {(cash[0]?.nominal || 0).toLocaleString("id-ID") || "0"}{" "}
                (COH)
              </Text>
            )}
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
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <ProductCard product={item} onAddToCart={addToCart} />
          )}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </View>

      {/* Reminder Modal */}
      <Modal
        type="action"
        visible={showReminder}
        onClose={() => setShowReminder(false)}
        onConfirm={() => setShowReminder(false)}
        confirmText="OK, Mengerti"
        hiddenButtonCancel
      >
        <View style={{ alignItems: "center", paddingVertical: 10 }}>
          <Text style={{ fontSize: 40, marginBottom: 10 }}>📝</Text>
          <Text style={styles.reminderTitle}>Reminder</Text>
          <Text style={styles.reminderText}>
            Catat Penjualan Sebelum 23:59 WIB
          </Text>
        </View>
      </Modal>
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
    top: -5,
    right: -5,
    backgroundColor: Colors.red,
    borderRadius: 50,
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: "MontserratBold",
  },
  cashOnHandText: {
    color: Colors.black,
    fontSize: 20,
    fontFamily: "MontserratRegular",
  },
  row: {
    justifyContent: "space-between",
  },
  reminderTitle: {
    fontSize: 20,
    fontFamily: "MontserratBold",
    color: Colors.black,
    marginBottom: 8,
  },
  reminderText: {
    fontSize: 14,
    fontFamily: "MontserratRegular",
    color: Colors.secondary,
    textAlign: "center",
  },
});
