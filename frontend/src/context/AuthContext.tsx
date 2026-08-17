import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  loginUser,
  registerUser,
  getCurrentUser,
  LoginPayload,
  RegisterPayload,
} from "../api/authApi";
import { getTeams, Team } from "../api/teamApi";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface PlayerProfile {
  _id: string;
  name: string;
  age: number;
  role: string;
  battingStyle: string;
  bowlingStyle: string;
  team: string | null;
  country: string;
}

interface AuthContextType {
  user: User | null;
  player: PlayerProfile | null;
  coachTeam: Team | null;
  token: string | null;
  isLoading: boolean;
  showWelcome: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshPlayerProfile: () => Promise<void>;
  refreshCoachTeam: () => Promise<void>;
  dismissWelcome: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

  const [user, setUser] = useState<User | null>(null);
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [coachTeam, setCoachTeam] = useState<Team | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  const fetchPlayerProfile = async () => {
    try {
      const data = await getCurrentUser();
      setPlayer(data?.data?.player || null);
    } catch (error) {
      console.error("Failed to fetch player profile:", error);
      setPlayer(null);
    }
  };

  const fetchCoachTeam = async (userId: string) => {
    try {
      const res = await getTeams();
      const mine = res.data.find((t: any) => t.coach?._id === userId) || null;
      setCoachTeam(mine);
    } catch (error) {
      console.error("Failed to fetch coach's team:", error);
      setCoachTeam(null);
    }
  };

  useEffect(() => {

    const loadSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          if (parsedUser.role === "Player") {
            await fetchPlayerProfile();
          } else if (parsedUser.role === "Coach") {
            await fetchCoachTeam(parsedUser.id);
          }
        }
      } catch (error) {
        console.error("Failed to load session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = async (payload: LoginPayload) => {
    const data = await loginUser(payload);
    await AsyncStorage.setItem("token", data.token);
    await AsyncStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setShowWelcome(true);

    if (data.user.role === "Player") {
      await fetchPlayerProfile();
    } else if (data.user.role === "Coach") {
      await fetchCoachTeam(data.user.id);
    }
  };

  const register = async (payload: RegisterPayload) => {
    await registerUser(payload);
    await login({ email: payload.email, password: payload.password });
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setPlayer(null);
    setCoachTeam(null);
    setShowWelcome(false);
  };

  const dismissWelcome = () => setShowWelcome(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        player,
        coachTeam,
        token,
        isLoading,
        showWelcome,
        login,
        register,
        logout,
        refreshPlayerProfile: fetchPlayerProfile,
        refreshCoachTeam: () => (user ? fetchCoachTeam(user.id) : Promise.resolve()),
        dismissWelcome,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};