import Constants from 'expo-constants';

const { FIREBASE_API_KEY, 
        FIREBASE_AUTH_DOMAIN, 
        FIREBASE_PROJECT_ID, 
        FIREBASE_STORAGE_BUCKET, 
        FIREBASE_MESSAGING_SENDER_ID, 
        FIREBASE_APP_ID, 
        FIREBASE_MEASUREMENT_ID
 } = Constants.expoConfig.extra;


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { db };