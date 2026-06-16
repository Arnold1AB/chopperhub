import { getMeals, Meal } from "@/lib/meals";
import { globalStyles } from "@/styles/global";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import ChopperGrid from "@/components/ChopperGrid";
import CopyButton from "@/components/CopyButton";
import HomeHeader from "@/components/HomeHeader";
import RecentMeals from "@/components/RecentMeals";
import ReminderToggle from "@/components/ReminderToggle";
import ShareButton from "@/components/ShareButton";

const now = new Date();
const hour = now.getHours();
const greeting =
  hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

export default function HomeScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);

  const loadMeals = async () => {
    try {
      const data = await getMeals();
      setMeals(data);
    } catch (error) {
      // Silently fail — user may not be authenticated yet
      setMeals([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, []),
  );

  const handleDeleteMeal = useCallback(() => {
    loadMeals();
  }, []);

  return (
    <ScrollView style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={globalStyles.title}>ChopperHub</Text>
        <ShareButton meals={meals} />
      </View>

      <HomeHeader />
      <ChopperGrid meals={meals} />
      <CopyButton meals={meals} />
      <ReminderToggle />
      <RecentMeals meals={meals} onDelete={handleDeleteMeal} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
});
