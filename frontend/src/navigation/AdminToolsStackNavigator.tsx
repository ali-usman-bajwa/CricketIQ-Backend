import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ToolsHomeScreen from "../screens/coach/ToolsHomeScreen";
import ComparisonScreen from "../screens/coach/ComparisonScreen";
import AIComparisonScreen from "../screens/coach/AIComparisonScreen";
import AdminTeamBuilderScreen from "../screens/admin/AdminTeamBuilderScreen";
import PlayerPickerScreen from "../screens/coach/PlayerPickerScreen";
import { colors, fonts } from "../theme/theme";

const Stack = createNativeStackNavigator();

const AdminToolsStackNavigator = () => (
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
    <Stack.Screen name="TeamBuilder" component={AdminTeamBuilderScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PlayerPicker" component={PlayerPickerScreen} options={{ title: "Select Players" }} />
  </Stack.Navigator>
);

export default AdminToolsStackNavigator;