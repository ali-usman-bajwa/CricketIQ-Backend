import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getMatches, Match } from "../../api/matchApi";
import { colors, fonts, spacing } from "../../theme/theme";

const MatchRow = ({ match, onPress }: { match: Match; onPress: () => void }) => {
  const isCompleted = match.status === "completed";
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{match.teamA.shortName} vs {match.teamB.shortName}</Text>
        <Text style={styles.rowSubtitle}>
          {match.format} · {new Date(match.date).toLocaleDateString()} · {match.venue}
        </Text>
      </View>
      <View style={[styles.badge, { borderColor: isCompleted ? colors.pitch : colors.secondaryText }]}>
        <Text style={[styles.badgeText, { color: isCompleted ? colors.pitch : colors.secondaryText }]}>
          {isCompleted ? "COMPLETED" : "SCHEDULED"}
        </Text>
      </View>
    </Pressable>
  );
};

const MatchesScreen = () => {
  const navigation = useNavigation<any>();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setIsLoading(true);
        try {
          const res = await getMatches();
          setMatches(res.data);
        } catch (error) {
          console.error("Failed to load matches:", error);
        } finally {
          setIsLoading(false);
        }
      };
      load();
    }, [])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
          onPress={() => navigation.navigate("CreateMatch")}
        >
          <Ionicons name="add" size={20} color={colors.background} />
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xxl }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {matches.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={32} color={colors.secondaryText} />
              <Text style={styles.emptyStateText}>No matches yet. Tap + to create your first fixture.</Text>
            </View>
          ) : (
            matches.map((m) => (
              <MatchRow key={m._id} match={m} onPress={() => navigation.navigate("CoachMatchDetail", { match: m })} />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  headerTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.primaryText },
  addButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, justifyContent: "center", alignItems: "center" },
  addButtonPressed: { backgroundColor: colors.accentPress },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.sm,
  },
  rowPressed: { backgroundColor: colors.border },
  rowTitle: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.primaryText },
  rowSubtitle: { fontFamily: fonts.body, fontSize: 12, color: colors.secondaryText, marginTop: 2 },
  badge: { borderWidth: 1, borderRadius: 20, paddingVertical: 4, paddingHorizontal: 8 },
  badgeText: { fontFamily: fonts.bodyMedium, fontSize: 9, letterSpacing: 0.5 },
  emptyState: { alignItems: "center", paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyStateText: { fontFamily: fonts.body, fontSize: 14, color: colors.secondaryText, textAlign: "center" },
});

export default MatchesScreen;