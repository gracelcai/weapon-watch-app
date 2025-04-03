import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function TrackingPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>LIVE TRACKING</Text>

      {Platform.OS !== "web" ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 37.7749, // Replace with real coordinates
            longitude: -122.4194,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker coordinate={{ latitude: 37.7749, longitude: -122.4194 }} title="Camera 1 - Entry" />
          <Marker coordinate={{ latitude: 37.7849, longitude: -122.4294 }} title="Camera 2 - East" />
        </MapView>
      ) : (
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapText}>Map Not Available on Web</Text>
        </View>
      )}

      <Text style={styles.title}>ACTIVE CAMERAS 🔴</Text>

      <View style={styles.cameraList}>
        <View style={styles.cameraItem}>
          <Text style={styles.cameraText}>FLOOR 1 - CAFE - CAM 1 / ENTRY</Text>
        </View>
        <View style={styles.cameraItem}>
          <Text style={styles.cameraText}>FLOOR 1 - CAFE - CAM 2 / EAST</Text>
        </View>
        <View style={styles.cameraItem}>
          <Text style={styles.cameraText}>FLOOR 1 - CAM 2 / EXIT</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16,
    paddingTop: 55,
    paddingBottom: 50
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  map: {
    flex: 1,
    borderRadius: 10,
    marginBottom: 16,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: "#222",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  mapText: {
    color: "#fff",
    fontSize: 18,
  },
  subTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cameraList: {
    marginBottom: 20,
  },
  cameraItem: {
    backgroundColor: "#333",
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
  },
  cameraText: {
    color: "#fff",
    fontSize: 16,
  },
});
