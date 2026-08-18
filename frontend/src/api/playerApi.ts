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

export interface AllPlayersEntry {
  _id: string;
  name: string;
  age: number;
  role: string;
  battingStyle: string;
  bowlingStyle: string;
  team: string | null;
  country: string;
}

export const getAllPlayers = async (): Promise<{ success: boolean; count: number; data: AllPlayersEntry[] }> => {
  const response = await api.get("/players");
  return response.data;
};

export interface UpdateAdminPlayerPayload {
  age?: number;
  battingStyle?: string;
  bowlingStyle?: string;
  country?: string;
}

export const updatePlayerAdmin = async (playerId: string, payload: UpdateAdminPlayerPayload) => {
  const response = await api.put(`/players/${playerId}`, payload);
  return response.data;
};

export const deletePlayer = async (playerId: string) => {
  const response = await api.delete(`/players/${playerId}`);
  return response.data;
};

export interface RawCreatePlayerPayload {
  user: string;
  name: string;
  age: number;
  role: string;
  battingStyle: string;
  bowlingStyle?: string;
  country: string;
  team?: string | null;
}

export const createPlayerRaw = async (payload: RawCreatePlayerPayload) => {
  const response = await api.post("/players", payload);
  return response.data;
};