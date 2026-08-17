import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { colors, fonts, spacing } from "../../theme/theme";

const PLAYER_ROLES = ["Batter", "Bowler", "All-Rounder", "Wicket-Keeper"] as const;
const BATTING_STYLES = ["Right Hand", "Left Hand"] as const;
const BOWLING_STYLES = [
  "Right Arm Fast",
  "Left Arm Fast",
  "Right Arm Medium",
  "Left Arm Medium",
  "Right Arm Spin",
  "Left Arm Spin",
] as const;

const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (val: T) => void;
}) => (
  <View style={styles.segmentGroup}>
    {options.map((option) => {
      const isSelected = value === option;
      return (
        <Pressable
          key={option}
          style={[styles.segment, isSelected && styles.segmentSelected]}
          onPress={() => onChange(option)}
        >
          <Text style={[styles.segmentText, isSelected && styles.segmentTextSelected]}>
            {option}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const RegisterScreen = () => {
  const { register } = useAuth();
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Player" | "Coach">("Player");

  const [age, setAge] = useState("");
  const [playerRole, setPlayerRole] = useState<typeof PLAYER_ROLES[number]>("Batter");
  const [battingStyle, setBattingStyle] = useState<typeof BATTING_STYLES[number]>("Right Hand");
  const [bowlingStyle, setBowlingStyle] = useState<typeof BOWLING_STYLES[number]>("Right Arm Fast");
  const [country, setCountry] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const needsBowlingStyle = playerRole === "Bowler" || playerRole === "All-Rounder";

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Missing fields", "Name, email, and password are required.");
      return;
    }

    if (role === "Player" && (!age || !country)) {
      Alert.alert("Missing fields", "Age and country are required for players.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        ...(role === "Player" && {
          age: Number(age),
          playerRole,
          battingStyle,
          bowlingStyle: needsBowlingStyle ? bowlingStyle : "None",
          country: country.trim(),
        }),
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || "Unable to register. Please try again.";
      Alert.alert("Registration Failed", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (val: string) => void,
    fieldKey: string,
    options: { placeholder?: string; secure?: boolean; keyboardType?: "default" | "email-address" | "number-pad" } = {}
  ) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, focusedField === fieldKey && styles.inputFocused]}
        placeholderTextColor={colors.secondaryText}
        placeholder={options.placeholder}
        secureTextEntry={options.secure}
        keyboardType={options.keyboardType || "default"}
        autoCapitalize={fieldKey === "email" ? "none" : "sentences"}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocusedField(fieldKey)}
        onBlur={() => setFocusedField(null)}
      />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>
          Cricket<Text style={styles.wordmarkAccent}>IQ</Text>
        </Text>
        <Text style={styles.tagline}>CREATE YOUR ACCOUNT</Text>
      </View>

      {renderInput("FULL NAME", name, setName, "name", { placeholder: "Your name" })}
      {renderInput("EMAIL", email, setEmail, "email", { placeholder: "you@example.com", keyboardType: "email-address" })}
      {renderInput("PASSWORD", password, setPassword, "password", { placeholder: "••••••••", secure: true })}

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>I AM A</Text>
        <SegmentedControl options={["Player", "Coach"] as const} value={role} onChange={setRole} />
      </View>

      {role === "Player" && (
        <>
          {renderInput("AGE", age, setAge, "age", { placeholder: "e.g. 24", keyboardType: "number-pad" })}

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>PLAYING ROLE</Text>
            <SegmentedControl options={PLAYER_ROLES} value={playerRole} onChange={setPlayerRole} />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>BATTING STYLE</Text>
            <SegmentedControl options={BATTING_STYLES} value={battingStyle} onChange={setBattingStyle} />
          </View>

          {needsBowlingStyle && (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>BOWLING STYLE</Text>
              <SegmentedControl options={BOWLING_STYLES} value={bowlingStyle} onChange={setBowlingStyle} />
            </View>
          )}

          {renderInput("COUNTRY", country, setCountry, "country", { placeholder: "e.g. Pakistan" })}
        </>
      )}

      <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={handleRegister} disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.buttonText}>Create Account</Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => navigation.goBack()}
        style={({ pressed }) => [styles.linkWrap, pressed && { opacity: 0.6 }]}
      >
        <Text style={styles.link}>
          Already have an account? <Text style={styles.linkAccent}>Log in</Text>
        </Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 32,
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
  segmentGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  segment: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 4,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  segmentSelected: {
    backgroundColor: colors.pitch,
    borderColor: colors.pitch,
  },
  segmentText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.secondaryText,
  },
  segmentTextSelected: {
    color: "#FFFFFF",
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
  },
  buttonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.background,
  },
  linkWrap: {
    marginTop: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.xl,
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

export default RegisterScreen;