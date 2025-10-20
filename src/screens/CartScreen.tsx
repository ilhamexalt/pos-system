import React from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { useCartStore } from "../stores/cartStore";
import CartItem from "../components/CartItem";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";

type Props = NativeStackScreenProps<RootStackParamList, "Cart">;

export default function CartScreen({ navigation }: Props) {
  const items = useCartStore((state) => state.items);
  const getTotalAmount = useCartStore((state) => state.getTotalAmount);
  const clearCart = useCartStore((state) => state.clearCart);

  const handleCheckout = () => {
    if (items.length === 0) {
      alert("Cart is empty!");
      return;
    }
    navigation.navigate("Checkout");
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CartItem item={item} />}
        ListEmptyComponent={
          <View>
            <Image
              source={require("../../assets/gif/empty.gif")}
              style={styles.image}
            />
            <Text style={styles.emptyText}>Your cart is empty</Text>
          </View>
        }
      />

      <SafeAreaView>
        {items.length > 0 && (
          <View style={styles.footer}>
            <Text style={styles.total}>
              Total: Rp {getTotalAmount().toLocaleString("id-ID")}
            </Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: Colors.secondary }]}
              activeOpacity={0.9}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={clearCart}
            >
              <Text style={styles.buttonText}>Clear Cart</Text>
            </TouchableOpacity>
            <View style={styles.spacer} />
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.9}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={handleCheckout}
            >
              <Text style={styles.buttonText}>Checkout ({items.length})</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  image: {
    width: "auto",
    height: 250,
    marginTop: 150,
  },
  footer: {
    padding: 15,
    backgroundColor: "transparent",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  total: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 10,
  },
  spacer: {
    height: 10,
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
    backgroundColor: Colors.primary,
  },

  buttonText: {
    color: Colors.white,
    textTransform: "uppercase",
    fontFamily: "MontserratSemiBold",
    fontSize: 14,
  },
  emptyText: {
    color: Colors.secondary,
    fontSize: 12,
    textAlign: "center",
  },
});
