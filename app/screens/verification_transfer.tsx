import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from '@expo/vector-icons';
import { doc, writeBatch } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig"; 
import { getUserByEmail, getUser} from "../../services/firestore";

export default function TransferVerificationScreen() {
  const router = useRouter();
  const [newVerifierEmail, setNewVerifierEmail] = useState("");

  const handleTransfer = async () => {
    if (!newVerifierEmail) {
      Alert.alert("Error", "Please enter the email of the new verifier.");
      return;
    }

    try {
        // Get current user's UID.
        const currentUid = auth.currentUser?.uid;
        if (!currentUid) throw new Error("Current user not found.");
  
        // Fetch the current user's document from Firestore.
        const currentUserData = await getUser(currentUid) as any;
        if (!currentUserData.isAdmin) {
          Alert.alert("Transfer Error", "Only admin users can transfer verification rights.");
          return;
        }
        
        // Look up the new verifier by email.
        const newVerifierData = await getUserByEmail(newVerifierEmail) as any;
        if (!newVerifierData) {
          Alert.alert("Error", "User with that email was not found.");
          return;
        }
        
        // Check that the new verifier is an admin.
        if (!newVerifierData.isAdmin) {
          Alert.alert("Error", "You can only transfer verification rights to admin users.");
          return;
        }
        
        const newVerifierUid = newVerifierData.uid;
        
        // Proceed with transfer using a batch write.
        const batch = writeBatch(db);
        // Remove verification rights from the current user.
        batch.update(doc(db, "users", currentUid), { isVerifier: false });
        // Grant verification rights to the new user.
        batch.update(doc(db, "users", newVerifierUid), { isVerifier: true });
        
        await batch.commit();
  
        Alert.alert("Success", "Verification rights transferred successfully!");
        router.push("/screens/cameras");
      } catch (error: any) {
        Alert.alert("Transfer Error", error.message);
      }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/screens/verification")}>
        <FontAwesome name="arrow-left" size={20} color="#fff" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Transfer Verification Rights</Text>
      <Text style={styles.instructions}>
        Enter the email address of the user you want to transfer verification rights to:
      </Text>
      <TextInput
        style={styles.input}
        placeholder="New verifier's email"
        placeholderTextColor="#aaa"
        value={newVerifierEmail}
        onChangeText={setNewVerifierEmail}
      />
      <Button title="Transfer Rights" onPress={handleTransfer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1,backgroundColor: "#000",padding: 16,justifyContent: "center",},
  title: {color: "#fff",fontSize: 24,marginBottom: 16,fontWeight: "bold",textAlign: "center"},
  instructions: {color: "#fff",fontSize: 16,marginBottom: 12,textAlign: "center",},
  input: {backgroundColor: "#222",color: "#fff",padding: 10,borderRadius: 8,marginBottom: 16,},
  backButton: {position: "absolute",top: 50,left: 20,flexDirection: "row",alignItems: "center",},
  backText: { color: "#fff", fontSize: 16, marginLeft: 5 },
});
