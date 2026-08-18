import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { updateMatch, deleteMatch } from "../../api/matchApi";
import { colors, fonts, spacing } from "../../theme/theme";

const FORMATS = ["T20", "ODI", "TEST"] as const;

const AdminMatchDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const [match, setMatch] = useState(route.params.match);

  const [format, setFormat] = useState<typeof FORMATS[number]>(match.format);
  const [venue, setVenue] = useState(match.venue);
  const [date, setDate] = useState(match.date?.slice(0, 10) || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateMatch(match._id, { format, venue: venue.trim(), date });
      setMatch(res.data);
      Alert.alert("Saved", "Match details updated.");
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Unable to update match.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async () => {
    const newStatus = match.status === "completed" ? "scheduled" : "completed";
    try {
      const res = await updateMatch(match._id, { status: newStatus });
      setMatch(res.data);
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Unable to update status.");
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Match", "Permanently delete this match? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMatch(match._id);
            navigation.goBack();
          } catch (error: any) {
            Alert.alert("Error", error?.response?.data?.message || "Unable to delete match.");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.matchCard}>
        <Text style={styles.matchTitle}>{match.teamA.name} vs {match.teamB.name}</Text>
        <Pressable style={styles.statusRow} onPress={toggleStatus}>
          <Ionicons
            name={match.status === "completed" ? "checkmark-circle" : "time-outline"}
            size={16}
            color={match.status === "completed" ? colors.pitch : colors.secondaryText}
          />
          <Text style={styles.statusText}>
            {match.status === "completed" ? "Completed" : "Scheduled"} · tap to toggle
          </Text>
        </Pressable>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>FORMAT</Text>
        <View style={styles.optionsWrap}>
          {FORMATS.map((f) => (
            <Pressable key={f} style={[styles.option, format === f && styles.optionSelected]} onPress={() => setFormat(f)}>
              <Text style={[styles.optionText, format === f && styles.optionTextSelected]}>{f}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>DATE (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>VENUE</Text>
        <TextInput style={styles.input} value={venue} onChangeText={setVenue} />
      </View>

      <Pressable style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]} onPress={handleSave} disabled={isSaving}>
        {isSaving ? <ActivityIndicator color={colors.background} /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
      </Pressable>

      <Pressable style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.7 }]} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={16} color="#C1443C" />
        <Text style={styles.deleteButtonText}>Delete Match</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  matchCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.lg, marginBottom: spacing.xl },
  matchTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.primaryText, marginBottom: spacing.sm },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.primaryText },
  fieldGroup: { marginBottom: spacing.lg },
  fieldLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1.5, color: colors.secondaryText, marginBottom: spacing.sm },
  input: { fontFamily: fonts.body, fontSize: 16, color: colors.primaryText, borderBottomWidth: 1.5, borderBottomColor: colors.border, paddingVertical: spacing.sm },
  optionsWrap: { flexDirection: "row", gap: spacing.sm },
  option: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 4, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  optionSelected: { backgroundColor: colors.pitch, borderColor: colors.pitch },
  optionText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.secondaryText },
  optionTextSelected: { color: "#FFFFFF" },
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

export default AdminMatchDetailScreen;