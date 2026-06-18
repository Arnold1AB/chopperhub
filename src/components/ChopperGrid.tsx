import { Meal } from "@/lib/meals";
import { StyleSheet, View } from "react-native";

import ChopperCard from "./ChopperCard";

type ChopperGridProps = {
  meals: Meal[];
};

const metricColors = {
  calories: "#F97316",
  protein: "#A78BFA",
  carbs: "#22D3EE",
  fat: "#F43F5E",
  fibre: "#84CC16",
  sugar: "#EC4899",
  sodium: "#FACC15",
  water: "#38BDF8",
};

export default function ChopperGrid({ meals }: ChopperGridProps) {
  const totals = meals.reduce(
    (acc, meal) => ({
      protein: acc.protein + Number(meal.protein),
      carbs: acc.carbs + Number(meal.carbs),
      fat: acc.fat + Number(meal.fat),

      fibre: acc.fibre + Number(meal.fibre || 0),
      sugar: acc.sugar + Number(meal.sugar || 0),
      sodium: acc.sodium + Number(meal.sodium || 0),
      water: acc.water + Number(meal.water || 0),
    }),
    {
      protein: 0,
      carbs: 0,
      fat: 0,

      fibre: 0,
      sugar: 0,
      sodium: 0,
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
        color={metricColors.calories}
      />

      <ChopperCard
        label="Protein"
        value={`${totals.protein.toFixed(0)}g`}
        goal="Tracked"
        color={metricColors.protein}
      />

      <ChopperCard
        label="Carbs"
        value={`${totals.carbs.toFixed(0)}g`}
        goal="Tracked"
        color={metricColors.carbs}
      />

      <ChopperCard
        label="Fat"
        value={`${totals.fat.toFixed(0)}g`}
        goal="Tracked"
        color={metricColors.fat}
      />

      <ChopperCard
        label="Fibre"
        value={`${totals.fibre.toFixed(0)}g`}
        goal="Nutrition"
        color={metricColors.fibre}
      />

      <ChopperCard
        label="Sugar"
        value={`${totals.sugar.toFixed(0)}g`}
        goal="Nutrition"
        color={metricColors.sugar}
      />

      <ChopperCard
        label="Sodium"
        value={`${totals.sodium.toFixed(0)}mg`}
        goal="Nutrition"
        color={metricColors.sodium}
      />

      <ChopperCard
        label="Water"
        value={`${totals.water.toFixed(1)}L`}
        goal="Hydration"
        color={metricColors.water}
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
