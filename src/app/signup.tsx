import { auth } from "@/lib/firebase";
import { createUserProfile } from "@/lib/profile";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
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

export default function SignUpScreen() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profession, setProfession] = useState("");
  const [foodPreference, setFoodPreference] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const clearForm = () => {
    setFullName("");
    setPhone("");
    setProfession("");
    setFoodPreference("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSignUp = async () => {
    try {
      setSubmitting(true);

      if (
        !fullName.trim() ||
        !email.trim() ||
        !password.trim() ||
        !confirmPassword.trim()
      ) {
        Alert.alert(
          "Missing Information",
          "Please complete all required fields.",
        );
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert("Password Mismatch", "Passwords do not match.");
        setPassword("");
        setConfirmPassword("");
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      const credential = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        password,
      );

      const names = fullName.trim().split(" ");
      const firstName = names[0] || "";
      const lastName = names.slice(1).join(" ");

      await createUserProfile(credential.user.uid, credential.user.email, {
        full_name: fullName.trim(),
        first_name: firstName,
        last_name: lastName,
        phone,
        profession,
        food_preference: foodPreference,
        trial_started_at: new Date().toISOString(),
        subscription_status: "trialing",
      });

      router.replace("/(tabs)/home");
      clearForm();
    } catch (error: any) {
      console.log("SIGNUP ERROR:", error);

      if (error?.code === "auth/email-already-in-use") {
        try {
          await signInWithEmailAndPassword(
            auth,
            email.trim().toLowerCase(),
            password,
          );
          router.replace("/(tabs)/home");
          clearForm();
          return;
        } catch (signInError) {
          console.log("SIGNUP FALLBACK SIGNIN ERROR:", signInError);
          Alert.alert(
            "Account Already Exists",
            "This email already has an account. Use Sign In, or tap Forgot password if you cannot remember the password.",
          );
          return;
        }
      }

      if (error?.code === "auth/weak-password") {
        Alert.alert("Weak Password", "Use at least 6 characters.");
        setPassword("");
        setConfirmPassword("");
        return;
      }

      if (error?.code === "auth/invalid-email") {
        Alert.alert("Invalid Email", "Enter a valid email address.");
        return;
      }

      Alert.alert("Sign Up Failed", error?.message || "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    Alert.alert(
      "Google Sign In",
      "Google sign-in will be added after Firebase OAuth client IDs are configured.",
    );
  };

  return (
    <ImageBackground
      source={require("../../assets/images/auth-bg.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={require("../../assets/images/chopperhub-logo.png")}
          style={styles.logoImage}
        />

        <Text style={styles.title}>Create Account</Text>

        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#ccc"
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
        />

        <TextInput
          placeholder="Email"
          placeholderTextColor="#ccc"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.passwordInput}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#ccc"
            style={styles.passwordTextInput}
            secureTextEntry={!showNewPassword}
            value={password}
            onChangeText={setPassword}
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

        <View style={styles.passwordInput}>
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#ccc"
            style={styles.passwordTextInput}
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
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>
            {submitting ? "Creating account..." : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
        >
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  logoImage: {
    width: 120,
    height: 120,
    alignSelf: "center",
    resizeMode: "contain",
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    color: "#fff",
  },
  passwordInput: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    paddingLeft: 15,
  },
  passwordTextInput: {
    color: "#fff",
    flex: 1,
    height: "100%",
    padding: 0,
    paddingRight: 8,
  },
  eyeButton: {
    height: 48,
    width: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#ff7a00",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  googleButton: {
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  googleText: {
    color: "#000",
    fontWeight: "bold",
  },
  link: {
    color: "#fff",
    marginTop: 20,
    textAlign: "center",
  },
});
