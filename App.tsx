import "react-native-gesture-handler";
import "react-native-reanimated";

import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
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
