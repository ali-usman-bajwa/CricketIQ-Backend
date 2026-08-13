import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { colors, fonts, spacing } from "../../theme/theme";

const InfoRow = ({ label, value }: { label: string; value: string | number }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const ProfileScreen = () => {
  const { user, player, logout } = useAuth();
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{player?.name?.[0]?.toUpperCase() || "P"}</Text>
        </View>
        <Text style={styles.name}>{player?.name}</Text>
        <Text style={styles.role}>{player?.role}</Text>
      </View>

      <View style={styles.card}>
        <InfoRow label="AGE" value={player?.age ?? "—"} />
        <InfoRow label="BATTING STYLE" value={player?.battingStyle ?? "—"} />
        <InfoRow label="BOWLING STYLE" value={player?.bowlingStyle ?? "—"} />
        <InfoRow label="COUNTRY" value={player?.country ?? "—"} />
        <InfoRow label="EMAIL" value={user?.email ?? "—"} />
      </View>

      <Pressable
        style={({ pressed }) => [styles.editButton, pressed && styles.editButtonPressed]}
        onPress={() => navigation.navigate("EditProfile")}
      >
        <Ionicons name="create-outline" size={18} color={colors.background} />
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.logoutButton, pressed && { opacity: 0.6 }]}
        onPress={logout}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  avatarWrap: { alignItems: "center", marginBottom: spacing.xl },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.pitch,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  avatarInitial: { fontFamily: fonts.display, fontSize: 28, color: "#FFFFFF" },
  name: { fontFamily: fonts.display, fontSize: 20, color: colors.primaryText },
  role: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.accent, marginTop: 2 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1, color: colors.secondaryText },
  infoValue: { fontFamily: fonts.body, fontSize: 14, color: colors.primaryText },
  editButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.accent,
    borderRadius: 4,
    paddingVertical: spacing.md,
  },
  editButtonPressed: { backgroundColor: colors.accentPress },
  editButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.background },
  logoutButton: { alignItems: "center", marginTop: spacing.lg, paddingVertical: spacing.sm },
  logoutText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: "#C1443C" },
});

export default ProfileScreen;