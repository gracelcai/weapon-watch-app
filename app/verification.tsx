import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Verification() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Verification Placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000", 
    padding: 16,
    paddingTop: 65,
    paddingBottom: 20},
  text: { color: "#fff", fontSize: 16 },
});