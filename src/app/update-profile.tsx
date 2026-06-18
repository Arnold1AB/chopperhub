import { supabase } from "@/lib/supabase";
import { getProfileCompletion } from "@/lib/profileCompletion";
import { colors, globalStyles } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type SavedProfile = {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  profession?: string | null;
  food_preference?: string | null;
};

export default function UpdateProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedProfile, setSavedProfile] = useState<SavedProfile | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [profession, setProfession] = useState("");
  const [foodPreference, setFoodPreference] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      setFirstName(data?.first_name ?? "");
      setLastName(data?.last_name ?? "");
      setPhone(data?.phone ?? "");
      setProfession(data?.profession ?? "");
      setFoodPreference(data?.food_preference ?? "");
      setSavedProfile({
        first_name: data?.first_name ?? "",
        last_name: data?.last_name ?? "",
        phone: data?.phone ?? "",
        profession: data?.profession ?? "",
        food_preference: data?.food_preference ?? "",
      });
    } catch (error) {
      console.log("LOAD PROFILE ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Error", "User not found");
        return;
      }

      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const profilePayload = {
        id: user.id,
        email: user.email,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: fullName,
        phone: phone.trim(),
        profession: profession.trim(),
        food_preference: foodPreference.trim(),
      };

      const { error } = await supabase.from("profiles").upsert(profilePayload);

      if (error) throw error;

      setSavedProfile({
        first_name: profilePayload.first_name,
        last_name: profilePayload.last_name,
        phone: profilePayload.phone,
        profession: profilePayload.profession,
        food_preference: profilePayload.food_preference,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        "Profile Updated",
        "Your profile has been successfully updated.",
      );

      router.back();
    } catch (error: any) {
      console.log(error);

      Alert.alert(
        "Update Failed",
        error?.message || "Unable to update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  const draftProfile = {
    first_name: firstName,
    last_name: lastName,
    phone,
    profession,
    food_preference: foodPreference,
  };

  const completion = getProfileCompletion(savedProfile);
  const draftCompletion = getProfileCompletion(draftProfile);
  const hasUnsavedChanges =
    (savedProfile?.first_name ?? "") !== firstName.trim() ||
    (savedProfile?.last_name ?? "") !== lastName.trim() ||
    (savedProfile?.phone ?? "") !== phone.trim() ||
    (savedProfile?.profession ?? "") !== profession.trim() ||
    (savedProfile?.food_preference ?? "") !== foodPreference.trim();
  const statusComplete = completion.complete && !hasUnsavedChanges;

  if (loading) {
    return (
      <View
        style={[
          globalStyles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator color={colors.secondary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={colors.text} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={globalStyles.title}>Update Profile</Text>

      <Text style={styles.subtitle}>
        Keep your ChopperHub profile information up to date.
      </Text>

      <View
        style={[
          styles.completionCard,
          statusComplete && styles.completionCardComplete,
          hasUnsavedChanges && styles.completionCardDraft,
        ]}
      >
        <View style={styles.completionHeader}>
          <View>
            <Text style={styles.completionLabel}>Profile Completion</Text>
            <Text style={styles.completionTitle}>
              {hasUnsavedChanges
                ? "Unsaved profile changes"
                : statusComplete
                  ? "Profile completed 100%"
                  : `${completion.percentage}% completed`}
            </Text>
          </View>

          <View
            style={[
              styles.completionBadge,
              statusComplete && styles.completionBadgeComplete,
              hasUnsavedChanges && styles.completionBadgeDraft,
            ]}
          >
            <Text style={styles.completionBadgeText}>
              {hasUnsavedChanges
                ? `${draftCompletion.percentage}%`
                : `${completion.percentage}%`}
            </Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  hasUnsavedChanges
                    ? draftCompletion.percentage
                    : completion.percentage
                }%`,
              },
              statusComplete && styles.progressFillComplete,
              hasUnsavedChanges && styles.progressFillDraft,
            ]}
          />
        </View>

        <Text style={styles.completionBody}>
          {hasUnsavedChanges
            ? "Save your changes to update your official profile completion."
            : statusComplete
              ? "Everything looks complete. You can update these details anytime."
              : `Add ${completion.missing
                  .map((field) => field.label.toLowerCase())
                  .join(", ")} to finish your profile.`}
        </Text>
      </View>

      <Text style={styles.label}>First Name</Text>
      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Enter first name"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Last Name</Text>
      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
        placeholder="Enter last name"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="Enter phone number"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Profession</Text>
      <TextInput
        style={styles.input}
        value={profession}
        onChangeText={setProfession}
        placeholder="Student, Engineer, Designer..."
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Food Preference</Text>
      <TextInput
        style={styles.input}
        value={foodPreference}
        onChangeText={setFoodPreference}
        placeholder="Vegetarian, High Protein, Balanced..."
        placeholderTextColor={colors.textMuted}
      />

      <TouchableOpacity
        style={[styles.button, saving && { opacity: 0.7 }]}
        disabled={saving}
        onPress={handleSave}
      >
        <Text style={styles.buttonText}>
          {saving ? "Saving..." : "Save Changes"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 80,
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
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 28,
  },

  label: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 6,
  },

  completionCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(53,167,255,0.45)",
    marginBottom: 24,
  },

  completionCardComplete: {
    borderColor: "rgba(34,197,94,0.55)",
  },

  completionCardDraft: {
    borderColor: "rgba(250,204,21,0.55)",
  },

  completionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  completionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  completionTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 4,
  },

  completionBadge: {
    backgroundColor: colors.secondary,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  completionBadgeComplete: {
    backgroundColor: colors.success,
  },

  completionBadgeDraft: {
    backgroundColor: colors.accent,
  },

  completionBadgeText: {
    color: "#0F172A",
    fontWeight: "900",
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

  progressFillComplete: {
    backgroundColor: colors.success,
  },

  progressFillDraft: {
    backgroundColor: colors.accent,
  },

  completionBody: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },

  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    color: colors.text,
    fontSize: 15,
    marginBottom: 18,
  },

  button: {
    backgroundColor: colors.secondary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 16,
  },

  buttonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
});
