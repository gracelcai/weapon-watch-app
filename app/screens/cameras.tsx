import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { getCameras } from "../../services/firestore";

export default function CamerasScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cameras, setCameras] = useState<Array<any>>([]);
  const [selected, setSelected] = useState<{ [floor: string]: string }>({});

  // Fetch cameras from Firestore on mount.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const cams = await getCameras();
        setCameras(cams);
      } catch (error) {
        console.error("Error fetching cameras:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Group cameras by floor.
  const camerasByFloor = cameras.reduce((acc: { [floor: string]: any[] }, camera) => {
    // If camera.floor exists, use its string value; otherwise, group under "Unknown".
    const floor = camera.floor !== undefined ? camera.floor.toString() : "Unknown";
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(camera);
    return acc;
  }, {});

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>CAMERAS</Text>

      {/* Render a dropdown (Picker) for each floor */}
      {Object.keys(camerasByFloor).map((floor) => (
        <View key={floor} style={styles.floorContainer}>
          <Text style={styles.floorTitle}>Floor {floor}</Text>
          <Picker
            selectedValue={selected[floor] || ""}
            style={styles.picker}
            onValueChange={(itemValue: string) =>
              setSelected((prev) => ({ ...prev, [floor]: itemValue }))
            }
          >
            <Picker.Item label={`Select a camera for Floor ${floor}`} value="" />
            {camerasByFloor[floor].map((camera) => (
              <Picker.Item key={camera.id} label={camera.name} value={camera.id} />
            ))}
          </Picker>
        </View>
      ))}

      {/* Manage Cameras Button */}
      <TouchableOpacity 
        style={styles.manageButton} 
        onPress={() => router.push("/screens/cameras_manage")}
      >
        <Text style={styles.manageButtonText}>Manage Cameras</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1,backgroundColor: "#000",padding: 16,paddingTop: 60,},
  title: { color: "#fff", fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  floorContainer: { marginBottom: 20 },
  floorTitle: { color: "#fff", fontSize: 18, marginBottom: 8 },
  picker: { color: "#fff", backgroundColor: "#222" },
  manageButton: { backgroundColor: "#201c1c", padding: 16, borderRadius: 8, alignItems: "center", marginTop: 20 },
  manageButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
