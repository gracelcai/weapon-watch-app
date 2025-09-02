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

      // Only trigger if a new detection occurred
      if (newId && newId !== oldId) {
        await change.after.ref.update({
          detectedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // --- Step 1: Notify primary verifier ---
        const primaryRef = after.Verifier;
        if (!primaryRef) return null;

        const primaryDoc = await primaryRef.get();
        const primaryToken = primaryDoc.data().expoPushToken;

        if (primaryToken) {
          await expo.sendPushNotificationsAsync([
            {
              to: primaryToken,
              sound: "emergencysos.wav",
              title: "POTENTIAL THREAT DETECTED",
              body: "Confirm Active Threat Event",
              data: {url: "screens/verification"},
              channelId: "weapon_detected",
              priority: "high",
              sticky: true,
            },
          ]);
        }

        // --- Step 2: Wait 10 seconds, then check again ---
        await new Promise((resolve) => setTimeout(resolve, 20000));

        // Re-fetch document to see if resolved
        const schoolSnap = await change.after.ref.get();
        const schoolData = schoolSnap.data();

        if (schoolData.detected_cam_id && !schoolData["Active Event"]) {
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

      return null;
    });
