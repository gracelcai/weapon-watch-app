import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { auth, db } from '../../firebaseConfig';
import { updateProfile, updateEmail, updatePassword  } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getUser } from '../../services/firestore';

export default function Settings() {
  const router = useRouter();
  const user = auth.currentUser;

  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [schoolId, setSchoolId] = useState('');
  const [role, setRole] = useState("");
  
  // pre-fill the form
  useEffect(() => {
    if (user) {
      setName(user.displayName || "");
      setEmail(user.email || "");

      const fetchUserData = async () => {
        try {
          const uid = auth.currentUser?.uid;
          if (!uid) throw new Error("User not found");
          const userData = (await getUser(uid)) as { isAdmin: boolean; isVerifier: boolean; schoolId?: string };
          setSchoolId(userData.schoolId || "");
          if (userData.isAdmin) {
            setRole("Admin");
          } else if (userData.isVerifier) {
              setRole("Admin & Verifier");
          } else {
            setRole("Student/Faculty");
          }
        } catch (error: any) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [user]);

  const handleLogout = () => {
    router.push("/screens/login");
  };

  const handleSaveChanges = async () => {
    try {
      if (user) {
        // Update Firebase Auth profile
        if (name && name !== user.displayName) {
          await updateProfile(user, { displayName: name });
        }
        if (email && email !== user.email) {
          await updateEmail(user, email);
        }
        if (password) {
          // Only update password if user provided a new one
          await updatePassword(user, password);
        }
        // Optionally update Firestore with the new name and email
        await updateDoc(doc(db, "users", user.uid), {
          name,
          email,
        });
        Alert.alert("Profile Updated", "Your changes have been saved.");
      }
    } catch (error: any) {
      Alert.alert("Update Error", error.message);
    }
  };

  const handleBack = async () => {
    try {
      // Get the current user's data
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("User not found");
      const userData = await getUser(uid) as { isAdmin: boolean };

      // Check the isAdmin field to route appropriately
      if (userData.isAdmin) {
        router.push("/screens/cameras");
      } else {
        router.push("/screens/student_notifications");
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };
    
  

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <FontAwesome name="arrow-left" size={20} color="#fff" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>SETTINGS</Text>

      <Text style={styles.label}>School ID:</Text><Text style={styles.readOnly}>{schoolId}</Text>

      <Text style={styles.label}>Role:</Text>
      <Text style={styles.readOnly}>{role}</Text>

      {/* Change Name */}
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />

      {/* Change Email */}
      <Text style={styles.label}>Change Email </Text>
      <TextInput
        style={styles.input}
        placeholder="Enter new email"
        value={email}
        onChangeText={setEmail}
      />

      {/* Change Password */}
      <Text style={styles.label}>Change Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter new password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Save Changes Button */}
      <TouchableOpacity style={styles.button} onPress={handleSaveChanges}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      {/* Help and Support Button */}
      <TouchableOpacity style={styles.helpButton} onPress={() => router.push("/screens/settings")}>
        <Text style={styles.helpButtonText}>HELP & SUPPORT</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16,
    justifyContent: "center",
  },
  backButton: {position: "absolute", top: 50, left: 20, flexDirection: "row", alignItems: "center"},
  backText: { color: "#fff", fontSize: 16, marginLeft: 5 },
  title: {color: "#fff", fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 24},
  label: {color: "#fff", fontSize: 16, marginBottom: 8},
  input: {backgroundColor: "#222",color: "#fff",padding: 12,borderRadius: 8,marginBottom: 16,fontSize: 16,},
  button: {backgroundColor: "#444",padding: 16,borderRadius: 8,alignItems: "center",marginBottom: 16,},
  buttonText: {color: "#fff",fontSize: 18,fontWeight: "bold",},
  logoutButton: {backgroundColor: "#7A3A3A",padding: 16,borderRadius: 8, alignItems: "center"},
  readOnly: {color: "#aaa",fontSize: 16,marginBottom: 12,},
  link: { color: "#4a90e2", textDecorationLine: "underline" },
  footer: { marginTop: 20, alignItems: "center" },
  footerText: { fontSize: 14, color: "#bbb" },
  helpButton: { marginTop: 20, alignSelf: "center", paddingBottom: 20},
  helpButtonText: { color: "#fff", fontSize: 16},
});
