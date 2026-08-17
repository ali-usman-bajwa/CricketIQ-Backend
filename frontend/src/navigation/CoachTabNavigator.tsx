import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import CoachHomeStackNavigator from "./CoachHomeStackNavigator";
import CoachSquadStackNavigator from "./CoachSquadStackNavigator";
import CoachMatchesStackNavigator from "./CoachMatchesStackNavigator";
import CoachToolsStackNavigator from "./CoachToolsStackNavigator";
import CoachProfileScreen from "../screens/coach/CoachProfileScreen";
import { colors, fonts } from "../theme/theme";

const Tab = createBottomTabNavigator();

const ICONS: Record<string, { active: any; inactive: any }> = {
  Home: { active: "home", inactive: "home-outline" },
  Squad: { active: "people", inactive: "people-outline" },
  Matches: { active: "calendar", inactive: "calendar-outline" },
  Tools: { active: "hardware-chip", inactive: "hardware-chip-outline" },
  Profile: { active: "person-circle", inactive: "person-circle-outline" },
};

const CoachTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.secondaryText,
      tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
      tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 10 },
      tabBarIcon: ({ focused, color, size }) => {
        const icon = ICONS[route.name];
        return <Ionicons name={focused ? icon.active : icon.inactive} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={CoachHomeStackNavigator} />
    <Tab.Screen name="Squad" component={CoachSquadStackNavigator} />
    <Tab.Screen name="Matches" component={CoachMatchesStackNavigator} />
    <Tab.Screen name="Tools" component={CoachToolsStackNavigator} />
    <Tab.Screen name="Profile" component={CoachProfileScreen} />
  </Tab.Navigator>
);

export default CoachTabNavigator;