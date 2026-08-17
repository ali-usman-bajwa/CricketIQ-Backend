import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PerformanceHomeScreen from "../screens/player/PerformanceHomeScreen";
import MatchDetailScreen from "../screens/player/MatchDetailScreen";
import SubmitPerformanceScreen from "../screens/player/SubmitPerformanceScreen";
import TeammateProfileScreen from "../screens/player/TeammateProfileScreen";
import { colors, fonts } from "../theme/theme";

const Stack = createNativeStackNavigator();

const PerformanceStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.background },
      headerTitleStyle: { fontFamily: fonts.bodySemiBold, color: colors.primaryText },
      headerTintColor: colors.primaryText,
      headerShadowVisible: false,
    }}
  >
    <Stack.Screen name="PerformanceHome" component={PerformanceHomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="MatchDetail" component={MatchDetailScreen} options={{ title: "Match" }} />
    <Stack.Screen name="SubmitPerformance" component={SubmitPerformanceScreen} options={{ title: "Add Performance" }} />
    <Stack.Screen name="TeammateProfile" component={TeammateProfileScreen} options={{ title: "Player" }} />
  </Stack.Navigator>
);

export default PerformanceStackNavigator;