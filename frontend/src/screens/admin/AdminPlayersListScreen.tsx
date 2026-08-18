import React, { useCallback, useState } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getAllPlayers, AllPlayersEntry } from "../../api/playerApi";
import { colors, fonts, spacing } from "../../theme/theme";

const PlayerRow = ({ player, onPress }: { player: AllPlayersEntry; onPress: () => void }) => (
  <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={onPress}>
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{player.name[0]?.toUpperCase()}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.rowTitle}>{player.name}</Text>
      <Text style={styles.rowSubtitle}>{player.role} · {player.country}</Text>
    </View>
    {!player.team && (
      <View style={styles.unassignedBadge}>
        <Text style={styles.unassignedText}>NO TEAM</Text>
      </View>
    )}
    <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} />
  </Pressable>
);

const AdminPlayersListScreen = () => {
  const navigation = useNavigation<any>();
  const [players, setPlayers] = useState<AllPlayersEntry[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setIsLoading(true);
        try {
          const res = await getAllPlayers();
          setPlayers(res.data);
        } catch (error) {
          console.error("Failed to load players:", error);
        } finally {
          setIsLoading(false);
        }
      };
      load();
    }, [])
  );

  const filtered = players.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>All Players</Text>
          <Text style={styles.headerSubtitle}>{players.length} total</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
          onPress={() => navigation.navigate("AdminCreatePlayer")}
        >
          <Ionicons name="add" size={20} color={colors.background} />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Search players…"
          placeholderTextColor={colors.secondaryText}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xxl }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={32} color={colors.secondaryText} />
              <Text style={styles.emptyStateText}>No players found.</Text>
            </View>
          ) : (
            filtered.map((p) => (
              <PlayerRow key={p._id} player={p} onPress={() => navigation.navigate("AdminPlayerDetail", { playerId: p._id })} />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  headerTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.primaryText },
  headerSubtitle: { fontFamily: fonts.body, fontSize: 12, color: colors.secondaryText, marginTop: 2 },
  addButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, justifyContent: "center", alignItems: "center" },
  addButtonPressed: { backgroundColor: colors.accentPress },
  searchWrap: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
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
  },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
  },
  rowPressed: { backgroundColor: colors.border },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.pitch, justifyContent: "center", alignItems: "center" },
  avatarText: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: "#FFFFFF" },
  rowTitle: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.primaryText },
  rowSubtitle: { fontFamily: fonts.body, fontSize: 12, color: colors.secondaryText, marginTop: 2 },
  unassignedBadge: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingVertical: 3, paddingHorizontal: 8 },
  unassignedText: { fontFamily: fonts.bodyMedium, fontSize: 8, letterSpacing: 0.5, color: colors.secondaryText },
  emptyState: { alignItems: "center", paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyStateText: { fontFamily: fonts.body, fontSize: 14, color: colors.secondaryText, textAlign: "center" },
});

export default AdminPlayersListScreen;