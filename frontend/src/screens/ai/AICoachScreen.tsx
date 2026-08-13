import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getAICoachPlan, AICoachResponse } from "../../api/aiApi";
import ExpandableText from "../../components/ExpandableText";
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

const GoalChecklist = ({ goals }: { goals: string[] }) => (
  <View style={{ gap: spacing.sm }}>
    {goals.map((goal, i) => (
      <View key={i} style={styles.goalRow}>
        <Ionicons name="ellipse-outline" size={18} color={colors.pitch} />
        <Text style={styles.goalText}>{goal}</Text>
      </View>
    ))}
  </View>
);

const AICoachScreen = () => {
  const route = useRoute<any>();
  const { playerId } = route.params;

  const [data, setData] = useState<AICoachResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getAICoachPlan(playerId);
        setData(response.data);
      } catch (error: any) {
        setErrorMessage(
          error?.response?.data?.message || "Unable to generate your coaching plan right now."
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
        <Text style={styles.loadingText}>Building your coaching plan…</Text>
      </View>
    );
  }

  if (errorMessage || !data) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={32} color={colors.secondaryText} />
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    );
  }

  const { coaching } = data;
  const confidenceColor = CONFIDENCE_COLORS[coaching.confidence] || colors.secondaryText;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* HERO — priority area is the one thing to walk away with */}
      <View style={styles.priorityCard}>
        <Text style={styles.priorityLabel}>FOCUS ON THIS FIRST</Text>
        <Text style={styles.priorityText}>{coaching.priorityArea}</Text>
        <View style={[styles.confidenceBadge, { borderColor: confidenceColor }]}>
          <Text style={[styles.confidenceText, { color: confidenceColor }]}>
            {coaching.confidence} CONFIDENCE
          </Text>
        </View>
      </View>

      <SectionCard title="COACH SUMMARY" icon="chatbubble-ellipses-outline">
        <ExpandableText text={coaching.coachSummary} />
      </SectionCard>

      <SectionCard title="KEEP DOING THIS" icon="ribbon-outline">
        <Text style={styles.bodyText}>{coaching.strengthToMaintain}</Text>
      </SectionCard>

      <View style={styles.splitRow}>
        <View style={[styles.card, styles.splitCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="construct-outline" size={16} color={colors.secondaryText} />
            <Text style={styles.cardTitle}>WORK ON</Text>
          </View>
          {coaching.developmentAreas.map((item, i) => (
            <CompactBullet key={i} text={item} iconColor="#D4A614" />
          ))}
        </View>
        <View style={[styles.card, styles.splitCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="barbell-outline" size={16} color={colors.secondaryText} />
            <Text style={styles.cardTitle}>TRAINING</Text>
          </View>
          {coaching.trainingFocus.map((item, i) => (
            <CompactBullet key={i} text={item} iconColor={colors.pitch} />
          ))}
        </View>
      </View>

      <SectionCard title="BEFORE YOUR NEXT MATCH" icon="calendar-outline">
        {coaching.matchPreparation.map((item, i) => (
          <CompactBullet key={i} text={item} iconColor={colors.accent} />
        ))}
      </SectionCard>

      <SectionCard title="SHORT-TERM GOALS" icon="flag-outline">
        <GoalChecklist goals={coaching.shortTermGoals} />
      </SectionCard>

      <Text style={styles.dataLimitNote}>{coaching.dataLimitations}</Text>
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
  errorText: { fontFamily: fonts.body, color: colors.secondaryText, textAlign: "center" },

  priorityCard: {
    backgroundColor: colors.pitch,
    borderRadius: 10,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  priorityLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: "rgba(255,255,255,0.7)",
  },
  priorityText: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: "#FFFFFF",
    lineHeight: 26,
  },
  confidenceBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  confidenceText: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 0.5 },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: spacing.sm },
  cardTitle: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1, color: colors.secondaryText },
  bodyText: { fontFamily: fonts.body, fontSize: 14, color: colors.primaryText, lineHeight: 20 },

  splitRow: { flexDirection: "row", gap: spacing.sm },
  splitCard: { flex: 1 },

  bulletRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm, alignItems: "flex-start" },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  bulletText: { fontFamily: fonts.body, fontSize: 12, color: colors.primaryText, flex: 1, lineHeight: 16 },

  goalRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  goalText: { fontFamily: fonts.body, fontSize: 14, color: colors.primaryText, flex: 1, lineHeight: 19 },

  dataLimitNote: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.secondaryText,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: spacing.sm,
  },
});

export default AICoachScreen;