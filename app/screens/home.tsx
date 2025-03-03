import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Link } from "expo-router";

export default function Home() {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../../assets/images/red-white-logo.png")}
        style={styles.logo}
      />

      {/* Title */}
      <Text style={styles.title}>WEAPON WATCH</Text>

      {/* Button */}
      <TouchableOpacity style={styles.button}>
        <Link href="/screens/login" style={styles.buttonText}>
          LOGIN
        </Link>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  logo: {
    width: 160,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#888",
    padding: 16,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
});


