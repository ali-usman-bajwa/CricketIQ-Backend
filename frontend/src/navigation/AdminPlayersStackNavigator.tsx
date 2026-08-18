import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminPlayersListScreen from "../screens/admin/AdminPlayersListScreen";
import AdminPlayerDetailScreen from "../screens/admin/AdminPlayerDetailScreen";
import AdminCreatePlayerScreen from "../screens/admin/AdminCreatePlayerScreen";
import { colors, fonts } from "../theme/theme";

const Stack = createNativeStackNavigator();

const AdminPlayersStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.background },
      headerTitleStyle: { fontFamily: fonts.bodySemiBold, color: colors.primaryText },
      headerTintColor: colors.primaryText,
      headerShadowVisible: false,
    }}
  >
    <Stack.Screen name="PlayersList" component={AdminPlayersListScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AdminPlayerDetail" component={AdminPlayerDetailScreen} options={{ title: "Player" }} />
    <Stack.Screen name="AdminCreatePlayer" component={AdminCreatePlayerScreen} options={{ title: "Raw Player Create" }} />
  </Stack.Navigator>
);

export default AdminPlayersStackNavigator;