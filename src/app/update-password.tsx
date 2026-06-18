import { supabase } from "@/lib/supabase";
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

export default function UpdatePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async () => {
    try {
      if (
        !currentPassword.trim() ||
        !newPassword.trim() ||
        !confirmPassword.trim()
      ) {
        Alert.alert("Missing Information", "Complete all fields.");
        return;
      }

      if (newPassword !== confirmPassword) {
        Alert.alert("Password Error", "Passwords do not match.");
        return;
      }

      if (newPassword.length < 8) {
        Alert.alert("Weak Password", "Password must be at least 8 characters.");
        return;
      }

      if (currentPassword === newPassword) {
        Alert.alert(
          "Password Error",
          "New password must be different from your current password.",
        );
        return;
      }

      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) throw new Error("User session not found.");

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        Alert.alert("Authentication Failed", "Current password is incorrect.");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        "Password Updated",
        "Your password has been successfully changed.",
        [{ text: "OK", onPress: () => router.back() }],
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

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

      <Text style={globalStyles.title}>Update Password</Text>

      <Text style={styles.subtitle}>
        Verify your current password before setting a new one.
      </Text>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Current Password"
          placeholderTextColor={colors.textMuted}
          secureTextEntry={!showCurrentPassword}
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowCurrentPassword(!showCurrentPassword)}
        >
          <Ionicons
            name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#B0B0B0"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="New Password"
          placeholderTextColor={colors.textMuted}
          secureTextEntry={!showNewPassword}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowNewPassword(!showNewPassword)}
        >
          <Ionicons
            name={showNewPassword ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#B0B0B0"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm Password"
          placeholderTextColor={colors.textMuted}
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Ionicons
            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#B0B0B0"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleUpdatePassword}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Updating..." : "Update Password"}
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
    marginTop: 8,
    marginBottom: 24,
    fontSize: 14,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingLeft: 16,
    marginBottom: 14,
  },

  passwordInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 15,
    paddingRight: 8,
  },

  eyeButton: {
    height: 52,
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    color: colors.text,
    marginBottom: 14,
  },

  button: {
    backgroundColor: colors.secondary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 16,
  },
});
