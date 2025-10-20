import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  interpolate,
  useAnimatedStyle,
  Extrapolate,
} from "react-native-reanimated";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Colors } from "../constants/Colors";
import { useCartStore } from "../stores/cartStore";
import { CartItem as CartItemType } from "../types";

interface Props {
  item: CartItemType;
}

export default function CartItem({ item }: Props) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  const renderRightActions = (progress: any, dragX: any) => {
    // Animasi tombol delete biar smooth
    const animatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        dragX.value,
        [-100, 0],
        [1, 0.8],
        Extrapolate.CLAMP
      );

      const opacity = interpolate(
        dragX.value,
        [-100, -20, 0],
        [1, 0.5, 0],
        Extrapolate.CLAMP
      );

      return {
        transform: [{ scale }],
        opacity,
      };
    });

    return (
      <Animated.View style={[styles.deleteAction, animatedStyle]}>
        <TouchableOpacity
          onPress={() => removeFromCart(item.id)}
          style={styles.deleteButton}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={24} color={Colors.white} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ReanimatedSwipeable
      renderRightActions={renderRightActions}
      friction={2}
      overshootRight={false}
    >
      <View style={styles.item}>
        {/* Nama Produk */}
        <View style={styles.header}>
          <Text style={styles.name}>{item.name}</Text>
        </View>

        {/* Harga */}
        <Text style={styles.price}>
          Rp {item.price?.toLocaleString("id-ID")}
        </Text>

        {/* Quantity */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() =>
              updateQuantity(item.id, Math.max(1, item.quantity - 1))
            }
            activeOpacity={0.9}
          >
            <Text style={styles.qtyText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.quantity}>{item.quantity}</Text>

          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
            activeOpacity={0.9}
          >
            <Text style={styles.qtyText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Subtotal */}
        <View style={styles.subtotalContainer}>
          <Text style={styles.subtotalLabel}>Subtotal</Text>
          <Text style={styles.subtotalValue}>
            Rp {((item.price || 0) * item.quantity).toLocaleString("id-ID")}
          </Text>
        </View>
      </View>
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: Colors.white,
    padding: 16,
    marginBottom: 14,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontFamily: "MontserratSemiBold",
    color: Colors.black,
    flexShrink: 1,
  },
  price: {
    color: Colors.green,
    marginTop: 8,
    fontSize: 15,
    fontFamily: "MontserratSemiBold",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  qtyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: "MontserratBold",
  },
  quantity: {
    marginHorizontal: 18,
    fontSize: 16,
    fontFamily: "MontserratSemiBold",
  },
  subtotalContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.whiteSmoke,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  subtotalLabel: {
    fontSize: 14,
    color: Colors.secondary,
    fontFamily: "MontserratRegular",
  },
  subtotalValue: {
    fontSize: 15,
    color: Colors.secondary,
    fontFamily: "MontserratSemiBold",
  },
  deleteAction: {
    justifyContent: "center",
    alignItems: "flex-end",
    backgroundColor: "transparent",
    borderRadius: 10,
  },
  deleteButton: {
    backgroundColor: Colors.red,
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    height: "85%",
    borderRadius: 10,
    marginVertical: 5,
  },
});
