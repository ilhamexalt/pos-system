import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Cash, RootStackParamList } from "../types";
import { supabase } from "../config/supabase";
import { useCartStore } from "../stores/cartStore";
import { useAuthStore } from "../stores/authStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import Modal from "../components/Modal";
import { useCashStore } from "../stores/cashStore";

type Props = NativeStackScreenProps<RootStackParamList, "Checkout">;

export default function CheckoutScreen({ navigation }: Props) {
  const items = useCartStore((state) => state.items);
  const getTotalAmount = useCartStore((state) => state.getTotalAmount);
  const clearCart = useCartStore((state) => state.clearCart);
  const user = useAuthStore((state) => state.user);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { fetchCash } = useCashStore();

  const createOrder = async () => {
    if (!user) {
      Alert.alert("Error", "Please login first");
      return;
    }

    if (items.length === 0) {
      Alert.alert("Error", "Cart is empty!");
      return;
    }

    setLoading(true);

    try {
      let cashData: Cash | null = null;
      let currentCash = 0;
      if (paymentMethod.toLowerCase() === "cash") {
        const { data, error } = await supabase
          .from("cash")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;

        cashData = data;
        currentCash = data.nominal || 0;
      }

      for (const item of items) {
        const totalItem = (item.price || 0) * item.quantity;

        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert({
            product_id: item.id,
            user_uid: user.id,
            total_amount: (item.price || 0) * item.quantity,
            status: "completed",
          })
          .select()
          .single();

        if (orderError) throw orderError;

        const { error: transactionError } = await supabase
          .from("transactions")
          .insert({
            order_id: orderData.id,
            user_uid: user.id,
            amount: (item.price || 0) * item.quantity,
            status: "completed",
            category: "selling",
            type: "income",
            description: `Order for ${item.name}`,
            payment_method: paymentMethod,
          });

        if (transactionError) throw transactionError;

        if (paymentMethod.toLowerCase() === "cash") {
          currentCash += totalItem;
        }

        // add new row table cash jika paymentMethod cash
        if (paymentMethod.toLowerCase() === "cash" && cashData) {
          const amountAdded = (item.price || 0) * item.quantity;
          const description = `Saldo telah bertambah ${amountAdded}. Saldo baru: ${currentCash}`;

          const { error: insertCashError } = await supabase
            .from("cash")
            .insert({
              nominal: currentCash,
              desc: description,
            });

          if (insertCashError) throw insertCashError;
        }
      }
      setLoading(false);
      setMessage("Order created successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteSmoke }}>
      <View style={styles.container}>
        <Text style={styles.title}>🛒 Checkout</Text>

        <View style={styles.card}>
          <Text style={styles.totalLabel}>Total Payment</Text>
          <Text style={styles.totalValue}>
            Rp {getTotalAmount().toLocaleString("id-ID")}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentContainer}>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "cash" && styles.paymentSelected,
            ]}
            onPress={() => setPaymentMethod("cash")}
            activeOpacity={0.9}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <FontAwesome6 name="money-bill-1" size={24} color="black" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "qris" && styles.paymentSelected,
            ]}
            onPress={() => setPaymentMethod("qris")}
            activeOpacity={0.9}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="qr-code-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: loading ? Colors.secondary : Colors.primary },
          ]}
          onPress={createOrder}
          activeOpacity={0.9}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Processing..." : "Place Order"}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        type="alert"
        visible={!!message}
        message={message}
        iconName="checkmark-circle-outline"
        iconColor={Colors.green}
        onClose={() => {
          setMessage("");
          fetchCash();
          clearCart();
          navigation.navigate("Main");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontFamily: "MontserratBold",
    marginBottom: 24,
    textAlign: "center",
    color: Colors.black,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 16,
    color: Colors.secondary,
  },
  totalValue: {
    fontSize: 24,
    fontFamily: "MontserratBold",
    color: Colors.black,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "MontserratSemiBold",
    marginBottom: 10,
    color: Colors.secondary,
  },
  paymentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  paymentOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.white,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: Colors.white,
  },
  paymentSelected: {
    backgroundColor: "transparent",
    borderColor: Colors.primary,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    height: 50,
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "MontserratSemiBold",
  },
});
