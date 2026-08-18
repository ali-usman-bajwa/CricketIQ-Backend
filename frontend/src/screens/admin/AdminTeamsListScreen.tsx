import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getTeams, Team } from "../../api/teamApi";
import { colors, fonts, spacing } from "../../theme/theme";

const TeamRow = ({ team, onPress }: { team: Team; onPress: () => void }) => (
  <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={onPress}>
    <View style={styles.crest}>
      <Text style={styles.crestText}>{team.shortName?.slice(0, 3)}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.rowTitle}>{team.name}</Text>
      <Text style={styles.rowSubtitle}>
        {team.players.length} players · {(team as any).coach?.name || "No coach assigned"}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} />
  </Pressable>
);

const AdminTeamsListScreen = () => {
  const navigation = useNavigation<any>();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setIsLoading(true);
        try {
          const res = await getTeams();
          setTeams(res.data);
        } catch (error) {
          console.error("Failed to load teams:", error);
        } finally {
          setIsLoading(false);
        }
      };
      load();
    }, [])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Teams</Text>
        <Text style={styles.headerSubtitle}>{teams.length} total</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xxl }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {teams.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="shield-outline" size={32} color={colors.secondaryText} />
              <Text style={styles.emptyStateText}>No teams have been created yet.</Text>
            </View>
          ) : (
            teams.map((t) => (
              <TeamRow key={t._id} team={t} onPress={() => navigation.navigate("TeamDetail", { teamId: t._id })} />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md },
  headerTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.primaryText },
  headerSubtitle: { fontFamily: fonts.body, fontSize: 12, color: colors.secondaryText, marginTop: 2 },
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
  crest: { width: 40, height: 40, borderRadius: 8, backgroundColor: colors.pitch, justifyContent: "center", alignItems: "center" },
  crestText: { fontFamily: fonts.bodySemiBold, fontSize: 11, color: "#FFFFFF" },
  rowTitle: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.primaryText },
  rowSubtitle: { fontFamily: fonts.body, fontSize: 12, color: colors.secondaryText, marginTop: 2 },
  emptyState: { alignItems: "center", paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyStateText: { fontFamily: fonts.body, fontSize: 14, color: colors.secondaryText, textAlign: "center" },
});

export default AdminTeamsListScreen;