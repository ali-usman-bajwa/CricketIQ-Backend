import React from "react";
import { View, ActivityIndicator } from "react-native";
import { useFonts, SpaceGrotesk_700Bold, SpaceGrotesk_500Medium } from "@expo-google-fonts/space-grotesk";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { AuthProvider } from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { colors } from "./src/theme/theme";

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_700Bold,
    SpaceGrotesk_500Medium,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}