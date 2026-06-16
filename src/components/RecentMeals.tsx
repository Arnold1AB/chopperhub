import { Meal } from "@/lib/meals";
import { colors } from "@/styles/global";
import { StyleSheet, Text, View } from "react-native";
import MealItem from "./MealItem";

type RecentMealsProps = {
  meals: Meal[];
  onDelete: () => void;
};

export default function RecentMeals({ meals, onDelete }: RecentMealsProps) {
  const recentMeals = meals.slice(0, 5);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Meals</Text>

      {recentMeals.length === 0 ? (
        <Text style={styles.empty}>No meals logged yet.</Text>
      ) : (
        recentMeals.map((meal) => (
          <MealItem
            key={meal.id}
            id={meal.id}
            name={meal.name}
            protein={Number(meal.protein || 0)}
            carbs={Number(meal.carbs || 0)}
            fat={Number(meal.fat || 0)}
            fibre={Number(meal.fibre || 0)}
            water={Number(meal.water || 0)}
            onDelete={onDelete}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 28,
  },

  title: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },

  empty: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
