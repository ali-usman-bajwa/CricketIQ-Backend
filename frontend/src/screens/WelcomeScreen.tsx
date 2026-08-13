import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useAuth } from "../context/AuthContext";
import { colors, fonts, spacing } from "../theme/theme";

const WelcomeScreen = () => {
  const { user, dismissWelcome } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.wordmark}>
          Cricket<Text style={styles.wordmarkAccent}>IQ</Text>
        </Text>
        <Text style={styles.greeting}>Welcome back, {user?.name?.split(" ")[0]}</Text>
        <Text style={styles.subtitle}>Your performance intelligence is ready.</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={dismissWelcome}
      >
        <Text style={styles.buttonText}>Enter Dashboard</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: spacing.sm },
  wordmark: { fontFamily: fonts.display, fontSize: 36, color: colors.primaryText, marginBottom: spacing.lg },
  wordmarkAccent: { color: colors.accent },
  greeting: { fontFamily: fonts.display, fontSize: 22, color: colors.primaryText, textAlign: "center" },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.secondaryText, textAlign: "center" },
  button: { backgroundColor: colors.accent, borderRadius: 4, paddingVertical: spacing.md, alignItems: "center" },
  buttonPressed: { backgroundColor: colors.accentPress },
  buttonText: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.background },
});

export default WelcomeScreen;