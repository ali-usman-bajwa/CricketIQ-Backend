import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, spacing } from "../../theme/theme";

const ToolCard = ({
  title,
  description,
  icon,
  onPress,
}: {
  title: string;
  description: string;
  icon: any;
  onPress: () => void;
}) => (
  <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={onPress}>
    <View style={styles.iconWrap}>
      <Ionicons name={icon} size={22} color={colors.pitch} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} />
  </Pressable>
);

const ToolsHomeScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>Tools</Text>

        <ToolCard
          title="Compare Players"
          description="Side-by-side stats and ML potential, ranked"
          icon="git-compare-outline"
          onPress={() => navigation.navigate("Comparison")}
        />
        <ToolCard
          title="AI Comparison"
          description="Same comparison, with an AI-generated breakdown"
          icon="sparkles-outline"
          onPress={() => navigation.navigate("AIComparison")}
        />
        <ToolCard
          title="Build Recommended XI"
          description="AI-assisted team selection from 11-30 players"
          icon="trophy-outline"
          onPress={() => navigation.navigate("TeamBuilder")}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: { padding: spacing.xl, gap: spacing.sm },
  headerTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.primaryText, marginBottom: spacing.sm },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
  },
  cardPressed: { backgroundColor: colors.border },
  iconWrap: { width: 40, height: 40, borderRadius: 8, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" },
  cardTitle: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.primaryText },
  cardDescription: { fontFamily: fonts.body, fontSize: 12, color: colors.secondaryText, marginTop: 2 },
});

export default ToolsHomeScreen;