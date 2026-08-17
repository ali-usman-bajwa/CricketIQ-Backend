import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { submitCoachReport } from "../../api/performanceApi";
import { colors, fonts, spacing } from "../../theme/theme";

const NumberField = ({ label, value, onChangeText }: { label: string; value: string; onChangeText: (v: string) => void }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      keyboardType="number-pad"
      value={value}
      onChangeText={onChangeText}
      placeholder="0"
      placeholderTextColor={colors.secondaryText}
    />
  </View>
);

const SubmitCoachReportScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { matchId, player } = route.params;

  const [runs, setRuns] = useState("");
  const [balls, setBalls] = useState("");
  const [fours, setFours] = useState("");
  const [sixes, setSixes] = useState("");
  const [wickets, setWickets] = useState("");
  const [runsConceded, setRunsConceded] = useState("");
  const [oversBowled, setOversBowled] = useState("");
  const [dismissed, setDismissed] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!runs || !balls) {
      Alert.alert("Missing fields", "Runs and balls faced are required.");
      return;
    }
    if (dismissed === null) {
      Alert.alert("Missing field", "Please indicate whether the player was dismissed.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitCoachReport({
        player: player._id,
        match: matchId,
        coachReport: {
          runs: Number(runs),
          balls: Number(balls),
          fours: Number(fours) || 0,
          sixes: Number(sixes) || 0,
          wickets: Number(wickets) || 0,
          runsConceded: Number(runsConceded) || 0,
          oversBowled: Number(oversBowled) || 0,
          dismissed,
        },
      });

      Alert.alert("Submitted", `Report for ${player.name} has been recorded.`, [
        { text: "OK", onPress: () => navigation.navigate("MatchesHome") },
      ]);
    } catch (error: any) {
      Alert.alert("Submission Failed", error?.response?.data?.message || "Unable to submit report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.playerHeader}>{player.name}</Text>

      <Text style={styles.sectionLabel}>BATTING</Text>
      <View style={styles.row}>
        <View style={{ flex: 1 }}><NumberField label="RUNS" value={runs} onChangeText={setRuns} /></View>
        <View style={{ flex: 1 }}><NumberField label="BALLS FACED" value={balls} onChangeText={setBalls} /></View>
      </View>
      <View style={styles.row}>
        <View style={{ flex: 1 }}><NumberField label="FOURS" value={fours} onChangeText={setFours} /></View>
        <View style={{ flex: 1 }}><NumberField label="SIXES" value={sixes} onChangeText={setSixes} /></View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>DISMISSED?</Text>
        <View style={styles.toggleRow}>
          {[{ label: "Yes", value: true }, { label: "No (Not Out)", value: false }].map((opt) => (
            <Pressable
              key={opt.label}
              style={[styles.toggle, dismissed === opt.value && styles.toggleSelected]}
              onPress={() => setDismissed(opt.value)}
            >
              <Text style={[styles.toggleText, dismissed === opt.value && styles.toggleTextSelected]}>{opt.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Text style={styles.sectionLabel}>BOWLING (if applicable)</Text>
      <View style={styles.row}>
        <View style={{ flex: 1 }}><NumberField label="WICKETS" value={wickets} onChangeText={setWickets} /></View>
        <View style={{ flex: 1 }}><NumberField label="OVERS BOWLED" value={oversBowled} onChangeText={setOversBowled} /></View>
      </View>
      <NumberField label="RUNS CONCEDED" value={runsConceded} onChangeText={setRunsConceded} />

      <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? <ActivityIndicator color={colors.background} /> : <Text style={styles.buttonText}>Submit Report</Text>}
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  playerHeader: { fontFamily: fonts.display, fontSize: 20, color: colors.primaryText, marginBottom: spacing.md },
  sectionLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1.5, color: colors.secondaryText, marginTop: spacing.md, marginBottom: spacing.sm },
  row: { flexDirection: "row", gap: spacing.md },
  fieldGroup: { marginBottom: spacing.lg },
  fieldLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1.5, color: colors.secondaryText, marginBottom: spacing.sm },
  input: { fontFamily: fonts.body, fontSize: 16, color: colors.primaryText, borderBottomWidth: 1.5, borderBottomColor: colors.border, paddingVertical: spacing.sm },
  toggleRow: { flexDirection: "row", gap: spacing.sm },
  toggle: { flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: 4, paddingVertical: spacing.sm, alignItems: "center" },
  toggleSelected: { backgroundColor: colors.pitch, borderColor: colors.pitch },
  toggleText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.secondaryText },
  toggleTextSelected: { color: "#FFFFFF" },
  button: { backgroundColor: colors.accent, borderRadius: 4, paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.lg },
  buttonPressed: { backgroundColor: colors.accentPress },
  buttonText: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.background },
});

export default SubmitCoachReportScreen;