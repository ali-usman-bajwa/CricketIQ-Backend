import api from "./axios";

export interface MatchTeamRef {
  _id: string;
  name: string;
  shortName: string;
  country: string;
}

export interface Match {
  _id: string;
  teamA: MatchTeamRef;
  teamB: MatchTeamRef;
  format: string;
  date: string;
  venue: string;
  status: "scheduled" | "completed";
  winner: MatchTeamRef | null;
}

export const getMatches = async (): Promise<{ success: boolean; count: number; data: Match[] }> => {
  const response = await api.get("/matches");
  return response.data;
};

export interface CreateMatchPayload {
  teamA: string;
  teamB: string;
  format: string;
  date: string;
  venue: string;
}

export const createMatch = async (payload: CreateMatchPayload) => {
  const response = await api.post("/matches", payload);
  return response.data;
};

export const updateMatchStatus = async (matchId: string, status: "completed") => {
  const response = await api.put(`/matches/${matchId}`, { status });
  return response.data;
};

export const deleteMatch = async (matchId: string) => {
  const response = await api.delete(`/matches/${matchId}`);
  return response.data;
};

export interface UpdateMatchPayload {
  teamA?: string;
  teamB?: string;
  format?: string;
  date?: string;
  venue?: string;
  status?: "scheduled" | "completed";
  winner?: string;
}

export const updateMatch = async (matchId: string, payload: UpdateMatchPayload) => {
  const response = await api.put(`/matches/${matchId}`, payload);
  return response.data;
};