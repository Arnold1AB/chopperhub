import { Meal } from "@/storage/meals";
import { colors } from "@/styles/global";
import { StyleSheet, View } from "react-native";
import ChopperCard from "./ChopperCard";

type ChopperGridProps = {
  meals: Meal[];
};

export default function ChopperGrid({ meals }: ChopperGridProps) {
  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  );

  return (
    <View style={styles.grid}>
      <ChopperCard
        label="Calories"
        value={`${totals.calories}`}
        goal="2,000"
        color={colors.secondary}
      />

      <ChopperCard
        label="Protein"
        value={`${totals.protein}g`}
        goal="150g"
        color={colors.accent}
      />

      <ChopperCard
        label="Carbs"
        value={`${totals.carbs}g`}
        goal="250g"
        color="#60A5FA"
      />

      <ChopperCard
        label="Fat"
        value={`${totals.fat}g`}
        goal="65g"
        color={colors.success}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
});
