import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal as ModalRN,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { supabase } from "../config/supabase";
import { Colors } from "../constants/Colors";
import { format } from "../utils/format";
import LoadingComponent from "../components/Loading";

type Product = {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  in_stock: number;
  image?: string;
};

export default function ProductScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*");
    if (error) Alert.alert("Error", error.message);
    else setProducts(data as Product[]);
    setLoading(false);
  };

  const openModal = (item?: Product) => {
    setEditing(item || null);
    setForm(item || {});
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const handleSave = async () => {
    if (!form.name || !form.category || !form.price) {
      Alert.alert("Validation", "Please fill in required fields.");
      return;
    }

    if (editing) {
      // Update existing
      const { error } = await supabase
        .from("products")
        .update({
          name: form.name,
          category: form.category,
          description: form.description,
          price: form.price,
          in_stock: form.in_stock,
          image: form.image,
        })
        .eq("id", editing.id);

      if (error) Alert.alert("Error", error.message);
    } else {
      // Create new
      const { error } = await supabase.from("products").insert([
        {
          name: form.name,
          category: form.category,
          description: form.description,
          price: form.price,
          in_stock: form.in_stock || 0,
          image: form.image || "https://picsum.photos/200",
        },
      ]);

      if (error) Alert.alert("Error", error.message);
    }

    closeModal();
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) Alert.alert("Error", error.message);
    fetchProducts();
  };

  const renderRightActions = (id: string) => (
    <View style={styles.deleteContainer}>
      <Pressable onPress={() => handleDelete(id)}>
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>
    </View>
  );

  const renderItem = ({ item }: { item: Product }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <View style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.category}>
            {format().capitalizeEachWord(item.category)}
          </Text>
          <Text style={styles.price}>
            Rp {item.price.toLocaleString("id-ID")}
          </Text>
          <Text style={styles.stock}>Stock: {item.in_stock}</Text>
        </View>
        <TouchableOpacity onPress={() => openModal(item)}>
          <Text style={styles.edit}>Edit</Text>
        </TouchableOpacity>
      </View>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <LoadingComponent />
      ) : (
        // <ActivityIndicator
        //   size="large"
        //   color={Colors.primary}
        //   style={{ marginTop: 50 }}
        // />
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12 }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 40, color: "#777" }}>
              No products found
            </Text>
          }
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      {/* Modal Form */}
      <ModalRN visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {editing ? "Edit Product" : "Add Product"}
            </Text>

            <TextInput
              placeholderTextColor={Colors.secondary}
              style={styles.input}
              placeholder="Name"
              value={form.name || ""}
              onChangeText={(v) => setForm({ ...form, name: v })}
            />
            <TextInput
              placeholderTextColor={Colors.secondary}
              style={styles.input}
              placeholder="Description"
              value={form.description || ""}
              onChangeText={(v) => setForm({ ...form, description: v })}
            />
            <TextInput
              placeholderTextColor={Colors.secondary}
              style={styles.input}
              placeholder="Category"
              value={form.category || ""}
              onChangeText={(v) => setForm({ ...form, category: v })}
            />
            <TextInput
              placeholderTextColor={Colors.secondary}
              style={styles.input}
              placeholder="Price"
              keyboardType="numeric"
              value={form.price?.toString() || ""}
              onChangeText={(v) => setForm({ ...form, price: Number(v) })}
            />
            <TextInput
              placeholderTextColor={Colors.secondary}
              style={styles.input}
              placeholder="In Stock"
              keyboardType="numeric"
              value={form.in_stock?.toString() || ""}
              onChangeText={(v) => setForm({ ...form, in_stock: Number(v) })}
            />
            <TextInput
              placeholderTextColor={Colors.secondary}
              style={styles.input}
              placeholder="Image URL"
              value={form.image || ""}
              onChangeText={(v) => setForm({ ...form, image: v })}
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.btnCancel} onPress={closeModal}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.btnSave} onPress={handleSave}>
                <Text style={styles.btnSaveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ModalRN>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.whiteSmoke,
    paddingBottom: 50,
  },
  card: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    alignItems: "center",
    elevation: 2,
  },
  image: { width: 70, height: 70, borderRadius: 8 },
  name: { fontSize: 16, fontFamily: "MontserratBold" },
  category: { fontSize: 12, color: Colors.secondary },
  price: {
    fontSize: 14,
    color: Colors.black,
    marginTop: 2,
    fontFamily: "MontserratRegular",
  },
  stock: {
    fontSize: 12,
    color: Colors.secondary,
    fontFamily: "MontserratRegular",
  },
  edit: {
    color: Colors.green,
    fontSize: 14,
    padding: 6,
    fontFamily: "MontserratRegular",
  },
  deleteContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
    backgroundColor: Colors.red,
    borderRadius: 10,
    marginVertical: 5,
  },
  deleteText: {
    color: Colors.white,
    fontFamily: "MontserratSemiBold",
    paddingHorizontal: 20,
    paddingVertical: 25,
  },
  fab: {
    position: "absolute",
    bottom: 40,
    right: 25,
    backgroundColor: Colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  fabText: { color: Colors.white, fontSize: 28, marginBottom: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.blackTransparent,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    width: "85%",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "MontserratBold",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.whiteSmoke,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
    paddingHorizontal: 10,
    fontFamily: "MontserratRegular",
    color: Colors.secondary,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  btnCancel: {
    padding: 10,
    marginRight: 8,
  },
  btnCancelText: { color: Colors.secondary, fontFamily: "MontserratRegular" },
  btnSave: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  btnSaveText: { color: Colors.white, fontFamily: "MontserratSemiBold" },
});
