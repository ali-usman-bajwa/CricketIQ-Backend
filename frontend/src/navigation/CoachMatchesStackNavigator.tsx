import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MatchesScreen from "../screens/coach/MatchesScreen";
import CreateMatchScreen from "../screens/coach/CreateMatchScreen";
import CoachMatchDetailScreen from "../screens/coach/CoachMatchDetailScreen";
import SubmitCoachReportScreen from "../screens/coach/SubmitCoachReportScreen";
import { colors, fonts } from "../theme/theme";

const Stack = createNativeStackNavigator();

const CoachMatchesStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.background },
      headerTitleStyle: { fontFamily: fonts.bodySemiBold, color: colors.primaryText },
      headerTintColor: colors.primaryText,
      headerShadowVisible: false,
    }}
  >
    <Stack.Screen name="MatchesHome" component={MatchesScreen} options={{ headerShown: false }} />
    <Stack.Screen name="CreateMatch" component={CreateMatchScreen} options={{ title: "New Match" }} />
    <Stack.Screen name="CoachMatchDetail" component={CoachMatchDetailScreen} options={{ title: "Match" }} />
    <Stack.Screen name="SubmitCoachReport" component={SubmitCoachReportScreen} options={{ title: "Submit Report" }} />
  </Stack.Navigator>
);

export default CoachMatchesStackNavigator;