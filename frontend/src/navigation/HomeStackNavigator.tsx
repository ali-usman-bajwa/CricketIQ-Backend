import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PlayerDashboardScreen from "../screens/player/PlayerDashboardScreen";
import AIScoutScreen from "../screens/ai/AIScoutScreen";
import AICoachScreen from "../screens/ai/AICoachScreen";
import AIInsightsScreen from "../screens/ai/AIInsightsScreen";
import { colors, fonts } from "../theme/theme";

export type HomeStackParamList = {
  PlayerDashboard: undefined;
  AIScout: { playerId: string };
  AICoach: { playerId: string };
  AIInsights: { playerId: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.background },
      headerTitleStyle: { fontFamily: fonts.bodySemiBold, color: colors.primaryText },
      headerTintColor: colors.primaryText,
      headerShadowVisible: false,
    }}
  >
    <Stack.Screen name="PlayerDashboard" component={PlayerDashboardScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AIScout" component={AIScoutScreen} options={{ title: "AI Scout Analysis" }} />
    <Stack.Screen name="AICoach" component={AICoachScreen} options={{ title: "AI Coach" }} />
    <Stack.Screen name="AIInsights" component={AIInsightsScreen} options={{ title: "Performance Report" }} />
  </Stack.Navigator>
);

export default HomeStackNavigator;