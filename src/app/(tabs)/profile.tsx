import { getProfileCompletion } from "@/lib/profileCompletion";
import { auth } from "@/lib/firebase";
import { clearAllMeals } from "@/lib/meals";
import { deleteUserProfile, getCurrentUser, getUserProfile } from "@/lib/profile";
import { colors, globalStyles } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { signOut } from "firebase/auth";
import { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Profile = {
  first_name?: string | null;
  last_name?: string | null;
  profession?: string | null;
  phone?: string | null;
  food_preference?: string | null;
  email?: string | null;
  onboarding_complete?: boolean;
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const user = getCurrentUser();

      if (!user) return;

      const data = await getUserProfile(user.uid);

      setProfile(data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const toSentenceCase = (text: string = "") =>
    text
      .toLowerCase()
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const fullName = toSentenceCase(
    `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim(),
  );

  const completion = getProfileCompletion(profile);

  const handleShareProgress = async () => {
    try {
      await Share.share({
        message: `Tracking my nutrition journey with ChopperHub.

Stay consistent.
Track smarter.
Build better habits.

#ChopperHub`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut(auth);
          router.replace("/signin");
        },
      },
    ]);
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete My Data",
      "This will permanently delete your meals, profile information and nutrition history.",
      [
        {
          text: "Keep My Data",
          style: "cancel",
        },
        {
          text: "Continue",
          style: "destructive",
          onPress: confirmDeleteFinal,
        },
      ],
    );
  };

  const confirmDeleteFinal = () => {
    Alert.alert(
      "Final Confirmation",
      "This action cannot be undone. Are you sure you want to permanently remove all your data?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete Everything",
          style: "destructive",
          onPress: handleDeleteMyData,
        },
      ],
    );
  };

  const handleDeleteMyData = async () => {
    try {
      const user = getCurrentUser();

      if (!user) {
        Alert.alert("Error", "User not found");
        return;
      }

      await clearAllMeals();
      await deleteUserProfile(user.uid);
      await signOut(auth);

      router.replace("/signin");
    } catch (error) {
      console.log("DELETE ERROR:", error);

      Alert.alert("Error", "Unable to delete your data. Please try again.");
    }
  };

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={globalStyles.title}>Profile</Text>

      <View style={styles.profileCard}>
        <Text style={styles.greeting}>{greeting},</Text>

        <Text style={styles.name}>{fullName || "ChopperHub User"}</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.completionCard,
          completion.complete && styles.completionCardComplete,
        ]}
        activeOpacity={0.88}
        onPress={() => router.push("/update-profile")}
      >
        <View style={styles.completionHeader}>
          <View
            style={[
              styles.completionIcon,
              completion.complete && styles.completionIconComplete,
            ]}
          >
            <Ionicons
              name={completion.complete ? "checkmark" : "person-add"}
              size={20}
              color="#0F172A"
            />
          </View>

          <View style={styles.completionCopy}>
            <Text style={styles.completionEyebrow}>Profile Completion</Text>
            <Text style={styles.completionTitle}>
              {completion.complete
                ? "Profile Complete"
                : "Complete Your Profile"}
            </Text>
          </View>

          <Text
            style={[
              styles.completionPercent,
              completion.complete && styles.completionPercentComplete,
            ]}
          >
            {completion.percentage}%
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${completion.percentage}%` },
              completion.complete && styles.progressFillComplete,
            ]}
          />
        </View>

        <View style={styles.completionFooter}>
          <Text style={styles.completionBody}>
            {completion.complete
              ? "Everything looks complete. You can update your details anytime."
              : `Missing: ${completion.missing
                  .slice(0, 3)
                  .map((field) => field.label)
                  .join(", ")}`}
          </Text>

          <View
            style={[
              styles.completionButton,
              completion.complete && styles.completionButtonComplete,
            ]}
          >
            <Text style={styles.completionButtonText}>
              {completion.complete ? "Edit" : "Complete"}
            </Text>
            <Ionicons name="arrow-forward" size={14} color="#0F172A" />
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.menuContainer}>
        <MenuItem
          title="Payments"
          subtitle="Manage your subscription and Paystack checkout"
          onPress={() => router.push("/subscriptions" as never)}
        />

        <MenuItem
          title="Update Password"
          subtitle="Secure your account with a new password"
          onPress={() => router.push("/update-password")}
        />

        <MenuItem
          title="Notifications"
          subtitle="Manage reminders and nutrition alerts"
          onPress={() => router.push("/notifications")}
        />

        <MenuItem
          title="Tracker Insights"
          subtitle="View nutrition analytics and trends"
          onPress={() => router.push("/tracker")}
        />

        <MenuItem
          title="Share Progress"
          subtitle="Share your ChopperHub journey"
          onPress={handleShareProgress}
        />

        <MenuItem
          title="Sign Out"
          subtitle="Log out of your account"
          danger
          onPress={handleSignOut}
        />

        <MenuItem
          title="Delete My Data"
          subtitle="Permanently remove all meals and profile information"
          danger
          onPress={confirmDelete}
        />
      </View>
    </ScrollView>
  );
}

type MenuItemProps = {
  title: string;
  subtitle: string;
  onPress: () => void;
  danger?: boolean;
};

function MenuItem({ title, subtitle, onPress, danger }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.menuCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.menuTitle, danger && { color: "#EF4444" }]}>
        {title}
      </Text>

      <Text style={styles.menuSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 120,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },

  greeting: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 8,
  },

  name: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  completionCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "rgba(53,167,255,0.45)",
  },

  completionCardComplete: {
    borderColor: "rgba(34,197,94,0.55)",
  },

  completionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  completionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  completionIconComplete: {
    backgroundColor: colors.success,
  },

  completionCopy: {
    flex: 1,
  },

  completionEyebrow: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  completionTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 3,
  },

  completionPercent: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: "900",
    marginLeft: 10,
  },

  completionPercentComplete: {
    color: colors.success,
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

  completionFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 14,
  },

  completionBody: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },

  completionButton: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  completionButtonComplete: {
    backgroundColor: colors.success,
  },

  completionButtonText: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "900",
  },

  menuContainer: {
    marginTop: 20,
  },

  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },

  menuTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },

  menuSubtitle: {
    color: colors.textMuted,
    marginTop: 4,
    fontSize: 13,
    lineHeight: 20,
  },
});
