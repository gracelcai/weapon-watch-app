import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function AdminNotifications() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NOTIFICATIONS</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="Search..." placeholderTextColor="#aaa" />
      </View>

      {/* Notifications List */}
      <ScrollView contentContainerStyle={styles.notificationList}>
        <View style={[styles.notificationItem, styles.urgent]}>
          <Text style={styles.notificationTitle}>URGENT ALERT</Text>
          <Text style={styles.notificationTime}>2:45 PM</Text>
          <Text style={styles.notificationText}>
            Verification Required! Incident in progress at Silver Oak High School.
          </Text>
          <TouchableOpacity>
            <Text style={styles.tapToView}>Tap to view.</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.notificationItem, styles.urgent]}>
          <Text style={styles.notificationTitle}>WEAPON DETECTED</Text>
          <Text style={styles.notificationTime}>2:36 PM</Text>
          <Text style={styles.notificationText}>
            Verification Required! Further action might be required.
          </Text>
          <TouchableOpacity>
            <Text style={styles.tapToView}>Tap to view.</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.notificationItem]}>
          <Text style={styles.notificationTitle}>Notification Delivered</Text>
          <Text style={styles.notificationTime}>10:15 AM</Text>
          <Text style={styles.notificationText}>
            "All Clear" alert initiated at 10:05 AM, 1/24/25 was delivered to all users.
          </Text>
          <TouchableOpacity>
            <Text style={styles.tapToView}>Tap to view.</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Create Notification Button */}
      <TouchableOpacity style={styles.createButton}>
        <Text style={styles.createButtonText}>CREATE</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16,
    paddingTop: 60,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  searchContainer: {
    backgroundColor: "#222",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  searchInput: {
    color: "#fff",
    fontSize: 16,
  },
  notificationList: {
    paddingBottom: 80, // Extra space for the create button
  },
  notificationItem: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  urgent: {
    backgroundColor: "#660000",
  },
  notificationTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  notificationTime: {
    color: "#bbb",
    fontSize: 12,
    textAlign: "right",
  },
  notificationText: {
    color: "#fff",
    fontSize: 14,
    marginVertical: 5,
  },
  tapToView: {
    color: "#ff6666",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  createButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 20,
    left: "35%",
    width: "30%",
  },
  createButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});
