import { getMeals, Meal } from "@/lib/meals";
import { getProfileCompletion } from "@/lib/profileCompletion";
import { getCurrentUser, getUserProfile } from "@/lib/profile";
import { colors, globalStyles } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ChopperGrid from "@/components/ChopperGrid";
import CopyButton from "@/components/CopyButton";
import HomeHeader from "@/components/HomeHeader";
import RecentMeals from "@/components/RecentMeals";
import ReminderToggle from "@/components/ReminderToggle";
import ShareButton from "@/components/ShareButton";

type Profile = {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  profession?: string | null;
  food_preference?: string | null;
};

export default function HomeScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadMeals = useCallback(async () => {
    try {
      const meals = await getMeals();
      setMeals(meals ?? []);
    } catch (error) {
      console.log("MEALS ERROR:", error);
      setMeals([]);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const user = getCurrentUser();

      if (!user) {
        setProfile(null);
        return;
      }

      const data = await getUserProfile(user.uid);

      setProfile(data);
    } catch (error) {
      console.log("HOME PROFILE ERROR:", error);
      setProfile(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMeals();
      loadProfile();
    }, [loadMeals, loadProfile]),
  );

  const handleDeleteMeal = useCallback(() => {
    loadMeals();
  }, [loadMeals]);

  const completion = getProfileCompletion(profile);
  const firstName = profile?.first_name?.trim() || "there";
  const todayMealCount = meals.filter((meal) => {
    const createdAt = new Date(meal.created_at);
    const now = new Date();

    return (
      createdAt.getFullYear() === now.getFullYear() &&
      createdAt.getMonth() === now.getMonth() &&
      createdAt.getDate() === now.getDate()
    );
  }).length;

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.greetingBlock}>
          <Text style={styles.greetingEyebrow}>Welcome back</Text>
          <Text style={styles.greetingTitle}>
            Hi, {firstName} {"\uD83D\uDC4B"}
          </Text>
        </View>
        <ShareButton meals={meals} />
      </View>

      <HomeHeader />

      <View style={styles.mealSummaryCard}>
        <View>
          <Text style={styles.mealSummaryLabel}>Meals logged</Text>
          <Text style={styles.mealSummaryValue}>{meals.length}</Text>
        </View>
        <View style={styles.mealSummaryDivider} />
        <View>
          <Text style={styles.mealSummaryLabel}>Today</Text>
          <Text style={styles.mealSummaryValue}>{todayMealCount}</Text>
        </View>
        <TouchableOpacity
          style={styles.logMealButton}
          activeOpacity={0.86}
          onPress={() => router.push("/(tabs)/add-meal")}
        >
          <Ionicons name="add" size={18} color="#0F172A" />
          <Text style={styles.logMealButtonText}>Log</Text>
        </TouchableOpacity>
      </View>

      {!completion.complete && (
        <TouchableOpacity
          style={styles.completionCard}
          activeOpacity={0.9}
          onPress={() => router.push("/update-profile")}
        >
          <View style={styles.completionTopRow}>
            <View style={styles.completionIcon}>
              <Ionicons name="sparkles" size={20} color="#0F172A" />
            </View>

            <View style={styles.completionTextBlock}>
              <Text style={styles.completionTitle}>Complete your profile</Text>
              <Text style={styles.completionSubtitle}>
                Unlock a cleaner experience with personalized insights.
              </Text>
            </View>

            <Text style={styles.completionPercent}>
              {completion.percentage}%
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${completion.percentage}%` },
              ]}
            />
          </View>

          <View style={styles.completionBottomRow}>
            <Text style={styles.missingText}>
              Missing:{" "}
              {completion.missing
                .slice(0, 2)
                .map((field) => field.label)
                .join(", ")}
            </Text>

            <View style={styles.completeButton}>
              <Text style={styles.completeButtonText}>Complete</Text>
              <Ionicons name="arrow-forward" size={14} color="#0F172A" />
            </View>
          </View>
        </TouchableOpacity>
      )}

      <ChopperGrid meals={meals} />
      <CopyButton meals={meals} />
      <ReminderToggle />
      <RecentMeals meals={meals} onDelete={handleDeleteMeal} />
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
  greetingBlock: {
    flex: 1,
    marginRight: 12,
  },
  greetingEyebrow: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  greetingTitle: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: "800",
  },
  completionCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "rgba(53,167,255,0.45)",
  },
  mealSummaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  mealSummaryLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  mealSummaryValue: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 4,
  },
  mealSummaryDivider: {
    width: 1,
    height: 44,
    backgroundColor: colors.border,
  },
  logMealButton: {
    marginLeft: "auto",
    minHeight: 40,
    borderRadius: 999,
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logMealButtonText: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "800",
  },
  completionTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  completionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  completionTextBlock: {
    flex: 1,
  },
  completionTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "800",
  },
  completionSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  completionPercent: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: "800",
    marginLeft: 10,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceElevated,
    overflow: "hidden",
    marginTop: 16,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.secondary,
  },
  completionBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    gap: 12,
  },
  missingText: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 12,
  },
  completeButton: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  completeButtonText: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "800",
  },
});
