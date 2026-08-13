import api from "./axios";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: "Player" | "Coach";
  age?: number;
  playerRole?: "Batter" | "Bowler" | "All-Rounder" | "Wicket-Keeper";
  battingStyle?: "Right Hand" | "Left Hand";
  bowlingStyle?: string;
  country?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const registerUser = async (payload: RegisterPayload) => {
  const response = await api.post("/auth/register", payload);
  return response.data;
};

export const loginUser = async (payload: LoginPayload) => {
  const response = await api.post("/auth/login", payload);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};