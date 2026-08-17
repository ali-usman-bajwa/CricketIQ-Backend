import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { compareAI, ComparisonEntry, AIComparisonNarrative } from "../../api/aiApi";
import ExpandableText from "../../components/ExpandableText";
import { colors, fonts, spacing } from "../../theme/theme";

const CONFIDENCE_COLORS: Record<string, string> = {
  LOW: "#C1443C",
  MEDIUM: "#D4A614",
  HIGH: colors.accent,
};

const RankStrip = ({ players }: { players: ComparisonEntry[] }) => (
  <View style={styles.rankStrip}>
    {players.map((entry) => (
      <View key={entry.player.id} style={[styles.rankChip, entry.rank === 1 && styles.rankChipTop]}>
        <Text style={[styles.rankChipRank, entry.rank === 1 && styles.rankChipRankTop]}>#{entry.rank}</Text>
        <Text style={styles.rankChipName} numberOfLines={1}>{entry.player.name}</Text>
        <Text style={styles.rankChipScore}>{entry.prediction.potentialScore.toFixed(1)}</Text>
      </View>
    ))}
  </View>
);

const SectionCard = ({ title, icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Ionicons name={icon} size={16} color={colors.secondaryText} />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const AIComparisonScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [players, setPlayers] = useState<ComparisonEntry[] | null>(null);
  const [narrative, setNarrative] = useState<AIComparisonNarrative | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const ids = route.params?.selectedPlayerIds;
      if (ids && ids.length >= 2) {
        run(ids);
      }
    }, [route.params?.selectedPlayerIds])
  );

  const run = async (ids: string[]) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await compareAI(ids);
      setPlayers(res.data.players);
      setNarrative(res.data.aiComparison);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || "Unable to generate AI comparison.");
      setPlayers(null);
      setNarrative(null);
    } finally {
      setIsLoading(false);
    }
  };

  const openPicker = () => {
    navigation.navigate("PlayerPicker", { returnTo: "AIComparison", minSelect: 2, maxSelect: 5 });
  };

  const confidenceColor = narrative ? CONFIDENCE_COLORS[narrative.confidence] || colors.secondaryText : colors.secondaryText;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Comparison</Text>
        <Pressable style={({ pressed }) => [styles.pickButton, pressed && styles.pickButtonPressed]} onPress={openPicker}>
          <Ionicons name="people-outline" size={16} color={colors.background} />
          <Text style={styles.pickButtonText}>{players ? "Change Players" : "Select Players"}</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.loadingText}>Analyzing players…</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={32} color={colors.secondaryText} />
          <Text style={styles.emptyStateText}>{errorMessage}</Text>
        </View>
      ) : !players || !narrative ? (
        <View style={styles.centered}>
          <Ionicons name="sparkles-outline" size={32} color={colors.secondaryText} />
          <Text style={styles.emptyStateText}>Select 2–5 players for an AI-generated comparison.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <RankStrip players={players} />

          <View style={[styles.confidenceBadge, { borderColor: confidenceColor, alignSelf: "flex-start" }]}>
            <Text style={[styles.confidenceText, { color: confidenceColor }]}>{narrative.confidence} CONFIDENCE</Text>
          </View>

          <SectionCard title="OVERALL COMPARISON" icon="analytics-outline">
            <ExpandableText text={narrative.overallComparison} />
          </SectionCard>

          {narrative.playerAdvantages.map((entry, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.advantagePlayer}>{entry.player}</Text>
              {entry.advantages.map((adv, j) => (
                <View key={j} style={styles.bulletRow}>
                  <View style={[styles.dot, { backgroundColor: colors.pitch }]} />
                  <Text style={styles.bulletText}>{adv}</Text>
                </View>
              ))}
            </View>
          ))}

          <SectionCard title="CATEGORY LEADERS" icon="ribbon-outline">
            {narrative.categoryComparison.map((cat, i) => (
              <View key={i} style={styles.categoryRow}>
                <Text style={styles.categoryName}>{cat.category}</Text>
                <Text style={styles.categoryLeader}>{cat.leader}</Text>
              </View>
            ))}
          </SectionCard>

          <SectionCard title="ML POTENTIAL" icon="hardware-chip-outline">
            <ExpandableText text={narrative.potentialComparison} />
          </SectionCard>

          <SectionCard title="RECOMMENDATION" icon="checkmark-done-outline">
            <ExpandableText text={narrative.recommendation} />
          </SectionCard>

          <Text style={styles.dataLimitNote}>{narrative.sampleSizeAssessment}</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { padding: spacing.xl, gap: spacing.md },
  headerTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.primaryText },
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

  rankStrip: { flexDirection: "row", gap: spacing.sm },
  rankChip: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, alignItems: "center" },
  rankChipTop: { borderColor: colors.pitch, borderWidth: 1.5 },
  rankChipRank: { fontFamily: fonts.bodySemiBold, fontSize: 10, color: colors.secondaryText },
  rankChipRankTop: { color: colors.pitch },
  rankChipName: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.primaryText, marginTop: 2 },
  rankChipScore: { fontFamily: fonts.display, fontSize: 16, color: colors.primaryText, marginTop: 2 },

  confidenceBadge: { borderWidth: 1, borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  confidenceText: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 0.5 },

  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: spacing.sm },
  cardTitle: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1, color: colors.secondaryText },
  advantagePlayer: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.primaryText, marginBottom: spacing.sm },

  bulletRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.xs, alignItems: "flex-start" },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  bulletText: { fontFamily: fonts.body, fontSize: 13, color: colors.primaryText, flex: 1, lineHeight: 18 },

  categoryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
  categoryName: { fontFamily: fonts.body, fontSize: 13, color: colors.secondaryText },
  categoryLeader: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.pitch },

  dataLimitNote: { fontFamily: fonts.body, fontSize: 12, color: colors.secondaryText, fontStyle: "italic", textAlign: "center" },
});

export default AIComparisonScreen;