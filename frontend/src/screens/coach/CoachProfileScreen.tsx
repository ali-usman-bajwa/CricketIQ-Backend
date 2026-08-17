import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { colors, fonts, spacing } from "../../theme/theme";

const InfoRow = ({ label, value }: { label: string; value: string | number }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const CoachProfileScreen = () => {
  const { user, coachTeam, logout } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{user?.name?.[0]?.toUpperCase() || "C"}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.role}>Coach</Text>
        </View>

        <View style={styles.card}>
          <InfoRow label="EMAIL" value={user?.email ?? "—"} />
          <InfoRow label="TEAM" value={coachTeam?.name ?? "Not assigned"} />
          <InfoRow label="SQUAD SIZE" value={coachTeam?.players?.length ?? 0} />
        </View>

        <Pressable style={({ pressed }) => [styles.logoutButton, pressed && { opacity: 0.6 }]} onPress={logout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  avatarWrap: { alignItems: "center", marginBottom: spacing.xl },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.pitch, justifyContent: "center", alignItems: "center", marginBottom: spacing.sm },
  avatarInitial: { fontFamily: fonts.display, fontSize: 28, color: "#FFFFFF" },
  name: { fontFamily: fonts.display, fontSize: 20, color: colors.primaryText },
  role: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.accent, marginTop: 2 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, marginBottom: spacing.lg },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1, color: colors.secondaryText },
  infoValue: { fontFamily: fonts.body, fontSize: 14, color: colors.primaryText },
  logoutButton: { alignItems: "center", marginTop: spacing.lg, paddingVertical: spacing.sm },
  logoutText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: "#C1443C" },
});

export default CoachProfileScreen;