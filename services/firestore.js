import { createUserWithEmailAndPassword, updateProfile, deleteUser, getAuth } from "firebase/auth";
import { auth, db, database } from "../firebaseConfig";
import { doc, setDoc, updateDoc, getDoc, runTransaction, arrayUnion,} from "firebase/firestore";
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";


/**
 * Creates a new user with email and password, updates their profile, and stores additional user data in Firestore.
 *
 * @param {string} name - The name of the user.
 * @param {string} email - The email of the user.
 * @param {string} password - The password for the user.
 * @param {boolean} isAdmin - Whether the user is an admin or not.
 * @param {boolean} isVerifier - Whether the user is a verifier or not.
 * @param {string} schoolId - The ID of the school associated with the user.
 * @param {string | null} expoPushToken - Token to send user notifications
 * @returns {Promise<void>}
 */
export const addUser = async (name, email, password, isAdmin, isVerifier, schoolId, expoPushToken) => {
  let user; // Declare user outside the try block for cleanup in case of errors
  try {
    // Create a new user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    user = userCredential.user;

    // Update the user's display name in Firebase Auth
    await updateProfile(user, { displayName: name });

    // Build the document references
    const userRef = doc(db, "users", user.uid);
    const schoolRef = doc(db, "schools", schoolId);

    // Add user data to Firestore
    await setDoc(userRef, {
      name,
      email,
      schoolId,
      isAdmin: isAdmin,
      isVerifier: false,
      expoPushToken: expoPushToken || null,
      createdAt: new Date(),
    });

    // Add the user reference to the school's users array
    await updateDoc(schoolRef, { users: arrayUnion(userRef) });

    console.log("User successfully added:", user.uid);
  } catch (error) {
    // If an error occurs, delete the user to avoid orphaned accounts
    if (user) {
      await deleteUser(user).catch(() => {
        console.error("Failed to delete user after error:", error);
      });
    }
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

/**
 * Retrieves a user document from Firestore by email address.
 *
 * @param {string} email - The email address to look for.
 * @returns {Promise<Object|null>} Resolves to an object containing the uid and the document data if found, or null if not found.
 */
export const getUserByEmail = async (email) => {
  // Create a reference to the "users" collection.
  const usersRef = collection(db, "users");
  
  // Create a query where the "email" field equals the provided email.
  const q = query(usersRef, where("email", "==", email));
  
  // Execute the query.
  const querySnapshot = await getDocs(q);
  
  // If no documents match, return null.
  if (querySnapshot.empty) {
    return null;
  }
  
  // Assume email is unique; return the first matching document.
  const docSnapshot = querySnapshot.docs[0];
  return { uid: docSnapshot.id, ...docSnapshot.data() };
};


/**
 * Adds or updates a camera document in Firestore with the specified fields.
 *
 * @param {string} cameraId - The unique identifier for the camera. (Ggenerate this from the name and floor.)
 * @param {Object} cameraData - An object containing camera information.
 * @param {number} cameraData.floor - The floor on which the camera is located.
 * @param {string} cameraData.name - A descriptive name for the camera.
 * @param {string} cameraData.location - More details about the camera's location.
 * @param {string} cameraData.video_type - The type of video stream, e.g. "rtsp".
 * @param {string} cameraData.video_link - The RTSP URL.
 * @param {boolean} [cameraData.isDetected=false] - Whether the camera currently detects activity (default false).
 * @param {boolean} [cameraData.isConfirmed=false] - Whether any detection has been confirmed (default false).
 *
 * @returns {Promise<boolean>} Returns true if the document was added/updated successfully.
 */
export const addCamera = async (cameraId, cameraData) => {
  try {
    await setDoc(doc(db, "cameras", cameraId), {
      floor: cameraData.floor,
      name: cameraData.name,
      location: cameraData.location,
      video_type: cameraData.video_type,
      video_link: cameraData.video_link,
      isDetected: cameraData.isDetected ?? false,
      isConfirmed: cameraData.isConfirmed ?? false,
      createdAt: new Date(),
    });

    console.log("Camera successfully added/updated:", cameraId);
    return true;
  } catch (error) {
    console.error("Error adding camera:", error);
    throw error;
  }
};


export const updateCamera = async (cameraId, updatedData) => {
  try {
    await updateDoc(doc(database, 'cameras', cameraId), {
      confirmed: updatedData.confirmed,
      detected: updatedData.detected,
      longitude: updatedData.longitude,
      latitude: updatedData.latitude,
      building: updatedData.building,
      name: updatedData.name,
      coverageRadius: updatedData.coverageRadius,
      floor: updatedData.floor,
      roomID: updatedData.roomID,
    });
    console.log(`Camera with ID ${cameraId} updated successfully.`);
  } catch (error) {
    console.error('Error updating camera: ', error);
  }
};

export function listenToCameras(callback) {
  const camerasCollectionRef = collection(doc(db, "schools", "UMD"), "cameras");

  const unsubscribe = onSnapshot(camerasCollectionRef, (snapshot) => {
    const cameras = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(cameras);
  });

  return unsubscribe; 
};

/**
 * Fetches all camera documents from the "cameras" collection in Firestore.
 *
 * @returns {Promise<Array<Object>>} An array of camera objects including their ID.
 */
export async function getCameras() {
  try {
    const snapshot = await getDocs(collection(doc(db, "schools", "UMD"), "cameras"));
    const cameras = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,  // Use Firestore document ID as the unique key
        confirmed: data.confirmed ?? false,  // Default to false if missing
        detected: data.detected ?? false,    // Default to false if missing
        longitude: data.longitude ?? 0,      // Default to 0 if missing
        latitude: data.latitude ?? 0,        // Default to 0 if missing
        building: data.building ?? "",       // Default to empty string if missing
        name: data.name ?? "",               // Default to empty string if missing
        coverageRadius: data.coverageRadius ?? 50,  // Default to 50 if missing
        floor: data.floor ?? 1,              // Default to 1 if missing
        roomID: data.roomID
      };
    });
    return cameras;  // Return the array of cameras with proper defaults
  } catch (error) {
    console.error("FROM FIRESTORE Error fetching cameras:", error);
    return [];  // Return an empty array on error to avoid crashing map()
  }
}

/**
 * Fetch all cameras that belong to the signed-in user’s school.
 * Assumes the user doc has a `schoolId` field (e.g. "UMD").
 * 
 * @returns {Promise<Array<Object>>} An array of camera objects including their ID.
 */
export const getCamerasSchool = async () => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not signed in");

  // read the user profile to discover their schoolId
  const userData = await getUser(uid);
  const schoolId = userData.schoolId;
  if (!schoolId) throw new Error("No schoolId on user profile");

  // query schools/{schoolId}/cameras
  const camsSnap = await getDocs(
    collection(db, "schools", schoolId, "cameras")
  );

  // return plain JS objects (include the doc id)
  return camsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Checks if a school exists in Firestore.
 * 
 * @param {string} schoolId - The ID of the school to check.
 * @returns {Promise<boolean>} - Returns true if the school exists, false otherwise.
 */
export const schoolExists = async (schoolId) => {
  const snap = await getDoc(doc(db, "schools", schoolId));
  return snap.exists();
};