const Performance = require("../models/Performance");

const getAnalysisData = async (performanceId) => {
  const performance = await Performance.findById(
    performanceId
  );

  if (!performance) {
    throw new Error("Performance not found");
  }

  if (
    performance.verificationStatus ===
    "COACH_VERIFIED"
  ) {
    if (!performance.unifiedPerformance) {
      throw new Error(
        "Unified performance is not available"
      );
    }

    return {
      source: "UNIFIED",
      status: "COACH_VERIFIED",
      data: performance.unifiedPerformance,
    };
  }

  if (
    performance.verificationStatus ===
    "PLAYER_REPORTED"
  ) {
    if (!performance.playerReport) {
      throw new Error(
        "Player performance report is not available"
      );
    }

    return {
      source: "PLAYER",
      status: "PLAYER_REPORTED",
      data: performance.playerReport,
    };
  }

  if (
    performance.verificationStatus ===
    "COACH_REPORTED"
  ) {
    if (performance.playerReport) {
      return {
        source: "PLAYER",
        status: "COACH_REPORTED",
        data: performance.playerReport,
      };
    }

    if (performance.coachReport) {
      return {
        source: "COACH",
        status: "COACH_REPORTED",
        data: performance.coachReport,
      };
    }
  }

  throw new Error(
    "No valid performance data available for analysis"
  );
};

module.exports = {
  getAnalysisData,
};