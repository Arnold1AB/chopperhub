import {
  AppButton,
  BodyText,
  Card,
  Chip,
  Screen,
  SectionHeader,
  SegmentedControl,
} from "@/components/ui";
import { analyzeMealDraft, MealDraft } from "@/lib/mealDraft";
import { addMeal } from "@/lib/meals";
import { transcribeMealAudio } from "@/lib/voiceTranscription";
import { colors, radii, spacing, typography } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Image, StyleSheet, Text, TextInput, View } from "react-native";

type LogMode = "type" | "speak" | "scan";
type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "drink";
type Portion = "small" | "regular" | "large" | "custom";

const logModes: {
  label: string;
  value: LogMode;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { label: "Type", value: "type", icon: "create-outline" },
  { label: "Speak", value: "speak", icon: "mic-outline" },
  { label: "Scan", value: "scan", icon: "camera-outline" },
];

const mealTypes: {
  label: string;
  value: MealType;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
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

const metricValue = (value: number, suffix = "") =>
  value > 0 ? `${Math.round(value)}${suffix}` : "Needs detail";

export default function AddMealScreen() {
  const [logMode, setLogMode] = useState<LogMode>("type");
  const [mealDescription, setMealDescription] = useState("");
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [portion, setPortion] = useState<Portion>("regular");
  const [customPortion, setCustomPortion] = useState("");
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<MealDraft | null>(null);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const portionLabel = useMemo(() => {
    if (portion === "custom" && customPortion.trim()) {
      return customPortion.trim();
    }

    return `${portion} portion`;
  }, [customPortion, portion]);

  const clearForm = () => {
    setLogMode("type");
    setMealDescription("");
    setMealType("lunch");
    setPortion("regular");
    setCustomPortion("");
    setCapturedPhotoUri(null);
    setDraft(null);
  };

  const handleDescriptionChange = (value: string) => {
    setMealDescription(value);
    setDraft(null);
  };

  const validateMealInput = () => {
    if (!mealDescription.trim()) {
      Alert.alert(
        "Missing Meal",
        "Describe what you ate before running the nutrient estimate.",
      );
      return false;
    }

    if (portion === "custom" && !customPortion.trim()) {
      Alert.alert(
        "Missing Portion",
        "Add a custom portion or choose small, regular, or large.",
      );
      return false;
    }

    return true;
  };

  const handleAnalyzeMeal = async () => {
    if (!validateMealInput()) return;

    try {
      setAnalyzing(true);

      const result = await analyzeMealDraft({
        description: mealDescription.trim(),
        mealType,
        portion: portionLabel,
      });

      setDraft(result);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Estimator Unavailable",
        error?.message ||
          "Meal analysis is unavailable right now. Check the Netlify backend and Groq API key.",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!draft) {
      await handleAnalyzeMeal();
      return;
    }

    try {
      setSaving(true);

      await addMeal({
        name: draft.name.trim() || mealDescription.trim(),
        quantity: portionMultipliers[portion],
        protein: draft.protein,
        carbs: draft.carbs,
        fat: draft.fat,
        fibre: draft.fibre,
        sugar: draft.sugar,
        sodium: draft.sodium,
        water: draft.water,
        meal_type: draft.mealType,
        portion_label: portionLabel,
        calories_min: draft.caloriesEstimateMin,
        calories_max: draft.caloriesEstimateMax,
        confidence: draft.confidence,
        ingredients: draft.ingredients,
        follow_up_questions: draft.followUpQuestions,
        source:
          logMode === "scan" && capturedPhotoUri
            ? "photo"
            : logMode === "speak"
              ? "voice"
              : "typed",
        image_url: capturedPhotoUri,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        "Meal Saved",
        "Home totals and Tracker analysis will update from this meal.",
      );

      clearForm();
      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.error(error);
      Alert.alert("Unable to Save Meal", error?.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClearMeal = () => {
    Alert.alert("Clear Meal", "Clear the current meal draft?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: clearForm,
      },
    ]);
  };

  const startRecording = async () => {
    try {
      const permission = await requestRecordingPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Microphone Permission Needed",
          "Allow microphone access to speak a meal into ChopperHub.",
        );
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Recording Unavailable",
        error?.message || "Unable to start voice recording.",
      );
    }
  };

  const stopRecording = async () => {
    try {
      setTranscribing(true);

      await audioRecorder.stop();
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      const audioUri = audioRecorder.uri;

      if (!audioUri) {
        Alert.alert("No Audio Found", "Try recording your meal again.");
        return;
      }

      const transcript = await transcribeMealAudio(audioUri);
      handleDescriptionChange(transcript);
      setLogMode("type");

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Transcription Unavailable",
        error?.message || "Unable to turn this recording into text.",
      );
    } finally {
      setTranscribing(false);
    }
  };

  const handleScanMeal = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Camera Permission Needed",
          "Allow camera access to scan a meal photo.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.75,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      setCapturedPhotoUri(result.assets[0].uri);
      setDraft(null);

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Camera Unavailable",
        error?.message || "Unable to open the camera on this device.",
      );
    }
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
        <Text style={styles.title}>Log a meal</Text>
        <BodyText muted style={styles.subtitle}>
          Type, speak, or scan a meal. Review the nutrient estimate before it
          updates Home and Tracker.
        </BodyText>
      </View>

      <SegmentedControl
        options={logModes}
        value={logMode}
        onChange={(mode) => {
          setLogMode(mode);
          if (mode === "scan") {
            void handleScanMeal();
          }
        }}
      />

      {logMode === "speak" && (
        <Card style={styles.voiceCard}>
          <SectionHeader
            title="Speak your meal"
            subtitle="Record a short meal description, then review the AI estimate."
          />
          <View style={styles.voiceStatusRow}>
            <View style={styles.voiceIcon}>
              <Ionicons
                name={recorderState.isRecording ? "mic" : "mic-outline"}
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.voiceCopy}>
              <Text style={styles.voiceTitle}>
                {recorderState.isRecording
                  ? "Recording..."
                  : transcribing
                    ? "Transcribing..."
                    : "Ready to record"}
              </Text>
              <BodyText muted>
                {recorderState.isRecording
                  ? `${Math.max(
                      1,
                      Math.round(recorderState.durationMillis / 1000),
                    )}s captured`
                  : "Say something like: rice, plantain, and chicken."}
              </BodyText>
            </View>
          </View>

          <AppButton
            title={
              recorderState.isRecording ? "Stop and transcribe" : "Start recording"
            }
            icon={
              recorderState.isRecording ? "stop-circle-outline" : "mic-outline"
            }
            onPress={recorderState.isRecording ? stopRecording : startRecording}
            loading={transcribing}
          />
        </Card>
      )}

      {capturedPhotoUri && (
        <Card style={styles.photoCard}>
          <SectionHeader
            title="Meal photo"
            subtitle="Photo is attached for the meal draft. Add a short description before estimating."
          />
          <Image source={{ uri: capturedPhotoUri }} style={styles.mealPhoto} />
          <AppButton
            title="Retake photo"
            icon="camera-outline"
            variant="secondary"
            onPress={handleScanMeal}
          />
        </Card>
      )}

      <Card style={styles.primaryCard}>
        <SectionHeader
          title="What did you eat?"
          subtitle="Give enough detail for the estimate: food, cooking method, drink, and portion if known."
        />

        <TextInput
          multiline
          style={styles.descriptionInput}
          placeholder="Rice, fried plantain, chicken, and a bottle of water"
          placeholderTextColor={colors.textMuted}
          value={mealDescription}
          onChangeText={handleDescriptionChange}
          textAlignVertical="top"
        />
      </Card>

      <View style={styles.sectionBlock}>
        <SectionHeader title="Meal type" subtitle="Helps organize your history." />
        <View style={styles.chipWrap}>
          {mealTypes.map((type) => (
            <Chip
              key={type.value}
              label={type.label}
              icon={type.icon}
              selected={mealType === type.value}
              onPress={() => {
                setMealType(type.value);
                setDraft(null);
              }}
            />
          ))}
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <SectionHeader title="Portion" subtitle="Choose a simple estimate." />
        <View style={styles.chipWrap}>
          {portions.map((item) => (
            <Chip
              key={item.value}
              label={item.label}
              selected={portion === item.value}
              onPress={() => {
                setPortion(item.value);
                setDraft(null);
              }}
            />
          ))}
        </View>

        {portion === "custom" && (
          <TextInput
            style={styles.input}
            placeholder="Example: 1 plate, 2 wraps, 1 cup"
            placeholderTextColor={colors.textMuted}
            value={customPortion}
            onChangeText={(value) => {
              setCustomPortion(value);
              setDraft(null);
            }}
          />
        )}
      </View>

      <Card style={styles.reviewCard}>
        <SectionHeader
          title="AI nutrient review"
          subtitle="Confirm the estimate before it affects Home and Tracker."
        />

        {draft ? (
          <MealDraftReview draft={draft} />
        ) : (
          <BodyText muted>
            Run the estimate after describing the meal. If AI is not ready yet,
            no fake nutrients will be saved.
          </BodyText>
        )}

        <View style={styles.actionBlock}>
          <AppButton
            title={draft ? "Re-estimate meal" : "Estimate nutrients"}
            icon="sparkles"
            onPress={handleAnalyzeMeal}
            loading={analyzing}
            disabled={saving}
          />
          <AppButton
            title="Confirm and save"
            icon="checkmark-circle"
            onPress={handleConfirmSave}
            loading={saving}
            disabled={!draft || analyzing}
          />
          <AppButton
            title="Clear draft"
            icon="trash-outline"
            variant="secondary"
            onPress={handleClearMeal}
            disabled={saving || analyzing}
          />
        </View>
      </Card>
    </Screen>
  );
}

function MealDraftReview({ draft }: { draft: MealDraft }) {
  const nutrients = [
    { label: "Protein", value: metricValue(draft.protein, "g") },
    { label: "Carbs", value: metricValue(draft.carbs, "g") },
    { label: "Fat", value: metricValue(draft.fat, "g") },
    { label: "Fibre", value: metricValue(draft.fibre, "g") },
    { label: "Sugar", value: metricValue(draft.sugar, "g") },
    { label: "Sodium", value: metricValue(draft.sodium, "mg") },
    { label: "Water", value: metricValue(draft.water, "L") },
  ];

  return (
    <View style={styles.draftBlock}>
      <View style={styles.draftHeader}>
        <View style={styles.draftTitleBlock}>
          <Text style={styles.draftName}>{draft.name}</Text>
          <Text style={styles.draftMeta}>
            {draft.mealType} • {draft.portion}
          </Text>
        </View>
        <Text style={styles.confidenceBadge}>{draft.confidence}</Text>
      </View>

      <View style={styles.calorieBox}>
        <Text style={styles.inputLabel}>Calories</Text>
        <Text style={styles.calorieValue}>
          {draft.caloriesEstimateMin && draft.caloriesEstimateMax
            ? `${Math.round(draft.caloriesEstimateMin)}-${Math.round(
                draft.caloriesEstimateMax,
              )} kcal`
            : "Needs detail"}
        </Text>
      </View>

      <View style={styles.nutritionGrid}>
        {nutrients.map((item) => (
          <View key={item.label} style={styles.nutritionTile}>
            <Text style={styles.nutritionLabel}>{item.label}</Text>
            <Text style={styles.nutritionValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      {draft.ingredients.length > 0 && (
        <View style={styles.resultBlock}>
          <Text style={styles.inputLabel}>Ingredients understood</Text>
          <Text style={styles.bodyText}>{draft.ingredients.join(", ")}</Text>
        </View>
      )}

      {draft.followUpQuestions.length > 0 && (
        <View style={styles.resultBlock}>
          <Text style={styles.inputLabel}>Questions to improve accuracy</Text>
          {draft.followUpQuestions.slice(0, 4).map((question) => (
            <Text key={question} style={styles.questionText}>
              {question}
            </Text>
          ))}
        </View>
      )}

      {draft.warnings.length > 0 && (
        <Text style={styles.warningText}>{draft.warnings[0]}</Text>
      )}
    </View>
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
  title: {
    ...typography.screenTitle,
  },
  subtitle: {
    maxWidth: 560,
  },
  primaryCard: {
    gap: spacing.lg,
  },
  photoCard: {
    gap: spacing.lg,
  },
  voiceCard: {
    gap: spacing.lg,
  },
  voiceStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  voiceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  voiceCopy: {
    flex: 1,
  },
  voiceTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  mealPhoto: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceElevated,
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
  reviewCard: {
    gap: spacing.lg,
  },
  actionBlock: {
    gap: spacing.md,
  },
  draftBlock: {
    gap: spacing.lg,
  },
  draftHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  draftTitleBlock: {
    flex: 1,
  },
  draftName: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 25,
  },
  draftMeta: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    marginTop: spacing.xs,
    textTransform: "capitalize",
  },
  confidenceBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.16)",
    borderColor: "rgba(34, 197, 94, 0.32)",
    borderRadius: radii.pill,
    borderWidth: 1,
    color: colors.success,
    fontSize: 12,
    fontWeight: "800",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textTransform: "capitalize",
  },
  calorieBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  inputLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  calorieValue: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "800",
  },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  nutritionTile: {
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
  nutritionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  nutritionValue: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20,
  },
  resultBlock: {
    gap: spacing.sm,
  },
  bodyText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 23,
  },
  questionText: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 21,
  },
  warningText: {
    color: colors.warning,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
});
