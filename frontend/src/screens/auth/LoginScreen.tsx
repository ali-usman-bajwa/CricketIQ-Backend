import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useDispatch } from "react-redux";

import { loginUser } from "../../api/authApi";
import { loginSuccess } from "../../store/slices/authSlice";

export default function LoginScreen() {
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(
        "Missing Information",
        "Please enter email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser(
        email,
        password
      );

      if (!response.success) {
        Alert.alert(
          "Login Failed",
          response.message || "Unable to login."
        );
        return;
      }

      const { token, user } = response;

      await SecureStore.setItemAsync(
        "authToken",
        token
      );

      dispatch(loginSuccess({token,user}));

      Alert.alert(
        "Success",
        "Login successful."
      );
    } catch (error: any) {
      console.log(
        "Login Error:",
        error?.response?.data || error.message
      );

      Alert.alert(
        "Login Failed",
        error?.response?.data?.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        CricketIQ
      </Text>

      <Text style={styles.subtitle}>
        AI-Powered Cricket Intelligence
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 40,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 14,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#1e40af",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});