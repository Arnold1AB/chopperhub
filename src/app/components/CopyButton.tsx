import { Meal } from "@/storage/meals";
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

    const summary = `ChopperHub Daily Summary

Calories: ${totals.calories}
Protein: ${totals.protein}g
Carbohydrates: ${totals.carbs}g
Fat: ${totals.fat}g

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
