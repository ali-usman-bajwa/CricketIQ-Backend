import React, { useEffect } from "react";
import {
  Provider,
  useDispatch,
  useSelector,
} from "react-redux";
import {
  NavigationContainer,
} from "@react-navigation/native";
import {
  View,
  ActivityIndicator,
} from "react-native";
import * as SecureStore from "expo-secure-store";

import {
  store,
  RootState,
  AppDispatch,
} from "./src/store/store";

import AuthNavigator from "./src/navigation/AuthNavigator";
import AppNavigator from "./src/navigation/AppNavigator";

import {
  loginSuccess,
  finishLoading,
} from "./src/store/slices/authSlice";

import {
  getCurrentUser,
} from "./src/api/authApi";

function RootNavigator() {
  const dispatch =
    useDispatch<AppDispatch>();

  const {
    isAuthenticated,
    isLoading,
  } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    const restoreAuthentication =
      async () => {
        try {
          const token =
            await SecureStore.getItemAsync(
              "authToken"
            );

          if (!token) {
            dispatch(finishLoading());
            return;
          }

          const response =
            await getCurrentUser();

          if (
            response.success &&
            response.data
          ) {
            dispatch(
              loginSuccess({
                token,
                user: response.data,
              })
            );
          } else {
            await SecureStore.deleteItemAsync(
              "authToken"
            );

            dispatch(finishLoading());
          }
        } catch (error) {
          console.log(
            "Authentication restore failed:",
            error
          );

          await SecureStore.deleteItemAsync(
            "authToken"
          );

          dispatch(finishLoading());
        }
      };

    restoreAuthentication();
  }, [dispatch]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <AppNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}