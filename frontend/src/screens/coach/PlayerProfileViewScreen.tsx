import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { colors, fonts, spacing } from "../../theme/theme";

const InfoRow = ({ label, value }: { label: string; value: string | number }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const PlayerProfileViewScreen = () => {
  const route = useRoute<any>();
  const { player } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{player.name[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{player.name}</Text>
        <Text style={styles.role}>{player.role}</Text>
      </View>

      <View style={styles.card}>
        <InfoRow label="AGE" value={player.age} />
        <InfoRow label="BATTING STYLE" value={player.battingStyle} />
        <InfoRow label="BOWLING STYLE" value={player.bowlingStyle} />
        <InfoRow label="COUNTRY" value={player.country} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl },
  avatarWrap: { alignItems: "center", marginBottom: spacing.xl },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.pitch, justifyContent: "center", alignItems: "center", marginBottom: spacing.sm },
  avatarInitial: { fontFamily: fonts.display, fontSize: 28, color: "#FFFFFF" },
  name: { fontFamily: fonts.display, fontSize: 20, color: colors.primaryText },
  role: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.accent, marginTop: 2 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1, color: colors.secondaryText },
  infoValue: { fontFamily: fonts.body, fontSize: 14, color: colors.primaryText },
});

export default PlayerProfileViewScreen;