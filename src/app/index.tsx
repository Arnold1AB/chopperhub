import { auth } from "@/lib/firebase";
import { getSubscriptionAccess } from "@/lib/subscription";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [targetRoute, setTargetRoute] = useState<"/(tabs)/home" | "/signin" | "/subscribe">(
    "/signin",
  );

  useEffect(() => {
    const checkSession = async () => {
      try {
        await auth.authStateReady();
        const user = auth.currentUser;

        if (!user) {
          setTargetRoute("/signin");
          return;
        }

        const access = await getSubscriptionAccess();
        setTargetRoute(access.hasAccess ? "/(tabs)/home" : "/subscribe");
      } catch (error) {
        console.log("AUTH GATE ERROR:", error);
        setTargetRoute(auth.currentUser ? "/(tabs)/home" : "/signin");
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
        <Text style={styles.text}>Preparing your tracker...</Text>
      </View>
    );
  }

  return <Redirect href={targetRoute as never} />;
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
