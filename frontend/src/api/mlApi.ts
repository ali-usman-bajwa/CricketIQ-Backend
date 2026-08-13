import api from "./axios";

export interface PlayerFeatures {
  age: number;
  matches: number;
  totalRuns: number;
  battingAverage: number;
  strikeRate: number;
  fours: number;
  sixes: number;
  totalWickets: number;
  economy: number;
  recentForm: number;
  consistency: number;
  battingImpact: number;
  bowlingImpact: number;
  powerHitting: number;
  overallImpact: number;
}

export interface PlayerFeaturesResponse {
  success: boolean;
  data: {
    player: { id: string; name: string; role: string; age: number };
    performanceSource: string;
    features: PlayerFeatures;
    statistics: Record<string, number>;
    performances: any[];
  };
}

export const getPlayerFeatures = async (
  playerId: string
): Promise<PlayerFeaturesResponse> => {
  const response = await api.get(`/ml/features/${playerId}`);
  return response.data;
};