import { getMeals, Meal } from "@/lib/meals";
import { colors, globalStyles } from "@/styles/global";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type GroupedMeals = {
  [date: string]: Meal[];
};

export default function MealsScreen() {
  const [groupedMeals, setGroupedMeals] = useState<GroupedMeals>({});

  const groupMealsByDate = (meals: Meal[]) => {
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
  };

  const loadMeals = async () => {
    try {
      const meals = await getMeals();

      const grouped = groupMealsByDate(meals);

      setGroupedMeals(grouped);
    } catch (error) {
      console.log("MEALS ERROR:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, []),
  );

  const dates = Object.keys(groupedMeals);

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
    paddingBottom: 40,
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
});
