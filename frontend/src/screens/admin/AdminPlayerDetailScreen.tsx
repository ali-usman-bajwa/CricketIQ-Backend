import React, { useCallback, useState } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getPlayer, updatePlayerAdmin, deletePlayer } from "../../api/playerApi";
import { colors, fonts, spacing } from "../../theme/theme";

const BATTING_STYLES = ["Right Hand", "Left Hand"] as const;
const BOWLING_STYLES = ["None", "Right Arm Fast", "Left Arm Fast", "Right Arm Medium", "Left Arm Medium", "Right Arm Spin", "Left Arm Spin"] as const;

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

const AdminPlayerDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { playerId } = route.params;

  const [player, setPlayer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [age, setAge] = useState("");
  const [battingStyle, setBattingStyle] = useState<typeof BATTING_STYLES[number]>("Right Hand");
  const [bowlingStyle, setBowlingStyle] = useState<typeof BOWLING_STYLES[number]>("None");
  const [country, setCountry] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getPlayer(playerId);
      const p = res.data;
      setPlayer(p);
      setAge(p.age?.toString() || "");
      setBattingStyle(p.battingStyle || "Right Hand");
      setBowlingStyle(p.bowlingStyle || "None");
      setCountry(p.country || "");
    } catch (error) {
      console.error("Failed to load player:", error);
    } finally {
      setIsLoading(false);
    }
  }, [playerId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePlayerAdmin(playerId, {
        age: Number(age),
        battingStyle,
        bowlingStyle,
        country: country.trim(),
      });
      Alert.alert("Saved", "Player updated.");
      await load();
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Unable to update player.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Player", `Permanently delete ${player?.name}? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePlayer(playerId);
            navigation.goBack();
          } catch (error: any) {
            Alert.alert("Error", error?.response?.data?.message || "Unable to delete player.");
          }
        },
      },
    ]);
  };

  if (isLoading || !player) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.readOnlyCard}>
        <Text style={styles.readOnlyName}>{player.name}</Text>
        <Text style={styles.readOnlyRole}>{player.role} · {player.user?.email || "No linked email"}</Text>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>AGE</Text>
        <TextInput style={styles.input} keyboardType="number-pad" value={age} onChangeText={setAge} />
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

      <Pressable style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]} onPress={handleSave} disabled={isSaving}>
        {isSaving ? <ActivityIndicator color={colors.background} /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
      </Pressable>

      <Pressable style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.7 }]} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={16} color="#C1443C" />
        <Text style={styles.deleteButtonText}>Delete Player</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  readOnlyCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, marginBottom: spacing.xl },
  readOnlyName: { fontFamily: fonts.display, fontSize: 18, color: colors.primaryText },
  readOnlyRole: { fontFamily: fonts.body, fontSize: 12, color: colors.secondaryText, marginTop: 2 },
  fieldGroup: { marginBottom: spacing.lg },
  fieldLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1.5, color: colors.secondaryText, marginBottom: spacing.sm },
  input: { fontFamily: fonts.body, fontSize: 16, color: colors.primaryText, borderBottomWidth: 1.5, borderBottomColor: colors.border, paddingVertical: spacing.sm },
  segmentGroup: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  segment: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 4, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  segmentSelected: { backgroundColor: colors.pitch, borderColor: colors.pitch },
  segmentText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.secondaryText },
  segmentTextSelected: { color: "#FFFFFF" },
  saveButton: { backgroundColor: colors.accent, borderRadius: 4, paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.sm },
  saveButtonPressed: { backgroundColor: colors.accentPress },
  saveButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.background },
  deleteButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: spacing.md,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: "#C1443C",
    borderRadius: 4,
  },
  deleteButtonText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: "#C1443C" },
});

export default AdminPlayerDetailScreen;