import api from "./axios";

export interface TeamPlayer {
  _id: string;
  name: string;
  role: string;
  age: number;
  battingStyle: string;
  bowlingStyle: string;
  country: string;
  image?: string;
}

export interface Team {
  _id: string;
  name: string;
  shortName: string;
  country: string;
  players: TeamPlayer[];
  captain: TeamPlayer | null;
}

export const getTeam = async (teamId: string): Promise<{ success: boolean; data: Team }> => {
  const response = await api.get(`/teams/${teamId}`);
  return response.data;
};

export const getTeams = async (): Promise<{ success: boolean; count: number; data: Team[] }> => {
  const response = await api.get("/teams");
  return response.data;
};

export interface CreateTeamPayload {
  name: string;
  shortName: string;
  country: string;
}

export const createTeam = async (payload: CreateTeamPayload) => {
  const response = await api.post("/teams", payload);
  return response.data;
};

export const addPlayerToTeam = async (teamId: string, playerId: string) => {
  const response = await api.post(`/teams/${teamId}/players`, { playerId });
  return response.data;
};

export const removePlayerFromTeam = async (teamId: string, playerId: string) => {
  const response = await api.delete(`/teams/${teamId}/players/${playerId}`);
  return response.data;
};