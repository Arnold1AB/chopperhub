import { getTrackerSummary } from "@/lib/groq";
import { getMeals } from "@/lib/meals";
import { supabase } from "@/lib/supabase";
import { colors, globalStyles } from "@/styles/global";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Tracker() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState("");
  const [expanded, setExpanded] = useState(false);

  const [totals, setTotals] = useState({
    meals: 0,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fibre: 0,
    sugar: 0,
    sodium: 0,
    water: 0,
  });

  const loadTracker = useCallback(async () => {
    try {
      setLoading(true);

      const meals = await getMeals();

      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

      const todaysMeals = meals.filter((meal) => {
        const createdAt = new Date(meal.created_at);
        return createdAt >= start && createdAt < end;
      });

      const calculated = todaysMeals.reduce(
        (acc, meal) => {
          const protein = Number(meal.protein || 0);
          const carbs = Number(meal.carbs || 0);
          const fat = Number(meal.fat || 0);

          const calories = protein * 4 + carbs * 4 + fat * 9;

          return {
            meals: acc.meals + 1,
            calories: acc.calories + calories,
            protein: acc.protein + protein,
            carbs: acc.carbs + carbs,
            fat: acc.fat + fat,
            fibre: acc.fibre + Number(meal.fibre || 0),
            sugar: acc.sugar + Number(meal.sugar || 0),
            sodium: acc.sodium + Number(meal.sodium || 0),
            water: acc.water + Number(meal.water || 0),
          };
        },
        {
          meals: 0,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fibre: 0,
          sugar: 0,
          sodium: 0,
          water: 0,
        },
      );

      setTotals(calculated);

      if (calculated.meals === 0) {
        setSummary(
          "Hi, log your meals for today. Small consistent choices make your nutrition easier to understand.",
        );
        setLoading(false);
        return;
      }

      const safeData = {
        meals: calculated.meals ?? 0,
        calories: calculated.calories ?? 0,
        protein: calculated.protein ?? 0,
        carbs: calculated.carbs ?? 0,
        fat: calculated.fat ?? 0,
        fibre: calculated.fibre ?? 0,
        sugar: calculated.sugar ?? 0,
        sodium: calculated.sodium ?? 0,
        water: calculated.water ?? 0,
      };

      const aiSummary = await getTrackerSummary(safeData);
      setSummary(aiSummary);
    } catch (error) {
      console.log("TRACKER ERROR:", error);
      setSummary("Meal-lysis is unable to generate analysis right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTracker();
    }, [loadTracker]),
  );

  const clearTodayMeals = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not found");

      const now = new Date();

      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      );

      const { error } = await supabase
        .from("meals")
        .delete()
        .eq("user_id", user.id)
        .gte("created_at", start.toISOString())
        .lt("created_at", end.toISOString());

      if (error) {
        console.log("DELETE ERROR:", error);
        throw error;
      }
    } catch (err) {
      console.log("DELETE FAILED:", err);
      throw err;
    }
  };

  const handleClearTodayMeals = () => {
    if (totals.meals === 0) {
      Alert.alert("Nothing to Clear", "No meals have been logged today.");
      return;
    }

    Alert.alert("Clear Today", "Delete all meals logged today?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await clearTodayMeals();

            setTotals({
              meals: 0,
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              fibre: 0,
              sugar: 0,
              sodium: 0,
              water: 0,
            });

            setSummary(
              "Hi, log your meals for today and remember what you eat matters.",
            );

            Alert.alert("Deleted", "Today's meals have been removed.");
          } catch (error) {
            console.log(error);
            Alert.alert("Error", "Failed to delete meals.");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.trackerTitle}>Tracker</Text>

        <TouchableOpacity
          onPress={handleClearTodayMeals}
          disabled={loading || totals.meals === 0}
        >
          <Text
            style={[
              styles.clearToday,
              (loading || totals.meals === 0) && styles.clearTodayDisabled,
            ]}
          >
            Clear Today
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Daily nutrition tracking and meal analysis.
      </Text>

      <TouchableOpacity
        style={styles.collapseHeader}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.collapseTitle}>{"Today's Analytics"}</Text>
        <Text style={styles.collapseArrow}>{expanded ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.statsCard}>
          {Object.entries(totals).map(([key, value]) => (
            <View key={key} style={styles.row}>
              <Text style={styles.label}>{key}</Text>
              <Text style={styles.value}>{Math.round(value)}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.aiCard}>
        <Text style={styles.aiTitle}>Meal-lysis</Text>

        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Text style={styles.aiText}>{summary}</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  trackerTitle: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 20,
  },
  clearToday: {
    color: "#EF4444",
    fontWeight: "800",
  },
  clearTodayDisabled: {
    color: colors.textMuted,
    opacity: 0.55,
  },
  collapseHeader: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  collapseTitle: {
    color: colors.primary,
    fontWeight: "700",
  },
  collapseArrow: {
    color: colors.secondary,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  label: {
    color: colors.textMuted,
  },
  value: {
    color: colors.primary,
    fontWeight: "700",
  },
  aiCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    marginTop: 18,
  },
  aiTitle: {
    color: colors.primary,
    fontWeight: "800",
    marginBottom: 12,
    fontSize: 18,
  },

  aiText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 24,
  },
});
