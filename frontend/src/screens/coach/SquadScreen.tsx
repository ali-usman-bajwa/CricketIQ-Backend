import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { removePlayerFromTeam } from "../../api/teamApi";
import { colors, fonts, spacing } from "../../theme/theme";

const RosterRow = ({
  player,
  onPress,
  onRemove,
}: {
  player: any;
  onPress: () => void;
  onRemove: () => void;
}) => (
  <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={onPress}>
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{player.name[0]?.toUpperCase()}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.rowTitle}>{player.name}</Text>
      <Text style={styles.rowSubtitle}>{player.role} · {player.battingStyle}</Text>
    </View>
    <Pressable hitSlop={10} onPress={onRemove}>
      <Ionicons name="close-circle-outline" size={22} color={colors.error} />
    </Pressable>
  </Pressable>
);

const SquadScreen = () => {
  const { coachTeam, refreshCoachTeam } = useAuth();
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setIsLoading(true);
        await refreshCoachTeam();
        setIsLoading(false);
      };
      load();
    }, [])
  );

  const handleRemove = (playerId: string, name: string) => {
    if (!coachTeam) return;
    Alert.alert("Remove Player", `Remove ${name} from ${coachTeam.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await removePlayerFromTeam(coachTeam._id, playerId);
            await refreshCoachTeam();
          } catch (error: any) {
            Alert.alert("Error", error?.response?.data?.message || "Unable to remove player.");
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xxl }} />
      </SafeAreaView>
    );
  }

  if (!coachTeam) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={36} color={colors.secondaryText} />
          <Text style={styles.emptyStateText}>You don't have a team yet.</Text>
          <Pressable
            style={({ pressed }) => [styles.createButton, pressed && styles.createButtonPressed]}
            onPress={() => navigation.navigate("CreateTeam")}
          >
            <Text style={styles.createButtonText}>Create Team</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{coachTeam.name}</Text>
          <Text style={styles.headerSubtitle}>{coachTeam.players.length} players</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
          onPress={() => navigation.navigate("AddPlayer", { teamId: coachTeam._id, existingIds: coachTeam.players.map((p) => p._id) })}
        >
          <Ionicons name="add" size={20} color={colors.background} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {coachTeam.players.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No players yet. Tap + to add your first player.</Text>
          </View>
        ) : (
          coachTeam.players.map((p) => (
            <RosterRow
              key={p._id}
              player={p}
              onPress={() => navigation.navigate("PlayerProfileView", { player: p })}
              onRemove={() => handleRemove(p._id, p.name)}
            />
          ))
        )}
      </ScrollView>
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
    paddingBottom: spacing.md,
  },
  headerTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.primaryText },
  headerSubtitle: { fontFamily: fonts.body, fontSize: 12, color: colors.secondaryText, marginTop: 2 },
  addButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, justifyContent: "center", alignItems: "center" },
  addButtonPressed: { backgroundColor: colors.accentPress },
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
  emptyState: { alignItems: "center", paddingVertical: spacing.xxl, gap: spacing.md, paddingHorizontal: spacing.xl },
  emptyStateText: { fontFamily: fonts.body, fontSize: 14, color: colors.secondaryText, textAlign: "center" },
  createButton: { backgroundColor: colors.accent, borderRadius: 4, paddingVertical: spacing.sm, paddingHorizontal: spacing.xl },
  createButtonPressed: { backgroundColor: colors.accentPress },
  createButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.background },
});

export default SquadScreen;