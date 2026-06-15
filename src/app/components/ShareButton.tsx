import { Ionicons } from "@expo/vector-icons";
import { Share, TouchableOpacity } from "react-native";

import { Meal } from "@/storage/meals";
import { colors } from "@/styles/global";

type ShareButtonProps = {
  meals: Meal[];
};

export default function ShareButton({ meals }: ShareButtonProps) {
  const handleShare = async () => {
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

    await Share.share({
      message: `ChopperHub Daily Summary

Calories: ${totals.calories}
Protein: ${totals.protein}g
Carbohydrates: ${totals.carbs}g
Fat: ${totals.fat}g

Meals Logged: ${meals.length}`,
    });
  };

  return (
    <TouchableOpacity
      onPress={handleShare}
      activeOpacity={0.7}
      style={{
        padding: 8,
      }}
    >
      <Ionicons name="paper-plane-outline" size={22} color={colors.secondary} />
    </TouchableOpacity>
  );
}
