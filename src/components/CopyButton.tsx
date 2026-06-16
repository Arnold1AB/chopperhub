import { Meal } from "@/lib/meals";
import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type CopyButtonProps = {
  meals: Meal[];
};

export default function CopyButton({ meals }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const totals = meals.reduce(
      (acc, meal) => {
        const protein = Number(meal.protein || 0);
        const carbs = Number(meal.carbs || 0);
        const fat = Number(meal.fat || 0);

        const fibre = Number(meal.fibre || 0);
        const water = Number(meal.water || 0);

        const calories = protein * 4 + carbs * 4 + fat * 9;

        return {
          calories: acc.calories + calories,
          protein: acc.protein + protein,
          carbs: acc.carbs + carbs,
          fat: acc.fat + fat,
          fibre: acc.fibre + fibre,
          water: acc.water + water,
        };
      },
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fibre: 0,
        water: 0,
      },
    );

    const summary = `ChopperHub Daily Summary

Calories: ${Math.round(totals.calories)}
Protein: ${totals.protein.toFixed(0)}g
Carbohydrates: ${totals.carbs.toFixed(0)}g
Fat: ${totals.fat.toFixed(0)}g
Fibre: ${totals.fibre.toFixed(0)}g
Water: ${totals.water.toFixed(1)}L

Meals Logged: ${meals.length}`;

    await Clipboard.setStringAsync(summary);

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleCopy}
      activeOpacity={0.7}
    >
      <Ionicons
        name={copied ? "checkmark" : "copy-outline"}
        size={16}
        color={colors.textMuted}
      />

      <Text style={styles.text}>{copied ? "Copied" : "Copy Summary"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 16,
    gap: 6,
  },

  text: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "500",
  },
});
