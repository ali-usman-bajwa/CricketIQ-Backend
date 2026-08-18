import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import MainTabNavigator from "./MainTabNavigator";
import CoachTabNavigator from "./CoachTabNavigator";
import AdminTabNavigator from "./AdminTabNavigator";
import WelcomeScreen from "../screens/WelcomeScreen";
import { colors } from "../theme/theme";

const RootNavigator = () => {
  const { token, user, isLoading, showWelcome } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const AppShell =
    user?.role === "Admin" ? AdminTabNavigator : user?.role === "Coach" ? CoachTabNavigator : MainTabNavigator;

  return (
    <NavigationContainer>
      {!token ? <AuthNavigator /> : showWelcome ? <WelcomeScreen /> : <AppShell />}
    </NavigationContainer>
  );
};

export default RootNavigator;