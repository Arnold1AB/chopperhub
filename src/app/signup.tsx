import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
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

WebBrowser.maybeCompleteAuthSession();

const redirectUrl = AuthSession.makeRedirectUri({
  scheme: "chopperhub",
  path: "auth-callback",
});

const createSessionFromUrl = async (url: string) => {
  const [, hash = ""] = url.split("#");
  const query = url.split("?")[1]?.split("#")[0] ?? "";
  const params = new URLSearchParams(`${query}&${hash}`);
  const errorDescription = params.get("error_description");
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (errorDescription) throw new Error(errorDescription);
  if (!accessToken || !refreshToken) return null;

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) throw error;

  return data.session;
};

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

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        Alert.alert("Sign Up Failed", error.message);
        clearForm();
        return;
      }

      if (!data.user) {
        Alert.alert("Error", "Unable to create account.");
        clearForm();
        return;
      }

      const names = fullName.trim().split(" ");
      const firstName = names[0] || "";
      const lastName = names.slice(1).join(" ");

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        first_name: firstName,
        last_name: lastName,
        phone,
        profession,
        food_preference: foodPreference,
        trial_started_at: new Date().toISOString(),
        subscription_status: "trialing",
      });

      if (profileError) {
        console.log("PROFILE CREATE WARNING:", profileError);
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/");
        return;
      }

      Alert.alert(
        "Account Created",
        "Please verify your email before signing in.",
      );
      clearForm();
    } catch (error) {
      console.log("SIGNUP ERROR:", error);
      clearForm();
      Alert.alert("Error", "Unable to create account.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
      });

      if (error) {
        Alert.alert("Google Sign In Failed", error.message);
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl,
      );

      if (result.type === "success") {
        const session = await createSessionFromUrl(result.url);

        if (session) {
          router.replace("/");
        }
      }
    } catch (error) {
      console.log("GOOGLE ERROR:", error);
      Alert.alert("Error", "Google sign in failed.");
    }
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

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
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
