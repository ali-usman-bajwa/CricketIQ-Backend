import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { updateMatchStatus } from "../../api/matchApi";
import { colors, fonts, spacing } from "../../theme/theme";

const CoachMatchDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { coachTeam } = useAuth();
  const [match, setMatch] = useState(route.params.match);
  const [isUpdating, setIsUpdating] = useState(false);

  const isMyTeamInMatch =
    coachTeam && (match.teamA._id === coachTeam._id || match.teamB._id === coachTeam._id);

  const handleComplete = async () => {
    setIsUpdating(true);
    try {
      const res = await updateMatchStatus(match._id, "completed");
      setMatch(res.data);
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Unable to update match.");
    } finally {
      setIsUpdating(false);
    }
  };

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

      {match.status !== "completed" && isMyTeamInMatch && (
        <Pressable
          style={({ pressed }) => [styles.completeButton, pressed && styles.completeButtonPressed]}
          onPress={handleComplete}
          disabled={isUpdating}
        >
          {isUpdating ? <ActivityIndicator color={colors.background} /> : <Text style={styles.completeButtonText}>Mark as Completed</Text>}
        </Pressable>
      )}

      {match.status === "completed" && isMyTeamInMatch && coachTeam && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SUBMIT REPORTS FOR YOUR SQUAD</Text>
          {coachTeam.players.length === 0 ? (
            <Text style={styles.emptyText}>No players on your squad yet.</Text>
          ) : (
            coachTeam.players.map((p: any) => (
              <Pressable
                key={p._id}
                style={({ pressed }) => [styles.playerRow, pressed && styles.playerRowPressed]}
                onPress={() => navigation.navigate("SubmitCoachReport", { matchId: match._id, player: p })}
              >
                <Text style={styles.playerName}>{p.name}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.secondaryText} />
              </Pressable>
            ))
          )}
        </View>
      )}

      {!isMyTeamInMatch && (
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>This match doesn't involve your team.</Text>
        </View>
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
  completeButton: { backgroundColor: colors.accent, borderRadius: 4, paddingVertical: spacing.md, alignItems: "center" },
  completeButtonPressed: { backgroundColor: colors.accentPress },
  completeButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.background },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md },
  cardTitle: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1, color: colors.secondaryText, marginBottom: spacing.sm },
  playerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  playerRowPressed: { opacity: 0.6 },
  playerName: { fontFamily: fonts.body, fontSize: 14, color: colors.primaryText },
  emptyText: { fontFamily: fonts.body, fontSize: 13, color: colors.secondaryText },
  infoCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md },
  infoText: { fontFamily: fonts.body, fontSize: 13, color: colors.secondaryText },
});

export default CoachMatchDetailScreen;