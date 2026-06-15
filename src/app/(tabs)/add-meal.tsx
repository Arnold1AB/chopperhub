import { addMeal } from "@/storage/meals";
import { colors, globalStyles } from "@/styles/global";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddMealScreen() {
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const handleAddMeal = async () => {
    console.log("BUTTON PRESSED");

    try {
      console.log("Starting validation");

      if (!mealName.trim()) {
        Alert.alert("Missing Information", "Please enter a meal name.");
        return;
      }

      if (!calories.trim()) {
        Alert.alert("Missing Information", "Please enter the calorie value.");
        return;
      }

      console.log("Calling addMeal");

      const savedMeal = await addMeal({
        name: mealName.trim(),
        calories: Number(calories),
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
      });

      console.log("SUCCESSFULLY SAVED");
      console.log(savedMeal);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Meal Saved",
        `${mealName} was successfully added to ChopperHub.`,
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/");
            },
          },
        ],
      );

      setMealName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
    } catch (error) {
      console.error("SAVE FAILED:", error);

      Alert.alert("Error", `Failed to save meal: ${String(error)}`);
    }
  };

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={true}
    >
      {/* Screen Title */}
      <Text style={globalStyles.title}>Add Meal</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Add a meal to your daily ChopperHub tracker.
      </Text>

      {/* Meal Name */}
      <TextInput
        style={styles.input}
        placeholder="Meal Name"
        placeholderTextColor={colors.textMuted}
        value={mealName}
        onChangeText={setMealName}
      />

      {/* Calories */}
      <TextInput
        style={styles.input}
        placeholder="Calories"
        placeholderTextColor={colors.textMuted}
        keyboardType="numeric"
        value={calories}
        onChangeText={setCalories}
      />

      {/* Nutrition Row */}
      <View style={styles.nutritionRow}>
        <TextInput
          style={[styles.input, styles.smallInput]}
          placeholder="Protein (g)"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={protein}
          onChangeText={setProtein}
        />

        <TextInput
          style={[styles.input, styles.smallInput]}
          placeholder="Carbs (g)"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={carbs}
          onChangeText={setCarbs}
        />

        <TextInput
          style={[styles.input, styles.smallInput]}
          placeholder="Fat (g)"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={fat}
          onChangeText={setFat}
        />
      </View>

      {/* Add Meal Button */}
      <TouchableOpacity
        style={styles.addButton}
        activeOpacity={0.8}
        onPress={handleAddMeal}
      >
        <Text style={styles.addButtonText}>Add Meal</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 40,
    flexGrow: 1,
  },

  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: 8,
    marginBottom: 10,
  },

  input: {
    backgroundColor: colors.surface,
    color: colors.text,

    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,

    paddingVertical: 15,
    paddingHorizontal: 16,

    fontSize: 16,
    marginTop: 14,
  },

  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },

  smallInput: {
    width: "31%",
    marginTop: 0,
    paddingHorizontal: 10,
    fontSize: 14,
  },

  addButton: {
    backgroundColor: colors.secondary,
    borderRadius: 14,

    paddingVertical: 16,
    marginTop: 28,
    marginBottom: 24,

    alignItems: "center",
    justifyContent: "center",
  },

  addButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
});
