import {
  AppButton,
  BodyText,
  Card,
  EmptyState,
  Screen,
  SectionHeader,
} from "@/components/ui";
import { getMeals, Meal, clearTodayMeals as deleteTodayMeals } from "@/lib/meals";
import {
  buildTrackerAnalysisInput,
  calculateMealTotals,
  getMealsInLastDays,
  getTrackerAnalysis,
  TrackerAnalysis,
} from "@/lib/trackerAnalysis";
import { colors, radii, spacing, typography } from "@/styles/global";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isToday = (meal: Meal) => {
  const createdAt = new Date(meal.created_at);
  const start = startOfDay(new Date());
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);

  return createdAt >= start && createdAt < end;
};

const formatNumber = (value: number) => Math.round(value).toLocaleString();

export default function Tracker() {
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [analysis, setAnalysis] = useState<TrackerAnalysis | null>(null);

  const loadTracker = useCallback(async () => {
    try {
      setLoading(true);
      const allMeals = await getMeals();
      setMeals(allMeals);
    } catch (error) {
      console.log("TRACKER LOAD ERROR:", error);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTracker();
    }, [loadTracker]),
  );

  const todayMeals = useMemo(() => meals.filter(isToday), [meals]);
  const todayTotals = useMemo(() => calculateMealTotals(todayMeals), [todayMeals]);
  const thirtyDayMeals = useMemo(() => getMealsInLastDays(meals, 30), [meals]);
  const thirtyDayInput = useMemo(
    () => buildTrackerAnalysisInput(meals, 30),
    [meals],
  );

  const handleClearTodayMeals = () => {
    if (todayMeals.length === 0) {
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
            await deleteTodayMeals();
            setAnalysis(null);
            await loadTracker();
            Alert.alert("Deleted", "Today's meals have been removed.");
          } catch (error) {
            console.log(error);
            Alert.alert("Error", "Failed to delete meals.");
          }
        },
      },
    ]);
  };

  const handleGenerateAnalysis = async () => {
    if (thirtyDayMeals.length === 0) {
      Alert.alert("No Meals Yet", "Log a meal before generating analysis.");
      return;
    }

    try {
      setAnalysisLoading(true);
      const result = await getTrackerAnalysis(thirtyDayInput);
      setAnalysis(result);
    } catch (error: any) {
      console.log("TRACKER ANALYSIS ERROR:", error);
      Alert.alert(
        "Analysis Unavailable",
        error?.message ||
          "Tracker analysis is unavailable right now. Check the Netlify backend and Groq API key.",
      );
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleShareAnalysis = async () => {
    if (!analysis?.exportText) {
      Alert.alert("No Analysis Yet", "Generate the 30-day analysis first.");
      return;
    }

    await Share.share({
      title: "ChopperHub 30-Day Nutrition Analysis",
      message: analysis.exportText,
    });
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Tracker</Text>
          <BodyText muted>
            Your confirmed meals become nutrient totals and AI analysis.
          </BodyText>
        </View>

        <TouchableOpacity
          onPress={handleClearTodayMeals}
          disabled={loading || todayMeals.length === 0}
        >
          <Text
            style={[
              styles.clearToday,
              (loading || todayMeals.length === 0) && styles.clearTodayDisabled,
            ]}
          >
            Clear Today
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Card style={styles.loadingCard}>
          <ActivityIndicator color={colors.secondary} />
          <BodyText muted>Loading tracker...</BodyText>
        </Card>
      ) : meals.length === 0 ? (
        <EmptyState
          title="No meals logged yet"
          body="Log your first meal to build Home totals and Tracker analysis."
          icon="analytics-outline"
          action={
            <AppButton
              title="Log a meal"
              icon="add-circle-outline"
              onPress={() => router.push("/(tabs)/add-meal")}
            />
          }
        />
      ) : (
        <>
          <Card style={styles.card}>
            <SectionHeader
              title="Today"
              subtitle="These totals come from meals confirmed today."
            />

            <View style={styles.summaryRow}>
              <StatBox label="Meals" value={todayMeals.length} />
              <StatBox
                label="Calories"
                value={formatNumber(todayTotals.calories)}
              />
            </View>

            <View style={styles.nutritionGrid}>
              <NutrientTile
                label="Protein"
                value={`${formatNumber(todayTotals.protein)}g`}
              />
              <NutrientTile
                label="Carbs"
                value={`${formatNumber(todayTotals.carbs)}g`}
              />
              <NutrientTile label="Fat" value={`${formatNumber(todayTotals.fat)}g`} />
              <NutrientTile
                label="Fibre"
                value={`${formatNumber(todayTotals.fibre)}g`}
              />
              <NutrientTile
                label="Sugar"
                value={`${formatNumber(todayTotals.sugar)}g`}
              />
              <NutrientTile
                label="Sodium"
                value={`${formatNumber(todayTotals.sodium)}mg`}
              />
              <NutrientTile
                label="Water"
                value={`${todayTotals.water.toFixed(1)}L`}
              />
            </View>
          </Card>

          <Card style={styles.card}>
            <SectionHeader
              title="Meal Estimator"
              subtitle="AI analyzes your last 30 days without showing a long food log."
            />

            <View style={styles.summaryRow}>
              <StatBox label="30-day meals" value={thirtyDayInput.mealsLogged} />
              <StatBox label="Logged days" value={thirtyDayInput.loggedDays} />
            </View>

            <View style={styles.analysisIntro}>
              <BodyText muted>
                Generate this when you want the report. It uses the Netlify AI
                backend, so it does not run automatically on every screen open.
              </BodyText>
            </View>

            <AppButton
              title={analysis ? "Refresh 30-day analysis" : "Generate 30-day analysis"}
              icon="sparkles"
              onPress={handleGenerateAnalysis}
              loading={analysisLoading}
            />

            {analysis && <AnalysisResult analysis={analysis} />}
          </Card>

          <View style={styles.footerActions}>
            <AppButton
              title="Share analysis"
              icon="share-social-outline"
              variant="secondary"
              onPress={handleShareAnalysis}
              disabled={!analysis}
            />
            <AppButton
              title="Log another meal"
              icon="add-circle-outline"
              onPress={() => router.push("/(tabs)/add-meal")}
            />
          </View>
        </>
      )}
    </Screen>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function NutrientTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.nutrientTile}>
      <Text style={styles.nutrientLabel}>{label}</Text>
      <Text style={styles.nutrientValue}>{value}</Text>
    </View>
  );
}

function AnalysisResult({ analysis }: { analysis: TrackerAnalysis }) {
  return (
    <View style={styles.analysisBlock}>
      <Text style={styles.analysisSummary}>{analysis.summary}</Text>

      <AnalysisList title="Patterns" items={analysis.patterns} />
      <AnalysisList title="Strengths" items={analysis.strengths} />
      <AnalysisList title="Nutrient gaps" items={analysis.nutrientGaps} />
      <AnalysisList title="Next actions" items={analysis.nextActions} />
    </View>
  );
}

function AnalysisList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <View style={styles.analysisList}>
      <Text style={styles.analysisListTitle}>{title}</Text>
      {items.slice(0, 3).map((item) => (
        <Text key={item} style={styles.analysisItem}>
          {item}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.lg,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.sm,
  },
  title: {
    ...typography.screenTitle,
  },
  clearToday: {
    color: colors.danger,
    fontWeight: "800",
    paddingTop: spacing.xs,
  },
  clearTodayDisabled: {
    color: colors.textMuted,
    opacity: 0.55,
  },
  loadingCard: {
    alignItems: "center",
    gap: spacing.md,
  },
  card: {
    gap: spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statBox: {
    flex: 1,
    minHeight: 92,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    justifyContent: "space-between",
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  statValue: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "800",
  },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  nutrientTile: {
    flexBasis: "30%",
    flexGrow: 1,
    minHeight: 76,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    justifyContent: "space-between",
  },
  nutrientLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  nutrientValue: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "800",
  },
  analysisIntro: {
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  analysisBlock: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  analysisSummary: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 24,
  },
  analysisList: {
    gap: spacing.sm,
  },
  analysisListTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  analysisItem: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 21,
  },
  footerActions: {
    gap: spacing.md,
  },
});
