import "react-native-gesture-handler";
import "react-native-reanimated";

import React, { useEffect } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as SplashScreen from "expo-splash-screen";
import { Alert, Platform } from "react-native";
import AppNavigation from "./src/navigation/AppNavigation";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [loaded] = useFonts({
    MontserratThin: require("./assets/fonts/Montserrat-Thin.ttf"),
    MontserratLight: require("./assets/fonts/Montserrat-Light.ttf"),
    MontserratRegular: require("./assets/fonts/Montserrat-Regular.ttf"),
    MontserratSemiBold: require("./assets/fonts/Montserrat-SemiBold.ttf"),
    MontserratBold: require("./assets/fonts/Montserrat-Bold.ttf"),
    MontserratExtraBold: require("./assets/fonts/Montserrat-ExtraBold.ttf"),
  });

  // const registerForPushNotificationsAsync = async () => {
  //   let token;
  //   if (Device.isDevice) {
  //     const { status: existingStatus } =
  //       await Notifications.getPermissionsAsync();
  //     let finalStatus = existingStatus;

  //     if (existingStatus !== "granted") {
  //       const { status } = await Notifications.requestPermissionsAsync();
  //       finalStatus = status;
  //     }

  //     if (finalStatus !== "granted") {
  //       alert("Failed to get push token!");
  //       return;
  //     }

  //     token = (await Notifications.getExpoPushTokenAsync()).data;
  //     console.log("Expo Push Token:", token);
  //   } else {
  //     alert("Must use physical device for Push Notifications");
  //   }

  //   if (Platform.OS === "android") {
  //     Notifications.setNotificationChannelAsync("default", {
  //       name: "default",
  //       importance: Notifications.AndroidImportance.MAX,
  //       vibrationPattern: [0, 250, 250, 250],
  //       lightColor: "#FF231F7C",
  //     });
  //   }

  //   return token;
  // };

  // useEffect(() => {
  //   registerForPushNotificationsAsync();

  //   const subscription = Notifications.addNotificationReceivedListener(
  //     (notification) => {
  //       console.log("Received notification:", notification);
  //       Notifications.addNotificationReceivedListener((notification) => {
  //         Alert.alert(
  //           "New Notification!",
  //           notification.request.content.body ?? "You have a new notification"
  //         );
  //       });
  //     }
  //   );

  //   return () => subscription.remove();
  // }, []);

  useEffect(() => {
    const prepare = async () => {
      if (loaded) {
        await SplashScreen.hideAsync();
      }
    };
    prepare();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigation />
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}
