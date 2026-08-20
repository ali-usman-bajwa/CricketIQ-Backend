import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getTeams } from "../../api/teamApi";
import { getMatches } from "../../api/matchApi";
import { getAllPlayers } from "../../api/playerApi";
import { colors, fonts, spacing } from "../../theme/theme";

const StatCard = ({ value, label, icon }: { value: string | number; label: string; icon: any }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={18} color={colors.pitch} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ActionRow = ({ title, icon, onPress }: { title: string; icon: any; onPress: () => void }) => (
  <Pressable style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]} onPress={onPress}>
    <View style={styles.actionIcon}>
      <Ionicons name={icon} size={18} color={colors.secondaryText} />
    </View>
    <Text style={styles.actionTitle}>{title}</Text>
    <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} />
  </Pressable>
);

const AdminProfileScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();

  const [teamCount, setTeamCount] = useState<number | null>(null);
  const [playerCount, setPlayerCount] = useState<number | null>(null);
  const [matchCount, setMatchCount] = useState<number | null>(null);
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
          setMatchCount(matchesRes.count);
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
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{user?.name?.[0]?.toUpperCase() || "A"}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark-outline" size={12} color={colors.accent} />
            <Text style={styles.roleBadgeText}>ADMINISTRATOR</Text>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: spacing.lg }} />
        ) : (
          <View style={styles.statsRow}>
            <StatCard value={teamCount ?? "—"} label="TEAMS" icon="shield-outline" />
            <StatCard value={playerCount ?? "—"} label="PLAYERS" icon="people-outline" />
            <StatCard value={matchCount ?? "—"} label="MATCHES" icon="calendar-outline" />
          </View>
        )}

        <Text style={styles.sectionLabel}>MANAGE</Text>
        <View style={styles.actionList}>
          <ActionRow title="Teams" icon="shield-outline" onPress={() => navigation.navigate("Teams")} />
          <ActionRow title="Players" icon="people-outline" onPress={() => navigation.navigate("Players")} />
          <ActionRow title="Matches" icon="calendar-outline" onPress={() => navigation.navigate("Matches")} />
          <ActionRow title="Tools" icon="hardware-chip-outline" onPress={() => navigation.navigate("Tools")} />
        </View>

        <View style={styles.emailCard}>
          <Text style={styles.emailLabel}>EMAIL</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>

        <Pressable style={({ pressed }) => [styles.logoutButton, pressed && { opacity: 0.6 }]} onPress={logout}>
          <Ionicons name="log-out-outline" size={16} color="#C1443C" />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  avatarWrap: { alignItems: "center", marginBottom: spacing.lg },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.pitch, justifyContent: "center", alignItems: "center", marginBottom: spacing.sm },
  avatarInitial: { fontFamily: fonts.display, fontSize: 30, color: "#FFFFFF" },
  name: { fontFamily: fonts.display, fontSize: 20, color: colors.primaryText },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginTop: spacing.xs,
  },
  roleBadgeText: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 1, color: colors.accent },

  statsRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.xl },
  statCard: { flex: 1, alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.md, gap: 4 },
  statValue: { fontFamily: fonts.display, fontSize: 22, color: colors.primaryText },
  statLabel: { fontFamily: fonts.bodyMedium, fontSize: 9, letterSpacing: 0.5, color: colors.secondaryText },

  sectionLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1.5, color: colors.secondaryText, marginBottom: spacing.sm },
  actionList: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, overflow: "hidden", marginBottom: spacing.lg },
  actionRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  actionRowPressed: { backgroundColor: colors.border },
  actionIcon: { width: 30, height: 30, borderRadius: 8, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" },
  actionTitle: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.primaryText },

  emailCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, marginBottom: spacing.lg },
  emailLabel: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 1, color: colors.secondaryText, marginBottom: 2 },
  emailText: { fontFamily: fonts.body, fontSize: 13, color: colors.primaryText },

  logoutButton: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, paddingVertical: spacing.sm },
  logoutText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: "#C1443C" },
});

export default AdminProfileScreen;