import { deleteMeal } from "@/lib/meals";
import { colors } from "@/styles/global";
import * as Haptics from "expo-haptics";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";

type MealItemProps = {
  id: string;
  name: string;

  protein: number;
  carbs: number;
  fat: number;

  fibre?: number;
  sugar?: number;
  sodium?: number;
  water?: number;

  onDelete: () => void;
};

export default function MealItem({
  id,
  name,
  protein,
  carbs,
  fat,
  fibre = 0,
  sugar = 0,
  sodium = 0,
  water = 0,
  onDelete,
}: MealItemProps) {
  const calories = protein * 4 + carbs * 4 + fat * 9;
  const extras = [
    fibre > 0 ? `${fibre}g fibre` : "",
    sugar > 0 ? `${sugar}g sugar` : "",
    sodium > 0 ? `${sodium}mg sodium` : "",
    water > 0 ? `${water}L water` : "",
  ].filter(Boolean);

  const handleLongPress = () => {
    Alert.alert("Delete Meal", `Are you sure you want to delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMeal(id);

            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success,
            );

            onDelete();
          } catch (error) {
            console.error("DELETE ERROR:", error);
            Alert.alert("Error", "Unable to delete meal.");
          }
        },
      },
    ]);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onLongPress={handleLongPress}
      activeOpacity={0.8}
    >
      <Text style={styles.name}>{name}</Text>

      <Text style={styles.macros}>
        {Math.round(calories)} cal | {protein}g P | {carbs}g C | {fat}g F
      </Text>

      {extras.length > 0 && (
        <Text style={styles.extra}>{extras.join(" | ")}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },

  macros: {
    fontSize: 13,
    color: colors.secondary,
    marginTop: 4,
  },

  extra: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
});
