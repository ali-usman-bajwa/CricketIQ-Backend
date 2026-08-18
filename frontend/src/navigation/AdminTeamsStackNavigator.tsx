import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminTeamsListScreen from "../screens/admin/AdminTeamsListScreen";
import AdminTeamDetailScreen from "../screens/admin/AdminTeamDetailScreen";
import AdminAddPlayerScreen from "../screens/admin/AdminAddPlayerScreen";
import AdminPlayerProfileViewScreen from "../screens/admin/AdminPlayerProfileViewScreen";
import { colors, fonts } from "../theme/theme";

const Stack = createNativeStackNavigator();

const AdminTeamsStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.background },
      headerTitleStyle: { fontFamily: fonts.bodySemiBold, color: colors.primaryText },
      headerTintColor: colors.primaryText,
      headerShadowVisible: false,
    }}
  >
    <Stack.Screen name="TeamsList" component={AdminTeamsListScreen} options={{ headerShown: false }} />
    <Stack.Screen name="TeamDetail" component={AdminTeamDetailScreen} options={{ title: "Team" }} />
    <Stack.Screen name="AdminAddPlayer" component={AdminAddPlayerScreen} options={{ title: "Add Player" }} />
    <Stack.Screen name="AdminPlayerProfileView" component={AdminPlayerProfileViewScreen} options={{ title: "Player" }} />
  </Stack.Navigator>
);

export default AdminTeamsStackNavigator;