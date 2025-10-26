const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const {Expo} = require("expo-server-sdk");

admin.initializeApp();
const expo = new Expo();

exports.notifyOnDetection = functions.firestore
    .document("schools/UMD")
    .onUpdate(async (change) => {
      const before = change.before.data() || {};
      const after = change.after.data() || {};

      const oldId = before.detected_cam_id || "";
      const newId = after.detected_cam_id || "";
      const currentTimestamp = admin.firestore.FieldValue.serverTimestamp();

      let elapsedSec = 25;
      // if (before.detectedAt) {
      //   const detectedTime = before.detectedAt.toDate().getTime();
      //   elapsedSec = Math.floor(( Date.now() - detectedTime) / 1000);
      // }

      if (elapsedSec > 20) {
        // Only trigger if detected_cam_id goes from nothing to something
        if (newId && !oldId) {
          await change.after.ref.update({
            detectedAt: currentTimestamp,
          });

          // --- Step 1: Notify all users ---
          const schoolDoc = await admin.firestore().doc("schools/UMD").get();
          const schoolDocData = schoolDoc.data();
          const usersArray = schoolDocData.users || []; // Get the users array

          if (usersArray.length === 0) return null;

          // Notify each user in the array
          const notificationPromises = usersArray.map(async (userRef) => {
            try {
              const userDoc = await userRef.get();
              if (!userDoc.exists) return null;

              const userData = userDoc.data();
              const userToken = userData.expoPushToken;

              if (!userToken) return null;

              // Determine message based on verifier status
              const isVerifier = userData.isVerifier || false;
              const body = isVerifier ? "Confirm Active Threat Event" :
              "Await further instructions";

              return expo.sendPushNotificationsAsync([
                {
                  to: userToken,
                  sound: "emergencysos.wav",
                  title: "POTENTIAL THREAT DETECTED",
                  body: body,
                  data: {
                    url: isVerifier ? "screens/verification" :
                    "screens/notification_admin",
                  },
                  channelId: "weapon_detected",
                  priority: "high",
                  sticky: true,
                },
              ]);
            } catch (error) {
              console.error(`Error notifying user: ${error}`);
              return null;
            }
          });

          // Wait for all notifications to be sent
          await Promise.all(notificationPromises);

          // --- Step 2: Wait 10 seconds, then check again ---
          await new Promise((resolve) => setTimeout(resolve, 22000));

          // Re-fetch document to see if resolved
          const schoolSnap = await change.after.ref.get();
          const schoolData = schoolSnap.data();
          const falseAlertTime = schoolData.falseAlertAt.toDate().getTime();
          elapsedSec = Math.floor(( Date.now() - falseAlertTime) / 1000);

          if (elapsedSec > 22 && !schoolData["Active Event"]) {
            // Secondary verifier reference
            const secondaryRef = schoolData.SecondaryVerifier;
            if (secondaryRef) {
              // Give verification privileges to secondary verifier
              await secondaryRef.update({isVerifier: true});
              const secondaryDoc = await secondaryRef.get();
              const secondaryToken = secondaryDoc.data().expoPushToken;

              if (secondaryToken) {
                await expo.sendPushNotificationsAsync([
                  {
                    to: secondaryToken,
                    sound: "emergencysos.wav",
                    title: "SECONDARY VERIFICATION REQUIRED",
                    body: "Primary verifier did not respond",
                    data: {url: "screens/verification"},
                    channelId: "weapon_detected",
                    priority: "high",
                    sticky: true,
                  },
                ]);
              }
            }

            // Notify primary that control has passed
            const primaryRef = after.Verifier;
            if (!primaryRef) return null;
            const primaryDoc = await primaryRef.get();
            const primaryToken = primaryDoc.data().expoPushToken;
            if (primaryToken) {
              await expo.sendPushNotificationsAsync([
                {
                  to: primaryToken,
                  sound: "emergencysos.wav",
                  title: "VERIFICATION TIMEOUT",
                  body: "Threat control passed to secondary verifier",
                  channelId: "weapon_detected",
                  priority: "high",
                  sticky: true,
                },
              ]);
            }
            // --- Step 3: Demote primary verifier ---
            await primaryRef.update({isVerifier: false});
          }
        }
      }
      return null;
    });
