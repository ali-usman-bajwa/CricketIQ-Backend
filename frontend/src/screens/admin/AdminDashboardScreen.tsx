import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getTeams } from "../../api/teamApi";
import { getMatches } from "../../api/matchApi";
import { getAllPlayers } from "../../api/playerApi";
import { colors, fonts, spacing } from "../../theme/theme";

const StatCard = ({ value, label, icon }: { value: string | number; label: string; icon: any }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={20} color={colors.pitch} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const AdminDashboardScreen = () => {
  const { user } = useAuth();

  const [teamCount, setTeamCount] = useState<number | null>(null);
  const [playerCount, setPlayerCount] = useState<number | null>(null);
  const [matchStats, setMatchStats] = useState<{ scheduled: number; completed: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setIsLoading(true);
        try {
          const [teamsRes, playersRes, matchesRes] = await Promise.all([
            getTeams(),
            getAllPlayers(),
            getMatches(),
          ]);
          setTeamCount(teamsRes.count);
          setPlayerCount(playersRes.count);
          setMatchStats({
            scheduled: matchesRes.data.filter((m) => m.status === "scheduled").length,
            completed: matchesRes.data.filter((m) => m.status === "completed").length,
          });
        } catch (error) {
          console.error("Failed to load admin stats:", error);
        } finally {
          setIsLoading(false);
        }
      };
      load();
    }, [])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.greeting}>{user?.name}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark-outline" size={12} color={colors.accent} />
            <Text style={styles.roleBadgeText}>ADMINISTRATOR</Text>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />
        ) : (
          <View style={styles.statsGrid}>
            <StatCard value={teamCount ?? "—"} label="TEAMS" icon="shield-outline" />
            <StatCard value={playerCount ?? "—"} label="PLAYERS" icon="people-outline" />
            <StatCard value={matchStats?.scheduled ?? "—"} label="SCHEDULED" icon="time-outline" />
            <StatCard value={matchStats?.completed ?? "—"} label="COMPLETED" icon="checkmark-done-outline" />
          </View>
        )}

        <Text style={styles.sectionLabel}>SYSTEM OVERVIEW</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            You have full access to manage all teams, matches, and players across CricketIQ, along with
            AI tools for scouting, comparison, and team building.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.xl },
  welcomeText: { fontFamily: fonts.body, fontSize: 14, color: colors.secondaryText },
  greeting: { fontFamily: fonts.display, fontSize: 26, color: colors.primaryText, marginTop: 2 },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginTop: spacing.sm,
  },
  roleBadgeText: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 1, color: colors.accent },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.xl },
  statCard: {
    width: "47.5%",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: spacing.md,
    gap: 4,
  },
  statValue: { fontFamily: fonts.display, fontSize: 24, color: colors.primaryText },
  statLabel: { fontFamily: fonts.bodyMedium, fontSize: 9, letterSpacing: 0.5, color: colors.secondaryText },
  sectionLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1.5, color: colors.secondaryText, marginBottom: spacing.sm },
  infoCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md },
  infoText: { fontFamily: fonts.body, fontSize: 13, color: colors.secondaryText, lineHeight: 19 },
});

export default AdminDashboardScreen;