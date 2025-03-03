import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "student" | null>(null);

  const handleLogin = () => {
    if (!role) {
      alert("Please select a role before logging in.");
      return;
    }

    if (role === "admin") {
      router.push("/cameras");
    } else {
      router.push("/student_notifications");
    }
  };

  const handleGoogleLogin = () => {
    alert("Google Login Clicked! (integrate Firebase Auth here)");
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/home")}>
        <FontAwesome name="arrow-left" size={20} color="#fff" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.description}>Login with your Google account</Text>
        </View>

        {/* Role Selection */}
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleButton, role === "admin" && styles.selectedRole]}
            onPress={() => setRole("admin")}
          >
            <Text style={styles.roleText}>Admin/Police</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === "student" && styles.selectedRole]}
            onPress={() => setRole("student")}
          >
            <Text style={styles.roleText}>Student/Faculty</Text>
          </TouchableOpacity>
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
          <Text style={styles.footerText}>
            Don’t have an account? <Text style={styles.link}>Sign up</Text>
          </Text>
        </View>
      </View>

      <Text style={styles.terms}>
        By clicking continue, you agree to our <Text style={styles.link}>Terms of Service</Text> and{" "}
        <Text style={styles.link}>Privacy Policy</Text>.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#000" },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backText: { color: "#fff", fontSize: 16, marginLeft: 5 },
  card: { backgroundColor: "#111", borderRadius: 8, padding: 20, elevation: 3 },
  header: { alignItems: "center", marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  description: { fontSize: 14, color: "#bbb" },
  roleContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
  roleButton: { backgroundColor: "#222", padding: 15, marginHorizontal: 10, borderRadius: 8 },
  selectedRole: { backgroundColor: "#444" },
  roleText: { color: "#fff", fontSize: 16 },
  icon: { fontSize: 18, marginRight: 5 },
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
  terms: { textAlign: "center", marginTop: 20, fontSize: 12, color: "#666" },
  inlineContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
