import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { comparePlayers, ComparisonEntry } from "../../api/aiApi";
import { colors, fonts, spacing } from "../../theme/theme";

const RankedCard = ({ entry }: { entry: ComparisonEntry }) => {
  const isTop = entry.rank === 1;
  return (
    <View style={[styles.card, isTop && styles.cardTop]}>
      <View style={styles.cardHeader}>
        <View style={[styles.rankBadge, isTop && styles.rankBadgeTop]}>
          <Text style={[styles.rankText, isTop && styles.rankTextTop]}>#{entry.rank}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.playerName}>{entry.player.name}</Text>
          <Text style={styles.playerMeta}>{entry.player.role} · Age {entry.player.age}</Text>
        </View>
        <View style={styles.scoreWrap}>
          <Text style={styles.scoreValue}>{entry.prediction.potentialScore.toFixed(1)}</Text>
          <Text style={styles.scoreLabel}>{entry.prediction.potentialLevel}</Text>
        </View>
      </View>

      <View style={styles.statRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{entry.features.battingAverage?.toFixed(1) ?? "—"}</Text>
          <Text style={styles.statLabel}>AVG</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{entry.features.strikeRate?.toFixed(1) ?? "—"}</Text>
          <Text style={styles.statLabel}>SR</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{entry.features.consistency?.toFixed(0) ?? "—"}</Text>
          <Text style={styles.statLabel}>CONSISTENCY</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{entry.features.overallImpact?.toFixed(0) ?? "—"}</Text>
          <Text style={styles.statLabel}>IMPACT</Text>
        </View>
      </View>
    </View>
  );
};

const ComparisonScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [results, setResults] = useState<ComparisonEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      const ids = route.params?.selectedPlayerIds;
      if (ids && ids.length >= 2) {
        runComparison(ids);
      }
    }, [route.params?.selectedPlayerIds])
  );

  const runComparison = async (ids: string[]) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await comparePlayers(ids);
      setResults(res.data.players);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || "Unable to compare players.");
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const openPicker = () => {
    navigation.navigate("PlayerPicker", { returnTo: "Comparison", minSelect: 2, maxSelect: 5 });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Compare Players</Text>
        <Pressable style={({ pressed }) => [styles.pickButton, pressed && styles.pickButtonPressed]} onPress={openPicker}>
          <Ionicons name="people-outline" size={16} color={colors.background} />
          <Text style={styles.pickButtonText}>{results ? "Change Players" : "Select Players"}</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xxl }} />
      ) : errorMessage ? (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={32} color={colors.secondaryText} />
          <Text style={styles.emptyStateText}>{errorMessage}</Text>
        </View>
      ) : !results ? (
        <View style={styles.emptyState}>
          <Ionicons name="git-compare-outline" size={32} color={colors.secondaryText} />
          <Text style={styles.emptyStateText}>Select 2–5 players to compare their stats and ML potential.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {results.map((entry) => (
            <RankedCard key={entry.player.id} entry={entry} />
          ))}
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
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.sm },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md },
  cardTop: { borderColor: colors.pitch, borderWidth: 1.5 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  rankBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" },
  rankBadgeTop: { backgroundColor: colors.pitch },
  rankText: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.secondaryText },
  rankTextTop: { color: "#FFFFFF" },
  playerName: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.primaryText },
  playerMeta: { fontFamily: fonts.body, fontSize: 11, color: colors.secondaryText },
  scoreWrap: { alignItems: "flex-end" },
  scoreValue: { fontFamily: fonts.display, fontSize: 20, color: colors.primaryText },
  scoreLabel: { fontFamily: fonts.bodyMedium, fontSize: 9, color: colors.accent, letterSpacing: 0.5 },
  statRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  statItem: { alignItems: "center" },
  statValue: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.primaryText },
  statLabel: { fontFamily: fonts.bodyMedium, fontSize: 9, color: colors.secondaryText, marginTop: 2 },
  emptyState: { alignItems: "center", paddingVertical: spacing.xxl, gap: spacing.sm, paddingHorizontal: spacing.xl },
  emptyStateText: { fontFamily: fonts.body, fontSize: 14, color: colors.secondaryText, textAlign: "center" },
});

export default ComparisonScreen;