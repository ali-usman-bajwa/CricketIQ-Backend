import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { colors, fonts, spacing } from "../../theme/theme";

const LoginScreen = () => {
  const { login } = useAuth();
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
    } catch (error: any) {
      const message = error?.response?.data?.message || "Unable to log in. Please try again.";
      Alert.alert("Login Failed", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.wordmark}>
          Cricket<Text style={styles.wordmarkAccent}>IQ</Text>
        </Text>
        <Text style={styles.tagline}>PERFORMANCE INTELLIGENCE</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>EMAIL</Text>
          <TextInput
            style={[
              styles.input,
              focusedField === "email" && styles.inputFocused,
            ]}
            placeholderTextColor={colors.secondaryText}
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>PASSWORD</Text>
          <TextInput
            style={[
              styles.input,
              focusedField === "password" && styles.inputFocused,
            ]}
            placeholderTextColor={colors.secondaryText}
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleLogin}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.buttonText}>Log In</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("Register" as never)}
          style={({ pressed }) => [styles.linkWrap, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.link}>
            New here? <Text style={styles.linkAccent}>Create an account</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 40,
    color: colors.primaryText,
  },
  wordmarkAccent: {
    color: colors.accent,
  },
  tagline: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 3,
    color: colors.secondaryText,
    marginTop: spacing.xs,
  },
  form: {
    width: "100%",
  },
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.secondaryText,
    marginBottom: spacing.sm,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.primaryText,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  inputFocused: {
    borderBottomColor: colors.accent,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 4,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonPressed: {
    backgroundColor: colors.accentPress,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.background,
  },
  linkWrap: {
    marginTop: spacing.xl,
    alignItems: "center",
  },
  link: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.secondaryText,
  },
  linkAccent: {
    color: colors.accent,
    fontFamily: fonts.bodyMedium,
  },
});

export default LoginScreen;