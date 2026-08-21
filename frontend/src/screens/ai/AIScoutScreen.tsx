import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getAIScoutAnalysis, AIScoutResponse } from "../../api/aiApi";
import CircularGauge from "../../components/CircularGauge";
import ExpandableText from "../../components/ExpandableText";
import NoDataTipsCard from "../../components/NoDataTipsCard";
import { colors, fonts, spacing } from "../../theme/theme";

const CONFIDENCE_COLORS: Record<string, string> = {
  LOW: "#C1443C",
  MEDIUM: "#D4A614",
  HIGH: colors.accent,
};

const TREND_ICON: Record<string, { icon: any; color: string }> = {
  IMPROVING: { icon: "trending-up", color: colors.accent },
  DECLINING: { icon: "trending-down", color: "#C1443C" },
  STABLE: { icon: "remove", color: colors.secondaryText },
};

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

const CompactBullet = ({ text, icon, iconColor }: { text: string; icon: any; iconColor: string }) => (
  <View style={styles.bulletRow}>
    <Ionicons name={icon} size={15} color={iconColor} style={{ marginTop: 2 }} />
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

const TrendPill = ({ label, trend }: { label: string; trend: string }) => {
  const config = TREND_ICON[trend] || TREND_ICON.STABLE;
  return (
    <View style={styles.trendPill}>
      <Ionicons name={config.icon} size={18} color={config.color} />
      <Text style={styles.trendPillLabel}>{label}</Text>
      <Text style={[styles.trendPillValue, { color: config.color }]}>{trend}</Text>
    </View>
  );
};

const AIScoutScreen = () => {
  const route = useRoute<any>();
  const { playerId } = route.params;

  const [data, setData] = useState<AIScoutResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getAIScoutAnalysis(playerId);
        setData(response.data);
      } catch (error: any) {
        setErrorMessage(error?.response?.data?.message || "Unable to generate scouting analysis right now.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [playerId]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.loadingText}>Analyzing performance data…</Text>
      </View>
    );
  }

  if (errorMessage || !data) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <NoDataTipsCard />
      </ScrollView>
    );
  }

  const { player, prediction, analysis } = data;
  const confidenceColor = CONFIDENCE_COLORS[analysis.confidence] || colors.secondaryText;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* HERO */}
      <View style={styles.hero}>
        <CircularGauge value={prediction.potentialScore} label={prediction.potentialLevel} color={confidenceColor} />
        <View style={styles.heroText}>
          <Text style={styles.playerName}>{player.name}</Text>
          <Text style={styles.playerMeta}>{player.role} · Age {player.age}</Text>
          <View style={[styles.confidenceBadge, { borderColor: confidenceColor }]}>
            <Text style={[styles.confidenceText, { color: confidenceColor }]}>{analysis.confidence} CONFIDENCE</Text>
          </View>
        </View>
      </View>

      {/* TREND — icon-first, scannable at a glance */}
      <View style={styles.trendRow}>
        <TrendPill label="RUNS" trend={analysis.recentTrend.runTrend} />
        <TrendPill label="STRIKE RATE" trend={analysis.recentTrend.strikeRateTrend} />
      </View>

      {/* STRENGTHS / IMPROVEMENTS — side by side */}
      <View style={styles.splitRow}>
        <View style={[styles.card, styles.splitCard]}>
          <Text style={styles.cardTitle}>STRENGTHS</Text>
          {analysis.strengths.map((item, i) => (
            <CompactBullet key={i} text={item} icon="checkmark-circle" iconColor={colors.accent} />
          ))}
        </View>
        <View style={[styles.card, styles.splitCard]}>
          <Text style={styles.cardTitle}>TO IMPROVE</Text>
          {analysis.areasForImprovement.map((item, i) => (
            <CompactBullet key={i} text={item} icon="arrow-up-circle" iconColor="#D4A614" />
          ))}
        </View>
      </View>

      <SectionCard title="OVERALL ASSESSMENT">
        <ExpandableText text={analysis.overallAssessment} />
      </SectionCard>

      <SectionCard title="SCOUTING RECOMMENDATION">
        <ExpandableText text={analysis.scoutingRecommendation} />
      </SectionCard>

      <SectionCard title="WHAT THE ML SIGNAL MEANS">
        <ExpandableText text={`${analysis.mlExplanation} ${analysis.potentialAssessment}`} />
      </SectionCard>

      <Text style={styles.dataLimitNote}>{analysis.sampleSizeAssessment}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.md },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background, gap: spacing.sm, padding: spacing.xl },
  loadingText: { fontFamily: fonts.body, color: colors.secondaryText },

  hero: { flexDirection: "row", alignItems: "center", gap: spacing.lg, marginBottom: spacing.sm },
  heroText: { flex: 1, gap: spacing.xs },
  playerName: { fontFamily: fonts.display, fontSize: 20, color: colors.primaryText },
  playerMeta: { fontFamily: fonts.body, fontSize: 13, color: colors.secondaryText },
  confidenceBadge: { alignSelf: "flex-start", borderWidth: 1, borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10, marginTop: spacing.xs },
  confidenceText: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 0.5 },

  trendRow: { flexDirection: "row", gap: spacing.sm },
  trendPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
  },
  trendPillLabel: { fontFamily: fonts.bodyMedium, fontSize: 10, color: colors.secondaryText, flex: 1 },
  trendPillValue: { fontFamily: fonts.bodySemiBold, fontSize: 11 },

  splitRow: { flexDirection: "row", gap: spacing.sm },
  splitCard: { flex: 1 },

  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md },
  cardTitle: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1, color: colors.secondaryText, marginBottom: spacing.sm },

  bulletRow: { flexDirection: "row", gap: 6, marginBottom: spacing.sm },
  bulletText: { fontFamily: fonts.body, fontSize: 12, color: colors.primaryText, flex: 1, lineHeight: 16 },

  dataLimitNote: { fontFamily: fonts.body, fontSize: 12, color: colors.secondaryText, fontStyle: "italic", textAlign: "center", marginTop: spacing.sm },
});

export default AIScoutScreen;