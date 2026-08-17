import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { buildTeam, RecommendedXIEntry, TeamBuilderAnalysis } from "../../api/aiApi";
import ExpandableText from "../../components/ExpandableText";
import { colors, fonts, spacing } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";

const FORMATS = ["T20", "ODI", "TEST"] as const;
type Format = (typeof FORMATS)[number];

const CONFIDENCE_COLORS: Record<string, string> = {
  LOW: "#C1443C",
  MEDIUM: "#D4A614",
  HIGH: colors.accent,
};

const ROLE_ORDER = ["Wicket-Keeper", "Batter", "All-Rounder", "Bowler"];

const SectionCard = ({ title, icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Ionicons name={icon} size={16} color={colors.secondaryText} />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const XIPlayerRow = ({ entry }: { entry: RecommendedXIEntry }) => (
  <View style={styles.xiRow}>
    <View style={{ flex: 1 }}>
      <Text style={styles.xiName}>{entry.player.name}</Text>
      <Text style={styles.xiRole}>{entry.role}</Text>
    </View>
    <View style={styles.xiScoreWrap}>
      <Text style={styles.xiScore}>{entry.prediction.potentialScore.toFixed(0)}</Text>
      <Text style={styles.xiScoreLabel}>{entry.prediction.potentialLevel}</Text>
    </View>
  </View>
);

const LeadershipCard = ({
  title,
  name,
  reason,
}: {
  title: string;
  name: string;
  reason: string;
}) => (
  <View style={styles.leadershipCard}>
    <Text style={styles.leadershipTitle}>{title}</Text>
    <Text style={styles.leadershipName}>{name}</Text>
    <ExpandableText text={reason} numberOfLines={2} />
  </View>
);

const TeamBuilderScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { coachTeam } = useAuth();

  const [format, setFormat] = useState<Format>("T20");
  const [recommendedXI, setRecommendedXI] = useState<RecommendedXIEntry[] | null>(null);
  const [analysis, setAnalysis] = useState<TeamBuilderAnalysis | null>(null);
  const [teamMetrics, setTeamMetrics] = useState<{ averagePotential: number; averageOverallImpact: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const ids = route.params?.selectedPlayerIds;
      if (ids && ids.length >= 11) {
        run(ids, format);
      }
    }, [route.params?.selectedPlayerIds])
  );

  const run = async (ids: string[], fmt: Format) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await buildTeam(ids, fmt);
      setRecommendedXI(res.data.recommendedXI);
      setAnalysis(res.data.aiTeamAnalysis);
      setTeamMetrics(res.data.teamMetrics);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || "Unable to build recommended team.");
      setRecommendedXI(null);
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };

  const openPicker = () => {
    if (!coachTeam || coachTeam.players.length < 11) {
      return; // guarded below by the banner instead of silently failing
    }
    navigation.navigate("PlayerPicker", {
      returnTo: "TeamBuilder",
      minSelect: 11,
      maxSelect: 30,
      sourcePlayers: coachTeam.players,
    });
  };

  const groupedXI = recommendedXI
    ? ROLE_ORDER.map((role) => ({
        role,
        players: recommendedXI.filter((e) => e.role === role),
      })).filter((g) => g.players.length > 0)
    : [];

  const confidenceColor = analysis ? CONFIDENCE_COLORS[analysis.confidence] || colors.secondaryText : colors.secondaryText;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Team Builder</Text>

        <View style={styles.formatRow}>
          {FORMATS.map((f) => (
            <Pressable key={f} style={[styles.formatOption, format === f && styles.formatOptionSelected]} onPress={() => setFormat(f)}>
              <Text style={[styles.formatText, format === f && styles.formatTextSelected]}>{f}</Text>
            </Pressable>
          ))}
        </View>

        {coachTeam && coachTeam.players.length < 11 ? (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              Your squad has {coachTeam.players.length} player{coachTeam.players.length === 1 ? "" : "s"} — at least 11 are needed to build a recommended XI.
            </Text>
          </View>
        ) : (
          <Pressable style={({ pressed }) => [styles.pickButton, pressed && styles.pickButtonPressed]} onPress={openPicker}>
            <Ionicons name="people-outline" size={16} color={colors.background} />
            <Text style={styles.pickButtonText}>
              {recommendedXI ? "Change Players" : "Select From Your Squad"}
            </Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.loadingText}>Building your XI…</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={32} color={colors.secondaryText} />
          <Text style={styles.emptyStateText}>{errorMessage}</Text>
        </View>
      ) : !recommendedXI || !analysis ? (
        <View style={styles.centered}>
          <Ionicons name="trophy-outline" size={32} color={colors.secondaryText} />
          <Text style={styles.emptyStateText}>
            Select 11–30 players and a format to get an AI-recommended XI.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{teamMetrics?.averagePotential.toFixed(1)}</Text>
              <Text style={styles.metricLabel}>AVG POTENTIAL</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{teamMetrics?.averageOverallImpact.toFixed(1)}</Text>
              <Text style={styles.metricLabel}>AVG IMPACT</Text>
            </View>
            <View style={[styles.confidenceBadge, { borderColor: confidenceColor }]}>
              <Text style={[styles.confidenceText, { color: confidenceColor }]}>{analysis.confidence}</Text>
            </View>
          </View>

          <View style={styles.leadershipRow}>
            <LeadershipCard title="CAPTAIN" name={analysis.captainRecommendation.player} reason={analysis.captainRecommendation.reason} />
            <LeadershipCard title="VICE-CAPTAIN" name={analysis.viceCaptainRecommendation.player} reason={analysis.viceCaptainRecommendation.reason} />
          </View>

          <Text style={styles.sectionLabel}>RECOMMENDED XI</Text>
          {groupedXI.map((group) => (
            <View key={group.role} style={styles.roleGroup}>
              <Text style={styles.roleGroupTitle}>{group.role.toUpperCase()}S</Text>
              {group.players.map((entry) => (
                <XIPlayerRow key={entry.player.id} entry={entry} />
              ))}
            </View>
          ))}

          <SectionCard title="TEAM SUMMARY" icon="document-text-outline">
            <ExpandableText text={analysis.teamSummary} />
          </SectionCard>

          <View style={styles.splitRow}>
            <View style={[styles.card, styles.splitCard]}>
              <Text style={styles.cardTitle}>STRENGTHS</Text>
              {analysis.teamStrengths.map((s, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={[styles.dot, { backgroundColor: colors.accent }]} />
                  <Text style={styles.bulletText}>{s}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.card, styles.splitCard]}>
              <Text style={styles.cardTitle}>WEAKNESSES</Text>
              {analysis.teamWeaknesses.map((w, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={[styles.dot, { backgroundColor: "#D4A614" }]} />
                  <Text style={styles.bulletText}>{w}</Text>
                </View>
              ))}
            </View>
          </View>

          <SectionCard title="BATTING" icon="baseball-outline">
            <ExpandableText text={analysis.battingAnalysis} />
          </SectionCard>

          <SectionCard title="BOWLING" icon="disc-outline">
            <ExpandableText text={analysis.bowlingAnalysis} />
          </SectionCard>

          <SectionCard title="TEAM BALANCE" icon="scale-outline">
            <ExpandableText text={analysis.teamBalance} />
          </SectionCard>

          <SectionCard title="KEY PLAYERS" icon="star-outline">
            {analysis.keyPlayers.map((kp, i) => (
              <View key={i} style={{ marginBottom: spacing.sm }}>
                <Text style={styles.keyPlayerName}>{kp.player}</Text>
                <Text style={styles.bulletText}>{kp.reason}</Text>
              </View>
            ))}
          </SectionCard>

          <Text style={styles.dataLimitNote}>{analysis.dataLimitations}</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { padding: spacing.xl, gap: spacing.md },
  headerTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.primaryText },
  formatRow: { flexDirection: "row", gap: spacing.sm },
  formatOption: { flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: 4, paddingVertical: spacing.sm, alignItems: "center" },
  formatOptionSelected: { backgroundColor: colors.pitch, borderColor: colors.pitch },
  formatText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.secondaryText },
  formatTextSelected: { color: "#FFFFFF" },
  warningBanner: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md },
  warningText: { fontFamily: fonts.body, fontSize: 13, color: colors.secondaryText, textAlign: "center" },
  pickButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.accent,
    borderRadius: 4,
    paddingVertical: spacing.sm,
  },
  pickButtonPressed: { backgroundColor: colors.accentPress },
  pickButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: spacing.sm, padding: spacing.xl },
  loadingText: { fontFamily: fonts.body, color: colors.secondaryText },
  emptyStateText: { fontFamily: fonts.body, fontSize: 14, color: colors.secondaryText, textAlign: "center" },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.md },

  metricsRow: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  metricCard: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, alignItems: "center" },
  metricValue: { fontFamily: fonts.display, fontSize: 20, color: colors.primaryText },
  metricLabel: { fontFamily: fonts.bodyMedium, fontSize: 9, color: colors.secondaryText, marginTop: 2 },
  confidenceBadge: { borderWidth: 1, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 10 },
  confidenceText: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 0.5 },

  leadershipRow: { flexDirection: "row", gap: spacing.sm },
  leadershipCard: { flex: 1, backgroundColor: colors.pitch, borderRadius: 8, padding: spacing.md, gap: 4 },
  leadershipTitle: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 1, color: "rgba(255,255,255,0.7)" },
  leadershipName: { fontFamily: fonts.display, fontSize: 16, color: "#FFFFFF" },

  sectionLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1.5, color: colors.secondaryText },
  roleGroup: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md },
  roleGroupTitle: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 1, color: colors.accent, marginBottom: spacing.sm },
  xiRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
  xiName: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.primaryText },
  xiRole: { fontFamily: fonts.body, fontSize: 11, color: colors.secondaryText },
  xiScoreWrap: { alignItems: "flex-end" },
  xiScore: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.primaryText },
  xiScoreLabel: { fontFamily: fonts.bodyMedium, fontSize: 9, color: colors.secondaryText },

  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: spacing.sm },
  cardTitle: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1, color: colors.secondaryText, marginBottom: spacing.sm },
  keyPlayerName: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.primaryText, marginBottom: 2 },

  splitRow: { flexDirection: "row", gap: spacing.sm },
  splitCard: { flex: 1 },
  bulletRow: { flexDirection: "row", gap: 6, marginBottom: spacing.xs, alignItems: "flex-start" },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  bulletText: { fontFamily: fonts.body, fontSize: 12, color: colors.primaryText, flex: 1, lineHeight: 16 },

  dataLimitNote: { fontFamily: fonts.body, fontSize: 12, color: colors.secondaryText, fontStyle: "italic", textAlign: "center" },
});

export default TeamBuilderScreen;