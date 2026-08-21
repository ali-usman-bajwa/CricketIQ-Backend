import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getAIInsights, AIInsightsResponse } from "../../api/aiApi";
import ExpandableText from "../../components/ExpandableText";
import NoDataTipsCard from "../../components/NoDataTipsCard";
import { colors, fonts, spacing } from "../../theme/theme";

const CONFIDENCE_COLORS: Record<string, string> = {
  LOW: "#C1443C",
  MEDIUM: "#D4A614",
  HIGH: colors.accent,
};

const SectionCard = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Ionicons name={icon} size={16} color={colors.secondaryText} />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const CompactBullet = ({ text, iconColor }: { text: string; iconColor: string }) => (
  <View style={styles.bulletRow}>
    <View style={[styles.dot, { backgroundColor: iconColor }]} />
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

const StatCard = ({ metric, value, observation }: { metric: string; value: string; observation: string }) => (
  <View style={styles.statCard}>
    <Text style={styles.statMetric}>{metric}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statObservation}>{observation}</Text>
  </View>
);

const AIInsightsScreen = () => {
  const route = useRoute<any>();
  const { playerId } = route.params;

  const [data, setData] = useState<AIInsightsResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getAIInsights(playerId);
        setData(response.data);
      } catch (error: any) {
        setErrorMessage(
          error?.response?.data?.message || "Unable to generate your performance report right now."
        );
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
        <Text style={styles.loadingText}>Building your report…</Text>
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

  const { report } = data;
  const confidenceColor = CONFIDENCE_COLORS[report.confidence] || colors.secondaryText;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Performance Report</Text>
        <View style={[styles.confidenceBadge, { borderColor: confidenceColor }]}>
          <Text style={[styles.confidenceText, { color: confidenceColor }]}>
            {report.confidence} CONFIDENCE
          </Text>
        </View>
      </View>

      <Text style={styles.summaryText}>{report.reportSummary}</Text>

      {/* KEY STATS — the backend's own picks for what matters most */}
      <View style={styles.statsRow}>
        {report.keyStatistics.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </View>

      <SectionCard title="RECENT FORM" icon="pulse-outline">
        <ExpandableText text={report.formAnalysis} />
      </SectionCard>

      <View style={styles.splitRow}>
        <View style={[styles.card, styles.splitCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="baseball-outline" size={16} color={colors.secondaryText} />
            <Text style={styles.cardTitle}>BATTING</Text>
          </View>
          {report.battingInsights.map((item, i) => (
            <CompactBullet key={i} text={item} iconColor={colors.accent} />
          ))}
        </View>
        <View style={[styles.card, styles.splitCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="disc-outline" size={16} color={colors.secondaryText} />
            <Text style={styles.cardTitle}>BOWLING</Text>
          </View>
          {report.bowlingInsights.map((item, i) => (
            <CompactBullet key={i} text={item} iconColor={colors.pitch} />
          ))}
        </View>
      </View>

      <SectionCard title="CONSISTENCY" icon="analytics-outline">
        <ExpandableText text={report.consistencyAnalysis} />
      </SectionCard>

      <SectionCard title="WHAT THE ML SIGNAL MEANS" icon="hardware-chip-outline">
        <ExpandableText text={report.mlInsight} />
      </SectionCard>

      <SectionCard title="WHERE TO IMPROVE" icon="trending-up-outline">
        {report.developmentInsights.map((item, i) => (
          <CompactBullet key={i} text={item} iconColor="#D4A614" />
        ))}
      </SectionCard>

      <SectionCard title="OVERALL PROFILE" icon="person-outline">
        <ExpandableText text={report.scoutingInsight} />
      </SectionCard>

      <Text style={styles.dataLimitNote}>{report.dataLimitations}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.md },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  loadingText: { fontFamily: fonts.body, color: colors.secondaryText },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.primaryText },
  confidenceBadge: { borderWidth: 1, borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  confidenceText: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 0.5 },

  summaryText: { fontFamily: fonts.body, fontSize: 14, color: colors.primaryText, lineHeight: 20 },

  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  statCard: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
  },
  statMetric: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 0.5, color: colors.secondaryText },
  statValue: { fontFamily: fonts.display, fontSize: 20, color: colors.primaryText, marginTop: 2 },
  statObservation: { fontFamily: fonts.body, fontSize: 10, color: colors.secondaryText, marginTop: spacing.xs, lineHeight: 13 },

  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: spacing.sm },
  cardTitle: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1, color: colors.secondaryText },

  splitRow: { flexDirection: "row", gap: spacing.sm },
  splitCard: { flex: 1 },

  bulletRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm, alignItems: "flex-start" },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  bulletText: { fontFamily: fonts.body, fontSize: 12, color: colors.primaryText, flex: 1, lineHeight: 16 },

  dataLimitNote: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.secondaryText,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: spacing.sm,
  },
});

export default AIInsightsScreen;