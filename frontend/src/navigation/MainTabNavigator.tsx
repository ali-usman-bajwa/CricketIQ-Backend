import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeStackNavigator from "./HomeStackNavigator";
import PerformanceScreen from "../screens/player/PerformanceScreen";
import ProfileStackNavigator from "./ProfileStackNavigator";
import { colors, fonts } from "../theme/theme";

const Tab = createBottomTabNavigator();

const ICONS: Record<string, { active: any; inactive: any }> = {
  Home: { active: "home", inactive: "home-outline" },
  Performance: { active: "stats-chart", inactive: "stats-chart-outline" },
  Profile: { active: "person-circle", inactive: "person-circle-outline" },
};

const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.secondaryText,
      tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
      tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11 },
      tabBarIcon: ({ focused, color, size }) => {
        const icon = ICONS[route.name];
        return <Ionicons name={focused ? icon.active : icon.inactive} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeStackNavigator} />
    <Tab.Screen name="Performance" component={PerformanceScreen} />
    <Tab.Screen name="Profile" component={ProfileStackNavigator} />
  </Tab.Navigator>
);

export default MainTabNavigator;