import api from "./axios";

export interface PerformanceReport {
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  wickets: number;
  runsConceded: number;
  oversBowled: number;
  strikeRate: number;
  economy: number;
  dismissed: boolean;
}

export interface PerformanceRecord {
  _id: string;
  player: { _id: string; name: string; role: string };
  match: {
    _id: string;
    format: string;
    date: string;
    venue: string;
    status: string;
    teamA: { _id: string; name: string; shortName: string };
    teamB: { _id: string; name: string; shortName: string };
  };
  playerReport: PerformanceReport | null;
  coachReport: PerformanceReport | null;
  unifiedPerformance: PerformanceReport | null;
  verificationStatus: "PLAYER_REPORTED" | "COACH_REPORTED" | "COACH_VERIFIED";
}

export interface SubmitPerformancePayload {
  player: string;
  match: string;
  playerReport: {
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    wickets: number;
    runsConceded: number;
    oversBowled: number;
    dismissed: boolean;
  };
}

export const getPlayerPerformances = async (
  playerId: string
): Promise<{ success: boolean; count: number; data: PerformanceRecord[] }> => {
  const response = await api.get(`/performances/player/${playerId}`);
  return response.data;
};

export const submitPerformance = async (payload: SubmitPerformancePayload) => {
  const response = await api.post("/performances", payload);
  return response.data;
};

export interface SubmitCoachReportPayload {
  player: string;
  match: string;
  coachReport: {
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    wickets: number;
    runsConceded: number;
    oversBowled: number;
    dismissed: boolean;
  };
}

export const submitCoachReport = async (payload: SubmitCoachReportPayload) => {
  const response = await api.post("/performances", payload);
  return response.data;
};

export const getAllPerformances = async (): Promise<{ success: boolean; count: number; data: PerformanceRecord[] }> => {
  const response = await api.get("/performances");
  return response.data;
};