/*
import React from "react";
import { View, StyleSheet } from "react-native";
import { useSearchParams } from "expo-router";
import Video from "react-native-video";

export default function LiveFootage() {
  const { url } = useSearchParams();

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: url }} // Use the RTSP URL passed from the camera management page
        style={styles.video}
        controls
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  video: { flex: 1 },
});
*/