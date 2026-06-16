import { Meal } from "@/lib/meals";
import { colors } from "@/styles/global";
import { StyleSheet, View } from "react-native";

import ChopperCard from "./ChopperCard";

type ChopperGridProps = {
  meals: Meal[];
};

export default function ChopperGrid({ meals }: ChopperGridProps) {
  const totals = meals.reduce(
    (acc, meal) => ({
      protein: acc.protein + Number(meal.protein),
      carbs: acc.carbs + Number(meal.carbs),
      fat: acc.fat + Number(meal.fat),

      fibre: acc.fibre + Number(meal.fibre),
      water: acc.water + Number(meal.water),
    }),
    {
      protein: 0,
      carbs: 0,
      fat: 0,

      fibre: 0,
      water: 0,
    },
  );

  const estimatedCalories =
    totals.protein * 4 + totals.carbs * 4 + totals.fat * 9;

  return (
    <View style={styles.grid}>
      <ChopperCard
        label="Calories"
        value={`${Math.round(estimatedCalories)}`}
        goal="Calculated"
        color={colors.secondary}
      />

      <ChopperCard
        label="Protein"
        value={`${totals.protein.toFixed(0)}g`}
        goal="Tracked"
        color={colors.accent}
      />

      <ChopperCard
        label="Carbs"
        value={`${totals.carbs.toFixed(0)}g`}
        goal="Tracked"
        color="#60A5FA"
      />

      <ChopperCard
        label="Fat"
        value={`${totals.fat.toFixed(0)}g`}
        goal="Tracked"
        color={colors.success}
      />

      <ChopperCard
        label="Water"
        value={`${totals.water.toFixed(1)}L`}
        goal="Hydration"
        color="#38BDF8"
      />

      <ChopperCard
        label="Fibre"
        value={`${totals.fibre.toFixed(0)}g`}
        goal="Nutrition"
        color="#F59E0B"
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
