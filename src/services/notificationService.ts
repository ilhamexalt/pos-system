import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import Constants from "expo-constants";

export async function registerForPushNotificationsAsync(userId: string): Promise<string | undefined> {
    let token: string | undefined;
    try {
        console.log("Registering for push notifications...");

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== "granted") {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== "granted") {
                alert("Permission for push notifications denied!");
                return;
            }

            if (Platform.OS === "android") {
                await Notifications.setNotificationChannelAsync("default", {
                    name: "default",
                    sound: "happy_bells.wav", // pastikan file ada di android/app/src/main/res/raw/
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
                });
            }

            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ||
                Constants?.easConfig?.projectId;

            const tokenResponse = await Notifications.getExpoPushTokenAsync({
                projectId
            });
            token = tokenResponse.data;

            //  --- SIMPAN TOKEN KE FIRESTORE ---
            if (token && userId) {
                try {
                    const tokenRef = doc(db, "PushTokens", userId);
                    await setDoc(
                        tokenRef,
                        {
                            token: token,
                            userId,
                            platform: Platform.OS,
                            timestamp: new Date().toISOString(),
                        },
                        { merge: true }
                    );

                    console.log("Token saved to Firestore successfully with userId:" + userId);
                } catch (e) {
                    console.error("Gagal menyimpan token ke Firestore:", e);
                }
            }

        } else {
            alert("Must use physical device for Push Notifications");
        }


    } catch (error) {
        console.log(error)
    }

    return token;
}
