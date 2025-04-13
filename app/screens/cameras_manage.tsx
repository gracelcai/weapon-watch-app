import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from '@expo/vector-icons';
import { addCamera } from "../../services/firestore";

export default function CameraSetupScreen() {
  const router = useRouter();
  const [floor, setFloor] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [videoLink, setVideoLink] = useState("");

  const handleSaveCamera = async () => {
    const video_type = "rtsp";

    if (!floor || !name || !location || !videoLink) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    // Create a unique cameraId from floor and name (you can customize this)
    const cameraId = `${floor}-${name}`.replace(/\s+/g, "_");

    try {
      await addCamera(cameraId, {
        floor: Number(floor),
        name,
        location,
        video_type,
        video_link: videoLink,
        // isDetected and isConfirmed will default to false.
      });
      Alert.alert("Success", "Camera saved successfully!");
      // Optionally, clear the form.
      setFloor("");
      setName("");
      setLocation("");
      setVideoLink("");
    } catch (error: any) {
      Alert.alert("Error", "Failed to save camera details.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/screens/cameras")}>
        <FontAwesome name="arrow-left" size={20} color="#fff" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Camera Setup</Text>

      <TextInput
        style={styles.input}
        placeholder="Floor (e.g., 1)"
        placeholderTextColor="#aaa"
        value={floor}
        onChangeText={setFloor}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Camera Name (e.g., Hallway 101)"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="RTSP URL"
        placeholderTextColor="#aaa"
        value={videoLink}
        onChangeText={setVideoLink}
      />
      <Button title="Save Camera" onPress={handleSaveCamera} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1,backgroundColor: "#000",padding: 16,justifyContent: "center",},
  title: {color: "#fff",fontSize: 24,marginBottom: 16,fontWeight: "bold",textAlign: "center"},
  input: {backgroundColor: "#222",color: "#fff",padding: 10,marginVertical: 8,borderRadius: 8,},
  backButton: {position: "absolute",top: 50,left: 20,flexDirection: "row",alignItems: "center",},
  backText: { color: "#fff", fontSize: 16, marginLeft: 5 },
});
