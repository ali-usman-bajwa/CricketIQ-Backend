import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getPlayerFeatures, PlayerFeatures } from "../../api/mlApi";
import { getTeam } from "../../api/teamApi";
import { colors, fonts, spacing } from "../../theme/theme";
import NoDataTipsCard from "../../components/NoDataTipsCard";

const StatTile = ({ label, value }: { label: string; value: string | number }) => (
  <View style={styles.tile}>
    <Text style={styles.tileValue}>{value}</Text>
    <Text style={styles.tileLabel}>{label}</Text>
  </View>
);

const ActionCard = ({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress: () => void;
}) => (
  <Pressable
    style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
    onPress={onPress}
  >
    <View style={{ flex: 1 }}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionDescription}>{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
  </Pressable>
);

const PlayerDashboardScreen = () => {
  const { user, player } = useAuth();
  const navigation = useNavigation<any>();

  const [features, setFeatures] = useState<PlayerFeatures | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string | null>(null);

  useEffect(() => {
    const loadTeam = async () => {
      if (!player?.team) return;
      try {
        const res = await getTeam(player.team);
        setTeamName(res.data.name);
      } catch {
        setTeamName(null);
      }
    };
    loadTeam();
  }, [player?.team]);

  const loadFeatures = useCallback(async () => {
    if (!player?._id) return;

    try {
      setErrorMessage(null);
      const response = await getPlayerFeatures(player._id);
      setFeatures(response.data.features);
    } catch (error: any) {
      // Backend returns a clear message for both "no performances yet"
      // and "under 3 matches" cases — surface it directly as an empty state.
      const message = error?.response?.data?.message || "Unable to load your stats right now.";
      setErrorMessage(message);
      setFeatures(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [player?._id]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadFeatures();
    }, [loadFeatures])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    loadFeatures();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.greeting}>{user?.name}</Text>
          <View style={styles.roleTeamRow}>
            <Text style={styles.role}>{player?.role || user?.role}</Text>
            {teamName && (
              <>
                <View style={styles.dot} />
                <Text style={styles.team}>{teamName}</Text>
              </>
            )}
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xxl }} />
        ) : errorMessage ? (
          <NoDataTipsCard role={player?.role} />
        ) : (
          features && (
            <View style={styles.grid}>
              <StatTile label="MATCHES" value={features.matches} />
              <StatTile label="BATTING AVG" value={features.battingAverage.toFixed(1)} />
              <StatTile label="STRIKE RATE" value={features.strikeRate.toFixed(1)} />
              <StatTile label="WICKETS" value={features.totalWickets} />
              <StatTile label="ECONOMY" value={features.economy.toFixed(1)} />
              <StatTile label="RECENT FORM" value={features.recentForm.toFixed(0)} />
              <StatTile label="CONSISTENCY" value={features.consistency.toFixed(0)} />
              <StatTile label="OVERALL IMPACT" value={features.overallImpact.toFixed(0)} />
            </View>
          )
        )}

        <Text style={styles.sectionLabel}>CRICKETIQ INTELLIGENCE</Text>

        <View style={styles.actionList}>
          <ActionCard
            title="AI Scout Analysis"
            description="Objective scouting assessment based on your performance"
            onPress={() => navigation.navigate("AIScout", { playerId: player?._id })}
          />
          <ActionCard
            title="AI Coach"
            description="Personalized development plan and training focus"
            onPress={() => navigation.navigate("AICoach", { playerId: player?._id })}
          />
          <ActionCard
            title="Performance Report"
            description="Detailed insights into your recent form and trends"
            onPress={() => navigation.navigate("AIInsights", { playerId: player?._id })}
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
  roleTeamRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 6 },
  role: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.accent },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.secondaryText },
  team: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.secondaryText },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.xl },
  tile: {
    width: "47.5%",
    backgroundColor: colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  tileValue: { fontFamily: fonts.display, fontSize: 26, color: colors.primaryText },
  tileLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.secondaryText,
    marginTop: spacing.xs,
  },
  sectionLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.secondaryText,
    marginBottom: spacing.sm,
  },
  actionList: { gap: spacing.sm },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  actionCardPressed: { backgroundColor: colors.border },
  actionTitle: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.primaryText },
  actionDescription: { fontFamily: fonts.body, fontSize: 12, color: colors.secondaryText, marginTop: 2 },
  emptyState: { alignItems: "center", paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyStateText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
});

export default PlayerDashboardScreen;