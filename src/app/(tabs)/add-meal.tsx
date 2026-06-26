import {
  AppButton,
  BodyText,
  Card,
  Chip,
  Screen,
  SectionHeader,
  SegmentedControl,
} from "@/components/ui";
import { addMeal } from "@/lib/meals";
import { colors, radii, spacing, typography } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

type LogMode = "type" | "speak" | "scan";
type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "drink";
type Portion = "small" | "regular" | "large" | "custom";

const logModes: { label: string; value: LogMode; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: "Type", value: "type", icon: "create-outline" },
  { label: "Speak", value: "speak", icon: "mic-outline" },
  { label: "Scan", value: "scan", icon: "camera-outline" },
];

const mealTypes: { label: string; value: MealType; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: "Breakfast", value: "breakfast", icon: "sunny-outline" },
  { label: "Lunch", value: "lunch", icon: "restaurant-outline" },
  { label: "Dinner", value: "dinner", icon: "moon-outline" },
  { label: "Snack", value: "snack", icon: "nutrition-outline" },
  { label: "Drink", value: "drink", icon: "water-outline" },
];

const portions: { label: string; value: Portion }[] = [
  { label: "Small", value: "small" },
  { label: "Regular", value: "regular" },
  { label: "Large", value: "large" },
  { label: "Custom", value: "custom" },
];

const portionMultipliers: Record<Portion, number> = {
  small: 0.75,
  regular: 1,
  large: 1.35,
  custom: 1,
};

export default function AddMealScreen() {
  const [logMode, setLogMode] = useState<LogMode>("type");
  const [mealDescription, setMealDescription] = useState("");
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [portion, setPortion] = useState<Portion>("regular");
  const [customPortion, setCustomPortion] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [fibre, setFibre] = useState("");
  const [sugar, setSugar] = useState("");
  const [sodium, setSodium] = useState("");

  const [loading, setLoading] = useState(false);

  const mealName = useMemo(() => {
    const description = mealDescription.trim();
    if (!description) return "";

    const portionLabel =
      portion === "custom" && customPortion.trim()
        ? customPortion.trim()
        : `${portion} portion`;

    return `${description} (${mealType}, ${portionLabel})`;
  }, [customPortion, mealDescription, mealType, portion]);

  const estimatedCalories = useMemo(() => {
    const macroCalories =
      (Number(protein) || 0) * 4 + (Number(carbs) || 0) * 4 + (Number(fat) || 0) * 9;

    if (macroCalories > 0) {
      return Math.round(macroCalories * portionMultipliers[portion]);
    }

    return null;
  }, [carbs, fat, portion, protein]);

  const clearForm = () => {
    setLogMode("type");
    setMealDescription("");
    setMealType("lunch");
    setPortion("regular");
    setCustomPortion("");
    setAdvancedOpen(false);
    setProtein("");
    setCarbs("");
    setFat("");
    setFibre("");
    setSugar("");
    setSodium("");
  };

  const handleAddMeal = async () => {
    try {
      if (!mealDescription.trim()) {
        Alert.alert("Missing Meal", "Describe what you ate before saving.");
        return;
      }

      if (portion === "custom" && !customPortion.trim()) {
        Alert.alert("Missing Portion", "Add a custom portion or choose small, regular, or large.");
        return;
      }

      setLoading(true);

      await addMeal({
        name: mealName,
        quantity: portionMultipliers[portion],
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        fibre: Number(fibre) || 0,
        sugar: Number(sugar) || 0,
        sodium: Number(sodium) || 0,
        water: mealType === "drink" ? 0.5 : 0,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert("Meal Saved", "Your meal has been added to today's tracker.");

      clearForm();
      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.error(error);
      Alert.alert("Unable to Save Meal", error?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearMeals = () => {
    Alert.alert("Clear Meal", "Clear the current meal draft?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: clearForm,
      },
    ]);
  };

  const handleUnavailableMode = () => {
    Alert.alert(
      "Coming in v2",
      "Voice and camera logging will connect to the transcription and meal scan backend after this guided flow is stable.",
    );
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.topBar}>
        <AppButton
          title="Back"
          icon="arrow-back"
          variant="ghost"
          onPress={() => router.back()}
          style={styles.backButton}
        />
      </View>

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>ChopperHub v2</Text>
        <Text style={styles.title}>Log a meal</Text>
        <BodyText muted style={styles.subtitle}>
          Describe what you ate, choose a portion, and save a clean meal draft.
          Voice and scan are staged for the next backend step.
        </BodyText>
      </View>

      <SegmentedControl
        options={logModes}
        value={logMode}
        onChange={(mode) => {
          setLogMode(mode);
          if (mode !== "type") {
            handleUnavailableMode();
          }
        }}
      />

      <Card style={styles.primaryCard}>
        <SectionHeader
          title="What did you eat?"
          subtitle="Use normal words, like rice, plantain, and chicken."
        />

        <TextInput
          multiline
          style={styles.descriptionInput}
          placeholder="Rice, fried plantain, and chicken"
          placeholderTextColor={colors.textMuted}
          value={mealDescription}
          onChangeText={setMealDescription}
          textAlignVertical="top"
        />
      </Card>

      <View style={styles.sectionBlock}>
        <SectionHeader title="Meal type" subtitle="This keeps history easier to scan." />
        <View style={styles.chipWrap}>
          {mealTypes.map((type) => (
            <Chip
              key={type.value}
              label={type.label}
              icon={type.icon}
              selected={mealType === type.value}
              onPress={() => setMealType(type.value)}
            />
          ))}
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <SectionHeader title="Portion" subtitle="Avoid grams unless the user wants detail." />
        <View style={styles.chipWrap}>
          {portions.map((item) => (
            <Chip
              key={item.value}
              label={item.label}
              selected={portion === item.value}
              onPress={() => setPortion(item.value)}
            />
          ))}
        </View>

        {portion === "custom" && (
          <TextInput
            style={styles.input}
            placeholder="Example: 1 plate, 2 wraps, 1 cup"
            placeholderTextColor={colors.textMuted}
            value={customPortion}
            onChangeText={setCustomPortion}
          />
        )}
      </View>

      <Card style={styles.estimateCard}>
        <View style={styles.estimateHeader}>
          <View style={styles.estimateIcon}>
            <Ionicons name="sparkles" size={20} color={colors.primary} />
          </View>
          <View style={styles.estimateCopy}>
            <Text style={styles.estimateTitle}>AI estimate preview</Text>
            <BodyText muted>
              Full AI meal parsing comes next. For now, macro estimates update from optional nutrition details.
            </BodyText>
          </View>
        </View>

        <View style={styles.estimateRows}>
          <View style={styles.estimateRow}>
            <Text style={styles.estimateLabel}>Meal draft</Text>
            <Text style={styles.estimateValue}>
              {mealName || "Waiting for description"}
            </Text>
          </View>
          <View style={styles.estimateRow}>
            <Text style={styles.estimateLabel}>Calories</Text>
            <Text style={styles.estimateValue}>
              {estimatedCalories ? `${estimatedCalories} kcal` : "Add macros to estimate"}
            </Text>
          </View>
        </View>
      </Card>

      <Card style={styles.advancedCard}>
        <View style={styles.advancedHeader}>
          <SectionHeader
            title="Nutrition details"
            subtitle="Optional for users who know their macros."
            style={styles.advancedHeaderCopy}
          />
          <AppButton
            title={advancedOpen ? "Hide" : "Edit"}
            icon={advancedOpen ? "chevron-up" : "create-outline"}
            variant="secondary"
            onPress={() => setAdvancedOpen((open) => !open)}
            style={styles.smallButton}
          />
        </View>

        {advancedOpen && (
          <View style={styles.macroGrid}>
            <TextInput
              style={[styles.input, styles.macroInput]}
              placeholder="Protein (g)"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={protein}
              onChangeText={setProtein}
            />
            <TextInput
              style={[styles.input, styles.macroInput]}
              placeholder="Carbs (g)"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={carbs}
              onChangeText={setCarbs}
            />
            <TextInput
              style={[styles.input, styles.macroInput]}
              placeholder="Fat (g)"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={fat}
              onChangeText={setFat}
            />
            <TextInput
              style={[styles.input, styles.macroInput]}
              placeholder="Fibre (g)"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={fibre}
              onChangeText={setFibre}
            />
            <TextInput
              style={[styles.input, styles.macroInput]}
              placeholder="Sugar (g)"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={sugar}
              onChangeText={setSugar}
            />
            <TextInput
              style={[styles.input, styles.macroInput]}
              placeholder="Sodium (mg)"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={sodium}
              onChangeText={setSodium}
            />
          </View>
        )}
      </Card>

      <View style={styles.actionBlock}>
        <AppButton
          title="Save meal"
          icon="checkmark-circle"
          onPress={handleAddMeal}
          loading={loading}
        />
        <AppButton
          title="Clear draft"
          icon="trash-outline"
          variant="secondary"
          onPress={handleClearMeals}
          disabled={loading}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
  },
  topBar: {
    alignItems: "flex-start",
  },
  backButton: {
    minHeight: 36,
    paddingHorizontal: 0,
  },
  hero: {
    gap: spacing.sm,
  },
  eyebrow: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    ...typography.screenTitle,
  },
  subtitle: {
    maxWidth: 560,
  },
  primaryCard: {
    gap: spacing.lg,
  },
  descriptionInput: {
    minHeight: 116,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    color: colors.text,
    fontSize: 16,
    lineHeight: 23,
  },
  sectionBlock: {
    gap: spacing.md,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  input: {
    minHeight: 52,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    fontSize: 15,
  },
  estimateCard: {
    gap: spacing.lg,
  },
  estimateHeader: {
    flexDirection: "row",
    gap: spacing.md,
  },
  estimateIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  estimateCopy: {
    flex: 1,
  },
  estimateTitle: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  estimateRows: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  estimateRow: {
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
  estimateLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  estimateValue: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
  },
  advancedCard: {
    gap: spacing.lg,
  },
  advancedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  advancedHeaderCopy: {
    flex: 1,
  },
  smallButton: {
    minHeight: 42,
  },
  macroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  macroInput: {
    flexBasis: "47%",
    flexGrow: 1,
  },
  actionBlock: {
    gap: spacing.md,
  },
});
