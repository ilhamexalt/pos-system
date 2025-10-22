import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

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

            const tokenResponse = await Notifications.getExpoPushTokenAsync();
            token = tokenResponse.data;
            console.log("Expo Push Token:", token);

            //  --- SIMPAN TOKEN KE FIRESTORE ---
            console.log("Saving push token to Firestore with userId:", userId);
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

                    console.log("Token saved to Firestore successfully.");
                } catch (e) {
                    console.error("Gagal menyimpan token ke Firestore:", e);
                }
            }

        } else {
            alert("Must use physical device for Push Notifications");
        }

        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'A channel is needed for the permissions prompt to appear',
                sound: 'happy_bells.wav',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
                lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
            });
        }
    } catch (error) {
        console.log(error)
    }

    return token;
}
