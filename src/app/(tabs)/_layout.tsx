import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { getSubscriptionAccess } from "@/lib/subscription";
import { router, Tabs } from "expo-router";
import { useEffect } from "react";

export default function TabsLayout() {
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const access = await getSubscriptionAccess();

        if (!access.hasAccess) {
          router.replace("/subscribe" as never);
        }
      } catch (error) {
        console.log("TAB ACCESS ERROR:", error);
        router.replace("/signin");
      }
    };

    checkAccess();
  }, []);

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0,
          elevation: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="meals"
        options={{
          title: "Meals",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="add-meal"
        options={{
          title: "Add Meal",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="tracker"
        options={{
          title: "Tracker",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
