import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import { getAuth, signInWithRedirect } from "firebase/auth";




export default function LoginForm() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.description}>
            Login with your Google account
          </Text>
        </View>
        <View style={styles.content}>
          <TouchableOpacity style={[styles.button, styles.outlineButton]}>
            <Text style={styles.socialButtonText}><FontAwesome name="google" iconStyle= "brand"style={styles.icon}/>  Login with Google</Text>
          </TouchableOpacity>
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.divider} />
          </View>
          <View>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              keyboardType="email-address"
            />
           
            <View style = {styles.inlineContainer}>
            <Text style={styles.label}>Password</Text>
            <TouchableOpacity>
              <Text style={styles.link}>Forgot your password?</Text>
            </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              secureTextEntry
            />
            
            <TouchableOpacity style={[styles.button, styles.primaryButton]}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don’t have an account?{" "}
              <Text style={styles.link}>Sign up</Text>
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.terms}>
        By clicking continue, you agree to our{" "}
        <Text style={styles.link}>Terms of Service</Text> and{" "}
        <Text style={styles.link}>Privacy Policy</Text>.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    elevation: 3,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: "#666",
  },
  icon: {
    fontSize: 18, 
  },
  content: {
    gap: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButton: {
    borderColor: "#ccc",
    borderWidth: 1,
    backgroundColor: "#fff",
  },
  primaryButton: {
    backgroundColor: "#201c1c",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  socialButtonText:{
    color: "#333",
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#666",
    fontSize: 14,
  },
  label: {
    marginBottom: 5,
    fontSize: 14,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  link: {
    color: "#333",
    textDecorationLine: "underline",
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#333",
  },
  terms: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 12,
    color: "#666",
  },
  inlineContainer:{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
});