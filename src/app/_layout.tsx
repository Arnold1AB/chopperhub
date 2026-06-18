import { supabase } from "@/lib/supabase";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

SplashScreen.preventAutoHideAsync().catch(() => {
  // The native splash may already be hidden during fast refresh.
});

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        await supabase.auth.getSession();
      } catch (error) {
        console.log("SESSION RESTORE ERROR:", error);
      } finally {
        setReady(true);
        await SplashScreen.hideAsync().catch(() => {});
      }
    };

    prepare();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      setReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0F172A",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color="#35A7FF" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
