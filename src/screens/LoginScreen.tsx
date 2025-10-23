import React, { useRef, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Image,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { useAuthStore } from "../stores/authStore";
import { Colors } from "../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Modal from "../components/Modal";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 25,
      bounciness: 8,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 8,
    }).start();
  };

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      navigation.replace("Main");
    }
  };

  return (
    // <View style={styles.container}>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <Text style={styles.title}>POS System</Text>
      <Image
        source={require("../../assets/images/login.png")}
        style={styles.image}
      />
      <View style={styles.inputContainer}>
        <Ionicons
          name="mail-outline"
          size={20}
          color={Colors.secondary}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor={Colors.secondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color={Colors.secondary}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          placeholderTextColor={Colors.secondary}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={20}
            color={Colors.secondary}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={handleLogin}
        style={[
          styles.button,
          { backgroundColor: loading ? Colors.secondary : Colors.primary },
        ]}
        activeOpacity={0.9}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <Modal
        type="alert"
        visible={!!errorMessage}
        message={errorMessage}
        iconName="alert-circle-outline"
        iconColor={Colors.red}
        onClose={() => setErrorMessage("")}
      />
    </KeyboardAvoidingView>

    // </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 26,
    fontFamily: "MontserratBold",
    textAlign: "center",
    marginBottom: 30,
    color: Colors.black,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: Colors.white,
  },
  icon: {
    marginRight: 5,
    color: Colors.primary,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: "MontserratRegular",
    color: Colors.secondary,
    height: 50,
  },
  eyeIcon: {
    padding: 5,
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
    textTransform: "uppercase",
    fontFamily: "MontserratSemiBold",
  },
  image: {
    width: "auto",
    height: 200,
    resizeMode: "contain",
    marginBottom: 30,
  },
});
