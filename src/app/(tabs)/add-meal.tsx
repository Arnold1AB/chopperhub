import { addMeal } from "@/lib/meals";
import { colors, globalStyles } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
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

  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const [fibre, setFibre] = useState("");
  const [sugar, setSugar] = useState("");
  const [sodium, setSodium] = useState("");
  const [water, setWater] = useState("");

  const [loading, setLoading] = useState(false);

  const handleAddMeal = async () => {
    try {
      if (!mealName.trim()) {
        Alert.alert("Missing Information", "Please enter a meal name.");
        return;
      }

      setLoading(true);

      await addMeal({
        name: mealName.trim(),
        quantity: 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        fibre: Number(fibre) || 0,
        sugar: Number(sugar) || 0,
        sodium: Number(sodium) || 0,
        water: Number(water) || 0,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert("Meal Saved", `${mealName} has been added successfully.`);

      setMealName("");
      setProtein("");
      setCarbs("");
      setFat("");
      setFibre("");
      setSugar("");
      setSodium("");
      setWater("");

      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.error(error);
      Alert.alert("Unable to Save Meal", error?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearMeals = () => {
    Alert.alert(
      "Clear Meals",
      "Are you sure you want to clear the entered meal data?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            setMealName("");
            setProtein("");
            setCarbs("");
            setFat("");
            setFibre("");
            setSugar("");
            setSodium("");
            setWater("");
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={colors.text} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={globalStyles.title}>Add Meal</Text>

      <Text style={styles.subtitle}>
        Log meals, hydration, and nutrition data for your ChopperHub tracker.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Meal Name"
        placeholderTextColor={colors.textMuted}
        value={mealName}
        onChangeText={setMealName}
      />

      <Text style={styles.sectionTitle}>Core Nutrition</Text>

      <View style={styles.row}>
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

      <Text style={styles.sectionTitle}>Additional Tracking</Text>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.smallInput]}
          placeholder="Fibre (g)"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={fibre}
          onChangeText={setFibre}
        />
        <TextInput
          style={[styles.input, styles.smallInput]}
          placeholder="Sugar (g)"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={sugar}
          onChangeText={setSugar}
        />
        <TextInput
          style={[styles.input, styles.smallInput]}
          placeholder="Sodium (mg)"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={sodium}
          onChangeText={setSodium}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Water Intake (Litres)"
        placeholderTextColor={colors.textMuted}
        keyboardType="numeric"
        value={water}
        onChangeText={setWater}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleAddMeal}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Saving..." : "Add Meal"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.clearButton} onPress={handleClearMeals}>
        <Text style={styles.clearButtonText}>Clear Form</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 120,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 6,
  },

  backText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },

  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: 8,
    marginBottom: 28,
    lineHeight: 22,
  },

  sectionTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 12,
  },

  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    color: colors.text,
    fontSize: 16,
    marginBottom: 14,
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  smallInput: {
    flex: 1,
  },

  button: {
    backgroundColor: colors.secondary,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 20,
    alignItems: "center",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  clearButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 12,
    alignItems: "center",
  },

  clearButtonText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
  },

  buttonText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 16,
  },
});
