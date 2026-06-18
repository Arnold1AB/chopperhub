import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { getSubscriptionAccess } from "@/lib/subscription";
import { router, Tabs } from "expo-router";
import { useEffect } from "react";
import { Text } from "react-native";

const TabLabel = ({ color, label }: { color: string; label: string }) => (
  <Text
    style={{
      color,
      fontSize: 9,
      fontWeight: "700",
      textAlign: "center",
      maxWidth: 58,
    }}
    numberOfLines={1}
    adjustsFontSizeToFit
    minimumFontScale={0.7}
  >
    {label}
  </Text>
);

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
          paddingBottom: 8,
          paddingTop: 10,
        },

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,

        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarLabel: ({ color }) => <TabLabel color={color} label="Home" />,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="meals"
        options={{
          title: "Meals",
          tabBarLabel: ({ color }) => <TabLabel color={color} label="Meals" />,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="add-meal"
        options={{
          title: "Add Meal",
          tabBarLabel: ({ color }) => (
            <TabLabel color={color} label="Add Meal" />
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="tracker"
        options={{
          title: "Tracker",
          tabBarLabel: ({ color }) => (
            <TabLabel color={color} label="Tracker" />
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="subscriptions"
        options={{
          title: "Subscriptions",
          tabBarLabel: ({ color }) => (
            <TabLabel color={color} label="Subscriptions" />
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="card" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: ({ color }) => (
            <TabLabel color={color} label="Profile" />
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
