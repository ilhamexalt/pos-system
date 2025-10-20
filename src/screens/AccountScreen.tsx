// src/screens/AccountScreen.tsx
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Alert,
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { useAuthStore } from "../stores/authStore";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { format } from "../utils/format";
import Modal from "../components/Modal";
import Constants from "expo-constants";

type Props = NativeStackScreenProps<RootStackParamList, "Account">;

// --- Interface Props ---
interface SettingsListItemProps {
  iconName: keyof typeof FontAwesome6.glyphMap;
  labelText: string;
  onPress: () => void;
}

const SettingsListItem: React.FC<SettingsListItemProps> = ({
  iconName,
  labelText,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.infoItem}
      activeOpacity={0.9}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      onPress={onPress}
    >
      <FontAwesome6
        name={iconName}
        size={22}
        color={Colors.secondary}
        style={styles.infoIcon}
      />

      <Text style={styles.infoText}>{labelText}</Text>

      <Ionicons
        name="chevron-forward-outline"
        size={20}
        color={Colors.secondary}
      />
    </TouchableOpacity>
  );
};

export default function AccountScreen({ navigation }: Props) {
  const signOut = useAuthStore((state) => state.signOut);
  const user = useAuthStore((state) => state.user);
  const scale = useRef(new Animated.Value(1)).current;
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const role = useAuthStore((state) => state.role);

  const config = Constants.expoConfig;
  const appVersion = config?.version || "1.0.0";
  const appName = config?.name || "My App";

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

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut();
      setLoading(false);
      navigation.replace("Login");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to logout");
    }
  };

  const accountMenuItems = [
    {
      iconName: "user-gear",
      labelText: "Edit Profile",
      onPress: () => setErrorMessage("Feature Not Available"),
    },
    {
      iconName: "pencil",
      labelText: "Add Transaction",
      onPress: () => navigation.navigate("AddTransaction"),
    },
    {
      iconName: "file-archive",
      labelText: "Products",
      onPress: () => {
        if (role === "admin") {
          navigation.navigate("Products");
        } else {
          setErrorMessage("You don't have access");
        }
      },
    },
    {
      iconName: "circle-info",
      labelText: "Help Center",
      onPress: () => setErrorMessage("Feature Not Available"),
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HEADER PROFILE CARD */}
      <View style={styles.headerCard}>
        <View>
          <Ionicons
            name="person-circle-outline"
            size={80}
            color={Colors.primary}
          />
        </View>

        <Text style={styles.username}>{user?.email || "Unknown User"}</Text>
        <Text style={styles.joinDate}>
          Joined {format().formatDateToCustom(user?.created_at || "")}
        </Text>
      </View>

      {/* ACCOUNT INFO LIST */}
      <View style={styles.infoList}>
        {/* --- LOOPING ITEM MENU --- */}
        {accountMenuItems.map((item, index) => (
          <SettingsListItem
            key={index}
            iconName={item.iconName as any}
            labelText={item.labelText}
            onPress={item.onPress}
          />
        ))}
      </View>

      {/* LOGOUT BUTTON */}
      <Animated.View style={[styles.logoutWrapper, { transform: [{ scale }] }]}>
        <TouchableWithoutFeedback
          onPressIn={pressIn}
          onPressOut={pressOut}
          onPress={handleLogout}
          disabled={loading}
        >
          <View
            style={[
              styles.logoutButton,
              { backgroundColor: loading ? Colors.secondary : Colors.primary },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Ionicons name="exit-outline" size={22} color={Colors.white} />
            )}
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* VERSION INFO */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>
          {appName} • {appVersion}
        </Text>
      </View>

      {/* MODAL */}
      <Modal
        type="alert"
        visible={!!errorMessage}
        message={errorMessage}
        iconName="warning-outline"
        iconColor={Colors.yellow}
        onClose={() => setErrorMessage("")}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.whiteSmoke,
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  headerCard: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    width: "100%",
  },
  avatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  username: {
    fontSize: 20,
    color: Colors.black,
    fontFamily: "MontserratRegular",
  },
  joinDate: {
    color: Colors.secondary,
    fontSize: 13,
    marginTop: 5,
    fontFamily: "MontserratRegular",
  },
  infoList: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: Colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  infoIcon: {
    width: 30,
    textAlign: "center",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.whiteSmoke,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: Colors.secondary,
    fontFamily: "MontserratSemiBold",
  },
  logoutWrapper: {
    marginTop: 40,
    width: "100%",
  },
  logoutButton: {
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: Colors.red,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    height: 50,
  },
  versionContainer: {
    marginTop: 20,
    alignItems: "center",
    opacity: 0.6,
  },
  versionText: {
    fontSize: 12,
    color: Colors.secondary,
    textTransform: "uppercase",
    fontFamily: "MontserratRegular",
  },
});
