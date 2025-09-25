import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import API from "../api"; // Siguraduhin relative path dito

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function doLogin() {
    try {
      const res = await API.post("/auth/login", { email, password });
      const { user, token } = res.data;

      if (user.role === "admin") {
        navigation.replace("AdminDashboard", { user, token });
      } else {
        navigation.replace("Home", { user, token });
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Login failed");
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>LOGIN</Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={doLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>Don’t have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e9eef5",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 20, textAlign: "center", color: "#333" },
  input: {
    width: "100%",
    padding: 14,
    backgroundColor: "#f9fafc",
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#dce3f0",
    fontSize: 16,
  },
  button: { backgroundColor: "#4a90e2", paddingVertical: 14, borderRadius: 12, marginBottom: 15 },
  buttonText: { textAlign: "center", color: "#fff", fontSize: 17, fontWeight: "600" },
  link: { textAlign: "center", color: "#4a90e2", fontSize: 15, marginTop: 8 },
});
