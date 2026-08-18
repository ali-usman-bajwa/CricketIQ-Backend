import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { colors, fonts, spacing } from "../../theme/theme";

const AdminProfileScreen = () => {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{user?.name?.[0]?.toUpperCase() || "A"}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark-outline" size={12} color={colors.accent} />
            <Text style={styles.roleBadgeText}>ADMINISTRATOR</Text>
          </View>
        </View>

        <View style={styles.emailCard}>
          <Text style={styles.emailLabel}>EMAIL</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>

        <Pressable style={({ pressed }) => [styles.logoutButton, pressed && { opacity: 0.6 }]} onPress={logout}>
          <Ionicons name="log-out-outline" size={16} color="#C1443C" />
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
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.pitch, justifyContent: "center", alignItems: "center", marginBottom: spacing.sm },
  avatarInitial: { fontFamily: fonts.display, fontSize: 30, color: "#FFFFFF" },
  name: { fontFamily: fonts.display, fontSize: 20, color: colors.primaryText },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginTop: spacing.xs,
  },
  roleBadgeText: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 1, color: colors.accent },
  emailCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, marginBottom: spacing.lg },
  emailLabel: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 1, color: colors.secondaryText, marginBottom: 2 },
  emailText: { fontFamily: fonts.body, fontSize: 13, color: colors.primaryText },
  logoutButton: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, paddingVertical: spacing.sm },
  logoutText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: "#C1443C" },
});

export default AdminProfileScreen;