import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { VLCPlayer } from "react-native-vlc-media-player";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { getCameras, getCamerasSchool, getUser } from "../../services/firestore";
import { auth, db } from "../../firebaseConfig";
import Video from "react-native-video";

/*
// CameraFeed component: shows the live feed given an RTSP URL.
function CameraFeed({ rtspUrl }: { rtspUrl: string }) {
  return (
    // <VLCPlayer
    //   source={{ uri: rtspUrl }}
    //   style={styles.cameraFeed}
    //   autoplay={true}
    //   resizeMode="contain"
    // />
    <View style={[styles.cameraFeed, { backgroundColor: "red" }]}>
      <Text style={{ color: "white" }}>RTSP URL: {rtspUrl} (not implemented)</Text>
    </View>
  );
}
*/
const ACCENT = "#4da6ff";

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
        const cams = await getCamerasSchool();
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

      {/* Manage Cameras button */}
      <TouchableOpacity
        style={styles.manageButton}
        onPress={() => router.push("/screens/cameras_manage")}
        activeOpacity={0.8}
      >
        <Text style={styles.manageButtonText}>Manage Cameras</Text>
      </TouchableOpacity>

      {/* Floors & cameras */}
      {Object.keys(camerasByFloor).map((floor) => (
        <View key={floor} style={styles.floorContainer}>
          {/* ───── Floor header ───── */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => toggleFloor(floor)}
            style={[
              styles.floorHeader,
              expandedFloors[floor] && { backgroundColor: "#111" },
            ]}
          >
            <Text
              style={[
                styles.floorTitle,
                expandedFloors[floor] && { color: ACCENT },
              ]}
            >
              {expandedFloors[floor] ? "▼ " : "▶ "}Floor {floor}
            </Text>
          </TouchableOpacity>

          {/* ───── Camera list ───── */}
          {expandedFloors[floor] &&
            camerasByFloor[floor].map((camera) => (
              <View key={camera.id}>
                {/* camera “pill” */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.cameraPill,
                    visibleFeeds[camera.id] && { borderColor: ACCENT },
                  ]}
                  onPress={() => toggleFeed(camera.id)}
                >
                  <Text style={styles.cameraLabel}>{camera.name}</Text>
                </TouchableOpacity>

                {/* RTSP feed (optional) */}
                {visibleFeeds[camera.id] && camera.video_link 
                //&& (<CameraFeed rtspUrl={camera.video_link}/>)
                 }
              </View>
            ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingTop: 0, // status-bar offset
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 1,
  },
  manageButton: {
    backgroundColor: "#1a1a1a",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 18,
  },
  manageButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  floorContainer: { marginBottom: 18 },
  floorHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  floorTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  cameraPill: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 24,
    marginBottom: 8,
  },
  cameraLabel: {
    color: "#fff",
    fontSize: 15,
  },

  cameraFeed: {
    width: "92%",
    height: 160,
    alignSelf: "center",
    marginTop: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#222",
    backgroundColor: "#000",
  },
});