import { Text, View, StyleSheet} from "react-native";
import {useNotification} from "@/context/NotificationContext";

export default function HomeScreen() {
  const {notification, expoPushToken, error} = useNotification();
  
  if(error){
    return <Text>Error: {error.message}</Text>;
  }
  return(
    <View style = {styles.container}>
        <Text>Your push token:</Text>
        <Text>{expoPushToken}</Text>
        <Text>Latest notification:</Text>
        <Text>{notification?.request.content.title}</Text>
        <Text>
          {JSON.stringify(notification?.request.content.data, null, 2)}
        </Text>
    </View>
  )
}
const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
  }
});