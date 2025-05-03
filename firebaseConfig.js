import Constants from "expo-constants";
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getAuth } from "firebase/auth";
import { getReactNativePersistence } from '@firebase/auth/dist/rn/index.js';
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";


// Extract Firebase configuration from Expo constants
const {
	FIREBASE_API_KEY,
	FIREBASE_AUTH_DOMAIN,
	FIREBASE_PROJECT_ID,
	FIREBASE_STORAGE_BUCKET,
	FIREBASE_MESSAGING_SENDER_ID,
	FIREBASE_APP_ID,
	FIREBASE_MEASUREMENT_ID,
} = Constants.expoConfig?.extra || {};

// Firebase configuration object
const firebaseConfig = {
	apiKey: FIREBASE_API_KEY,
	authDomain: FIREBASE_AUTH_DOMAIN,
	projectId: FIREBASE_PROJECT_ID,
	storageBucket: FIREBASE_STORAGE_BUCKET,
	messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
	appId: FIREBASE_APP_ID,
	measurementId: FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase app (ensure it's only initialized once)
const app =
	getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
console.log("Firebase app instance:", app);
// Initialize Firestore
const db = getFirestore(app);

console.log("Before initializing Auth");
let auth;
try {
    // auth = initializeAuth(app, {
    //     persistence: AsyncStorage,
    // });
	auth = initializeAuth(app, {
		persistence: getReactNativePersistence(AsyncStorage),
	});
	// auth = getAuth(app);
    console.log("Auth initialized successfully:", auth);
} catch (error) {
    console.error("Error initializing Auth:", error);
}
// 
console.log("After initializing Auth");
// Initialize Analytics if supported
isSupported().then((supported) => {
	if (supported) {
		const analytics = getAnalytics(app);
		// Use analytics as needed
	}
});


// Export Firebase services
export { auth, db, app };
