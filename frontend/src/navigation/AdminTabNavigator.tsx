import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import AdminHomeStackNavigator from "./AdminHomeStackNavigator";
import AdminTeamsStackNavigator from "./AdminTeamsStackNavigator";
import AdminMatchesStackNavigator from "./AdminMatchesStackNavigator";
import AdminToolsStackNavigator from "./AdminToolsStackNavigator";
import AdminProfileScreen from "../screens/admin/AdminProfileScreen";
import { colors, fonts } from "../theme/theme";

const Tab = createBottomTabNavigator();

const ICONS: Record<string, { active: any; inactive: any }> = {
  Home: { active: "home", inactive: "home-outline" },
  Teams: { active: "shield", inactive: "shield-outline" },
  Matches: { active: "calendar", inactive: "calendar-outline" },
  Tools: { active: "hardware-chip", inactive: "hardware-chip-outline" },
  Profile: { active: "person-circle", inactive: "person-circle-outline" },
};

const AdminTabNavigator = () => (
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
    <Tab.Screen name="Home" component={AdminHomeStackNavigator} />
    <Tab.Screen name="Teams" component={AdminTeamsStackNavigator} />
    <Tab.Screen name="Matches" component={AdminMatchesStackNavigator} />
    <Tab.Screen name="Tools" component={AdminToolsStackNavigator} />
    <Tab.Screen name="Profile" component={AdminProfileScreen} />
  </Tab.Navigator>
);

export default AdminTabNavigator;