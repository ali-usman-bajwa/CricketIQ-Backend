import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getAllPlayers, AllPlayersEntry } from "../../api/playerApi";
import { colors, fonts, spacing } from "../../theme/theme";

const PlayerPickerScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { returnTo, minSelect, maxSelect, initialSelected = [], sourcePlayers } = route.params;

  const [players, setPlayers] = useState<AllPlayersEntry[]>(sourcePlayers || []);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [isLoading, setIsLoading] = useState(!sourcePlayers);

  useEffect(() => {
    // If a fixed player pool was supplied (e.g. the coach's own squad
    // for Team Builder), use it directly and skip the全-players fetch.
    if (sourcePlayers) return;

    const load = async () => {
      try {
        const res = await getAllPlayers();
        setPlayers(res.data);
      } catch (error) {
        console.error("Failed to load players:", error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = players.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (maxSelect && prev.length >= maxSelect) return prev;
      return [...prev, id];
    });
  };

  const handleConfirm = () => {
    navigation.navigate(returnTo, { selectedPlayerIds: selected, selectedPlayers: players.filter((p) => selected.includes(p._id)) });
  };

  const canConfirm = selected.length >= (minSelect || 1) && (!maxSelect || selected.length <= maxSelect);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <View style={styles.container}>
        <TextInput
          style={styles.search}
          placeholder="Search players…"
          placeholderTextColor={colors.secondaryText}
          value={search}
          onChangeText={setSearch}
        />
        <Text style={styles.helperText}>
          {selected.length} selected{maxSelect ? ` (max ${maxSelect})` : ""}{minSelect ? ` — minimum ${minSelect}` : ""}
        </Text>

        {isLoading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />
        ) : players.length === 0 ? (
          <Text style={styles.emptyText}>No players available to select.</Text>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const isSelected = selected.includes(item._id);
              return (
                <Pressable style={[styles.row, isSelected && styles.rowSelected]} onPress={() => toggle(item._id)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{item.name}</Text>
                    <Text style={styles.rowSubtitle}>{item.role} · {item.country}</Text>
                  </View>
                  <Ionicons
                    name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                    size={22}
                    color={isSelected ? colors.pitch : colors.secondaryText}
                  />
                </Pressable>
              );
            }}
          />
        )}

        <Pressable
          style={[styles.confirmButton, !canConfirm && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={!canConfirm}
        >
          <Text style={styles.confirmButtonText}>Confirm Selection</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl },
  search: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.primaryText,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  helperText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.secondaryText, marginTop: spacing.sm, marginBottom: spacing.sm },
  list: { gap: spacing.sm, paddingBottom: spacing.xl },
  emptyText: { fontFamily: fonts.body, fontSize: 14, color: colors.secondaryText, textAlign: "center", marginTop: spacing.xl },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
  },
  rowSelected: { borderColor: colors.pitch },
  rowTitle: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.primaryText },
  rowSubtitle: { fontFamily: fonts.body, fontSize: 12, color: colors.secondaryText, marginTop: 2 },
  confirmButton: { backgroundColor: colors.accent, borderRadius: 4, paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.sm },
  confirmButtonDisabled: { backgroundColor: colors.border },
  confirmButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.background },
});

export default PlayerPickerScreen;