import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { getUser, signInWithGoogle } from "../../services/firestore";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Set up Google authentication request with client IDs.
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "YOUR_EXPO_CLIENT_ID",
    iosClientId: "YOUR_IOS_CLIENT_ID",
    androidClientId: "YOUR_ANDROID_CLIENT_ID",
    webClientId: "YOUR_WEB_CLIENT_ID",
  });

  // Handle Google auth response
  useEffect(() => {
    if (response?.type === "success") {
      const handleGoogleAuth = async () => {
        try {
          const { id_token } = response.params;
          await signInWithGoogle(id_token);
          Alert.alert("Login Successful!", "Welcome back!");

          const uid = auth.currentUser?.uid;
          if (!uid) throw new Error("User not found");

          const userData = await getUser(uid) as { isAdmin: boolean };
          if (userData.isAdmin) {
            router.push("/screens/cameras");
          } else {
            router.push("/screens/notifications_student");
          }
        } catch (error: any) {
          Alert.alert("Authentication Error", error.message);
        }
      };

      handleGoogleAuth();
    }
  }, [response]);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Login Successful!", "Welcome back!");

      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("User not found");
      const userData = await getUser(uid) as { isAdmin: boolean };

      if (userData.isAdmin) {
        router.push("/screens/cameras");
      } else {
        router.push("/screens/notifications_student");
      }
    } catch (err: any) {
      Alert.alert("Login Error", err.message);
    }
  };

  const handleGoogleLogin = () => {
    promptAsync();
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/screens/home")}>
        <FontAwesome name="arrow-left" size={20} color="#fff" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.description}>Login to continue</Text>
        </View>

        {/* Google Login Button */}
        <TouchableOpacity style={[styles.button, styles.outlineButton]} onPress={handleGoogleLogin}>
          <Text style={styles.socialButtonText}>
            <FontAwesome name="google" style={styles.icon} /> Login with Google
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Or continue with</Text>
          <View style={styles.divider} />
        </View>

        {/* Email & Password Fields */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#aaa"
        />

        <View style={styles.inlineContainer}>
          <Text style={styles.label}>Password</Text>
          <TouchableOpacity>
            <Text style={styles.link}>Forgot your password?</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#aaa"
        />

        {/* Login Button */}
        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don’t have an account?{" "}
            <Text style={styles.link} onPress={() => router.push("/screens/signup")}>Sign up</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#000" },
  backButton: { position: "absolute", top: 50, left: 20, flexDirection: "row", alignItems: "center" },
  backText: { color: "#fff", fontSize: 16, marginLeft: 5 },
  card: { backgroundColor: "#111", borderRadius: 8, padding: 20, elevation: 3 },
  header: { alignItems: "center", marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  description: { fontSize: 14, color: "#bbb" },
  button: { padding: 15, borderRadius: 8, alignItems: "center", justifyContent: "center", flexDirection: "row" },
  outlineButton: { borderColor: "#ccc", borderWidth: 1, backgroundColor: "#222" },
  primaryButton: { backgroundColor: "#201c1c" },
  loginButtonText: { color: "#fff", fontSize: 16, justifyContent: "center" },
  socialButtonText: { color: "#fff", fontWeight: "bold" },
  dividerContainer: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  divider: { flex: 1, height: 1, backgroundColor: "#444" },
  dividerText: { marginHorizontal: 10, color: "#bbb", fontSize: 14 },
  label: { marginBottom: 5, fontSize: 14, color: "#fff" },
  input: { borderWidth: 1, borderColor: "#444", borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 16, color: "#fff" },
  link: { color: "#4a90e2", textDecorationLine: "underline" },
  footer: { marginTop: 20, alignItems: "center" },
  footerText: { fontSize: 14, color: "#bbb" },
});