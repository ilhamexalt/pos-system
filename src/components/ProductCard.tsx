import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";
import { Product } from "../types";
import { Colors } from "../constants/Colors";

interface Props {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
}

export default function ProductCard({ product, onAddToCart }: Props) {
  const [scale] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
      {product.image && (
        <Image source={{ uri: product.image }} style={styles.image} />
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {product.description}
        </Text>

        <Text style={styles.price}>
          Rp {product.price?.toLocaleString("id-ID")}
        </Text>

        <TouchableWithoutFeedback
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => onAddToCart(product, 1)}
        >
          <View style={styles.button}>
            <Text style={styles.buttonText}>Add to Cart</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 380,
    resizeMode: "cover",
  },
  infoContainer: {
    padding: 14,
  },
  name: {
    fontSize: 17,
    fontFamily: "MontserratBold",
    color: Colors.primary,
  },
  description: {
    fontSize: 14,
    color: Colors.secondary,
    marginVertical: 6,
    fontFamily: "MontserratRegular",
  },
  price: {
    fontSize: 16,
    color: Colors.green,
    marginTop: 2,
    marginBottom: 12,
    fontFamily: "MontserratBold",
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: "MontserratSemiBold",
  },
});
