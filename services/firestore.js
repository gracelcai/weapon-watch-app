import { createUserWithEmailAndPassword, updateProfile, deleteUser, getAuth } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
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
  try {
    /*
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user; */

    const { user } = await createUserWithEmailAndPassword(getAuth(), email, password);
    
    // Update the user's display name in Firebase Auth
    await updateProfile(user, { displayName: name });

    /* build the document references right here */
    const userRef = doc(db, "users", user.uid);
    const schoolRef = doc(db, "schools", schoolId);

    await setDoc(userRef, {
      name,
      email,
      schoolId,
      isAdmin: false,
      isVerifier: false,
      createdAt: new Date()
    });
  
    /* push the ref into the school’s users array */
    await updateDoc(schoolRef, { users: arrayUnion(userRef) });
    
    console.log("User successfully added:", user.uid);
  } catch (error) {
    await deleteUser(user).catch(() => {});
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




/**
 * Fetches all camera documents from the "cameras" collection in Firestore.
 *
 * @returns {Promise<Array<Object>>} An array of camera objects including their ID.
 */
export const getCameras = async () => {
  try {
    const snapshot = await getDocs(collection(db, "cameras"));
    const camerasArray = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return camerasArray;
  } catch (error) {
    console.error("Error fetching cameras:", error);
    throw error;
  }
};

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