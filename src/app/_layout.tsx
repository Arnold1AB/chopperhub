import { supabase } from "@/lib/supabase";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Wait for Supabase to restore session from AsyncStorage
    supabase.auth.getSession().then(() => {
      setReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      setReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0F172A" }}>
        <Text> </Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="update-profile" />
      <Stack.Screen name="update-password" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
