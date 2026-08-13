import api from "./axios";

export interface PlayerProfile {
  _id: string;
  name: string;
  age: number;
  role: string;
  battingStyle: string;
  bowlingStyle: string;
  team: string | null;
  country: string;
  image?: string;
}

export interface UpdatePlayerPayload {
  age?: number;
  battingStyle?: "Right Hand" | "Left Hand";
  bowlingStyle?: string;
  country?: string;
  image?: string;
}

export const getPlayer = async (playerId: string) => {
  const response = await api.get(`/players/${playerId}`);
  return response.data;
};

export const updatePlayer = async (playerId: string, payload: UpdatePlayerPayload) => {
  const response = await api.put(`/players/${playerId}`, payload);
  return response.data;
};