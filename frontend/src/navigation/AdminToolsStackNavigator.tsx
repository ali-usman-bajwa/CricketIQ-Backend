import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "../theme/theme";

const AdminToolsStackNavigator = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Comparison, AI Comparison & Team Builder — coming next.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center", padding: 24 },
  text: { fontFamily: fonts.body, color: colors.secondaryText, textAlign: "center" },
});

export default AdminToolsStackNavigator;