import { supabase } from "@/lib/supabase";
import { colors, globalStyles } from "@/styles/global";
import { router, useFocusEffect } from "expo-router";
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
  first_name?: string;
  last_name?: string;
  profession?: string;
  phone?: string;
  food_preference?: string;
  email?: string;
  onboarding_complete?: boolean;
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);

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
        .single();

      if (error) {
        console.log("PROFILE ERROR:", error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.log(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, []),
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

  const profileIncomplete =
    !profile?.first_name || !profile?.last_name || !profile?.phone;

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
          const { error } = await supabase.auth.signOut();

          if (error) {
            Alert.alert("Error", error.message);
            return;
          }

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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Error", "User not found");
        return;
      }

      const mealsResult = await supabase
        .from("meals")
        .delete()
        .eq("user_id", user.id);

      if (mealsResult.error) {
        Alert.alert("Meals Error", mealsResult.error.message);
        return;
      }

      const profileResult = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (profileResult.error) {
        Alert.alert("Profile Error", profileResult.error.message);
        return;
      }

      await supabase.auth.signOut();

      router.replace("/signin");
    } catch (error) {
      console.log("DELETE ERROR:", error);

      Alert.alert("Error", "Unable to delete your data. Please try again.");
    }
  };

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>Profile</Text>

      <View style={styles.profileCard}>
        <Text style={styles.greeting}>{greeting},</Text>

        <Text style={styles.name}>{fullName || "ChopperHub User"}</Text>
      </View>

      {profileIncomplete && (
        <TouchableOpacity
          style={styles.warningCard}
          onPress={() => router.push("/update-profile")}
        >
          <Text style={styles.warningTitle}>Complete Your Profile</Text>

          <Text style={styles.warningText}>
            Some information is still missing. Update your profile to unlock the
            full ChopperHub experience.
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.menuContainer}>
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

  warningCard: {
    backgroundColor: "#2D2410",
    borderRadius: 20,
    padding: 20,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#FACC15",
  },

  warningTitle: {
    color: "#FACC15",
    fontSize: 16,
    fontWeight: "700",
  },

  warningText: {
    color: "#E5E7EB",
    marginTop: 8,
    lineHeight: 22,
  },

  menuContainer: {
    marginTop: 20,
    marginBottom: 40,
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
