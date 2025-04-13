import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { auth } from "../../firebaseConfig";
import { getUser } from "../../services/firestore";

export default function VerificationScreen() {
  const router = useRouter();
  // allowed will be true if user can see the screen, false if not, and null while checking.
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUserVerification = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        Alert.alert("Error", "User not found. Please log in again.");
        router.replace("/screens/login");
        return;
      }
      try {
        const userData = await getUser(uid) as any;
        if (userData.isVerifier) {
          setAllowed(true);
        } else {
          // User is not allowed to see this screen.
          Alert.alert("Unauthorized", "You don't have verification permissions.");
          setAllowed(false);
          router.replace("/screens/cameras");
        }
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Unable to verify user permissions.");
        setAllowed(false);
        router.replace("/screens/cameras");
      }
    };

    checkUserVerification();
  }, [router]);

  const handleConfirmThreat = () => {
    alert("Threat confirmed! Authorities will be alerted.");
    // Add API call to notify security team
  };

  const handleFalseAlert = () => {
    alert("False alarm reported.");
    // Add API call to log false alert
  };

  // While checking user verification, show a loading indicator.
  if (allowed === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Potential threat detected</Text>

      {/* Threat Image */}
      <Image source={require("../../assets/images/shooter.avif")} style={styles.image} />

      {/* Action Buttons */}
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmThreat}>
        <Text style={styles.confirmButtonText}>Confirm the threat alert</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.falseButton} onPress={handleFalseAlert}>
        <Text style={styles.falseButtonText}>False alert</Text>
      </TouchableOpacity>

      {/* Verification Transfer Button */}
      <TouchableOpacity style={styles.transferButton} onPress={() => router.push("/screens/verification_transfer")}>
        <Text style={styles.transferButtonText}>TRANSFER</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center", padding: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  title: { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  image: { width: "100%", height: 300, resizeMode: "contain", marginBottom: 30 },
  confirmButton: { backgroundColor: "#D32F2F", padding: 15, width: "100%", alignItems: "center", borderRadius: 10, marginBottom: 10 },
  confirmButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  falseButton: { backgroundColor: "#fff", padding: 15, width: "100%", alignItems: "center", borderRadius: 10 },
  falseButtonText: { color: "#000", fontSize: 16, fontWeight: "bold" },
  transferButton: { marginTop: 20, alignSelf: "center", paddingBottom: 20},
  transferButtonText: { color: "#fff", fontSize: 16},
});
