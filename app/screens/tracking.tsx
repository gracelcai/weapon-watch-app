import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Button, ActivityIndicator, Platform } from "react-native";
import MapView, { Polygon, Overlay, PROVIDER_GOOGLE } from "react-native-maps";
import { db } from '../../firebaseConfig';
import { collection, doc, onSnapshot } from 'firebase/firestore';

// Types
type Camera = {
  id: string;
  name: string;
  detected: boolean;
  floor: string;
};

type Floor = "floor1" | "floor2" | "floor3";

type Room = {
  id: string;
  name: string;
  polygon: { x: number; y: number }[];
  floor: Floor;
};

// Assets
const floorImages: Record<Floor, any> = {
  floor1: require("../../assets/images/idea-factory-1.png"),
  floor2: require("../../assets/images/idea-factory-3.png"),
  floor3: require("../../assets/images/idea-factory-3.png"),
};

const floorBounds: Record<Floor, { northEast: { latitude: number; longitude: number }; southWest: { latitude: number; longitude: number } }> = {
  floor1: {
    northEast: { latitude: 38.99048332497971, longitude: -76.93799487382921 },
    southWest: { latitude: 38.99029118164155, longitude: -76.938594790733 },
  },
  floor2: {
    northEast: { latitude: 38.99050068686733, longitude: -76.93776544244812 },
    southWest: { latitude: 38.99029118164155, longitude: -76.938594790733 },
  },
  floor3: {
    northEast: { latitude: 38.99048332497971, longitude: -76.93799487382921 },
    southWest: { latitude: 38.99029118164155, longitude: -76.938594790733 },
  },
};

const roomPolygons: Room[] = [
  // FLOOR ONE 11111111
  {
    id: "room-1101",
    name: "Room 1101",
    floor: "floor1",
    polygon: [
      { x: 0.755, y: 0.440 }, // top left
      { x: 0.755, y: 0.005 }, // bottom left
      { x: 0.990, y: 0.005 }, // bottom right
      { x: 0.990, y: 0.455 }, // top right
    ], // counterclockwise from top left
  },
  {
    id: "room-1101A/B",
    name: "Room 1101A/B",
    floor: "floor1",
    polygon: [
      { x: 0.690, y: 0.718 },
      { x: 0.690, y: 0.515 },
      { x: 0.770, y: 0.515 },
      { x: 0.770, y: 0.755 },
    ],
  },
  {
    id: "room-1101C/E",
    name: "Room 1101C/E",
    floor: "floor1",
    polygon: [
      { x: 0.770, y: 0.675 },
      { x: 0.770, y: 0.515 },
      { x: 0.975, y: 0.515 },
      { x: 0.975, y: 0.675 },
    ],
  },
  {
    id: "room-1101D",
    name: "Room 1101D",
    floor: "floor1",
    polygon: [
      { x: 0.770, y: 0.675 },
      { x: 0.770, y: 0.825 },
      { x: 0.910, y: 0.900 },
      { x: 0.910, y: 0.675 },
    ],
  },
  {
    id: "room-1103",
    name: "Room 1103",
    floor: "floor1",
    polygon: [
      { x: 0.665, y: 0.375 },
      { x: 0.665, y: 0.005 },
      { x: 0.755, y: 0.005 },
      { x: 0.755, y: 0.375 },
    ],
  },
  {
    id: "room-1107",
    name: "Room 1107",
    floor: "floor1",
    polygon: [
      { x: 0.478, y: 0.375 },
      { x: 0.478, y: 0.005 },
      { x: 0.665, y: 0.005 },
      { x: 0.665, y: 0.375 },
    ],
  },
  {
    id: "room-1109",
    name: "Room 1109",
    floor: "floor1",
    polygon: [
      { x: 0.360, y: 0.375 },
      { x: 0.360, y: 0.005 },
      { x: 0.478, y: 0.005 },
      { x: 0.478, y: 0.375 },
    ],
  },
  {
    id: "room-1110/2/4/6",
    name: "Bathrooms",
    floor: "floor1",
    polygon: [
      { x: 0.292, y: 0.680 },
      { x: 0.292, y: 0.920 },
      { x: 0.468, y: 0.920 },
      { x: 0.468, y: 0.680 },
    ],
  },
  {
    id: "room-1113/A",
    name: "Room ALeX Garage",
    floor: "floor1",
    polygon: [
      { x: 0.078, y: 0.005 },
      { x: 0.078, y: 0.568 },
      { x: 0.24, y: 0.568 },
      { x: 0.24, y: 0.005 },
    ],
  },
  {
    id: "room-1118",
    name: "Main Electric Room",
    floor: "floor1",
    polygon: [
      { x: 0.218, y: 0.680 },
      { x: 0.218, y: 0.920 },
      { x: 0.292, y: 0.920 },
      { x: 0.292, y: 0.680 },
    ],
  },
  {
    id: "room-1129/A/B/C",
    name: "Room 1129/A/B/C",
    floor: "floor1",
    polygon: [
      { x: 0.001, y: 0.005 },
      { x: 0.001, y: 0.358 },
      { x: 0.078, y: 0.358 },
      { x: 0.078, y: 0.005 },
    ],
  },
  {
    id: "room-1191",
    name: "Room 1191",
    floor: "floor1",
    polygon: [
      { x: 0.001, y: 0.680 },
      { x: 0.001, y: 0.835 },
      { x: 0.055, y: 0.835 },
      { x: 0.055, y: 0.680 },
    ],
  },
  {
    id: "room-1192",
    name: "Room 1192",
    floor: "floor1",
    polygon: [
      { x: 0.055, y: 0.680 },
      { x: 0.055, y: 0.880 },
      { x: 0.110, y: 0.880 },
      { x: 0.110, y: 0.680 },
    ],
  },
  {
    id: "room-1193",
    name: "West Stairwell",
    floor: "floor1",
    polygon: [
      { x: 0.110, y: 0.780 },
      { x: 0.110, y: 0.920 },
      { x: 0.218, y: 0.920 },
      { x: 0.218, y: 0.780 },
    ],
  },
  {
    id: "cam-1",
    name: "Camera 1",
    floor: "floor1",
    polygon: [
      { x: 0.24, y: 0 },
      { x: 0.24, y: 0.375 },
      { x: 0.36, y: 0.375 },
      { x: 0.36, y: 0 },
    ],
  },
  //No Camera 2
  {
    id: "cam-3",
    name: "Camera 3",
    floor: "floor1",
    polygon: [
      { x: 0.36, y: 0.375 },
      { x: 0.36, y: 0.680 },
      { x: 0.51, y: 0.680 },
      { x: 0.51, y: 0.610 },
      { x: 0.46, y: 0.610 },
      { x: 0.46, y: 0.375 },
    ],
  },
  {
    id: "cam-4",
    name: "Camera 4",
    floor: "floor1",
    polygon: [
      { x: 0, y: 0.568 },
      { x: 0, y: 0.680 },
      { x: 0.27, y: 0.680 },
      { x: 0.27, y: 0.568 },
    ],
  },
    {
    id: "cam-5",
    name: "Camera 5",
    floor: "floor1",
    polygon: [
      { x: 0.27, y: 0.568 },
      { x: 0.27, y: 0.680 },
      { x: 0.36, y: 0.680 },
      { x: 0.36, y: 0.568 },
    ],
  },
  {
    id: "cam-6",
    name: "Camera 6",
    floor: "floor1",
    polygon: [
      { x: 0.24, y: 0.375 },
      { x: 0.24, y: 0.568 },
      { x: 0.36, y: 0.568 },
      { x: 0.36, y: 0.375 },
    ],
  },
  {
    id: "room-1195",
    name: "Main Stairs",
    floor: "floor1",
    polygon: [
      { x: 0.460, y: 0.610 },
      { x: 0.460, y: 0.375 },
      { x: 0.625, y: 0.375 },
      { x: 0.625, y: 0.610 },
    ],
  },
  {
    id: "room-1196",
    name: "Room 1196",
    floor: "floor1",
    polygon: [
      { x: 0.468, y: 0.715 },
      { x: 0.468, y: 0.920 },
      { x: 0.510, y: 0.920 },
      { x: 0.510, y: 0.715 },
    ],
  },
  {
    id: "room-1198",
    name: "East Stairwell",
    floor: "floor1",
    polygon: [
      { x: 0.510, y: 0.770 },
      { x: 0.510, y: 0.920 },
      { x: 0.624, y: 0.920 },
      { x: 0.624, y: 0.770 },
    ],
  },
  {
    id: "elevator-e1",
    name: "East Elevator",
    floor: "floor1",
    polygon: [
      { x: 0.510, y: 0.610 },
      { x: 0.510, y: 0.770 },
      { x: 0.624, y: 0.770 },
      { x: 0.624, y: 0.610 },
    ],
  },
  {
    id: "room-1199",
    name: "Main Entry",
    floor: "floor1",
    polygon: [
      { x: 0.635, y: 0.692 },
      { x: 0.645, y: 0.515 },
      { x: 0.690, y: 0.515 },
      { x: 0.690, y: 0.718 },
    ],
  },
  // FLOOR TWOOO
  {
    id: "roof",
    name: "Exterior Balcony",
    floor: "floor2",
    polygon: [
      { x: 0.672, y: 0.565 },
      { x: 0.672, y: 0.022 },
      { x: 0.998, y: 0.022 },
      { x: 0.998, y: 0.565 },
    ],
  },
  // FLOOR THREEE
  {
    id: "room-3100",
    name: "Room 3100",
    floor: "floor3",
    polygon: [
      { x: 0.865, y: 0.398 },
      { x: 0.865, y: 0.858 },
      { x: 0.970, y: 0.858 },
      { x: 0.935, y: 0.398 },
    ],
  },
  {
    id: "room-3110/2/4/5",
    name: "Bathrooms",
    floor: "floor3",
    polygon: [
      { x: 0.405, y: 0.700 },
      { x: 0.405, y: 0.950 },
      { x: 0.645, y: 0.950 },
      { x: 0.645, y: 0.700 },
    ],
  },
  {
    id: "room-3113",
    name: "Room 3113",
    floor: "floor3",
    polygon: [
      { x: 0.502, y: 0.398 },
      { x: 0.502, y: 0.580 },
      { x: 0.605, y: 0.580 },
      { x: 0.605, y: 0.398 },
    ],
  },
  {
    id: "room-3118",
    name: "Room 3118",
    floor: "floor3",
    polygon: [
      { x: 0.353, y: 0.700 },
      { x: 0.353, y: 0.950 },
      { x: 0.403, y: 0.950 },
      { x: 0.403, y: 0.700 },
    ],
  },
  {
    id: "room-3119",
    name: "RAL",
    floor: "floor3",
    polygon: [
      { x: 0.210, y: 0.008 },
      { x: 0.210, y: 0.398 },
      { x: 0.915, y: 0.398 },
      { x: 0.915, y: 0.008 },
    ],
  },
  {
    id: "room-3119A",
    name: "RAL Room A",
    floor: "floor3",
    polygon: [
      { x: 0.360, y: 0.398 },
      { x: 0.360, y: 0.580 },
      { x: 0.502, y: 0.580 },
      { x: 0.502, y: 0.398 },
    ],
  },
  {
    id: "room-3119B",
    name: "RAL Room B",
    floor: "floor3",
    polygon: [
      { x: 0.210, y: 0.398 },
      { x: 0.210, y: 0.580 },
      { x: 0.360, y: 0.580 },
      { x: 0.360, y: 0.398 },
    ],
  },
  {
    id: "room-3119C/D",
    name: "RAL Room C/D",
    floor: "floor3",
    polygon: [
      { x: 0.080, y: 0.008 },
      { x: 0.080, y: 0.430 },
      { x: 0.210, y: 0.430 },
      { x: 0.210, y: 0.008 },
    ],
  },
  {
    id: "room-3119F/E",
    name: "RAL Room F/E",
    floor: "floor3",
    polygon: [
      { x: 0.915, y: 0.008 },
      { x: 0.915, y: 0.398 },
      { x: 0.995, y: 0.398 },
      { x: 0.995, y: 0.008 },
    ],
  },
  {
    id: "room-3120",
    name: "Room 3120",
    floor: "floor3",
    polygon: [
      { x: 0.300, y: 0.700 },
      { x: 0.300, y: 0.950 },
      { x: 0.353, y: 0.950 },
      { x: 0.353, y: 0.700 },
    ],
  },
  {
    id: "room-3121",
    name: "Room 3121",
    floor: "floor3",
    polygon: [
      { x: 0.132, y: 0.430 },
      { x: 0.132, y: 0.580 },
      { x: 0.210, y: 0.580 },
      { x: 0.210, y: 0.430 },
    ],
  },
  {
    id: "room-3124",
    name: "Room 3124",
    floor: "floor3",
    polygon: [
      { x: 0.001, y: 0.580 },
      { x: 0.001, y: 0.858 },
      { x: 0.074, y: 0.858 },
      { x: 0.074, y: 0.580 },
    ],
  },
  {
    id: "room-3125A",
    name: "Room 3125A",
    floor: "floor3",
    polygon: [
      { x: 0.001, y: 0.008 },
      { x: 0.001, y: 0.430 },
      { x: 0.080, y: 0.430 },
      { x: 0.080, y: 0.008 },
    ],
  },
  {
    id: "room-3125B",
    name: "Room 3125B",
    floor: "floor3",
    polygon: [
      { x: 0.001, y: 0.430 },
      { x: 0.001, y: 0.580 },
      { x: 0.132, y: 0.580 },
      { x: 0.132, y: 0.430 },
    ],
  },
  {
    id: "room-3192",
    name: "Room 3192",
    floor: "floor3",
    polygon: [
      { x: 0.074, y: 0.700 },
      { x: 0.074, y: 0.950 },
      { x: 0.144, y: 0.950 },
      { x: 0.144, y: 0.700 },
    ],
  },
  {
    id: "room-3193",
    name: "West Stairwell 1",
    floor: "floor3",
    polygon: [
      { x: 0.144, y: 0.790 },
      { x: 0.144, y: 0.950 },
      { x: 0.300, y: 0.950 },
      { x: 0.300, y: 0.790 },
    ],
  },
  {
    id: "elevator-w3",
    name: "West Stairwell 2",
    floor: "floor3",
    polygon: [
      { x: 0.144, y: 0.700 },
      { x: 0.144, y: 0.790 },
      { x: 0.300, y: 0.790 },
      { x: 0.300, y: 0.700 },
    ],
  },
  {
    id: "room-3195",
    name: "Main Stairs",
    floor: "floor3",
    polygon: [
      { x: 0.605, y: 0.398 },
      { x: 0.605, y: 0.610 },
      { x: 0.870, y: 0.610 },
      { x: 0.870, y: 0.398 },
    ],
  },
  {
    id: "room-3196",
    name: "Room 3196",
    floor: "floor3",
    polygon: [
      { x: 0.645, y: 0.750 },
      { x: 0.645, y: 0.875 },
      { x: 0.705, y: 0.875 },
      { x: 0.705, y: 0.750 },
    ],
  },
  {
    id: "room-3198",
    name: "East Stairwell",
    floor: "floor3",
    polygon: [
      { x: 0.705, y: 0.790 },
      { x: 0.705, y: 0.950 },
      { x: 0.865, y: 0.950 },
      { x: 0.865, y: 0.790 },
    ],
  },
  {
    id: "elevator-e3",
    name: "East Elevator",
    floor: "floor3",
    polygon: [
      { x: 0.705, y: 0.688 },
      
      { x: 0.705, y: 0.790 },
      { x: 0.865, y: 0.790 },
      { x: 0.865, y: 0.688 },
    ],
  },
];

export default function TrackingPage() {
  const [cameraData, setCameraData] = useState<Camera[]>([]);
  const [currentFloor, setCurrentFloor] = useState<Floor>("floor1");
  const [loading, setLoading] = useState<boolean>(true);
  const [activeEvent, setActiveEvent] = useState<boolean>(false);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    setLoading(true);
    
    // Listen for camera data
    const camerasRef = collection(db, 'schools/UMD/cameras');
    const unsubscribeCameras = onSnapshot(camerasRef, (snapshot) => {
      const cameras: Camera[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        cameras.push({
          id: doc.id,
          name: data.name || 'Unnamed Camera',
          detected: data.detected || false,
          floor: 'floor' + data.floor || 'floor1',
        });
      });
      setCameraData(cameras);
      setLoading(false);
    });

    // Listen for active event status from schools/UMD document
    const schoolRef = doc(db, 'schools', 'UMD');
    const unsubscribeActiveEvent = onSnapshot(schoolRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setActiveEvent(data['Active Event'] || false);
      } else {
        setActiveEvent(false);
      }
    });

    return () => {
      unsubscribeCameras();
      unsubscribeActiveEvent();
    };
  }, []);

  const floorCameras = cameraData.filter(cam => cam.floor === currentFloor);
  const detectedCameraIds = floorCameras.filter(cam => cam.detected).map(cam => cam.name);
  const bounds = floorBounds[currentFloor];
  const toLatLng = (x: number, y: number) => ({
    latitude: bounds.southWest.latitude + y * (bounds.northEast.latitude - bounds.southWest.latitude),
    longitude: bounds.southWest.longitude + x * (bounds.northEast.longitude - bounds.southWest.longitude),
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading camera data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Active Event Banner */}
      {activeEvent && (
        <View style={styles.activeEventBanner}>
          <Text style={styles.activeEventText}>ACTIVE EVENT ONGOING</Text>
        </View>
      )}
      
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
          pitchEnabled={Platform.OS === 'ios' ? false : true}
          initialCamera={{
            center: {
              latitude: (bounds.southWest.latitude + bounds.northEast.latitude) / 2,
              longitude: (bounds.southWest.longitude + bounds.northEast.longitude) / 2,
            },
            pitch: 20,
            heading: 0,
            altitude: 70,
            zoom: 20,
          }}
        >
          <Overlay
            key={currentFloor}
            image={floorImages[currentFloor]}
            bounds={[
              [bounds.southWest.latitude, bounds.southWest.longitude],
              [bounds.northEast.latitude, bounds.northEast.longitude],
            ]}
          />

          {roomPolygons.filter(room => room.floor === currentFloor).map(room => {
            const isDetected = detectedCameraIds.includes(room.name);
            
            // Determine fill color based on active event and detection status
            let fillColor;
            if (isDetected) {
              fillColor = "rgba(255, 0, 0, 0.7)"; // Yellow for active event
            } 
            else {
              if (activeEvent)
              fillColor = "rgba(212, 212, 52, 0.67)"; // Red for detected threat
              else {
              fillColor = "rgba(0, 255, 0, 0.2)"; // Green for normal
              }
            }

            return (
              <Polygon
                key={room.name}
                coordinates={room.polygon.map(p => toLatLng(p.x, p.y))}
                fillColor={fillColor}
                strokeColor={"rgba(255, 255, 255, 0.7)"}
                strokeWidth={isDetected ? 4 : 2}
              />
            );
          })}
        </MapView>
      </View>

      <View style={styles.controlSection}>
        <View style={styles.floorButtonGroup}>
          <Text style={styles.sectionTitle}>Floors</Text>
          <View style={styles.floorButtonContainer}>
            <Button
              title="Floor 1"
              onPress={() => setCurrentFloor("floor1")}
              color={currentFloor === "floor1" ? "blue" : "gray"}
            />
            <Button
              title="Floor 2"
              // onPress={() => setCurrentFloor("floor2")}
              color={currentFloor === "floor2" ? "blue" : "gray"}
            />
            <Button
              title="Floor 3"
              // onPress={() => setCurrentFloor("floor3")}
              color={currentFloor === "floor3" ? "blue" : "gray"}
            />
          </View>
        </View>

        <View style={styles.cameraInfoGroup}>
          <Text style={[
            styles.sectionTitle
          ]}>
            {detectedCameraIds.length > 0 ? `🚨 THREAT DETECTED (${detectedCameraIds.length})` 
: "✅ NO ACTIVE THREATS"}
          </Text>
          <ScrollView style={styles.cameraList}>
            {detectedCameraIds.length === 0 ? (
              <Text style={styles.noCamerasText}>All cameras clear</Text>
            ) : (
              detectedCameraIds.map((cameraId) => {
                const camera = floorCameras.find(cam => cam.id === cameraId);
                return (
                  <View key={cameraId} style={styles.alertCameraItem}>
                    <Text style={styles.cameraName}>{camera?.name || cameraId}</Text>
                    <Text style={styles.alertStatus}>WEAPON DETECTED</Text>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", paddingTop: 0 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000'
  },
  loadingText: {
    color: '#fff',
    marginTop: 10
  },
  // Active Event Banner
  activeEventBanner: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeEventText: {
    color: '#dc2323ff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  // Active event status item
  activeEventItem: {
    backgroundColor: "#333300",
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeEventStatus: {
    color: "#ffcc00",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: 'center',
    marginBottom: 8,
  },
  activeEventInstruction: {
    color: "#ffcc00",
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
  mapContainer: { height: "50%", borderRadius: 10, margin: 16, overflow: "hidden" },
  controlSection: { flex: 1, flexDirection: "row", paddingHorizontal: 16 },
  floorButtonGroup: { flex: 1, paddingRight: 8, justifyContent: "flex-start" },
  cameraInfoGroup: { flex: 2, paddingLeft: 8 },
  sectionTitle: { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  cameraList: { backgroundColor: "#111", borderRadius: 8, padding: 8, maxHeight: 300 },
  alertCameraItem: { 
    backgroundColor: "#660000", 
    padding: 12, 
    marginVertical: 6, 
    borderRadius: 8 
  },
  cameraName: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  alertStatus: { color: "#ff0000", fontSize: 14, fontWeight: "bold", marginTop: 4 },
  noCamerasText: { color: "#ccc", textAlign: "center", padding: 20 },
  floorButtonContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 2,
    marginBottom: 2,
  },
});