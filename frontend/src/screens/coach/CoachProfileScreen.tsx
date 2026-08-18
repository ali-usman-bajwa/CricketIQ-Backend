import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getMatches, Match } from "../../api/matchApi";
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

const CoachProfileScreen = () => {
  const { user, coachTeam, logout } = useAuth();
  const navigation = useNavigation<any>();

  const [completedCount, setCompletedCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setIsLoading(true);
        try {
          const res = await getMatches();
          setCompletedCount(res.data.filter((m: Match) => m.status === "completed").length);
        } catch {
          setCompletedCount(null);
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
            <Text style={styles.avatarInitial}>{user?.name?.[0]?.toUpperCase() || "C"}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="ribbon-outline" size={12} color={colors.accent} />
            <Text style={styles.roleBadgeText}>COACH</Text>
          </View>
        </View>

        {coachTeam ? (
          <View style={styles.teamCard}>
            <View style={styles.teamCardHeader}>
              <View>
                <Text style={styles.teamLabel}>MANAGING</Text>
                <Text style={styles.teamName}>{coachTeam.name}</Text>
                <Text style={styles.teamMeta}>{coachTeam.shortName} · {coachTeam.country}</Text>
              </View>
              <View style={styles.teamCrest}>
                <Text style={styles.teamCrestText}>{coachTeam.shortName?.slice(0, 3)}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noTeamCard}>
            <Ionicons name="people-outline" size={22} color={colors.secondaryText} />
            <Text style={styles.noTeamText}>You haven't created a team yet.</Text>
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: spacing.lg }} />
        ) : (
          <View style={styles.statsRow}>
            <StatCard value={coachTeam?.players.length ?? 0} label="SQUAD SIZE" icon="people-outline" />
            <StatCard value={completedCount ?? "—"} label="MATCHES PLAYED" icon="checkmark-done-outline" />
          </View>
        )}

        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.actionList}>
          <ActionRow
            title="Manage Squad"
            icon="people-outline"
            onPress={() => navigation.navigate("Squad")}
          />
        </View>
        <View style={styles.emailRow}>
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

  teamCard: { backgroundColor: colors.pitch, borderRadius: 10, padding: spacing.lg, marginBottom: spacing.md },
  teamCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  teamLabel: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 1.5, color: "rgba(255,255,255,0.7)" },
  teamName: { fontFamily: fonts.display, fontSize: 18, color: "#FFFFFF", marginTop: 2 },
  teamMeta: { fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  teamCrest: { width: 44, height: 44, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center" },
  teamCrestText: { fontFamily: fonts.display, fontSize: 13, color: "#FFFFFF" },

  noTeamCard: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, marginBottom: spacing.md },
  noTeamText: { fontFamily: fonts.body, fontSize: 13, color: colors.secondaryText, flex: 1 },

  statsRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.xl },
  statCard: { flex: 1, alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.md, gap: 4 },
  statValue: { fontFamily: fonts.display, fontSize: 22, color: colors.primaryText },
  statLabel: { fontFamily: fonts.bodyMedium, fontSize: 9, letterSpacing: 0.5, color: colors.secondaryText },

  sectionLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1.5, color: colors.secondaryText, marginBottom: spacing.sm },
  actionList: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, overflow: "hidden" },
  actionRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md },
  actionRowPressed: { backgroundColor: colors.border },
  actionIcon: { width: 30, height: 30, borderRadius: 8, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" },
  actionTitle: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.primaryText },

  emailRow: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, marginTop: spacing.sm, marginBottom: spacing.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10 },
  emailLabel: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 1, color: colors.secondaryText, marginBottom: 2 },
  emailText: { fontFamily: fonts.body, fontSize: 13, color: colors.primaryText },

  logoutButton: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, paddingVertical: spacing.sm },
  logoutText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: "#C1443C" },
});

export default CoachProfileScreen;