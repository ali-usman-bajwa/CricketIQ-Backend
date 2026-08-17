import api from "./axios";

// =====================================================
// AI SCOUT
// =====================================================

export interface AIScoutAnalysis {
  performanceSource: string;
  overallAssessment: string;
  strengths: string[];
  areasForImprovement: string[];
  recentTrend: {
    runTrend: string;
    strikeRateTrend: string;
    summary: string;
  };
  mlExplanation: string;
  potentialAssessment: string;
  sampleSizeAssessment: string;
  scoutingRecommendation: string;
  confidence: "LOW" | "MEDIUM" | "HIGH";
}

export interface AIScoutResponse {
  success: boolean;
  data: {
    player: { id: string; name: string; role: string; age: number };
    prediction: { potentialLevel: string; potentialScore: number; prediction: 0 | 1; success: boolean };
    analysis: AIScoutAnalysis;
  };
}

export const getAIScoutAnalysis = async (playerId: string): Promise<AIScoutResponse> => {
  const response = await api.post(`/ai/analysis/${playerId}`);
  return response.data;
};

// =====================================================
// AI COACH
// =====================================================

export interface AICoachPlan {
  coachSummary: string;
  priorityArea: string;
  strengthToMaintain: string;
  developmentAreas: string[];
  trainingFocus: string[];
  matchPreparation: string[];
  shortTermGoals: string[];
  dataLimitations: string;
  confidence: "LOW" | "MEDIUM" | "HIGH";
}

export interface AICoachResponse {
  success: boolean;
  data: {
    player: { id: string; name: string; role: string; age: number };
    prediction: { potentialLevel: string; potentialScore: number; prediction: 0 | 1; success: boolean };
    coaching: AICoachPlan;
  };
}

export const getAICoachPlan = async (playerId: string): Promise<AICoachResponse> => {
  const response = await api.post(`/ai/coach/${playerId}`);
  return response.data;
};

// =====================================================
// AI INSIGHTS
// =====================================================

export interface AIInsightsReport {
  reportSummary: string;
  performanceTrend: string;
  keyStatistics: Array<{ metric: string; value: string; observation: string }>;
  battingInsights: string[];
  bowlingInsights: string[];
  formAnalysis: string;
  consistencyAnalysis: string;
  mlInsight: string;
  developmentInsights: string[];
  scoutingInsight: string;
  dataLimitations: string;
  confidence: "LOW" | "MEDIUM" | "HIGH";
}

export interface AIInsightsResponse {
  success: boolean;
  data: {
    player: { id: string; name: string; role: string; age: number };
    prediction: { potentialLevel: string; potentialScore: number; prediction: 0 | 1; success: boolean };
    report: AIInsightsReport;
  };
}

export const getAIInsights = async (playerId: string): Promise<AIInsightsResponse> => {
  const response = await api.get(`/ai-insights/player/${playerId}`);
  return response.data;
};

// =====================================================
// PLAYER COMPARISON (no AI narrative)
// =====================================================

export interface ComparisonEntry {
  rank: number;
  player: { id: string; name: string; role: string; age: number };
  features: Record<string, number>;
  statistics: Record<string, number>;
  prediction: { potentialLevel: string; potentialScore: number; prediction: 0 | 1; success: boolean };
}

export interface ComparisonResponse {
  success: boolean;
  data: { players: ComparisonEntry[] };
}

export const comparePlayers = async (playerIds: string[]): Promise<ComparisonResponse> => {
  const response = await api.post("/comparison", { playerIds });
  return response.data;
};

// =====================================================
// AI COMPARISON
// =====================================================

export interface AIComparisonNarrative {
  overallComparison: string;
  playerAdvantages: Array<{ player: string; advantages: string[] }>;
  categoryComparison: Array<{ category: string; leader: string; explanation: string }>;
  potentialComparison: string;
  sampleSizeAssessment: string;
  recommendation: string;
  confidence: "LOW" | "MEDIUM" | "HIGH";
}

export interface AIComparisonResponse {
  success: boolean;
  data: { players: ComparisonEntry[]; aiComparison: AIComparisonNarrative };
}

export const compareAI = async (playerIds: string[]): Promise<AIComparisonResponse> => {
  const response = await api.post("/ai-comparison", { playerIds });
  return response.data;
};

// =====================================================
// TEAM BUILDER
// =====================================================

export interface RecommendedXIEntry {
  selectionRank: number;
  player: { id: string; name: string; role: string; age: number };
  role: string;
  features: Record<string, number>;
  prediction: { potentialLevel: string; potentialScore: number; prediction: 0 | 1; success: boolean };
}

export interface TeamBuilderAnalysis {
  teamSummary: string;
  teamStrengths: string[];
  teamWeaknesses: string[];
  battingAnalysis: string;
  bowlingAnalysis: string;
  teamBalance: string;
  captainRecommendation: { player: string; reason: string };
  viceCaptainRecommendation: { player: string; reason: string };
  keyPlayers: Array<{ player: string; reason: string }>;
  selectionAssessment: string;
  dataLimitations: string;
  confidence: "LOW" | "MEDIUM" | "HIGH";
}

export interface TeamBuilderResponse {
  success: boolean;
  data: {
    format: string;
    teamSize: number;
    recommendedXI: RecommendedXIEntry[];
    roleDistribution: { batters: number; wicketkeepers: number; allRounders: number; bowlers: number };
    teamMetrics: { averagePotential: number; averageOverallImpact: number };
    aiTeamAnalysis: TeamBuilderAnalysis;
  };
}

export const buildTeam = async (
  playerIds: string[],
  format: "T20" | "ODI" | "TEST"
): Promise<TeamBuilderResponse> => {
  const response = await api.post("/team-builder", { playerIds, format });
  return response.data;
};