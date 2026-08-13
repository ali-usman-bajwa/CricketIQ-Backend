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