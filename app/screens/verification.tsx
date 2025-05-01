import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { getUser } from "../../services/firestore";
import { updateConfirmThreat } from '../../services/firestore';

async function sendPushNotification(expoPushToken: string) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

async function handleConfirmThreat() {
  alert("Threat confirmed! Authorities will be alerted.");
  updateConfirmThreat('UMD', {'Active Event': true})
  // Get the users of the school where was threat was detected
  const snapshot = await getDoc(doc(db, "schools", "UMD"));
  const data = snapshot.data();

  const userRefs: Array<any> = data!.users; // users is an array of DocumentReferences
  for (const userRef of userRefs) {
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data() as { expoPushToken: string };;
      if (userData.expoPushToken) {
        sendPushNotification(userData.expoPushToken);
      }
    }
  }
  // Add API call to notify security team
};

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
          //router.replace("/screens/cameras");
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

  const handleFalseAlert = () => {
    alert("False alarm reported.");
    updateConfirmThreat('UMD', {'Active Event': false})
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

  if (!allowed) {
    return (
      <View style={styles.container}>
        <Text style={styles.title2}>
          Verification is only available to designated verifiers
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title2}>VERIFICATION</Text>
      <Text style={styles.title}>Potential threat detected</Text>

      {/* Threat Image */}
      <Image source={require("../../assets/images/shooter.avif")} style={styles.image} />

      {/* Action Buttons */}
      <TouchableOpacity style={styles.confirmButton} onPress={async () => { await handleConfirmThreat();}}>
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
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center", padding: 16,paddingTop: 60,},
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  title: { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  title2: { color: "#fff", fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  image: { width: "100%", height: 300, resizeMode: "contain", marginBottom: 30 },
  confirmButton: { backgroundColor: "#D32F2F", padding: 15, width: "100%", alignItems: "center", borderRadius: 10, marginBottom: 10 },
  confirmButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  falseButton: { backgroundColor: "#fff", padding: 15, width: "100%", alignItems: "center", borderRadius: 10 },
  falseButtonText: { color: "#000", fontSize: 16, fontWeight: "bold" },
  transferButton: { marginTop: 20, alignSelf: "center", paddingBottom: 20},
  transferButtonText: { color: "#fff", fontSize: 16},
  msg: { color: "#fff", fontSize: 18, textAlign: "center" }
});
