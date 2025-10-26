// import React, { useEffect, useState } from "react";
// import { Stack, useRouter, usePathname, Slot } from "expo-router";
// import { View, TouchableOpacity, StyleSheet } from "react-native";
// import { FontAwesome5 } from "@expo/vector-icons";
// import * as Notifications from "expo-notifications";
// import { NotificationProvider } from "@/context/NotificationContext";

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowBanner: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//     shouldShowList: true, 
//     priority: Notifications.AndroidNotificationPriority.MAX,
//   }),
// });

// export default function RootLayout() {
//   const router = useRouter();
//   const pathname = usePathname(); // Get current page
//   const isActive = (path: string) => pathname === path;
//   const [isMounted, setIsMounted] = useState(false);

//   // Hide the bottom navigation bar on specific pages
//   const shouldShowNavBar = !["/", "/screens/settings", "/screens/login", "/screens/signup", "/screens/home", "/screens/notifications_student", "/screens/verification_transfer"].includes(pathname);
//   // useEffect(() => {
//   //   // Navigate to the home page (adjust the path if needed)
//   //   router.push("/screens/home");
//   // }, []);
//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   useEffect(() => {
//     if (isMounted && pathname === "/") {
//       router.push("/screens/home");
//     }
//   }, [isMounted, pathname]);

//   return (
//     <NotificationProvider>
//       {/* Render child routes */}
//       <Slot />
//       {/* Show Bottom Navigation Bar only if not on home, login, or landing */}
//       {shouldShowNavBar && (
//         <View style={styles.navBar}>
//           <TouchableOpacity onPress={() => router.push("/screens/tracking")} style={styles.navItem} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
//             <FontAwesome5 name="map-marker-alt" size={32} color={isActive("/screens/tracking") ? "#fff" : "#777"} />
//           </TouchableOpacity>

//           <TouchableOpacity onPress={() => router.push("/screens/cameras")} style={styles.navItem} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
//             <FontAwesome5 name="video" size={32} color={isActive("/screens/cameras") ? "#fff" : "#777"} />
//           </TouchableOpacity>

//           <TouchableOpacity onPress={() => router.push("/screens/verification")} style={styles.navItem} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
//             <FontAwesome5 name="shield-alt" size={32} color={isActive("/screens/verification") ? "#fff" : "#777"} />
//           </TouchableOpacity>

          // {/* <TouchableOpacity onPress={() => router.push("/screens/notifications_admin")} style={styles.navItem}>
          //   <FontAwesome5 name="bell" size={24} color={isActive("/screens/admin_notification_admin") ? "#fff" : "#777"} />
          // </TouchableOpacity> */}

//           {/* <TouchableOpacity onPress={() => router.push("/screens/settings")} style={styles.navItem}>
//             <FontAwesome5 name="cog" size={24} color={isActive("/screens/settings") ? "#fff" : "#777"} />
//           </TouchableOpacity> */}
//         </View>
//       )}
//     </NotificationProvider>
//   );
// }

// const styles = StyleSheet.create({
//   navBar: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     backgroundColor: "#000",
//     paddingVertical: 10,
//     borderTopWidth: 1,
//     borderTopColor: "#222",
//     position: "absolute",
//     left: 0,
//     right: 0,
//     bottom: 0,
//   },
//   navItem: {
//     flex: 1,
//     alignItems: "center",
//   },
// });

import React, { useEffect, useState } from "react";
import { Stack, useRouter, usePathname, Slot } from "expo-router";
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Text, 
  Animated, 
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { NotificationProvider } from "@/context/NotificationContext";
import { auth, db, storage } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowList: true, 
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const [isMounted, setIsMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const slideAnim = useState(new Animated.Value(-Dimensions.get('window').width))[0];

  // Hide the bottom navigation bar on specific pages
  const shouldShowNavBar = !["/", "/screens/settings", "/screens/login", "/screens/signup", "/screens/home", "/screens/verification_transfer"].includes(pathname);
  
  // Only show hamburger menu when nav bar is visible (after login)
  const shouldShowHamburger = shouldShowNavBar;
  
  useEffect(() => {
    setIsMounted(true);
    
    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch user data from Firestore
        fetchUserData(user.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isMounted && pathname === "/") {
      router.push("/screens/home");
    }
  }, [isMounted, pathname]);

  useEffect(() => {
    // Animate drawer in/out
    Animated.timing(slideAnim, {
      toValue: isDrawerOpen ? 0 : -Dimensions.get('window').width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isDrawerOpen]);

  const fetchUserData = async (uid: string) => {
    try {
      setLoading(true);
      const userDoc = doc(db, "users", uid);
      const userSnapshot = await getDoc(userDoc);
      
      if (userSnapshot.exists()) {
        setUserData(userSnapshot.data());
      } else {
        console.log("No user data found");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const navigateTo = (path: string) => {
    closeDrawer();
    router.push(path);
  };

  const handleSignOut = async () => {
  // Show confirmation dialog
  Alert.alert(
    "Confirm Sign Out",
    "Are you sure you want to sign out?",
    [
      {
        text: "Cancel",
        style: "cancel"
      },
      { 
        text: "Sign Out", 
        onPress: async () => {
          try {
            await auth.signOut();
            closeDrawer();
            router.push("/screens/login");
          } catch (error) {
            console.error("Error signing out:", error);
            // Optional: Show error message to user
            Alert.alert("Error", "Failed to sign out. Please try again.");
          }
        }
      }
    ]
  );
};

  return (
    <NotificationProvider>
      <SafeAreaView style={styles.container}>
        {/* Header with hamburger menu - only show when nav bar is visible */}
        {shouldShowHamburger && (
          <View style={styles.header}>
            <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
              <Ionicons name="menu" size={42} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerPlaceholder} />
          </View>
        )}

        {/* Drawer overlay */}
        {isDrawerOpen && (
          <TouchableOpacity 
            style={styles.overlay}
            onPress={closeDrawer}
            activeOpacity={1}
          />
        )}

        {/* Drawer panel */}
        <Animated.View 
          style={[
            styles.drawer,
            {
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          <View style={styles.drawerContent}>
            {/* User info section */}
            <View style={styles.userSection}>
              <View style={styles.userAvatar}>
                <FontAwesome5 name="user" size={40} color="#fff" />
              </View>
              
              {loading ? (
                <ActivityIndicator size="small" color="#fff" style={styles.loadingIndicator} />
              ) : (
                <>
                  <Text style={styles.userName}>
                    {userData?.name || currentUser?.displayName || "User"}
                  </Text>
                  <Text style={styles.userEmail}>
                    {currentUser?.email || "No email available"}
                  </Text>
                </>
              )}
            </View>

            <View style={styles.divider} />

            {/* Settings option at bottom */}
            <TouchableOpacity 
              style={styles.settingsOption}
              hitSlop={{ top: 6, bottom: 6, left: 12, right: 12 }}
              onPress={() => navigateTo("/screens/settings")}
            >
              <Ionicons name="settings-outline" size={32} color="#fff" />
              <Text style={styles.settingsText}>Settings</Text>
            </TouchableOpacity>
            
            {/* Sign out option */}
            <TouchableOpacity 
              style={styles.signOutOption}
              hitSlop={{ top: 6, bottom: 6, left: 12, right: 12 }}
              onPress={handleSignOut}
            >
              <Ionicons name="log-out-outline" size={32} color="#fff" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Render child routes */}
        <View style={styles.content}>
          <Slot />
        </View>

        {/* Show Bottom Navigation Bar only if not on home, login, or landing */}
        {shouldShowNavBar && (
          <View style={styles.navBar}>
            {userData?.isAdmin === true && (
                  <TouchableOpacity onPress={() => router.push("/screens/tracking")} style={styles.navItem} hitSlop={{ top: 12, bottom: 12, left: 6, right: 6 }}>
                    <FontAwesome5 name="map-marker-alt" size={32} color={isActive("/screens/tracking") ? "#fff" : "#777"} />
                  </TouchableOpacity>
            )}

            {userData?.isAdmin === true && (
                  <TouchableOpacity onPress={() => router.push("/screens/verification")} style={styles.navItem} hitSlop={{ top: 12, bottom: 12, left: 6, right: 6 }}>
                    <FontAwesome5 name="shield-alt" size={32} color={isActive("/screens/verification") ? "#fff" : "#777"} />
                  </TouchableOpacity>
            )}            

            <TouchableOpacity 
              onPress={() => router.push("/screens/notifications_admin")} 
              style={styles.navItem} 
              hitSlop={{ top: 12, bottom: 12, left: 6, right: 6 }}
            >
              <FontAwesome5 
                name="bell" 
                size={32} 
                color={isActive("/screens/notifications_admin") ? "#fff" : "#777"} 
              />
            </TouchableOpacity>
            
          </View>
        )}
      </SafeAreaView>
    </NotificationProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuButton: {
    padding: 4,
  },
  headerPlaceholder: {
    width: 28,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: Dimensions.get('window').width * 0.75, // 75% of screen width
    backgroundColor: '#121212', // Dark theme background
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  userSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333', // Dark theme avatar background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#fff', // White text for dark theme
  },
  userEmail: {
    fontSize: 14,
    color: '#aaa', // Lighter gray for email
  },
  divider: {
    height: 1,
    backgroundColor: '#333', // Dark divider
    marginVertical: 20,
  },
  settingsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    position: 'absolute',
    bottom: 90,
    left: 20,
  },
  settingsText: {
    fontSize: 18,
    marginLeft: 12,
    color: '#fff', // White text for dark theme
  },
  signOutOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  signOutText: {
    fontSize: 18,
    marginLeft: 12,
    color: '#fff', // White text for dark theme
  },
  content: {
    flex: 1,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#000",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
  },
  loadingIndicator: {
    marginVertical: 10,
  },
});