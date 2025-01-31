import React from "react";
import { Stack, usePathname } from "expo-router";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname(); // Get current page

  const isActive = (path: string) => pathname === path;

  // Hide the bottom navigation bar on the home, login, and landing page
  const shouldShowNavBar = !["/", "/login", "/home", "/student_dashboard", "/student_notifications", "/student_settings"].includes(pathname);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />

      {/* Show Bottom Navigation Bar only if not on home, login, or landing */}
      {shouldShowNavBar && (
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.push("/tracking")} style={styles.navItem}>
            <FontAwesome5 name="map-marker-alt" size={24} color={isActive("/tracking") ? "#fff" : "#777"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/cameras")} style={styles.navItem}>
            <FontAwesome5 name="video" size={24} color={isActive("/cameras") ? "#fff" : "#777"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/admin_notifications")} style={styles.navItem}>
            <FontAwesome5 name="bell" size={24} color={isActive("/notifications") ? "#fff" : "#777"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/settings")} style={styles.navItem}>
            <FontAwesome5 name="cog" size={24} color={isActive("/settings") ? "#fff" : "#777"} />
          </TouchableOpacity>
        </View>
      )}
    </>
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
