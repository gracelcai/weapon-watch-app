import { db } from "../firebaseConfig";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";

/**
 * Add a school to Firestore.
 */
export const addSchool = async (schoolID, name, location, adminID) => {
  try {
    await setDoc(doc(db, "schools", schoolID), {
      name,
      location,
      adminID,
    });
    console.log("School added:", name);
  } catch (error) {
    console.error("Error adding school:", error);
  }
};

/**
 * Add a camera to a school.
 */
export const addCamera = async (schoolID, camID, name, status, rtsp_url) => {
  try {
    await setDoc(doc(db, "schools", schoolID, "cameras", camID), {
      name,
      status,
      rtsp_url,
    });
    console.log("Camera added:", name);
  } catch (error) {
    console.error("Error adding camera:", error);
  }
};

/**
 * Add a notification to a school.
 */
export const addNotification = async (schoolID, type, message) => {
  try {
    await addDoc(collection(db, "schools", schoolID, "notifications"), {
      type,
      message,
      timestamp: new Date(),
    });
    console.log("Notification sent:", type);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};
