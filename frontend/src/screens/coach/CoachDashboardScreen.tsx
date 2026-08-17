import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getMatches, Match } from "../../api/matchApi";
import { colors, fonts, spacing } from "../../theme/theme";

const QuickAction = ({
  title,
  description,
  icon,
  onPress,
}: {
  title: string;
  description: string;
  icon: any;
  onPress: () => void;
}) => (
  <Pressable style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]} onPress={onPress}>
    <View style={styles.actionIcon}>
      <Ionicons name={icon} size={18} color={colors.pitch} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionDescription}>{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} />
  </Pressable>
);

const CoachDashboardScreen = () => {
  const { user, coachTeam, refreshCoachTeam } = useAuth();
  const navigation = useNavigation<any>();

  const [upcomingCount, setUpcomingCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setIsLoading(true);
        await refreshCoachTeam();
        try {
          const res = await getMatches();
          setUpcomingCount(res.data.filter((m: Match) => m.status === "scheduled").length);
        } catch {
          setUpcomingCount(null);
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
          <Text style={styles.role}>Coach{coachTeam ? ` · ${coachTeam.name}` : ""}</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />
        ) : !coachTeam ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={32} color={colors.secondaryText} />
            <Text style={styles.emptyStateText}>
              You don't have a team yet. Create one from the Squad tab to get started.
            </Text>
          </View>
        ) : (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{coachTeam.players.length}</Text>
              <Text style={styles.statLabel}>SQUAD SIZE</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{upcomingCount ?? "—"}</Text>
              <Text style={styles.statLabel}>UPCOMING MATCHES</Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
        <View style={styles.actionList}>
          <QuickAction
            title="Manage Squad"
            description="View roster, add or remove players"
            icon="people-outline"
            onPress={() => navigation.navigate("Squad")}
          />
          <QuickAction
            title="Matches"
            description="Create fixtures and mark results"
            icon="calendar-outline"
            onPress={() => navigation.navigate("Matches")}
          />
          <QuickAction
            title="Compare Players"
            description="Side-by-side stats and ML potential"
            icon="git-compare-outline"
            onPress={() => navigation.navigate("Tools", { screen: "Comparison" })}
          />
          <QuickAction
            title="Build Recommended XI"
            description="AI-assisted team selection"
            icon="trophy-outline"
            onPress={() => navigation.navigate("Tools", { screen: "TeamBuilder" })}
          />
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
  role: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.accent, marginTop: 4 },
  statsRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.xl },
  statCard: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md },
  statValue: { fontFamily: fonts.display, fontSize: 28, color: colors.primaryText },
  statLabel: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 1, color: colors.secondaryText, marginTop: spacing.xs },
  sectionLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1.5, color: colors.secondaryText, marginBottom: spacing.sm },
  actionList: { gap: spacing.sm },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  actionCardPressed: { backgroundColor: colors.border },
  actionIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" },
  actionTitle: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.primaryText },
  actionDescription: { fontFamily: fonts.body, fontSize: 12, color: colors.secondaryText, marginTop: 2 },
  emptyState: { alignItems: "center", paddingVertical: spacing.xl, gap: spacing.sm, marginBottom: spacing.xl },
  emptyStateText: { fontFamily: fonts.body, fontSize: 14, color: colors.secondaryText, textAlign: "center" },
});

export default CoachDashboardScreen;