import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminMatchesListScreen from "../screens/admin/AdminMatchesListScreen";
import AdminMatchDetailScreen from "../screens/admin/AdminMatchDetailScreen";
import { colors, fonts } from "../theme/theme";

const Stack = createNativeStackNavigator();

const AdminMatchesStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.background },
      headerTitleStyle: { fontFamily: fonts.bodySemiBold, color: colors.primaryText },
      headerTintColor: colors.primaryText,
      headerShadowVisible: false,
    }}
  >
    <Stack.Screen name="MatchesList" component={AdminMatchesListScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AdminMatchDetail" component={AdminMatchDetailScreen} options={{ title: "Match" }} />
  </Stack.Navigator>
);

export default AdminMatchesStackNavigator;