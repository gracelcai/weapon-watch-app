import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useNotification } from '@/context/NotificationContext';
export default function StudentNotifications() {
  const router = useRouter();
  const {notification, expoPushToken, error } = useNotification();
  if (error){
    return <Text>Error: {error.message}</Text>
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NOTIFICATIONS</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="Search..." placeholderTextColor="#aaa" />
      </View>

      {/* Notifications List */}
      <ScrollView contentContainerStyle={styles.notificationList}>
        <View style={[styles.notificationItem, styles.allClear]}>
          <Text style={styles.notificationTitle}>ALL CLEAR</Text>
          <Text style={styles.notificationTime}>3:17 PM</Text>
          <Text style={styles.notificationText}>
            The situation has been resolved. Normal operations may resume. Thank you for your cooperation.
          </Text>
          <TouchableOpacity>
            <Text style={styles.tapToView}>Tap to view.</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.notificationItem, styles.alert]}>
          <Text style={styles.notificationTitleRed}>MODIFIED LOCKDOWN</Text>
          <Text style={styles.notificationTime}>2:55 PM</Text>
          <Text style={styles.notificationText}>
            A security threat has been identified. Please remain indoors, secure doors and windows.
          </Text>
          <TouchableOpacity>
            <Text style={styles.tapToView}>Tap to view.</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.notificationItem, styles.alert]}>
          <Text style={styles.notificationTitleRed}>SHELTER IN PLACE</Text>
          <Text style={styles.notificationTime}>2:40 PM</Text>
          <Text style={styles.notificationText}>
            This is a precautionary measure. All students and faculty must stay in their classrooms. Await further instructions.
          </Text>
          <TouchableOpacity>
            <Text style={styles.tapToView}>Tap to view.</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 16, paddingTop: 0},
  title: { color: "#fff", fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
  searchContainer: { backgroundColor: "#222", borderRadius: 10, padding: 10, marginBottom: 20 },
  searchInput: { color: "#fff", fontSize: 16 },
  notificationList: { paddingBottom: 80 },
  notificationItem: { backgroundColor: "#333", padding: 12, borderRadius: 8, marginBottom: 10 },
  alert: { backgroundColor: "#450000" },
  allClear: { backgroundColor: "#666" },
  notificationTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  notificationTitleRed: { color: "#ff4444", fontSize: 16, fontWeight: "bold" },
  notificationTime: { color: "#bbb", fontSize: 12, textAlign: "right" },
  notificationText: { color: "#fff", fontSize: 14, marginVertical: 5 },
  tapToView: { color: "#ff6666", fontSize: 14, textDecorationLine: "underline" },
  dashboardButton: { marginTop: 20, alignSelf: "center", paddingBottom: 20},
  dashboardButtonText: { color: "#fff", fontSize: 16},
});
