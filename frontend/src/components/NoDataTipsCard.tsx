import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TIPS_BY_ROLE, GENERAL_TIPS } from "../data/cricketTips";
import { colors, fonts, spacing } from "../theme/theme";

const NoDataTipsCard = ({ role }: { role?: string }) => {
  const roleTips = (role && TIPS_BY_ROLE[role]) || [];
  const tips = [...roleTips, ...GENERAL_TIPS];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bulb-outline" size={22} color={colors.accent} />
        <Text style={styles.headerTitle}>Not enough matches yet</Text>
        <Text style={styles.headerSubtitle}>
          Your AI insights unlock after 3 recorded performances. In the meantime, here are a few tips
          {role ? ` for ${role.toLowerCase()}s` : ""}.
        </Text>
      </View>

      {tips.map((tip, i) => (
        <View key={i} style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons name={tip.icon as any} size={18} color={colors.pitch} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>{tip.title}</Text>
            <Text style={styles.tipDescription}>{tip.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  header: { alignItems: "center", gap: spacing.xs, marginBottom: spacing.md, paddingHorizontal: spacing.md },
  headerTitle: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.primaryText, marginTop: 4 },
  headerSubtitle: { fontFamily: fonts.body, fontSize: 12, color: colors.secondaryText, textAlign: "center", lineHeight: 17 },
  tipCard: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
  },
  tipIcon: { width: 34, height: 34, borderRadius: 8, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" },
  tipTitle: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.primaryText },
  tipDescription: { fontFamily: fonts.body, fontSize: 12, color: colors.secondaryText, marginTop: 2, lineHeight: 16 },
});

export default NoDataTipsCard;