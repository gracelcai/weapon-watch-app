import { Text, View, StyleSheet} from "react-native";
import LoginForm from "./login";
import React from "react";
import { Stack, Link} from "expo-router";
import { useEffect } from "react";


export default function Index() {
 return(
  <View style = {styles.container} >

    <Link href = {"\login"} style = {styles.button}>
    idk what this placeholder screen is but this link navigates to the login screen</Link>
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

