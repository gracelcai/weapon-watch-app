import { Text, View, StyleSheet, Image, Pressable} from "react-native";
import {useNotification} from "@/context/NotificationContext";


const PlaceholderImage = require("../assets/images/img_4191_720.jpg");

export default function HomeScreen() {
  const {notification, expoPushToken, error} = useNotification();
  
  if(error){
    return <Text>Error: {error.message}</Text>;
  }
  return(
    <View style = {styles.container}>
      <View style={styles.imageContainer}>
        <Image source={PlaceholderImage} style={styles.image}/>
      </View>
      <View style={styles.footerContainer}>
        <View style={styles.buttonContainer}>
          <Pressable style={[styles.button, {backgroundColor: "red"}]} onPress={() => alert("Active threat confrimed")}>
            <Text style={styles.buttonLabel}>Confirm the threat alert</Text>
          </Pressable>
        </View>
        <View style={styles.buttonContainer}>
          <Pressable style={[styles.button, {backgroundColor: "white"}]} onPress={() => alert("Thank you for your confirmation")}>
            <Text style={[{color: "black", fontSize: 16}]}>False alert</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}
const styles = StyleSheet.create({
  buttonContainer: {
    width: 320,
    height: 68,
    marginHorizontal: 20,
    alignItems: "center",
    padding: 3,
  },
  buttonLabel: {
    color: "white",
    fontSize: 16,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: 350
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black",
  },
  text: { 
    color: "white"
  },
  image: {
    width:320,
    height:400,
  },
  imageContainer: {
    flex:1,
  },
  footerContainer: {
    flex: 1/3,
    alignItems: "center"
  }
});