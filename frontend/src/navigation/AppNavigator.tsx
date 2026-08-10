import React from "react";
import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import {
  View,
  Text,
  Button,
} from "react-native";
import {
  useDispatch,
} from "react-redux";
import * as SecureStore from "expo-secure-store";

import {
  logout,
} from "../store/slices/authSlice";

import {
  AppDispatch,
} from "../store/store";

const Stack =
  createNativeStackNavigator();

function HomeScreen() {
  const dispatch =
    useDispatch<AppDispatch>();

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync(
      "authToken"
    );

    dispatch(logout());
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: 24,
          marginBottom: 20,
        }}
      >
        CricketIQ Home
      </Text>

      <Button
        title="Logout"
        onPress={handleLogout}
      />
    </View>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
      />
    </Stack.Navigator>
  );
}