import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "@/lib/firebase";
import { router } from "expo-router";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    try {
      if (!email.trim() || !password.trim()) {
        Alert.alert(
          "Missing Information",
          "Please enter your email and password.",
        );
        return;
      }

      const { user } = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      if (user) {
        router.replace("/");
      }
    } catch (error: any) {
      console.log(error);

      Alert.alert("Sign In Failed", error?.message || "Unable to sign in.");
    }
  };

  const handlePasswordReset = async () => {
    try {
      if (!email.trim()) {
        Alert.alert("Email Needed", "Enter your email address first.");
        return;
      }

      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert("Reset Email Sent", "Check your email for reset instructions.");
    } catch (error: any) {
      console.log(error);
      Alert.alert("Reset Failed", error?.message || "Unable to send reset email.");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/auth-bg.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScrollView
          style={styles.screen}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require("../../assets/images/chopperhub-logo.png")}
            style={styles.logoImage}
          />

          <Text style={styles.subtitle}>Track meals. Build consistency.</Text>

          <View style={styles.formCard}>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#B0B0B0"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              selectionColor={colors.secondary}
              cursorColor={colors.secondary}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#B0B0B0"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                selectionColor={colors.secondary}
                cursorColor={colors.secondary}
              />

              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#B0B0B0"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSignIn}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={() =>
                Alert.alert(
                  "Google Sign In",
                  "Google sign-in will be added after Firebase OAuth client IDs are configured.",
                )
              }
            >
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePasswordReset}>
              <Text style={styles.resetLink}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text style={styles.link}>{"Don't have an account? Sign Up"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  screen: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  logoImage: {
    width: 120,
    height: 120,
    alignSelf: "center",
    resizeMode: "contain",
  },

  subtitle: {
    color: "#E5E7EB",
    textAlign: "center",
    fontSize: 15,
    marginTop: 12,
    marginBottom: 30,
  },

  formCard: {
    backgroundColor: "rgba(20,20,20,0.78)",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    color: "#FFFFFF",
    fontSize: 16,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    paddingLeft: 16,
    marginBottom: 14,
  },

  passwordInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    paddingVertical: 16,
    paddingRight: 8,
  },

  eyeButton: {
    height: 54,
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  button: {
    backgroundColor: colors.secondary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
  },

  googleButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 14,
  },

  googleButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },

  link: {
    color: colors.secondary,
    textAlign: "center",
    marginTop: 24,
    fontSize: 15,
    fontWeight: "600",
  },
  resetLink: {
    color: "#E5E7EB",
    textAlign: "center",
    marginTop: 18,
    fontSize: 14,
    fontWeight: "600",
  },
});
