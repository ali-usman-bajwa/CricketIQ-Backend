import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { colors, fonts, spacing } from "../../theme/theme";

const StatBox = ({ label, value }: { label: string; value: string | number }) => (
  <View style={styles.statBox}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MatchDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { player } = useAuth();
  const { match, isSubmitted, submittedRecord } = route.params;

  const report = submittedRecord?.unifiedPerformance || submittedRecord?.playerReport;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.matchCard}>
        <Text style={styles.matchTitle}>{match.teamA.name} vs {match.teamB.name}</Text>
        <Text style={styles.matchMeta}>{match.format} · {match.venue}</Text>
        <Text style={styles.matchMeta}>{new Date(match.date).toLocaleDateString()}</Text>
        <View style={styles.statusRow}>
          <Ionicons
            name={match.status === "completed" ? "checkmark-circle" : "time-outline"}
            size={16}
            color={match.status === "completed" ? colors.pitch : colors.secondaryText}
          />
          <Text style={styles.statusText}>{match.status === "completed" ? "Completed" : "Scheduled"}</Text>
        </View>
      </View>

      {match.status !== "completed" ? (
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            This match hasn't finished yet. You'll be able to submit your performance once it's marked completed.
          </Text>
        </View>
      ) : isSubmitted && report ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>YOUR SUBMITTED PERFORMANCE</Text>
          <View style={styles.statGrid}>
            <StatBox label="RUNS" value={report.runs} />
            <StatBox label="BALLS" value={report.balls} />
            <StatBox label="FOURS" value={report.fours} />
            <StatBox label="SIXES" value={report.sixes} />
            <StatBox label="WICKETS" value={report.wickets} />
            <StatBox label="DISMISSED" value={report.dismissed ? "Yes" : "No"} />
          </View>
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed]}
          onPress={() => navigation.navigate("SubmitPerformance", { matchId: match._id, playerId: player?._id })}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.background} />
          <Text style={styles.submitButtonText}>Add Your Performance</Text>
        </Pressable>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, gap: spacing.md },
  matchCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.lg },
  matchTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.primaryText },
  matchMeta: { fontFamily: fonts.body, fontSize: 13, color: colors.secondaryText, marginTop: 4 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.sm },
  statusText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.primaryText },
  infoCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md },
  infoText: { fontFamily: fonts.body, fontSize: 13, color: colors.secondaryText, lineHeight: 18 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md },
  cardTitle: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1, color: colors.secondaryText, marginBottom: spacing.sm },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  statBox: { width: "30%", alignItems: "center", backgroundColor: colors.background, borderRadius: 6, paddingVertical: spacing.sm },
  statValue: { fontFamily: fonts.display, fontSize: 18, color: colors.primaryText },
  statLabel: { fontFamily: fonts.bodyMedium, fontSize: 9, color: colors.secondaryText, marginTop: 2 },
  submitButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.accent,
    borderRadius: 4,
    paddingVertical: spacing.md,
  },
  submitButtonPressed: { backgroundColor: colors.accentPress },
  submitButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.background },
});

export default MatchDetailScreen;