import React, { useCallback, useState } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getTeam, updateTeam, deleteTeam, removePlayerFromTeam, Team } from "../../api/teamApi";
import { colors, fonts, spacing } from "../../theme/theme";

const AdminTeamDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { teamId } = route.params;

  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [country, setCountry] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getTeam(teamId);
      setTeam(res.data);
      setName(res.data.name);
      setShortName(res.data.shortName);
      setCountry(res.data.country);
    } catch (error) {
      console.error("Failed to load team:", error);
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateTeam(teamId, { name: name.trim(), shortName: shortName.trim(), country: country.trim() });
      await load();
      Alert.alert("Saved", "Team details updated.");
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Unable to update team.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemovePlayer = (playerId: string, playerName: string) => {
    Alert.alert("Remove Player", `Remove ${playerName} from ${team?.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await removePlayerFromTeam(teamId, playerId);
            await load();
          } catch (error: any) {
            Alert.alert("Error", error?.response?.data?.message || "Unable to remove player.");
          }
        },
      },
    ]);
  };

  const handleDeleteTeam = () => {
    Alert.alert("Delete Team", `Permanently delete ${team?.name}? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTeam(teamId);
            navigation.goBack();
          } catch (error: any) {
            Alert.alert("Error", error?.response?.data?.message || "Unable to delete team.");
          }
        },
      },
    ]);
  };

  if (isLoading || !team) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>TEAM NAME</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>SHORT NAME</Text>
        <TextInput style={styles.input} value={shortName} onChangeText={setShortName} autoCapitalize="characters" />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>COUNTRY</Text>
        <TextInput style={styles.input} value={country} onChangeText={setCountry} />
      </View>

      <Pressable style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]} onPress={handleSave} disabled={isSaving}>
        {isSaving ? <ActivityIndicator color={colors.background} /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
      </Pressable>

      <View style={styles.rosterHeader}>
        <Text style={styles.sectionLabel}>ROSTER ({team.players.length})</Text>
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
          onPress={() => navigation.navigate("AdminAddPlayer", { teamId })}
        >
          <Ionicons name="add" size={16} color={colors.background} />
        </Pressable>
      </View>

      {team.players.length === 0 ? (
        <Text style={styles.emptyText}>No players on this team.</Text>
      ) : (
        team.players.map((p) => (
          <View key={p._id} style={styles.playerRow}>
            <Pressable style={{ flex: 1 }} onPress={() => navigation.navigate("AdminPlayerProfileView", { player: p })}>
              <Text style={styles.playerName}>{p.name}</Text>
              <Text style={styles.playerMeta}>{p.role} · {p.battingStyle}</Text>
            </Pressable>
            <Pressable hitSlop={10} onPress={() => handleRemovePlayer(p._id, p.name)}>
              <Ionicons name="close-circle-outline" size={22} color={colors.error} />
            </Pressable>
          </View>
        ))
      )}

      <Pressable style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.7 }]} onPress={handleDeleteTeam}>
        <Ionicons name="trash-outline" size={16} color="#C1443C" />
        <Text style={styles.deleteButtonText}>Delete Team</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  fieldGroup: { marginBottom: spacing.lg },
  fieldLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1.5, color: colors.secondaryText, marginBottom: spacing.sm },
  input: { fontFamily: fonts.body, fontSize: 16, color: colors.primaryText, borderBottomWidth: 1.5, borderBottomColor: colors.border, paddingVertical: spacing.sm },
  saveButton: { backgroundColor: colors.accent, borderRadius: 4, paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.sm, marginBottom: spacing.xl },
  saveButtonPressed: { backgroundColor: colors.accentPress },
  saveButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.background },
  rosterHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  sectionLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1.5, color: colors.secondaryText },
  addButton: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.accent, justifyContent: "center", alignItems: "center" },
  addButtonPressed: { backgroundColor: colors.accentPress },
  emptyText: { fontFamily: fonts.body, fontSize: 13, color: colors.secondaryText },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  playerName: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.primaryText },
  playerMeta: { fontFamily: fonts.body, fontSize: 12, color: colors.secondaryText, marginTop: 2 },
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

export default AdminTeamDetailScreen;