import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/player/ProfileScreen";
import EditProfileScreen from "../screens/player/EditProfileScreen";
import { colors, fonts } from "../theme/theme";
export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.background },
      headerTitleStyle: { fontFamily: fonts.bodySemiBold, color: colors.primaryText },
      headerTintColor: colors.primaryText,
      headerShadowVisible: false,
    }}
  >
    <Stack.Screen name="ProfileHome" component={ProfileScreen} options={{ headerShown: false }} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: "Edit Profile" }} />
  </Stack.Navigator>
);

export default ProfileStackNavigator;
