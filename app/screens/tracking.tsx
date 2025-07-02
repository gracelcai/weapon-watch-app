import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, FlatList, Button } from "react-native";
import MapView, { Marker, Circle, Polygon, Callout, Overlay } from "react-native-maps";
import { getCameras} from "../../services/firestore.js"; 
import { onSnapshot, collection, doc} from "firebase/firestore";
import { db } from "../../firebaseConfig";

// Types
type Camera = {
  confirmed: boolean;
  detected: boolean;
  longitude: number;
  latitude: number;
  building: string;
  name: string;
  floor: number;  // Updated to numeric floor
  id: string;
  roomID: string; 
  shooter_detected: boolean;
};

type Floor = {
  number: number;  // Numeric floor number
  name: string;    // Floor name
};

const floors = [
  { number: 1, name: "First Floor" },
  { number: 2, name: "Second Floor" },
  { number: 3, name: "Third Floor" },
];

type Room = {
  id: string;
  name: string;
  polygon: { x: number; y: number }[];
  floor: Floor;  // Floor now references the updated Floor type
};

// Assets
const floorImages: Record<number, any> = {
  1: require('../../assets/images/idea-factory-1.png'),
  2: require('../../assets/images/idea-factory-1.png'),
  3: require('../../assets/images/idea-factory-3.png'),
};

// 1: {
//  southEast: { latitude: 38.99029118164155, longitude: -76.93799487382921 },
//  northWest: { latitude: 38.99048332497971, longitude: -76.938594790733 },
//},

// Floor bounds
const floorBounds = {
  1: {
    southEast: { latitude: 38.99029118164155, longitude: -76.93799487382921 },
    northWest: { latitude: 38.99048332497971, longitude: -76.938594790733 },
  },
  2: {
    southEast: { latitude: 38.99027686756154, longitude: -76.93776544244812 },
    northWest: { latitude: 38.99050068686733, longitude: -76.93859374854767 },
  },
  3: {
    southEast: { latitude: 38.99029118164155, longitude: -76.93799487382921 },
    northWest: { latitude: 38.99048332497971, longitude: -76.938594790733 },
  },
};

interface Props {
  cameraMap: Record<string, Camera>;
}



const roomPolygons: Room[] = [
  // FLOOR ONE 11111111
  {
    id: "outside",
    name: "outside",
    floor: { number: 1, name: "First Floor" },  // Updated with floor number and name, 
    polygon: [
      { x: 0, y: 0.930 },
      { x: 0.018, y: 0.930},
      { x: 0.018, y: 0},
      { x: 0, y: 0.0},
    ], // counterclockwise from top left
  },

  {
    id: "room-1101",
    name: "Room 1101",
    floor: { number: 1, name: "First Floor" },  // Updated with floor number and name, 
    polygon: [
      { x: 0.755 , y: 0.440 }, // top left
      { x: 0.755 , y: 0.005 }, // bottom left
      { x: 0.990 , y: 0.005 }, // bottom right
      { x: 0.990 , y: 0.455 }, // top right
    ], // counterclockwise from top left
  },
  {
    id: "room-1101AB",
    name: "Room 1101A/B",
    floor: { number: 1, name: "First Floor" }, 
      polygon: [
      { x: 0.688 , y: 0.632 },
      { x: 0.688 , y: 0.450 },
      { x: 0.770 , y: 0.450 },
      { x: 0.770 , y: 0.665 },
    ],
  },
  {
    id: "room-1101CE",
    name: "Room 1101C/E",
    floor: { number: 1, name: "First Floor" }, 
    polygon: [
      { x: 0.770 , y: 0.595 },
      { x: 0.770 , y: 0.450 },
      { x: 0.965 , y: 0.450 },
      { x: 0.965 , y: 0.595 },
    ],
  },
  {
    id: "room-1101D",
    name: "Room 1101D",
    floor: { number: 1, name: "First Floor" },  
    polygon: [
      { x: 0.770 , y: 0.595 },
      { x: 0.770 , y: 0.715 },
      { x: 0.900 , y: 0.785 },
      { x: 0.900 , y: 0.595 },
    ],
  },
  {
    id: "room-1103",
    name: "Room 1103",
    floor: { number: 1, name: "First Floor" }, 
    polygon: [
      { x: 0.665, y: 0.324 },
      { x: 0.665, y: 0.005 },
      { x: 0.755, y: 0.005 },
      { x: 0.755, y: 0.324 }, 
    ],
  },
  {
    id: "room-1107",
    name: "Room 1107",
    floor: { number: 1, name: "First Floor" }, 
    polygon: [
      { x: 0.480, y: 0.325 },
      { x: 0.480, y: 0.005 },
      { x: 0.665, y: 0.005 },
      { x: 0.665, y: 0.325 }, 
    ],
  },
  {
    id: "room-1109",
    name: "Room 1109",
    floor: { number: 1, name: "First Floor" }, 
    polygon: [
      { x: 0.365, y: 0.325 },
      { x: 0.365, y: 0.005 },
      { x: 0.480, y: 0.005 },
      { x: 0.480, y: 0.325 }, 
    ],
  },
  {
    id: "room-1110",
    name: "Bathrooms",
    floor: { number: 1, name: "First Floor" }, 
    polygon: [
      { x: 0.30, y: 0.705 },
      { x: 0.300, y: 0.920 },
      { x: 0.475, y: 0.920 },
      { x: 0.475, y: 0.705 }, 
    ],
  },
  {
    id: "room-1113",
    name: "Room ALeX Garage",
    floor: { number: 1, name: "First Floor" }, 
    polygon: [
      { x: 0.086, y: 0.005 },
      { x: 0.086, y: 0.488 },
      { x: 0.364, y: 0.488 },
      { x: 0.365, y: 0.005 }, 
    ],
  },
  {
    id: "room-1118",
    name: "Room 1118",
    floor: { number: 1, name: "First Floor" }, 
    polygon: [
      { x: 0.225, y: 0.705 },
      { x: 0.225, y: 0.920 },
      { x: 0.300, y: 0.920 },
      { x: 0.300, y: 0.705 }, 
    ],
  },
  {
    id: "room-1129ABC",
    name: "Room 1129/A/B/C",
    floor: { number: 1, name: "First Floor" }, 
    polygon: [
      { x: 0.018, y: 0.005 },
      { x: 0.018, y: 0.490 },
      { x: 0.086, y: 0.490 },
      { x: 0.086, y: 0.005 }, 
    ],
  },
  {
    id: "room-1191",
    name: "Room 1191",
    floor: { number: 1, name: "First Floor" }, 
    polygon: [
      { x: 0.018, y: 0.705 },
      { x: 0.018, y: 0.920 },
      { x: 0.065, y: 0.920 },
      { x: 0.065, y: 0.705 }, 
    ],
  },
  {
    id: "room-1192",
    name: "Room 1192",
    floor: { number: 1, name: "First Floor" }, 
    polygon: [
      { x: 0.065, y: 0.705 },
      { x: 0.065, y: 0.920 },
      { x: 0.115, y: 0.920 },
      { x: 0.115, y: 0.705 }, 
    ],
  },
  {
    id: "room-1193",
    name: "West Stairwell",
    floor: { number: 1, name: "First Floor" }, 
    polygon: [
      { x: 0.115, y: 0.705 },
      { x: 0.115, y: 0.920 },
      { x: 0.225, y: 0.920 },
      { x: 0.225, y: 0.705 }, 
    ],
  },
 
  {
    id: "room-1195",
    name: "Main Stairs",
    floor: { number: 1, name: "First Floor" }, 
    polygon: [
      { x: 0.360 , y: 0.535 },
      { x: 0.360 , y: 0.325 },
      { x: 0.625 , y: 0.325 },
      { x: 0.625 , y: 0.535 },
    ],
  },
  
  {
    id: "room-1196",
    name: "Room 1196",
    floor: { number: 1, name: "First Floor" }, 
    polygon: [
      { x: 0.475, y: 0.705 },
      { x: 0.475, y: 0.920 },
      { x: 0.510, y: 0.920 },
      { x: 0.510, y: 0.705 }, 
    ],
  },
  {
    id: "room-1198",
    name: "East Stairwell",
    floor: { number: 1, name: "First Floor" }, 
    polygon: [
      { x: 0.510, y: 0.675 },
      { x: 0.510, y: 0.920 },
      { x: 0.624, y: 0.920 },
      { x: 0.624, y: 0.675 }, 
    ],
  },
  {
    id: "hallway-right",
    name: "East Elevator",
    floor: { number: 1, name: "First Floor" }, 
    polygon: [
      { x: 0.310, y: 0.535 },
      { x: 0.310, y: 0.675 },
      { x: 0.624, y: 0.675 },
      { x: 0.624, y: 0.535 }, 
    ],
  },
  {
    id: "window-hallway",
    name: "window-hallway",
    floor: { number: 1, name: "First Floor" }, 
    polygon: [
      { x: 0.010, y: 0.480 },
      { x: 0.010, y: 0.7 },
      { x: 0.324, y: 0.7 },
      { x: 0.324, y: 0.480 }, 
    ],
  },
  {
    id: "room-1199",
    name: "Main Entry",
    floor: { number: 1, name: "First Floor" },  
    polygon: [
      { x: 0.635 , y: 0.610 },
      { x: 0.645 , y: 0.450 },
      { x: 0.690 , y: 0.450 },
      { x: 0.690 , y: 0.635 },
    ],
  },
  // FLOOR TWOOO
  {
    id: "roof",
    name: "Exterior Balcony",
    floor: { number: 2, name: "Second Floor" }, 
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
    floor: { number: 3, name: "Third Floor" }, 
    polygon: [
      { x: 0.865, y: 0.398 },
      { x: 0.865, y: 0.858 },
      { x: 0.970, y: 0.858 },
      { x: 0.935, y: 0.398 },
    ],
  },
  {
    id: "room-3110245",
    name: "Bathrooms",
    floor: { number: 3, name: "Third Floor" }, 
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
    floor: { number: 3, name: "Third Floor" }, 
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
    floor: { number: 3, name: "Third Floor" }, 
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
    floor: { number: 3, name: "Third Floor" }, 
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
    floor: { number: 3, name: "Third Floor" }, 
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
    floor: { number: 3, name: "Third Floor" }, 
    polygon: [
      { x: 0.210, y: 0.398 },
      { x: 0.210, y: 0.580 },
      { x: 0.360, y: 0.580 },
      { x: 0.360, y: 0.398 },
    ],
  },
  {
    id: "room-3119CD",
    name: "RAL Room C/D",
    floor: { number: 3, name: "Third Floor" }, 
    polygon: [
      { x: 0.080, y: 0.008 },
      { x: 0.080, y: 0.430 },
      { x: 0.210, y: 0.430 },
      { x: 0.210, y: 0.008 },
    ],
  },
  {
    id: "room-3119FE",
    name: "RAL Room F/E",
    floor: { number: 3, name: "Third Floor" }, 
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
    floor: { number: 3, name: "Third Floor" }, 
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
    floor: { number: 3, name: "Third Floor" }, 
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
    floor: { number: 3, name: "Third Floor" }, 
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
    floor: { number: 3, name: "Third Floor" }, 
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
    floor: { number: 3, name: "Third Floor" }, 
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
    floor: { number: 3, name: "Third Floor" }, 
    polygon: [
      { x: 0.074, y: 0.700 },
      { x: 0.074, y: 0.950 },
      { x: 0.144, y: 0.950 },
      { x: 0.144, y: 0.700 },
    ],
  },
  {
    id: "room-3193",
    name: "West Stairwell",
    floor: { number: 3, name: "Third Floor" }, 
    polygon: [
      { x: 0.144, y: 0.790 },
      { x: 0.144, y: 0.950 },
      { x: 0.300, y: 0.950 },
      { x: 0.300, y: 0.790 },
    ],
  },
  {
    id: "elevator-w3",
    name: "West Stairwell",
    floor: { number: 3, name: "Third Floor" }, 
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
    floor: { number: 3, name: "Third Floor" }, 
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
    floor: { number: 3, name: "Third Floor" }, 
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
    floor: { number: 3, name: "Third Floor" }, 
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
    floor: { number: 3, name: "Third Floor" }, 
    polygon: [
      { x: 0.705, y: 0.688 },
      { x: 0.705, y: 0.790 },
      { x: 0.865, y: 0.790 },
      { x: 0.865, y: 0.688 },
    ],
  },
];

interface Coordinate {
  latitude: number;
  longitude: number;
}

const [tappedCoordinates, setTappedCoordinates] = useState(null);

export default function TrackingPage() {
  const [cameraData, setCameraData] = useState<Camera[]>([]);
  const [currentFloor, setCurrentFloor] = useState<Floor>({
    number: 1,
    name: "Floor 1",
  });
  const [shooterDetected, setShooterDetected] = useState<boolean>(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 38.9904276, 
    longitude: -76.9381733,
    latitudeDelta: 0.0008,
    longitudeDelta: 0.0008,
  });


  useEffect(() => {
    // Create a listener to fetch the data from Firestore in real-time
    const unsubscribe = onSnapshot(
      collection(doc(db, "schools", "UMD"), "cameras"),
      (snapshot) => {
        const camerasFromFirestore: Camera[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            latitude: data.latitude,
            longitude: data.longitude,
            floor: data.floor,
            roomID: data.roomID,
            detected: data.detected, 
            confirmed: data.confirmed,
            building: data.building,
            shooter_detected: data.shooter_detected,
          };
        });

        // Update state with the real-time data
        setCameraData(camerasFromFirestore);
      }
    );

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []); 

  // Fetch camera data when the component mounts
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const cameras = await getCameras(); // Array of Camera objects
        setCameraData(cameras); // Set raw array if you still need it
  
        const cameraMap: Record<string, Camera> = {};
        cameras.forEach((cam) => {
          cameraMap[cam.id] = cam;
        });
  
        setCameraMap(cameraMap); // Set map version for quick lookup
      } catch (error) {
        console.error("Error fetching cameras:", error);
      }
    };
  
    fetchCameras();  // Call the function to fetch the cameras
  }, []); // Empty dependency array to run once on component mount

  const [cameraMap, setCameraMap] = useState<Record<string, Camera>>({});

  const handleFloorChange = (floorNumber: number) => {
    const floor = floors.find(f => f.number === floorNumber);
    const floorName = floor ? floor.name : "Unknown Floor";
    setCurrentFloor({ number: floorNumber, name: floorName });
  };

  const bounds = floorBounds[currentFloor.number as keyof typeof floorBounds];
  const toLatLng = (x: number, y: number) => {
    const originLat = bounds.southEast.latitude;
    const originLng = bounds.northWest.longitude;
    const lat = originLat + y * (bounds.northWest.latitude - originLat); // ↑ increases
    const lng = originLng + x * (bounds.southEast.longitude - originLng); // → increases
    return { latitude: lat, longitude: lng };
  };

// Ensure it's a tuple: [southwest, northeast] format
    const overlayBounds: [[number, number], [number, number]] = [
      [bounds.southEast.latitude, bounds.northWest.longitude],
      [bounds.northWest.latitude, bounds.southEast.longitude]
    ];




  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={(region) => setMapRegion(region)}
        >
        <Overlay
            key={floorImages[currentFloor.number]} // 👈 use the image URL or floor name as a unique key
            bounds={overlayBounds}
            image={floorImages[currentFloor.number]}
          />
{roomPolygons
  .filter((room) => room.floor.number === currentFloor.number)
  .map((room) => {
    // Find all cameras associated with the room
const camerasInRoom = cameraData.filter((cam) => cam.roomID === room.id);

// Determine the detection state for the room based on all associated cameras
const detected = camerasInRoom.some((camera) => camera.detected);

// Function to determine the polygon color based on detection status
const getPolygonColor = (cameras: any[]) => {
  // If any camera in the room has detected a shooter or weapon, return red
  if (cameras.some((camera) => camera.shooter_detected || camera.detected)) {
    return "rgba(255, 0, 0, 0.3)"; // Red if shooter or weapon detected
  }
  return "rgba(0, 255, 0, 0.2)"; // Green otherwise
};

// Get the fill color for the room based on the updated logic
const fillColor = getPolygonColor(camerasInRoom);

    const handlePolygonPress = () => {
      console.log(`Polygon clicked: ${room.name}`); // Assuming each room has a `name` property
    };

    return (
      <Polygon
        key={room.id}
        coordinates={room.polygon.map((p) => toLatLng(p.x, p.y))}
        strokeColor="white"
        fillColor={fillColor} // Apply the dynamic fill color based on detection
        strokeWidth={2}
        zIndex={3}
        onPress={handlePolygonPress} // Optional: Handle polygon press
      />
    );
  })}

          {/* Show room name as a Callout when a room is tapped */}
          {cameraData.map((cam) => (
            <React.Fragment key={cam.id}>
              <Marker
                coordinate={{ latitude: cam.latitude, longitude: cam.longitude }}
                zIndex={3}
              >
                <Callout>
                  <Text>{cam.name}</Text>
                </Callout>
              </Marker>
              <Circle
                center={{ latitude: cam.latitude, longitude: cam.longitude }}
                radius={4}
                strokeColor={cam.detected ? "rgba(255,0,0,0.9)" : "rgba(0,255,0,0.4)"}
                fillColor={cam.detected ? "rgba(255,0,0,0.2)" : "rgba(0,255,0,0.1)"}
                zIndex={2}
              />
            </React.Fragment>
          ))}
        </MapView>
      </View>

      {/* Control Section for Floor Selection and Camera List */}
      <View style={styles.controlSection}>
        {/* Floor selection buttons */}
        <View style={styles.floorButtonGroup}>
          <Text style={styles.title}>Select Floor:</Text>
          {[1, 2, 3].map((floorNumber) => (
            <Button
              key={floorNumber}
              title={`Floor ${floorNumber}`}
              onPress={() => handleFloorChange(floorNumber)} // Pass the numeric floor number
            />
          ))}
        </View>

        <View style={styles.cameraInfoGroup}>
          <Text style={styles.title}>Cameras:</Text>
          <FlatList
              data={cameraData.filter((camera) => camera.floor === currentFloor.number)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isThreatDetected = item.detected || item.shooter_detected;

                return (
                  <View style={styles.cameraContainer}>
                    <Text style={{ color: isThreatDetected ? "red" : "green" }}>
                      {item.name} : {item.roomID || "No Room ID"}
                    </Text>
                  </View>
                );
              }}
            />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", paddingTop: 40 },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
  mapContainer: {flex: 1, height: "50%", borderRadius: 10, margin: 16, overflow: "hidden"},
  map: { flex: 1, zIndex: 2 },
  controlSection: { flex: 1, flexDirection: "row", paddingHorizontal: 16 },
  floorButtonGroup: { flex: 1, paddingRight: 8, justifyContent: "flex-start", gap: 8},
  cameraInfoGroup: { flex: 1, paddingLeft: 8, justifyContent: "center", overflow: "scroll",},
  cameraContainer: { flexDirection: "row", marginBottom: 8, justifyContent: "flex-start" },
  cameraImage: { width: 40, height: 40, marginRight: 8, borderRadius: 50 },
});
