import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function CameraManagement() {
  const router = useRouter();
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CAMERA MANAGEMENT</Text>
      <Text style={styles.title}>ACTIVE CAMERAS <Text style={styles.redDot}>⬤</Text></Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Active Cameras */}
        <View style={styles.cameraContainer}>
          <Text style={styles.cameraLabel}>FLOOR I - HALLWAY - CAM 2 / RIGHT</Text>
          <Image source={require("../school1.png")} style={styles.cameraImage} />
        </View>

        <View style={styles.cameraContainer}>
          <Text style={styles.cameraLabel}>FLOOR I - CLASS 102 - CAM 1</Text>
          <Image source={require("../school2.webp")} style={styles.cameraImage} />
        </View>

        {/* Camera Groups */}
        <View style={styles.groupsContainer}>
          <Text style={styles.groupsTitle}>CAMERA GROUPS</Text>

          {["FLOOR I - CAFE", "FLOOR I - AUDITORIUM", "FLOOR II - HALLWAY 1", "FLOOR II - HALLWAY 2", "OUTSIDE - FRONT ENTRANCE"].map(
            (group, index) => (
              <TouchableOpacity key={index} style={styles.groupItem} onPress={() => toggleGroup(group)}>
                <Text style={styles.groupText}>{expandedGroups[group] ? "▼" : "▶"} {group}</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 16, paddingTop: 60},
  title: { color: "#fff", fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  subtitle: { color: "#fff", fontSize: 14, textAlign: "center", marginBottom: 10 },
  redDot: { color: "red" },
  scrollContent: { paddingBottom: 100 },

  cameraContainer: { marginBottom: 20 },
  cameraLabel: { color: "#fff", fontSize: 14, fontWeight: "bold", marginBottom: 5 },
  cameraImage: { width: "100%", height: 150, borderRadius: 8 },

  groupsContainer: { marginTop: 20 },
  groupsTitle: { color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  groupItem: { backgroundColor: "#222", padding: 10, marginVertical: 5, borderRadius: 5 },
  groupText: { color: "#fff", fontSize: 14 },

  navbar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
  navIcon: { fontSize: 24 },
});

