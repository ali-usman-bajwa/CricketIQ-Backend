import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SquadScreen from "../screens/coach/SquadScreen";
import CreateTeamScreen from "../screens/coach/CreateTeamScreen";
import AddPlayerScreen from "../screens/coach/AddPlayerScreen";
import PlayerProfileViewScreen from "../screens/coach/PlayerProfileViewScreen";
import { colors, fonts } from "../theme/theme";

const Stack = createNativeStackNavigator();

const CoachSquadStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.background },
      headerTitleStyle: { fontFamily: fonts.bodySemiBold, color: colors.primaryText },
      headerTintColor: colors.primaryText,
      headerShadowVisible: false,
    }}
  >
    <Stack.Screen name="SquadHome" component={SquadScreen} options={{ headerShown: false }} />
    <Stack.Screen name="CreateTeam" component={CreateTeamScreen} options={{ title: "Create Team" }} />
    <Stack.Screen name="AddPlayer" component={AddPlayerScreen} options={{ title: "Add Player" }} />
    <Stack.Screen name="PlayerProfileView" component={PlayerProfileViewScreen} options={{ title: "Player" }} />
  </Stack.Navigator>
);

export default CoachSquadStackNavigator;