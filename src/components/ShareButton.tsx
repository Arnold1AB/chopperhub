import { Meal } from "@/lib/meals";
import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { Share, TouchableOpacity } from "react-native";

type ShareButtonProps = {
  meals: Meal[];
};

export default function ShareButton({ meals }: ShareButtonProps) {
  const handleShare = async () => {
    const totals = meals.reduce(
      (acc, meal) => {
        const protein = Number(meal.protein || 0);
        const carbs = Number(meal.carbs || 0);
        const fat = Number(meal.fat || 0);

        const calories = protein * 4 + carbs * 4 + fat * 9;

        return {
          calories: acc.calories + calories,
          protein: acc.protein + protein,
          carbs: acc.carbs + carbs,
          fat: acc.fat + fat,
        };
      },
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      },
    );

    await Share.share({
      message: `ChopperHub Daily Summary

Calories: ${Math.round(totals.calories)}
Protein: ${Math.round(totals.protein)}g
Carbohydrates: ${Math.round(totals.carbs)}g
Fat: ${Math.round(totals.fat)}g

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
