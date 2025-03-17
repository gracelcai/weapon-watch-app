import { Stack } from "expo-router";
import * as Notifications from "expo-notifications"
import { NotificationProvider } from "@/context/NotificationContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  return (
    <NotificationProvider>
    <Stack>
      <Stack.Screen name="index" 
      options={{ 
        headerTitle: "Potential threat detected",
        headerStyle: {backgroundColor: "black"},
        headerTintColor: '#fff',
        headerTitleStyle: {fontWeight: '700', fontSize: 25},
        headerTitleAlign: 'center',
        }} />
    </Stack>
    </NotificationProvider>
  );
}
