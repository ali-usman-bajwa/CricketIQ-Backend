import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { createTeam } from "../../api/teamApi";
import { colors, fonts, spacing } from "../../theme/theme";

const CreateTeamScreen = () => {
  const navigation = useNavigation();
  const { refreshCoachTeam } = useAuth();

  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [country, setCountry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name || !shortName || !country) {
      Alert.alert("Missing fields", "All fields are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createTeam({ name: name.trim(), shortName: shortName.trim(), country: country.trim() });
      await refreshCoachTeam();
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Unable to create team.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>TEAM NAME</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Lahore Qalandars" placeholderTextColor={colors.secondaryText} />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>SHORT NAME</Text>
        <TextInput style={styles.input} value={shortName} onChangeText={setShortName} placeholder="e.g. LQ" autoCapitalize="characters" placeholderTextColor={colors.secondaryText} />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>COUNTRY</Text>
        <TextInput style={styles.input} value={country} onChangeText={setCountry} placeholder="e.g. Pakistan" placeholderTextColor={colors.secondaryText} />
      </View>

      <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={handleCreate} disabled={isSubmitting}>
        {isSubmitting ? <ActivityIndicator color={colors.background} /> : <Text style={styles.buttonText}>Create Team</Text>}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl },
  fieldGroup: { marginBottom: spacing.lg },
  fieldLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1.5, color: colors.secondaryText, marginBottom: spacing.sm },
  input: { fontFamily: fonts.body, fontSize: 16, color: colors.primaryText, borderBottomWidth: 1.5, borderBottomColor: colors.border, paddingVertical: spacing.sm },
  button: { backgroundColor: colors.accent, borderRadius: 4, paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.lg },
  buttonPressed: { backgroundColor: colors.accentPress },
  buttonText: { fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.background },
});

export default CreateTeamScreen;