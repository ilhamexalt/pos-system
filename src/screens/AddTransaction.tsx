import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../config/supabase";
import { Colors } from "../constants/Colors";
import { useAuthStore } from "../stores/authStore";
import Modal from "../components/Modal";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";

export default function AddTransaction() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [platform, setPlatform] = useState("offline");
  const [category, setCategory] = useState("buying");

  const formatToIDR = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");

    if (!numericValue) {
      return "";
    }

    const formatted = new Intl.NumberFormat("id-ID").format(
      Number(numericValue)
    );

    return formatted;
  };

  const handleAmountChange = (text: string) => {
    const formattedText = formatToIDR(text);
    setAmount(formattedText);
  };

  const getRawValue = (formattedValue: string) => {
    return Number(formattedValue.replace(/\./g, ""));
  };

  const handleSubmit = async () => {
    if (!amount || !description) {
      setMessage("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const parsedAmount = getRawValue(amount);

    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_uid: user?.id,
        amount: parsedAmount,
        status: "completed",
        category,
        type: category === "buying" ? "outcome" : "income",
        description,
        payment_method: paymentMethod,
        platform,
      });

    setLoading(false);

    if (transactionError) {
      setMessage(transactionError.message);
    } else {
      if (paymentMethod.toLowerCase() === "cash") {
        const { data: cashData, error: cashError } = await supabase
          .from("cash")
          .select("nominal")
          .order("updated_at", { ascending: false })
          .limit(1)
          .single();

        if (cashError && cashError.code !== "PGRST116") {
          throw cashError;
        }

        const oldNominal = cashData ? cashData.nominal : 0;

        let newNominal: number;
        let transactionDesc: string;

        const isBuying = category.toLowerCase() === "buying";

        if (isBuying) {
          newNominal = oldNominal - parsedAmount;
          const decreaseAmount = parsedAmount;
          transactionDesc = `Saldo telah berkurang ${decreaseAmount}. Saldo sebelumnya: ${oldNominal} menjadi: ${newNominal}`;
        } else {
          newNominal = oldNominal + parsedAmount;
          const increaseAmount = parsedAmount;
          transactionDesc = `Saldo telah bertambah ${increaseAmount}. Saldo sebelumnya: ${oldNominal} menjadi: ${newNominal}`;
        }

        const newDescription = transactionDesc;

        const { error: insertCashError } = await supabase.from("cash").insert({
          nominal: newNominal,
          desc: newDescription,
        });

        if (insertCashError) throw insertCashError;
      }

      setMessage("Transaction added successfully!");
      setAmount("");
      setDescription("");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <Text style={styles.label}>Category</Text>
        <View style={styles.paymentContainer}>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              category === "buying" && styles.paymentSelected,
            ]}
            onPress={() => setCategory("buying")}
            activeOpacity={0.9}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.label}>Buying</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              category === "selling" && styles.paymentSelected,
            ]}
            onPress={() => setCategory("selling")}
            activeOpacity={0.9}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.label}>Selling</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>
          Amount <Text style={{ color: Colors.red }}>*</Text>
        </Text>
        <TextInput
          value={amount}
          // onChangeText={setAmount}
          onChangeText={handleAmountChange}
          placeholder="e.g., 100000"
          keyboardType="numeric"
          style={styles.input}
          placeholderTextColor={Colors.secondary}
        />

        <Text style={styles.label}>
          Description <Text style={{ color: Colors.red }}>*</Text>
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="e.g., Bought office supplies"
          multiline
          style={styles.textarea}
          placeholderTextColor={Colors.secondary}
        />

        <Text style={styles.label}>Platform</Text>
        <View style={styles.paymentContainer}>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              platform === "offline" && styles.paymentSelected,
            ]}
            onPress={() => setPlatform("offline")}
            activeOpacity={0.9}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.label}>Offline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              platform === "gojek" && styles.paymentSelected,
            ]}
            onPress={() => setPlatform("gojek")}
            activeOpacity={0.9}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.label}>Gojek</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              platform === "grab" && styles.paymentSelected,
            ]}
            onPress={() => setPlatform("grab")}
            activeOpacity={0.9}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.label}>Grab</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              platform === "shopee" && styles.paymentSelected,
            ]}
            onPress={() => setPlatform("shopee")}
            activeOpacity={0.9}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.label}>Shopee</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Choose payment method</Text>
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
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.9}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={[
            styles.button,
            { backgroundColor: loading ? Colors.secondary : Colors.primary },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Add Transaction</Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <Modal
        type="alert"
        visible={!!message}
        message={message}
        iconName={
          message === "Transaction added successfully!"
            ? "checkmark"
            : "alert-circle-outline"
        }
        iconColor={
          message === "Transaction added successfully!" ? "green" : "red"
        }
        onClose={() => setMessage("")}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: Colors.whiteSmoke,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: Colors.black,
    fontFamily: "MontserratRegular",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.whiteSmoke,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    backgroundColor: Colors.white,
    fontFamily: "MontserratRegular",
  },
  textarea: {
    borderWidth: 1,
    borderColor: Colors.whiteSmoke,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    backgroundColor: Colors.white,
    minHeight: 80,
    textAlignVertical: "top",
    fontFamily: "MontserratRegular",
  },
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    height: 50,
    // shadowColor: Colors.primary,
    // shadowOpacity: 0.2,
    // shadowRadius: 5,
    // elevation: 3,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "MontserratSemiBold",
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
    justifyContent: "center",
    alignContent: "center",
  },
  paymentSelected: {
    backgroundColor: "transparent",
    borderColor: Colors.primary,
  },
});
