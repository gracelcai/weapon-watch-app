import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: "Home" }} />
      <Stack.Screen name="login" options={{ headerTitle: "Login" }} />
      <Stack.Screen name="home" options={{ headerTitle: "Home Screen" }} />
    </Stack>
  );
}
