import { Stack } from "expo-router";
import * as Notifications from "expo-notifications"
import { NotificationProvider } from "@/context/NotificationContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  return (
    <NotificationProvider>
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: "Home" }} />
    </Stack>
    </NotificationProvider>
  );
}
