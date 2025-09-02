import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useNotification } from '@/context/NotificationContext';

export default function AdminNotifications() {
  const router = useRouter();
  const { notifications, expoPushToken, error, markAsRead, clearAllNotifications } = useNotification();

  // Format date to display time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  if (error) {
    return <Text style={styles.errorText}>Error: {error.message}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NOTIFICATIONS</Text>

      {/* Clear All Button */}
      {notifications.length > 0 && (
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={clearAllNotifications}
        >
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      )}

      {/* Notifications List */}
      <ScrollView contentContainerStyle={styles.notificationList}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No notifications yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Notifications will appear here when received
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              onPress={() => markAsRead(notification.id)}
            >
              <View 
                style={[
                  styles.notificationItem, 
                  notification.isUrgent && styles.urgent,
                  notification.read && styles.read
                ]}
              >
                {!notification.read && <View style={styles.unreadIndicator} />}
                <Text style={styles.notificationTitle}>
                  {notification.title.toUpperCase()}
                </Text>
                <Text style={styles.notificationDate}>
                  {formatDate(notification.date)} at {formatTime(notification.date)}
                </Text>
                <Text style={styles.notificationText}>
                  {notification.body}
                </Text>
                <Text style={styles.tapToView}>Tap to mark as read.</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16,
    paddingTop: 0,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16
  },
  tokenContainer: {
    backgroundColor: "#222",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  tokenLabel: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 4,
  },
  tokenText: {
    color: "#ff6666",
    fontSize: 12,
  },
  clearButton: {
    backgroundColor: "#444",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  notificationList: {
    paddingBottom: 80 // Extra space for the create button
  },
  notificationItem: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    position: "relative",
  },
  urgent: {
    backgroundColor: "#660000",
  },
  read: {
    opacity: 0.7,
  },
  unreadIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff6666",
  },
  notificationTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 15, // Space for unread indicator
  },
  notificationDate: {
    color: "#bbb",
    fontSize: 12,
    marginTop: 4,
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
  notificationData: {
    color: "#ccc",
    fontSize: 12,
    marginTop: 5,
    fontFamily: 'monospace',
  },
  tapToView: {
    color: "#ff6666",
    fontSize: 14,
    textDecorationLine: "underline",
    marginTop: 5,
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
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyStateText: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: "#bbb",
    fontSize: 14,
    textAlign: "center",
  },
});