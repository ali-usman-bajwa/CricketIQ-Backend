import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, Pressable, ActivityIndicator, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { getAllPlayers, AllPlayersEntry } from "../../api/playerApi";
import { addPlayerToTeam } from "../../api/teamApi";
import { colors, fonts, spacing } from "../../theme/theme";

const AddPlayerScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { refreshCoachTeam } = useAuth();
  const { teamId, existingIds } = route.params;

  const [players, setPlayers] = useState<AllPlayersEntry[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAllPlayers();
        // Only show players with no team at all — matches backend's own rule
        // (addPlayerToTeam rejects anyone already on a team).
        setPlayers(res.data.filter((p) => !p.team));
      } catch (error) {
        console.error("Failed to load players:", error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = players.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async (player: AllPlayersEntry) => {
    setAddingId(player._id);
    try {
      await addPlayerToTeam(teamId, player._id);
      await refreshCoachTeam();
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Unable to add player.");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search players…"
        placeholderTextColor={colors.secondaryText}
        value={search}
        onChangeText={setSearch}
      />

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No available players found.</Text>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Text style={styles.rowSubtitle}>{item.role} · {item.country}</Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
                onPress={() => handleAdd(item)}
                disabled={addingId === item._id}
              >
                {addingId === item._id ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Text style={styles.addButtonText}>Add</Text>
                )}
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl },
  search: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.primaryText,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  list: { gap: spacing.sm, paddingBottom: spacing.xxl },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
  },
  rowTitle: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.primaryText },
  rowSubtitle: { fontFamily: fonts.body, fontSize: 12, color: colors.secondaryText, marginTop: 2 },
  addButton: { backgroundColor: colors.accent, borderRadius: 4, paddingVertical: 6, paddingHorizontal: 14 },
  addButtonPressed: { backgroundColor: colors.accentPress },
  addButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.background },
  emptyText: { fontFamily: fonts.body, fontSize: 14, color: colors.secondaryText, textAlign: "center", marginTop: spacing.xl },
});

export default AddPlayerScreen;