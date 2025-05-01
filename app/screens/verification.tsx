import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { updateConfirmThreat, getData } from '../../services/firestore';

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

export default function VerificationScreen() {
  const router = useRouter();

  const handleConfirmThreat = () => {
    alert("Threat confirmed! Authorities will be alerted.");
    updateConfirmThreat('UMD', {'Active Event': true})
    // Get the users of the school where was threat was detected
    //const data = getData('schools', 'UMD')
    // async () => {
    //   await sendPushNotification('ExponentPushToken[oCHZlsKn7107T2sZDK4Af1]')
    // }
    // Add API call to notify security team
  };

  const handleFalseAlert = () => {
    alert("False alarm reported.");
    updateConfirmThreat('UMD', {'Active Event': false})
    // Add API call to log false alert
  };

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center", padding: 20 },
  title: { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  image: { width: "100%", height: 300, resizeMode: "contain", marginBottom: 30 },
  
  confirmButton: { backgroundColor: "#D32F2F", padding: 15, width: "100%", alignItems: "center", borderRadius: 10, marginBottom: 10 },
  confirmButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  falseButton: { backgroundColor: "#fff", padding: 15, width: "100%", alignItems: "center", borderRadius: 10 },
  falseButtonText: { color: "#000", fontSize: 16, fontWeight: "bold" },
});
