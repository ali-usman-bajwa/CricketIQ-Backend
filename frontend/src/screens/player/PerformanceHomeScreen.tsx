import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getMatches, Match } from "../../api/matchApi";
import { getTeam, TeamPlayer } from "../../api/teamApi";
import { getPlayerPerformances, PerformanceRecord } from "../../api/performanceApi";
import { colors, fonts, spacing } from "../../theme/theme";

const SEGMENTS = ["Matches", "Squad", "My Stats"] as const;
type Segment = (typeof SEGMENTS)[number];

const Segmented = ({ value, onChange }: { value: Segment; onChange: (s: Segment) => void }) => (
  <View style={styles.segmentGroup}>
    {SEGMENTS.map((s) => {
      const selected = s === value;
      return (
        <Pressable key={s} style={[styles.segment, selected && styles.segmentSelected]} onPress={() => onChange(s)}>
          <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{s}</Text>
        </Pressable>
      );
    })}
  </View>
);

const MatchRow = ({
  match,
  isSubmitted,
  onPress,
}: {
  match: Match;
  isSubmitted: boolean;
  onPress: () => void;
}) => {
  const statusColor = match.status === "completed" ? colors.pitch : colors.secondaryText;
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{match.teamA.shortName} vs {match.teamB.shortName}</Text>
        <Text style={styles.rowSubtitle}>
          {match.format} · {new Date(match.date).toLocaleDateString()} · {match.venue}
        </Text>
      </View>
      {match.status === "completed" ? (
        <View style={[styles.badge, { borderColor: isSubmitted ? colors.pitch : colors.accent }]}>
          <Text style={[styles.badgeText, { color: isSubmitted ? colors.pitch : colors.accent }]}>
            {isSubmitted ? "SUBMITTED" : "ADD REPORT"}
          </Text>
        </View>
      ) : (
        <View style={[styles.badge, { borderColor: colors.border }]}>
          <Text style={[styles.badgeText, { color: colors.secondaryText }]}>SCHEDULED</Text>
        </View>
      )}
    </Pressable>
  );
};

const SquadRow = ({ player, onPress }: { player: TeamPlayer; onPress: () => void }) => (
  <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={onPress}>
    <View style={styles.squadAvatar}>
      <Text style={styles.squadAvatarText}>{player.name[0]?.toUpperCase()}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.rowTitle}>{player.name}</Text>
      <Text style={styles.rowSubtitle}>{player.role} · {player.battingStyle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} />
  </Pressable>
);

const MyPerformanceRow = ({ record }: { record: PerformanceRecord }) => {
  const report = record.unifiedPerformance || record.playerReport;
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>vs {record.match.teamA.shortName === record.match.teamB.shortName ? record.match.teamB.shortName : `${record.match.teamA.shortName}/${record.match.teamB.shortName}`}</Text>
        <Text style={styles.rowSubtitle}>{new Date(record.match.date).toLocaleDateString()} · {record.verificationStatus.replace("_", " ")}</Text>
      </View>
      <View style={styles.statPair}>
        <Text style={styles.statPairValue}>{report?.runs ?? 0}</Text>
        <Text style={styles.statPairLabel}>RUNS</Text>
      </View>
    </View>
  );
};

const EmptyState = ({ text }: { text: string }) => (
  <View style={styles.emptyState}>
    <Ionicons name="information-circle-outline" size={28} color={colors.secondaryText} />
    <Text style={styles.emptyStateText}>{text}</Text>
  </View>
);

const PerformanceHomeScreen = () => {
  const { player } = useAuth();
  const navigation = useNavigation<any>();

  const [segment, setSegment] = useState<Segment>("Matches");
  const [matches, setMatches] = useState<Match[]>([]);
  const [squad, setSquad] = useState<TeamPlayer[]>([]);
  const [myPerformances, setMyPerformances] = useState<PerformanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noTeamMessage, setNoTeamMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!player?._id) return;
    setIsLoading(true);
    setNoTeamMessage(null);

    try {
      const [matchesRes, performancesRes] = await Promise.all([
        getMatches(),
        getPlayerPerformances(player._id),
      ]);

      setMatches(matchesRes.data);
      setMyPerformances(performancesRes.data);

      if (player.team) {
        const teamRes = await getTeam(player.team);
        setSquad(teamRes.data.players.filter((p) => p._id !== player._id));
      } else {
        setSquad([]);
        setNoTeamMessage("You are not assigned to a team yet.");
      }
    } catch (error) {
      console.error("Failed to load performance data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [player?._id, player?.team]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const submittedMatchIds = new Set(
    myPerformances.filter((p) => p.playerReport).map((p) => p.match._id)
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Performance</Text>
      </View>

      <View style={styles.segmentWrap}>
        <Segmented value={segment} onChange={setSegment} />
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xxl }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {noTeamMessage && segment !== "My Stats" ? (
            <EmptyState text={noTeamMessage} />
          ) : segment === "Matches" ? (
            matches.length === 0 ? (
              <EmptyState text="No matches found for your team yet." />
            ) : (
              matches.map((match) => (
                <MatchRow
                  key={match._id}
                  match={match}
                  isSubmitted={submittedMatchIds.has(match._id)}
                  onPress={() =>
                    navigation.navigate("MatchDetail", {
                      match,
                      isSubmitted: submittedMatchIds.has(match._id),
                      submittedRecord: myPerformances.find((p) => p.match._id === match._id) || null,
                    })
                  }
                />
              ))
            )
          ) : segment === "Squad" ? (
            squad.length === 0 ? (
              <EmptyState text="No teammates found." />
            ) : (
              squad.map((p) => (
                <SquadRow key={p._id} player={p} onPress={() => navigation.navigate("TeammateProfile", { player: p })} />
              ))
            )
          ) : myPerformances.length === 0 ? (
            <EmptyState text="You haven't submitted any performances yet." />
          ) : (
            myPerformances.map((record) => <MyPerformanceRow key={record._id} record={record} />)
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.sm },
  headerTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.primaryText },
  segmentWrap: { paddingHorizontal: spacing.xl, marginBottom: spacing.sm },
  segmentGroup: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: 8, padding: 4, gap: 4 },
  segment: { flex: 1, paddingVertical: spacing.sm, borderRadius: 6, alignItems: "center" },
  segmentSelected: { backgroundColor: colors.pitch },
  segmentText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.secondaryText },
  segmentTextSelected: { color: "#FFFFFF" },
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
  squadAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.pitch, justifyContent: "center", alignItems: "center" },
  squadAvatarText: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: "#FFFFFF" },
  statPair: { alignItems: "center" },
  statPairValue: { fontFamily: fonts.display, fontSize: 18, color: colors.primaryText },
  statPairLabel: { fontFamily: fonts.bodyMedium, fontSize: 9, color: colors.secondaryText },
  emptyState: { alignItems: "center", paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyStateText: { fontFamily: fonts.body, fontSize: 14, color: colors.secondaryText, textAlign: "center" },
});

export default PerformanceHomeScreen;