import { getMeals } from "@/lib/meals";
import { colors, globalStyles } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ShareProgressScreen() {
  const [loading, setLoading] = useState(true);

  const [totals, setTotals] = useState({
    meals: 0,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fibre: 0,
    sugar: 0,
    sodium: 0,
    water: 0,
  });

  const loadData = useCallback(async () => {
    try {
      const meals = await getMeals();

      const calculated = meals.reduce(
        (acc, meal) => {
          const protein = Number(meal.protein || 0);
          const carbs = Number(meal.carbs || 0);
          const fat = Number(meal.fat || 0);
          const calories = protein * 4 + carbs * 4 + fat * 9;

          return {
            meals: acc.meals + 1,
            calories: acc.calories + calories,
            protein: acc.protein + protein,
            carbs: acc.carbs + carbs,
            fat: acc.fat + fat,
            fibre: acc.fibre + Number(meal.fibre || 0),
            sugar: acc.sugar + Number(meal.sugar || 0),
            sodium: acc.sodium + Number(meal.sodium || 0),
            water: acc.water + Number(meal.water || 0),
          };
        },
        {
          meals: 0,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fibre: 0,
          sugar: 0,
          sodium: 0,
          water: 0,
        },
      );

      setTotals(calculated);
    } catch (error) {
      console.log("SHARE PROGRESS ERROR:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const shareProgress = async () => {
    try {
      const message = `
ChopperHub Nutrition Summary

Meals Logged: ${totals.meals}

Estimated Calories: ${Math.round(totals.calories)}

Protein: ${totals.protein.toFixed(0)}g
Carbohydrates: ${totals.carbs.toFixed(0)}g
Fat: ${totals.fat.toFixed(0)}g

Fibre: ${totals.fibre.toFixed(0)}g
Sugar: ${totals.sugar.toFixed(0)}g

Water Intake: ${totals.water.toFixed(1)}L

Tracked with ChopperHub
      `;

      await Share.share({ message });
    } catch {
      Alert.alert("Unable to Share", "Something went wrong.");
    }
  };

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={colors.text} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={globalStyles.title}>Share Progress</Text>

      <Text style={styles.subtitle}>
        Share your tracked nutrition statistics.
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.secondary} />
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Current Summary</Text>
            <Text style={styles.metric}>Meals Logged: {totals.meals}</Text>
            <Text style={styles.metric}>
              Calories: {Math.round(totals.calories)}
            </Text>
            <Text style={styles.metric}>
              Protein: {totals.protein.toFixed(0)}g
            </Text>
            <Text style={styles.metric}>Carbs: {totals.carbs.toFixed(0)}g</Text>
            <Text style={styles.metric}>Fat: {totals.fat.toFixed(0)}g</Text>
            <Text style={styles.metric}>Water: {totals.water.toFixed(1)}L</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={shareProgress}>
            <Text style={styles.buttonText}>Share Progress</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 80,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 6,
  },

  backText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },

  subtitle: {
    color: colors.textMuted,
    marginTop: 8,
    marginBottom: 24,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },

  cardTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 18,
  },

  metric: {
    color: colors.text,
    marginBottom: 10,
    fontSize: 15,
  },

  button: {
    backgroundColor: colors.secondary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },

  buttonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
});
