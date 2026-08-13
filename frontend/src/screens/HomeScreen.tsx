import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

const HomeScreen = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome, {user?.name}</Text>
      <Text style={styles.role}>Role: {user?.role}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  text: { fontSize: 20, fontWeight: "600" },
  role: { fontSize: 14, color: "#666" },
});

export default HomeScreen;