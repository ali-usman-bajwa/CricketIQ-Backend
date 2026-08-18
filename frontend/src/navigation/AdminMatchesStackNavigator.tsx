import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "../theme/theme";

const AdminMatchesStackNavigator = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Matches — coming next.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" },
  text: { fontFamily: fonts.body, color: colors.secondaryText },
});

export default AdminMatchesStackNavigator;