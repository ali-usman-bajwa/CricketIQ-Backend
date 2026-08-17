import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ToolsHomeScreen from "../screens/coach/ToolsHomeScreen";
import ComparisonScreen from "../screens/coach/ComparisonScreen";
import AIComparisonScreen from "../screens/coach/AIComparisonScreen";
import PlayerPickerScreen from "../screens/coach/PlayerPickerScreen";
import { colors, fonts } from "../theme/theme";
import TeamBuilderScreen from "../screens/coach/TeamBuilderScreen";

const Stack = createNativeStackNavigator();

const CoachToolsStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.background },
      headerTitleStyle: { fontFamily: fonts.bodySemiBold, color: colors.primaryText },
      headerTintColor: colors.primaryText,
      headerShadowVisible: false,
    }}
  >
    <Stack.Screen name="ToolsHome" component={ToolsHomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Comparison" component={ComparisonScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AIComparison" component={AIComparisonScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PlayerPicker" component={PlayerPickerScreen} options={{ title: "Select Players" }} />
    <Stack.Screen name="TeamBuilder" component={TeamBuilderScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

export default CoachToolsStackNavigator;