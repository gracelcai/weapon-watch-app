import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { VLCPlayer } from "react-native-vlc-media-player";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { getCameras } from "../../services/firestore";

// CameraFeed component: shows the live feed given an RTSP URL.
function CameraFeed({ rtspUrl }: { rtspUrl: string }) {
  return (
    <VLCPlayer
      source={{ uri: rtspUrl }}
      style={styles.cameraFeed}
      autoplay={true}
      resizeMode="contain"
    />
  );
}

export default function CamerasScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cameras, setCameras] = useState<Array<any>>([]);
  const [selected, setSelected] = useState<{ [floor: string]: string }>({});
  const [expandedFloors, setExpandedFloors] = useState<{ [floor: string]: boolean }>({});
  const [visibleFeeds, setVisibleFeeds] = useState<{ [cameraId: string]: boolean }>({});

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
    }; fetchData();
  }, []);

  // Group cameras by floor
  const camerasByFloor = cameras.reduce((acc: { [floor: string]: any[] }, camera) => {
    const floor = camera.floor !== undefined && camera.floor !== null
      ? camera.floor.toString()
      : "Unknown";
    if (!acc[floor]) {
      acc[floor] = [];
    }
    acc[floor].push(camera);
    return acc;
  }, {});

  // Toggle the expansion state of a particular floor section.
  const toggleFloor = (floor: string) => {
    setExpandedFloors((prev) => ({ ...prev, [floor]: !prev[floor] }));
  };

  // Toggle showing the live feed for a particular camera.
  const toggleFeed = (cameraId: string) => {
    setVisibleFeeds((prev) => ({ ...prev, [cameraId]: !prev[cameraId] }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CAMERAS</Text>

      {/* For each floor, render an expandable section with a list of cameras */}
      {Object.keys(camerasByFloor).map((floor) => (
        <View key={floor} style={styles.floorSection}>
          {/* Floor Header: Tapping toggles expansion */}
          <TouchableOpacity onPress={() => toggleFloor(floor)}>
            <Text style={styles.floorTitle}>
              {expandedFloors[floor] ? "▼ " : "▶ "}
              Floor {floor}
            </Text>
          </TouchableOpacity>
          
          {/* If the floor is expanded, list cameras */}
          {expandedFloors[floor] &&
            camerasByFloor[floor].map((camera) => (
              <View key={camera.id} style={styles.cameraSection}>
                {/* Camera label: tapping toggles the live feed */}
                <TouchableOpacity onPress={() => toggleFeed(camera.id)}>
                  <Text style={styles.cameraLabel}>{camera.name}</Text>
                </TouchableOpacity>
                {/* If the camera's feed is visible and a video link exists, render the live feed */}
                {visibleFeeds[camera.id] && camera.video_link ? (
                  <CameraFeed rtspUrl={camera.video_link} />
                ) : null}
              </View>
            ))
          }
        </View>
      ))}

      {/* Manage Cameras Button */}
      <TouchableOpacity 
        style={styles.manageButton} 
        onPress={() => router.push("/screens/cameras_manage")}
      >
        <Text style={styles.manageButtonText}>Manage Cameras</Text>
      </TouchableOpacity>
    </View>
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
  cameraFeed: { width: "100%", height: 150, marginTop: 5, borderRadius: 8, backgroundColor: "#000" },
  floorSection: { marginBottom: 20 },
  cameraSection: { marginLeft: 20, marginBottom: 10 },
  cameraLabel: { color: "#fff", fontSize: 16 },
});