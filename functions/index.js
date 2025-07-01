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

      if (newId && newId !== oldId) {
        const userRef = after.Verifier || [];
        const messages = [];

        const doc = await userRef.get();
        const token = doc.data().expoPushToken;
        if (Expo.isExpoPushToken(token)) {
          messages.push({
            to: token,
            sound: "emergencysos.wav",
            title: "POTENTIAL THREAT DETECTED",
            body: "Confirm Active Threat Event",
            data: {url: "screens/verification"},
            channelId: "weapon_detected",
            sticky: true,
            priority: "high",
          });
        }

        const chunks = expo.chunkPushNotifications(messages);
        const sendChunk = (chunk) => expo.sendPushNotificationsAsync(chunk);
        const sendPromises = chunks.map(sendChunk);
        await Promise.all(sendPromises);
      }

      return null;
    });
