import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";


/**
 * Creates a new user with email and password, updates their profile, and stores additional user data in Firestore.
 *
 * @param {string} name - The name of the user.
 * @param {string} email - The email of the user.
 * @param {string} password - The password for the user.
 * @param {boolean} isAdmin - Whether the user is an admin or not.
 * @param {string} schoolId - The ID of the school associated with the user.
 * @param {string | null} expoPushToken - Token to send user notifications
 * @returns {Promise<void>}
 */
export const addUser = async (name, email, password, isAdmin, schoolId, expoPushToken) => {
  try {
    // Create the user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user's display name in Firebase Auth
    await updateProfile(user, { displayName: name });
    
    // Store additional user data in Firestore under a "users" collection
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      isAdmin: false,
      schoolId,
      expoPushToken,
      createdAt: new Date()
    });
    
    console.log("User successfully added:", user.uid);
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

/**
 * Updates an existing user's data in Firestore.
 *
 * @param {string} userId - The ID of the user to update.
 * @param {Object} data - The data to update (e.g., name, email, isAdmin).
 * @returns {Promise<void>}
 */
export const updateUser = async (userId, data) => {
  try {
    // Update the user document in Firestore
    await updateDoc(doc(db, 'users', userId), data);
    console.log("User successfully updated:", userId);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

/**
 * Retrieves user data from Firestore for the given UID.
 *
 * @param {string} uid - The user's UID.
 * @returns {Promise<Object>} - A promise that resolves to the user data object.
 * @throws Will throw an error if the document does not exist.
 */
export const getUser = async (uid) => {
  const userDocRef = doc(db, "users", uid);
  const userDocSnap = await getDoc(userDocRef);
  if (userDocSnap.exists()) {
    return userDocSnap.data();
  } else {
    throw new Error("User data not found in Firestore.");
  }
};

/**
 * Signs in a user using a Google ID token.
 *
 * @param {string} idToken - The Google ID token obtained from your Google auth flow.
 * @returns {Promise<import("firebase/auth").UserCredential>} A promise that resolves with the Firebase user credential.
 */
export const signInWithGoogle = async (idToken) => {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    return await signInWithCredential(auth, credential);
  } catch (error) {
    throw error;
  }
};