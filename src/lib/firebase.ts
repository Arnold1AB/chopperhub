import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { getApp, getApps, initializeApp } from "firebase/app";
// @ts-ignore TypeScript resolves default auth typings; Metro uses the React Native export.
import { getAuth, getReactNativePersistence, initializeAuth } from "@firebase/auth";
import { getFirestore } from "firebase/firestore";

const extra = Constants.expoConfig?.extra as
  | Record<string, string | undefined>
  | undefined;

const readConfigValue = (key: string) => process.env[key] ?? extra?.[key];

const firebaseConfig = {
  apiKey: readConfigValue("EXPO_PUBLIC_FIREBASE_API_KEY"),
  authDomain: readConfigValue("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: readConfigValue("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: readConfigValue("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: readConfigValue(
    "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  ),
  appId: readConfigValue("EXPO_PUBLIC_FIREBASE_APP_ID"),
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  throw new Error(
    `Missing Firebase configuration: ${missingKeys.join(", ")}. Set the EXPO_PUBLIC_FIREBASE_* values.`,
  );
}

const hasFirebaseApp = getApps().length > 0;

export const firebaseApp = hasFirebaseApp
  ? getApp()
  : initializeApp(firebaseConfig);

export const auth =
  hasFirebaseApp
    ? getAuth(firebaseApp)
    : initializeAuth(firebaseApp, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

export const db = getFirestore(firebaseApp);
