import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { updatePlayer } from "../../api/playerApi";
import { colors, fonts, spacing } from "../../theme/theme";

const BATTING_STYLES = ["Right Hand", "Left Hand"] as const;
const BOWLING_STYLES = [
  "None",
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
          <Text style={[styles.segmentText, isSelected && styles.segmentTextSelected]}>{option}</Text>
        </Pressable>
      );
    })}
  </View>
);

const EditProfileScreen = () => {
  const { player, refreshPlayerProfile } = useAuth();
  const navigation = useNavigation();

  const [age, setAge] = useState(player?.age?.toString() || "");
  const [battingStyle, setBattingStyle] = useState<typeof BATTING_STYLES[number]>(
    (player?.battingStyle as any) || "Right Hand"
  );
  const [bowlingStyle, setBowlingStyle] = useState<typeof BOWLING_STYLES[number]>(
    (player?.bowlingStyle as any) || "None"
  );
  const [country, setCountry] = useState(player?.country || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!age || !country) {
      Alert.alert("Missing fields", "Age and country are required.");
      return;
    }

    if (!player?._id) return;

    setIsSubmitting(true);
    try {
      // Deliberately scoped to safe, self-editable fields only —
      // never send `team` or `role` from this screen.
      await updatePlayer(player._id, {
        age: Number(age),
        battingStyle,
        bowlingStyle,
        country: country.trim(),
      });

      await refreshPlayerProfile();
      Alert.alert("Saved", "Your profile has been updated.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.message || "Unable to update profile.";
      Alert.alert("Update Failed", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>AGE</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={age}
          onChangeText={setAge}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>BATTING STYLE</Text>
        <SegmentedControl options={BATTING_STYLES} value={battingStyle} onChange={setBattingStyle} />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>BOWLING STYLE</Text>
        <SegmentedControl options={BOWLING_STYLES} value={bowlingStyle} onChange={setBowlingStyle} />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>COUNTRY</Text>
        <TextInput style={styles.input} value={country} onChangeText={setCountry} />
      </View>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={handleSave}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.buttonText}>Save Changes</Text>
        )}
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  fieldGroup: { marginBottom: spacing.lg },
  fieldLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1.5, color: colors.secondaryText, marginBottom: spacing.sm },
  input: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.primaryText,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  segmentGroup: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  segment: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 4, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  segmentSelected: { backgroundColor: colors.pitch, borderColor: colors.pitch },
  segmentText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.secondaryText },
  segmentTextSelected: { color: "#FFFFFF" },
  button: { backgroundColor: colors.accent, borderRadius: 4, paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.sm },
  buttonPressed: { backgroundColor: colors.accentPress },
  buttonText: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.background },
});

export default EditProfileScreen;