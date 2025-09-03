import React, { useEffect, useState, useRef } from "react";
import { View, Text, ActivityIndicator, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { doc, onSnapshot, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { auth, db, storage } from "../../firebaseConfig";
import { getUser } from "../../services/firestore";
import { updateConfirmThreat } from '../../services/firestore';
import { getDownloadURL, ref } from "firebase/storage";

const ImageViewer = ({ url }: { url: string }) => (
  <View style={styles.imageViewerContainer}>
    {url ? (        
        <Image source={{ uri: url }} style={styles.image} />
    ) : (
      // <ActivityIndicator size="large" color="#fff" />
      <Text style={styles.title}>No image</Text>
    )}
  </View>
);

async function sendPushNotification(message: any) {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

// async function handleConfirmThreat() {
//   alert("Threat confirmed! Authorities will be alerted.");
//   updateConfirmThreat('UMD', {'Active Event': true})
//   // Get the users of the school where was threat was detected
//   const snapshot = await getDoc(doc(db, "schools", "UMD"));
//   const data = snapshot.data();

//   const userRefs: Array<any> = data!.users; // users is an array of DocumentReferences
//   for (const userRef of userRefs) {
//     const userSnap = await getDoc(userRef);
//     if (userSnap.exists()) {
//       const userData = userSnap.data() as any;
//       if (userData.expoPushToken) {
//           const message = {
//           to: userData.expoPushToken,
//           sound: 'emergencysos.wav',
//           title: 'ACTIVE THREAT',
//           body: userData.isAdmin ? 'Officers en-route. All faculty must secure classrooms: lock/barricade doors, call 911 with updates (location, description), and account for all students via attendance rosters' : 'Shelter-in-place order in effect. Stay inside your current room, lock/barricade the door, turn off lights, move away from windows, and silence all devices. Do not open doors for anyone until you hear the official ALL-CLEAR.',
//           data: { url: 'screens/notifications_student' },
//           channelId: 'weapon_detected',
//           sticky: true,
//           priority: 'high',
//         };
//         sendPushNotification(message);
//       }
//     }
//   }
// };


export default function VerificationScreen() {
  const router = useRouter();
  const [oldDetectID, setOldDetectID] = useState<string>("");
  // allowed will be true if user can see the screen, false if not, and null while checking.
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [activeEvent, setActiveEvent] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

   const handleConfirmThreat = async () => {
    alert("Threat confirmed! Authorities will be alerted.");
    setActiveEvent(true);
    await updateConfirmThreat('UMD', { 'Active Event': true });
    resetCountdown();

    const snapshot = await getDoc(doc(db, "schools", "UMD"));
    const data = snapshot.data();
    const userRefs: Array<any> = data!.users; // users is an array of DocumentReferences

    for (const userRef of userRefs) {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data() as any;
        if (userData.expoPushToken) {
            const message = {
            to: userData.expoPushToken,
            sound: 'emergencysos.wav',
            title: 'ACTIVE THREAT',
            body: userData.isAdmin ? 'Officers en-route. All faculty must secure classrooms: lock/barricade doors, call 911 with updates (location, description), and account for all students via attendance rosters' : 'Shelter-in-place order in effect. Stay inside your current room, lock/barricade the door, turn off lights, move away from windows, and silence all devices. Do not open doors for anyone until you hear the official ALL-CLEAR.',
            data: { url: 'screens/notifications_student' },
            channelId: 'weapon_detected',
            priority: 'high',
          };
          sendPushNotification(message);
        }
      }
    }
    
  };

const resetCountdown = () => {
  if (timerRef.current) {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }
  setCountdown(null);
};

useEffect(() => {
  if (countdown === null) return;
  if (timerRef.current) return; // already ticking

  timerRef.current = setInterval(() => {
    setCountdown((prev) => {
      if (prev === null) return null;
      if (prev <= 1) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return 0; // reached zero
      }
      return prev - 1;
    });
  }, 1000);

  return () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
}, [countdown]);

  useEffect(() => {
    const docRef = doc(db, "schools", "UMD");

    const unsubscribe = onSnapshot(docRef, async (snapshot) => {
      const data = snapshot.data();
      const detectedCamId = data?.detected_cam_id;
      const eventFlag = data?.['Active Event'];
      const uid = auth.currentUser?.uid;
      const verifierData = await getUser(uid) as any;

      if (!eventFlag && activeEvent) {
        setActiveEvent(false);
      }

      if (eventFlag && !activeEvent) {
        setActiveEvent(true);
      }

      if (detectedCamId == ""){setImageUrl("");}

      if (detectedCamId != "" && detectedCamId !== oldDetectID && !eventFlag) {
        setOldDetectID(detectedCamId);
        const elapsedSec = Math.floor(( Date.now() - data?.detectedAt.toDate().getTime()) / 1000);
        // Verifier has 20sec to confirm
        setCountdown(20-elapsedSec);

        const userRefs: Array<any> = data!.users; // users is an array of DocumentReferences
        for (const userRef of userRefs) {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data() as any;
            if (userData.expoPushToken != verifierData.expoPushToken) {
              const message = {
                to: userData.expoPushToken,
                sound: 'emergencysos.wav',
                title: 'POTENTIAL THREAT DETECTED',
                body: userData.expoPushToken == verifierData.expoPushToken ? 'Confirm Active Threat Event': 'Await further instructions',
                data: { url: 'screens/notification_students' },
                channelId: 'weapon_detected',
                priority: 'high',
              };
              sendPushNotification(message);
            }
          }
        }

        try {
          //const imgName = "frame_for_verifier_" + detectedCamId + ".jpg";
          const imgName = data?.firebase_storage_path;
          const imageRef = ref(storage, imgName);
          const downloadUrl = await getDownloadURL(imageRef);
          
          setImageUrl(downloadUrl); // update state → re-render ImageViewer :contentReference[oaicite:1]{index=1}
        } catch (err) {
          // console.error("Error fetching image:", err);
        }
        // For example, navigate to a different screen or display an alert
      }
    });

    // Cleanup the listener when the component unmounts
    return () => {unsubscribe(); resetCountdown();}
}, []);

useEffect(() => {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    Alert.alert("Error", "User not found. Please log in again.");
    router.replace("/screens/login");
    return;
  }

  let firstCheck = true;

  const userRef = doc(db, "users", uid);
  const unsubscribe = onSnapshot(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const userData = snapshot.data() as any;

      if (userData.isVerifier) {
        setAllowed(true);
      } else {
        setAllowed(false);
        if (firstCheck) {
          // Case 1: user starts without verifier access
          Alert.alert("Unauthorized", "You are not allowed to access this page.");
          router.replace("/screens/tracking");
        } else {
          // Case 2: user had it, then lost it
          Alert.alert("Access Revoked", "Your verification permissions have been removed.");
          router.replace("/screens/tracking");
        }
      }
    } else {
      setAllowed(false);
      Alert.alert("Error", "User data not found.");
      router.replace("/screens/login");
    }

    firstCheck = false;
  });

  return () => unsubscribe();
}, [router]);

  
  // useEffect(() => {
  //   const checkUserVerification = async () => {
  //     const uid = auth.currentUser?.uid;
  //     if (!uid) {
  //       Alert.alert("Error", "User not found. Please log in again.");
  //       router.replace("/screens/login");
  //       return;
  //     }
  //     try {
  //       const userData = await getUser(uid) as any;
  //       if (userData.isVerifier) {
  //         setAllowed(true);
  //       } else {
  //         // User is not allowed to see this screen.
  //         Alert.alert("Unauthorized", "You don't have verification permissions.");
  //         setAllowed(false);
  //         //router.replace("/screens/cameras");
  //       }
  //     } catch (error: any) {
  //       console.error("Error fetching user data:", error);
  //       Alert.alert("Error", "Unable to verify user permissions.");
  //       setAllowed(false);
  //       router.replace("/screens/cameras");
  //     }
  //   };


  //   checkUserVerification();

  // }, [router]);

  const handleFalseAlert = async() => {
    alert("False alarm reported.");
    updateDoc(doc(db, 'schools', "UMD"), {'detected_cam_id': ""});
    updateConfirmThreat('UMD', {'Active Event': false});
    setOldDetectID("");
    resetCountdown();
    setActiveEvent(false);

    const snapshot = await getDoc(doc(db, "schools", "UMD"));
    const data = snapshot.data();
    const userRefs: Array<any> = data!.users; // users is an array of DocumentReferences
    for (const userRef of userRefs) {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data() as any;
        if (userData.expoPushToken) {
          const message = {
          to: userData.expoPushToken,
          sound: 'emergencysos.wav',
          title: 'FALSE ALERT',
          body: 'No threat detected.',
          channelId: 'weapon_detected',
          priority: 'high',
        };
        sendPushNotification(message);
        }
      }
    }
    // Add API call to log false alert
  };

  const endEvent = async () => {
    Alert.alert(
      "End Active Event?",
      "Are you sure you want to end the active event?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              // Show success message and navigate
              Alert.alert(
                "Success", 
                "Verifier privileges have been transferred back to the Primary Verifier",
              );
              router.replace("/screens/tracking") 

              // Get references to the school document and cameras collection
              const schoolRef = doc(db, 'schools', 'UMD');
              const camerasRef = collection(db, 'schools/UMD/cameras');
              
              // Reset all cameras' detected field to false
              const camerasSnapshot = await getDocs(camerasRef);
              const updateCameraPromises = camerasSnapshot.docs.map(async (cameraDoc) => {
                await updateDoc(doc(db, 'schools/UMD/cameras', cameraDoc.id), {
                  detected: false
                });
              });
              
              // Wait for all camera updates to complete
              await Promise.all(updateCameraPromises);
              
              // Get verifier information
              const schoolSnapshot = await getDoc(schoolRef);
              const schoolData = schoolSnapshot.data();
              const primaryVerifierRef = schoolData?.Verifier;
              const secondaryVerifierRef = schoolData?.SecondaryVerifier;
              
              // Transfer verifier privileges
              const updateVerifierPromises = [];
              
              if (primaryVerifierRef) {
                const primaryVerifierDoc = await getDoc(primaryVerifierRef);
                if (primaryVerifierDoc.exists()) {
                  updateVerifierPromises.push(
                    updateDoc(primaryVerifierRef, {
                      isVerifier: true
                    })
                  );
                }
              }

              if (secondaryVerifierRef) {
                const secondaryVerifierDoc = await getDoc(secondaryVerifierRef);
                if (secondaryVerifierDoc.exists()) {
                  updateVerifierPromises.push(
                    updateDoc(secondaryVerifierRef, {
                      isVerifier: false
                    })
                  );
                }
              }
              
              // Wait for verifier updates to complete
              await Promise.all(updateVerifierPromises);
              
              // Update school document
              await updateDoc(schoolRef, { 
                detected_cam_id: "", 
                'Active Event': false 
              });
              
              await updateConfirmThreat('UMD', { 'Active Event': false });
              
              // Reset local state
              setImageUrl("");
              setOldDetectID("");
              setActiveEvent(false);
              
              // Send notifications
              const userRefs = schoolData?.users || [];
              for (const ref of userRefs) {
                const userData = (await getDoc(ref)).data() as any;
                if (userData.expoPushToken) {
                  const message = {
                    to: userData.expoPushToken,
                    sound: 'emergencysos.wav',
                    title: 'END OF ACTIVE THREAT',
                    body: 'The active threat event has been resolved.',
                    channelId: 'weapon_detected',
                    priority: 'high',
                  };
                  sendPushNotification(message);
                }
              }
              
            } catch (error) {
              console.error("Error ending active event:", error);
              Alert.alert("Error", "Failed to end active event. Please try again.");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  // While checking user verification, show a loading indicator.
  if (allowed === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!allowed) {
    return (
      <View style={styles.container}>
        <Text style={styles.title2}>
          Verification is only available to designated verifiers
        </Text>
      </View>
    );
  }

  if (activeEvent) {
    return (
      <View style={styles.container}>
        <Text style={styles.title2}>Active Event Ongoing</Text>
        <Text style={styles.title}>Navigate to the tracking page</Text>
        <TouchableOpacity style={styles.confirmButton} onPress={endEvent}>
          <Text style={styles.confirmButtonText}>End Active Event</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title2}>VERIFICATION</Text>
      
      {imageUrl === "" && (
        <View style={styles.loadingContainer}>
          <Text style={styles.title}>No threat detected</Text>
        </View>
      )}
      {imageUrl !== "" && (
        <>
          <Text style={styles.title}>Potential threat detected</Text>

          {countdown !== null && countdown > 0 && (
            <Text style={[styles.title, { color: "#FF5252" }]}>
              You have {countdown}s to act
            </Text>
          )}

          {/* Threat Image */}
          <ImageViewer url={imageUrl}/>

          {/* Action Buttons */}
          <TouchableOpacity style={styles.confirmButton} onPress={async () => { await handleConfirmThreat();}}>
            <Text style={styles.confirmButtonText}>Confirm the threat alert</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.falseButton} onPress={handleFalseAlert}>
            <Text style={styles.falseButtonText}>False alert</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center", padding: 16,paddingTop: 0,},
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  title: { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  title2: { color: "#fff", fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  image: { width: "100%", width: 350, height: 300, resizeMode: "contain", marginBottom: 30 },
  confirmButton: { backgroundColor: "#D32F2F", padding: 15, width: "100%", alignItems: "center", borderRadius: 10, marginBottom: 10 },
  confirmButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  falseButton: { backgroundColor: "#fff", padding: 15, width: "100%", alignItems: "center", borderRadius: 10 },
  falseButtonText: { color: "#000", fontSize: 16, fontWeight: "bold" },
  msg: { color: "#fff", fontSize: 18, textAlign: "center" },
  imageViewerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
  },
});