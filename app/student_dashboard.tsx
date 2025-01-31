import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";

export default function StudentDashboard() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image source={require("../red-white-logo.png")} style={styles.logo} />
      <Text style={styles.title}>DASHBOARD</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push("/student_notifications")}>
        <Text style={styles.buttonText}>NOTIFICATIONS</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push("/student_settings")}>
        <Text style={styles.buttonText}>SETTINGS</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logout} onPress={() => router.push("/login")}>
        <Text style={styles.logoutText}>LOGOUT</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  logo: { width: 150, height: 150, resizeMode: "contain", marginBottom: 20 },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  button: { backgroundColor: "#444", padding: 15, borderRadius: 8, marginVertical: 5, width: "80%", alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold"},
  logout: { marginTop: 20 },
  logoutText: { color: "#ff4d4d", fontSize: 16 },
});
