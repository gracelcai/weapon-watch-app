import React from "react";
import { Stack, usePathname } from "expo-router";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Notifications from 'expo-notifications';
import { NotificationProvider } from "@/context/NotificationContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname(); // Get current page

  const isActive = (path: string) => pathname === path;

  // Hide the bottom navigation bar on the home, login, and landing page
  const shouldShowNavBar = !["/", "/screens/settings", "/screens/login", "/screens/signup", "/screens/home", "/screens/student_notifications", "/screens/student_settings"].includes(pathname);

  return (
    <NotificationProvider>
      <Stack screenOptions={{ headerShown: false }} />

      {/* Show Bottom Navigation Bar only if not on home, login, or landing */}
      {shouldShowNavBar && (
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.push("/screens/tracking")} style={styles.navItem}>
            <FontAwesome5 name="map-marker-alt" size={24} color={isActive("/screens/tracking") ? "#fff" : "#777"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/screens/cameras")} style={styles.navItem}>
            <FontAwesome5 name="video" size={24} color={isActive("/screens/cameras") ? "#fff" : "#777"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/screens/verification")} style={styles.navItem}>
            <FontAwesome5 name="shield-alt" size={24} color={isActive("/screens/verification") ? "#fff" : "#777"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/screens/admin_notifications")} style={styles.navItem}>
            <FontAwesome5 name="bell" size={24} color={isActive("/screens/admin_notifications") ? "#fff" : "#777"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/screens/settings")} style={styles.navItem}>
            <FontAwesome5 name="cog" size={24} color={isActive("/screens/settings") ? "#fff" : "#777"} />
          </TouchableOpacity>
        </View>
      )}
    </NotificationProvider>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#000",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#222",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 20,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
  },
});
