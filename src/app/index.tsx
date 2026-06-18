import { supabase } from "@/lib/supabase";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setAuthenticated(!!session);
      } catch (error) {
        console.log("AUTH GATE ERROR:", error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#35A7FF" />
        <Text style={styles.text}>Loading ChopperHub...</Text>
      </View>
    );
  }

  return authenticated ? (
    <Redirect href="/(tabs)/home" />
  ) : (
    <Redirect href="/signin" />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F172A",
  },
  text: {
    color: "#CBD5E1",
    marginTop: 12,
  },
});
