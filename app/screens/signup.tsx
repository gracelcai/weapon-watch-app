// SignUpScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
    View, 
    TextInput, 
    Button, 
    Alert,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { addUser } from '../../services/firestore';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useNotification } from '@/context/NotificationContext';
import { signInWithGoogle, getUser } from "../../services/firestore";
import { auth, db } from "../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerifier, setIsVerifier] = useState(false);
  const [schoolId, setSchoolId] = useState('');
  const {notification, expoPushToken, error } = useNotification();
  if (error){
    return <Text>Error: {error.message}</Text>
  }

  // Set up the Google authentication request.
  const [request, response, promptAsync] = Google.useAuthRequest({
    // expoClientId: "YOUR_EXPO_CLIENT_ID.apps.googleusercontent.com",
    iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
    androidClientId: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
    webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const handleGoogleSignup = async () => {
        try {
          // Extract the Google ID token and sign in with Firebase.
          const { id_token } = response.params;
          await signInWithGoogle(id_token);
          Alert.alert("Signup Successful!", "Your account has been created.");

          // Get the current user's UID.
          const uid = auth.currentUser?.uid;
          if (!uid) throw new Error("User not found");

          // Try to fetch the user document from Firestore.
          let userData;
          try {
            userData = await getUser(uid);
          } catch (err) {
            // If it doesn't exist, create a new Firestore document.
            await setDoc(doc(db, "users", uid), {
              name: auth.currentUser?.displayName || "",
              email: auth.currentUser?.email || "",
              isAdmin: false, // Default to false (student/faculty). Adjust as needed.
              schoolId: "",   // Optional: set a default or leave empty.
              createdAt: new Date(),
            });
            userData = await getUser(uid) as any;
          }

          // Route based on the user's role.
          if (userData.isAdmin) {
            router.push("/screens/cameras");
          } else {
            router.push("/screens/notifications_student");
          }
        } catch (error: any) {
          Alert.alert("Google Sign-Up Error", error.message);
        }
      };

      handleGoogleSignup();
    }
  }, [response]);


  const handleSignUp = async () => {
    try {
      await addUser(name, email, password, isAdmin, isVerifier, schoolId, expoPushToken);
      Alert.alert('Sign Up Successful!', 'Your account has been created.');
      router.push("/screens/login");
    } catch (error: any) {
      Alert.alert('Sign Up Error', error.message);
    }
  };

  const handleGoogleSignup = () => {
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.description}>Sign up to continue</Text>
        </View>

        {/* Role Selection */}
        <View style={styles.roleContainer}>
            <TouchableOpacity
                style={[styles.roleButton, isAdmin && styles.selectedRole]}
                onPress={() => setIsAdmin(true)}
            >
                <Text style={styles.roleText}>Admin/Police</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.roleButton, !isAdmin && styles.selectedRole]}
                onPress={() => setIsAdmin(false)}
            >
                <Text style={styles.roleText}>Student/Faculty</Text>
            </TouchableOpacity>
        </View>

        {/* Google Sign Up Button */}
        <TouchableOpacity style={[styles.button, styles.outlineButton]} onPress={handleGoogleSignup}>
          <Text style={styles.socialButtonText}>
            <FontAwesome name="google" style={styles.icon} /> Sign Up with Google
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Or continue with</Text>
          <View style={styles.divider} />
        </View>

        {/* Name Field */}
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
        />

        {/* Email Field */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        {/* Password Field */}
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          secureTextEntry
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
        />

        {/* Optional School ID Field */}
        <Text style={styles.label}>School ID (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your School ID"
          placeholderTextColor="#aaa"
          value={schoolId}
          onChangeText={setSchoolId}
        />

        {/* Sign Up Button */}
        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleSignUp}>
          <Text style={styles.loginButtonText}>Sign Up</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{" "}
            <Text style={styles.link} onPress={() => router.push("/screens/login")}>
              Login
            </Text>
          </Text>
        </View>
      </View>

      <Text style={styles.terms}>
        By clicking sign up, you agree to our <Text style={styles.link}>Terms of Service</Text> and{" "}
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
});