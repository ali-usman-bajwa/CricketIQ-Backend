import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { createPlayerRaw } from "../../api/playerApi";
import { colors, fonts, spacing } from "../../theme/theme";

const ROLES = ["Batter", "Bowler", "All-Rounder", "Wicket-Keeper"] as const;
const BATTING_STYLES = ["Right Hand", "Left Hand"] as const;

const SegmentedControl = <T extends string>({ options, value, onChange }: { options: readonly T[]; value: T; onChange: (v: T) => void }) => (
  <View style={styles.segmentGroup}>
    {options.map((option) => {
      const isSelected = value === option;
      return (
        <Pressable key={option} style={[styles.segment, isSelected && styles.segmentSelected]} onPress={() => onChange(option)}>
          <Text style={[styles.segmentText, isSelected && styles.segmentTextSelected]}>{option}</Text>
        </Pressable>
      );
    })}
  </View>
);

const AdminCreatePlayerScreen = () => {
  const navigation = useNavigation();

  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [role, setRole] = useState<typeof ROLES[number]>("Batter");
  const [battingStyle, setBattingStyle] = useState<typeof BATTING_STYLES[number]>("Right Hand");
  const [country, setCountry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!userId || !name || !age || !country) {
      Alert.alert("Missing fields", "User ID, name, age, and country are all required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createPlayerRaw({
        user: userId.trim(),
        name: name.trim(),
        age: Number(age),
        role,
        battingStyle,
        country: country.trim(),
      });
      Alert.alert("Created", "Player document created.", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Unable to create player. Check the User ID is valid and not already linked to a player.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.warningCard}>
        <Ionicons name="warning-outline" size={18} color="#D4A614" />
        <Text style={styles.warningText}>
          This is a low-level tool. It creates a Player document directly and does NOT create a User
          account. You must already have a valid User ID (with no Player linked to it) — normally from
          someone who registered without completing player setup. For most cases, use normal Registration
          instead.
        </Text>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>USER ID</Text>
        <TextInput
          style={styles.input}
          value={userId}
          onChangeText={setUserId}
          placeholder="MongoDB ObjectId"
          placeholderTextColor={colors.secondaryText}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>NAME</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={colors.secondaryText} />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>AGE</Text>
        <TextInput style={styles.input} keyboardType="number-pad" value={age} onChangeText={setAge} placeholderTextColor={colors.secondaryText} />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>ROLE</Text>
        <SegmentedControl options={ROLES} value={role} onChange={setRole} />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>BATTING STYLE</Text>
        <SegmentedControl options={BATTING_STYLES} value={battingStyle} onChange={setBattingStyle} />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>COUNTRY</Text>
        <TextInput style={styles.input} value={country} onChangeText={setCountry} placeholderTextColor={colors.secondaryText} />
      </View>

      <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={handleCreate} disabled={isSubmitting}>
        {isSubmitting ? <ActivityIndicator color={colors.background} /> : <Text style={styles.buttonText}>Create Player Document</Text>}
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  warningCard: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#D4A614",
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  warningText: { flex: 1, fontFamily: fonts.body, fontSize: 12, color: colors.secondaryText, lineHeight: 17 },
  fieldGroup: { marginBottom: spacing.lg },
  fieldLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1.5, color: colors.secondaryText, marginBottom: spacing.sm },
  input: { fontFamily: fonts.body, fontSize: 16, color: colors.primaryText, borderBottomWidth: 1.5, borderBottomColor: colors.border, paddingVertical: spacing.sm },
  segmentGroup: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  segment: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 4, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  segmentSelected: { backgroundColor: colors.pitch, borderColor: colors.pitch },
  segmentText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.secondaryText },
  segmentTextSelected: { color: "#FFFFFF" },
  button: { backgroundColor: colors.accent, borderRadius: 4, paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.sm },
  buttonPressed: { backgroundColor: colors.accentPress },
  buttonText: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.background },
});

export default AdminCreatePlayerScreen;