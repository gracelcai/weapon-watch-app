import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc, updateDoc } from "firebase/firestore";

/**
 * Creates a new user with email and password, updates their profile,
 * and stores additional user data in Firestore.
 *
 * @param {string} name - The user's display name.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's chosen password.
 * @param {string} role - The user's role (admin, teachers, police).
 * @param {string} schoolId - The associated school Id.
 * @returns {Promise<void>}
 */
export const addUser = async (name, email, password, isAdmin, schoolId) => {
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
      isAdmin,
      schoolId,
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
 * @param {string} userId - The Firebase Auth user ID.
 * @param {object} data - An object containing the fields to update.
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
