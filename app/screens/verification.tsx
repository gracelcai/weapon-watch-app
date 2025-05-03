import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import { auth, db, storage } from "../../firebaseConfig";
import { getUser } from "../../services/firestore";
import { updateConfirmThreat } from '../../services/firestore';
import { getDownloadURL, ref } from "firebase/storage";

const ImageViewer = ({ url }: { url: string }) => (
  <View style={styles.imageViewerContainer}>
    {url ? (
      <Image source={{ uri: url }} style={styles.image} />
    ) : (
      <ActivityIndicator size="large" color="#fff" />
    )}
  </View>
);

async function sendPushNotification(isAdmin: boolean, expoPushToken: string) {
  const message = {
    to: expoPushToken,
    sound: 'emergencysos.wav',
    title: 'ACTIVE THREAT',
    body: isAdmin ? 'Officers en-route. All faculty must secure classrooms: lock/barricade doors, call 911 with updates (location, description), and account for all students via attendance rosters' : 'Shelter-in-place order in effect. Stay inside your current room, lock/barricade the door, turn off lights, move away from windows, and silence all devices. Do not open doors for anyone until you hear the official ALL-CLEAR.',
    data: { url: 'screens/notifications_student' },
    channelId: 'weapon_detected',
    sticky: true,
    priority: 'high',
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

async function sendPushNotificationVerifier(expoPushToken: string) {
  const message = {
    to: expoPushToken,
    sound: 'emergencysos.wav',
    title: 'ACTIVE THREAT DETECTED',
    body: 'Confirm Active Threat Event',
    data: { url: 'screens/verification' },
    channelId: 'weapon_detected',
    sticky: true,
    priority: 'high',
  };

  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
  const data = await res.json();
  console.log("Push response:", data);
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
      const userData = userSnap.data() as any;
      if (userData.expoPushToken) {
        sendPushNotification(userData.isAdmin, userData.expoPushToken);
      }
    }
  }
  // Add API call to notify security team
};


export default function VerificationScreen() {
  const router = useRouter();
  // allowed will be true if user can see the screen, false if not, and null while checking.
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    const docRef = doc(db, "schools", "UMD");

    const unsubscribe = onSnapshot(docRef, async (snapshot) => {
      const data = snapshot.data();
      const detectedCamId = data?.detected_cam_id;
      const uid = auth.currentUser?.uid;
      const userData = await getUser(uid) as any;

      if (detectedCamId && detectedCamId.trim() !== "") {
        // Trigger your desired action here
        try {
          const imageRef = ref(storage, "frame_for_verifier.jpg");
          const downloadUrl = await getDownloadURL(imageRef);
          setImageUrl(downloadUrl); // update state → re-render ImageViewer :contentReference[oaicite:1]{index=1}
        } catch (err) {
          console.error("Error fetching image:", err);
        }
        sendPushNotificationVerifier(userData.expoPushToken);
        
        // For example, navigate to a different screen or display an alert
      }
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

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
    updateDoc(doc(db, 'schools', "UMD"), {'detected_cam_id': ""});
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
      {/* <Image source={require("../../assets/images/shooter.avif")} style={styles.image} /> */}
      <ImageViewer url={imageUrl}/>

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
  image: { width: "100%", width: 350, height: 300, resizeMode: "contain", marginBottom: 30 },
  confirmButton: { backgroundColor: "#D32F2F", padding: 15, width: "100%", alignItems: "center", borderRadius: 10, marginBottom: 10 },
  confirmButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  falseButton: { backgroundColor: "#fff", padding: 15, width: "100%", alignItems: "center", borderRadius: 10 },
  falseButtonText: { color: "#000", fontSize: 16, fontWeight: "bold" },
  transferButton: { marginTop: 20, alignSelf: "center", paddingBottom: 20},
  transferButtonText: { color: "#fff", fontSize: 16},
  msg: { color: "#fff", fontSize: 18, textAlign: "center" },
  imageViewerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
  },
});