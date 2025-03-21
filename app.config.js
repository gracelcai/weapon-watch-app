import 'dotenv/config';

  export default ({ config }) => ({
    expo: {
      name: "weapon-watch-app",
      slug: "weapon-watch-app",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/images/icon.png",
      scheme: "myapp",
      userInterfaceStyle: "automatic",
      newArchEnabled: true,
      ios: {
        supportsTablet: true,
        bundleIdentifier: "com.anonymous.weaponwatchapp",
        config: {
          usesNonExemptEncryption: false
        },
        infoPlist: {
          NSLocationWhenInUseUsageDescription: "This app requires access to your location for tracking purposes."
        }
      },
      android: {
        adaptiveIcon: {
          foregroundImage: "./assets/images/adaptive-icon.png",
          backgroundColor: "#ffffff"
        },
        googleServicesFile: "./google-services.json"
      },
      web: {
        bundler: "metro",
        output: "static",
        favicon: "./assets/images/favicon.png"
      },
      plugins: [
        "expo-router",
        [
          "expo-splash-screen",
          {
            image: "./assets/images/splash-icon.png",
            imageWidth: 200,
            resizeMode: "contain",
            backgroundColor: "#ffffff"
          }
        ],
        [
          "expo-notifications",
          {
            icon: "./assets/images/app-logo.png",
            color: "#ffffff",
            defaultChannel: "default",
            enableBackgroundRemoteNotifications: false,
            sounds: [
              "./assets/sounds/emergencysos.wav"
            ]
          }
        ]
      ],
      experiments: {
        typedRoutes: true
      },
      extra: {
        router: {
          origin: false
        },
        eas: {
          projectId: "fc32b543-4598-49b6-85ee-879ff2429ec9"
        },
        FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
        FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
        FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
        FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
        FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
      },
      owner: "keguida"
    }
  }
  );