import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CoachDashboardScreen from "../screens/coach/CoachDashboardScreen";

const Stack = createNativeStackNavigator();

const CoachHomeStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CoachDashboard" component={CoachDashboardScreen} />
  </Stack.Navigator>
);

export default CoachHomeStackNavigator;