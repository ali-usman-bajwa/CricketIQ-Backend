import React, { useEffect, useState } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { getTeams, Team } from "../../api/teamApi";
import { createMatch } from "../../api/matchApi";
import { colors, fonts, spacing } from "../../theme/theme";

const FORMATS = ["T20", "ODI", "TEST"] as const;

const CreateMatchScreen = () => {
  const navigation = useNavigation();
  const { coachTeam } = useAuth();

  const [teams, setTeams] = useState<Team[]>([]);
  const [opponentId, setOpponentId] = useState<string | null>(null);
  const [format, setFormat] = useState<typeof FORMATS[number]>("T20");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTeams();
        setTeams(res.data.filter((t) => t._id !== coachTeam?._id));
      } catch (error) {
        console.error("Failed to load teams:", error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleCreate = async () => {
    if (!coachTeam) {
      Alert.alert("No team", "You need a team before creating a match.");
      return;
    }
    if (!opponentId || !date || !venue) {
      Alert.alert("Missing fields", "Please select an opponent and fill all fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createMatch({
        teamA: coachTeam._id,
        teamB: opponentId,
        format,
        date,
        venue: venue.trim(),
      });
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Unable to create match.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>OPPONENT</Text>
        <View style={styles.optionsWrap}>
          {teams.map((t) => (
            <Pressable
              key={t._id}
              style={[styles.option, opponentId === t._id && styles.optionSelected]}
              onPress={() => setOpponentId(t._id)}
            >
              <Text style={[styles.optionText, opponentId === t._id && styles.optionTextSelected]}>{t.shortName}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>FORMAT</Text>
        <View style={styles.optionsWrap}>
          {FORMATS.map((f) => (
            <Pressable key={f} style={[styles.option, format === f && styles.optionSelected]} onPress={() => setFormat(f)}>
              <Text style={[styles.optionText, format === f && styles.optionTextSelected]}>{f}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>DATE (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2026-08-20" placeholderTextColor={colors.secondaryText} />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>VENUE</Text>
        <TextInput style={styles.input} value={venue} onChangeText={setVenue} placeholder="e.g. National Stadium" placeholderTextColor={colors.secondaryText} />
      </View>

      <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={handleCreate} disabled={isSubmitting}>
        {isSubmitting ? <ActivityIndicator color={colors.background} /> : <Text style={styles.buttonText}>Create Match</Text>}
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  fieldGroup: { marginBottom: spacing.lg },
  fieldLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1.5, color: colors.secondaryText, marginBottom: spacing.sm },
  input: { fontFamily: fonts.body, fontSize: 16, color: colors.primaryText, borderBottomWidth: 1.5, borderBottomColor: colors.border, paddingVertical: spacing.sm },
  optionsWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  option: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 4, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  optionSelected: { backgroundColor: colors.pitch, borderColor: colors.pitch },
  optionText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.secondaryText },
  optionTextSelected: { color: "#FFFFFF" },
  button: { backgroundColor: colors.accent, borderRadius: 4, paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.sm },
  buttonPressed: { backgroundColor: colors.accentPress },
  buttonText: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.background },
});

export default CreateMatchScreen;