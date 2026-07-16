import { analyzeMealDraft } from "@/lib/mealDraft";
import { getMeals, Meal, updateMealEstimate } from "@/lib/meals";
import { colors, globalStyles } from "@/styles/global";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type GroupedMeals = {
  [date: string]: Meal[];
};

export default function MealsScreen() {
  const [groupedMeals, setGroupedMeals] = useState<GroupedMeals>({});
  const [estimatingMealId, setEstimatingMealId] = useState<string | null>(null);

  const groupMealsByDate = useCallback((meals: Meal[]) => {
    const grouped: GroupedMeals = {};

    meals.forEach((meal) => {
      const formattedDate = new Date(meal.created_at).toLocaleDateString(
        "en-US",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        },
      );

      if (!grouped[formattedDate]) {
        grouped[formattedDate] = [];
      }

      grouped[formattedDate].push(meal);
    });

    return grouped;
  }, []);

  const loadMeals = useCallback(async () => {
    try {
      const meals = await getMeals();

      if (!meals || meals.length === 0) {
        setGroupedMeals({});
        return;
      }

      const grouped = groupMealsByDate(meals);

      setGroupedMeals(grouped);
    } catch (error) {
      console.log("MEALS ERROR:", error);
      setGroupedMeals({});
    }
  }, [groupMealsByDate]);

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, [loadMeals]),
  );

  const dates = Object.keys(groupedMeals);

  const handleEstimateMeal = async (meal: Meal) => {
    try {
      setEstimatingMealId(meal.id);

      const draft = await analyzeMealDraft({
        description: meal.name,
        mealType: meal.meal_type ?? "unknown",
        portion: meal.portion_label ?? "unknown",
        imageUrl: meal.image_url ?? undefined,
      });

      await updateMealEstimate(meal.id, {
        name: draft.name.trim() || meal.name,
        protein: draft.protein,
        carbs: draft.carbs,
        fat: draft.fat,
        fibre: draft.fibre,
        sugar: draft.sugar,
        sodium: draft.sodium,
        water: draft.water,
        meal_type: draft.mealType,
        calories_min: draft.caloriesEstimateMin,
        calories_max: draft.caloriesEstimateMax,
        confidence: draft.confidence,
        ingredients: draft.ingredients,
        follow_up_questions: draft.followUpQuestions,
      });

      await loadMeals();
      Alert.alert("Meal Estimated", "Nutrients have been added to this meal.");
    } catch (error: any) {
      console.log("MEAL ESTIMATE ERROR:", error);
      Alert.alert(
        "Estimator Unavailable",
        error?.message || "Unable to estimate this meal right now.",
      );
    } finally {
      setEstimatingMealId(null);
    }
  };

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={globalStyles.title}>Meals</Text>

      <Text style={styles.subtitle}>All logged meals grouped by date.</Text>

      {dates.length === 0 ? (
        <Text style={styles.emptyText}>No meals have been logged yet.</Text>
      ) : (
        dates.map((date) => (
          <View key={date} style={styles.dateSection}>
            <Text style={styles.dateTitle}>{date}</Text>

            {groupedMeals[date].map((meal) => {
              const protein = Number(meal.protein || 0);
              const carbs = Number(meal.carbs || 0);
              const fat = Number(meal.fat || 0);

              const calories = protein * 4 + carbs * 4 + fat * 9;
              const needsEstimate = protein + carbs + fat === 0;

              const time = new Date(meal.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <View key={meal.id} style={styles.mealCard}>
                  <View style={styles.header}>
                    <Text style={styles.mealName}>{meal.name}</Text>

                    <Text style={styles.time}>{time}</Text>
                  </View>

                  <View style={styles.statsRow}>
                    <Text style={styles.stat}>{Math.round(calories)} kcal</Text>

                    <Text style={styles.stat}>P {protein.toFixed(0)}g</Text>

                    <Text style={styles.stat}>C {carbs.toFixed(0)}g</Text>

                    <Text style={styles.stat}>F {fat.toFixed(0)}g</Text>
                  </View>

                  {needsEstimate && (
                    <TouchableOpacity
                      style={styles.estimateButton}
                      activeOpacity={0.86}
                      disabled={estimatingMealId === meal.id}
                      onPress={() => handleEstimateMeal(meal)}
                    >
                      {estimatingMealId === meal.id ? (
                        <ActivityIndicator color="#0F172A" size="small" />
                      ) : (
                        <Text style={styles.estimateButtonText}>
                          Estimate nutrients
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 120,
  },

  subtitle: {
    color: colors.textMuted,
    marginTop: 8,
    marginBottom: 20,
    fontSize: 14,
  },

  emptyText: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
  },

  dateSection: {
    marginBottom: 24,
  },

  dateTitle: {
    color: colors.secondary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  mealCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,

    borderWidth: 1,
    borderColor: colors.border,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  mealName: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },

  time: {
    color: colors.textMuted,
    fontSize: 12,
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 12,
    flexWrap: "wrap",
  },

  stat: {
    color: colors.textMuted,
    fontSize: 13,
  },

  estimateButton: {
    alignItems: "center",
    backgroundColor: colors.secondary,
    borderRadius: 12,
    justifyContent: "center",
    marginTop: 14,
    minHeight: 42,
    paddingHorizontal: 14,
  },

  estimateButtonText: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "800",
  },
});
