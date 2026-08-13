import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, spacing } from "../../theme/theme";

const PerformanceScreen = () => (
  <View style={styles.container}>
    <Ionicons name="stats-chart-outline" size={32} color={colors.secondaryText} />
    <Text style={styles.text}>Performance history and submission — coming next.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center", gap: spacing.sm, padding: spacing.xl },
  text: { fontFamily: fonts.body, color: colors.secondaryText, textAlign: "center" },
});

export default PerformanceScreen;