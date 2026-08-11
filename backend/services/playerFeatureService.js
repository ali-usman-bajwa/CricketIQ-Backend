const Player = require("../models/Player");
const Performance = require("../models/Performance");

const {
  calculateFeatures,
} = require("./featureEngineering");

// Minimum number of usable performance records required
// before we consider a prediction meaningful. Below this,
// derived stats like consistency/recentForm are unreliable
// (e.g. a single match trivially yields consistency = 100).
const MIN_MATCHES_FOR_PREDICTION = 3;

// =====================================================
// SELECT THE CORRECT PERFORMANCE DATA
// =====================================================

const getAnalysisReport = (performance) => {

  // ---------------------------------------------------
  // COACH VERIFIED
  // ---------------------------------------------------

  if (
    performance.verificationStatus === "COACH_VERIFIED"
  ) {
    if (!performance.unifiedPerformance) {
      return null;
    }

    return {
      source: "UNIFIED",
      report: performance.unifiedPerformance,
    };
  }

  // ---------------------------------------------------
  // PLAYER REPORTED
  // ---------------------------------------------------

  if (
    performance.verificationStatus === "PLAYER_REPORTED"
  ) {
    if (!performance.playerReport) {
      return null;
    }

    return {
      source: "PLAYER",
      report: performance.playerReport,
    };
  }

  // ---------------------------------------------------
  // COACH REPORTED BUT NOT VERIFIED
  // ---------------------------------------------------
  //
  // If player data exists, use player's data
  // until both reports are available.
  //
  // If only coach data exists, ignore it because
  // it has not been verified yet.
  // ---------------------------------------------------

  if (
    performance.verificationStatus === "COACH_REPORTED"
  ) {

    // Player report exists → use player data temporarily
    if (performance.playerReport) {
      return {
        source: "PLAYER",
        report: performance.playerReport,
      };
    }

    // Coach report alone is not verified yet
    return null;
  }

  return null;
};

// =====================================================
// BUILD PLAYER FEATURES
// =====================================================

const buildPlayerFeatures = async (playerId) => {

  // ---------------------------------------------------
  // FIND PLAYER
  // ---------------------------------------------------

  const player = await Player.findById(playerId);

  if (!player) {
    throw new Error("Player not found");
  }

  // ---------------------------------------------------
  // GET PERFORMANCE RECORDS
  // ---------------------------------------------------

  const performances = await Performance.find({
    player: playerId,
  }).sort({
    createdAt: -1,
  });

  if (performances.length === 0) {
    throw new Error(
      "No performance data found for this player"
    );
  }

  // ===================================================
  // SELECT CORRECT ANALYSIS DATA
  // ===================================================

  const analysisPerformances = [];

  for (const performance of performances) {

    const analysis =
      getAnalysisReport(performance);

    if (!analysis) {
      continue;
    }

    analysisPerformances.push({
      id: performance._id,
      source: analysis.source,
      report: analysis.report,
      createdAt: performance.createdAt,
    });
  }

  // ---------------------------------------------------
  // NO USABLE DATA
  // ---------------------------------------------------

  if (analysisPerformances.length === 0) {
    throw new Error(
      "No valid performance data available for analysis"
    );
  }

  // ---------------------------------------------------
  // NOT ENOUGH USABLE DATA FOR A RELIABLE PREDICTION
  // ---------------------------------------------------

  if (analysisPerformances.length < MIN_MATCHES_FOR_PREDICTION) {
    throw new Error(
      `Insufficient performance data. Minimum ${MIN_MATCHES_FOR_PREDICTION} matches required, found ${analysisPerformances.length}`
    );
  }

  // ===================================================
  // AGGREGATED STATISTICS
  // ===================================================

  const matches =
    analysisPerformances.length;

  const totalRuns =
    analysisPerformances.reduce(
      (sum, performance) =>
        sum +
        Number(
          performance.report.runs || 0
        ),
      0
    );

  const totalBalls =
    analysisPerformances.reduce(
      (sum, performance) =>
        sum +
        Number(
          performance.report.balls || 0
        ),
      0
    );

  const totalFours =
    analysisPerformances.reduce(
      (sum, performance) =>
        sum +
        Number(
          performance.report.fours || 0
        ),
      0
    );

  const totalSixes =
    analysisPerformances.reduce(
      (sum, performance) =>
        sum +
        Number(
          performance.report.sixes || 0
        ),
      0
    );

  const totalWickets =
    analysisPerformances.reduce(
      (sum, performance) =>
        sum +
        Number(
          performance.report.wickets || 0
        ),
      0
    );

  const totalRunsConceded =
    analysisPerformances.reduce(
      (sum, performance) =>
        sum +
        Number(
          performance.report.runsConceded || 0
        ),
      0
    );

  const totalOvers =
    analysisPerformances.reduce(
      (sum, performance) =>
        sum +
        Number(
          performance.report.oversBowled || 0
        ),
      0
    );

  // ===================================================
  // BATTING AVERAGE
  // ===================================================

  const dismissals =
    analysisPerformances.filter(
      (performance) =>
        performance.report.dismissed === true
    ).length;

  const battingAverage =
    dismissals > 0
      ? totalRuns / dismissals
      : totalRuns;

  // ===================================================
  // STRIKE RATE
  // ===================================================

  const strikeRate =
    totalBalls > 0
      ? (totalRuns / totalBalls) * 100
      : 0;

  // ===================================================
  // ECONOMY
  // ===================================================

  const economy =
    totalOvers > 0
      ? totalRunsConceded / totalOvers
      : 0;

  // ===================================================
  // RECENT FORM
  // ===================================================

  const recentPerformances =
    analysisPerformances.slice(0, 5);

  const recentWeights = [
    0.40,
    0.25,
    0.15,
    0.10,
    0.10,
  ];

  let weightedRuns = 0;
  let totalWeight = 0;

  recentPerformances.forEach(
    (performance, index) => {

      const weight =
        recentWeights[index];

      if (!weight) {
        return;
      }

      weightedRuns +=
        Number(
          performance.report.runs || 0
        ) * weight;

      totalWeight += weight;
    }
  );

  const weightedRecentAverage =
    totalWeight > 0
      ? weightedRuns / totalWeight
      : 0;

  const recentForm =
    Math.min(
      100,
      (weightedRecentAverage / 50) * 100
    );

  // ===================================================
  // CONSISTENCY
  // ===================================================

  const runValues =
    analysisPerformances.map(
      (performance) =>
        Number(
          performance.report.runs || 0
        )
    );

  const averageRuns =
    runValues.reduce(
      (sum, runs) =>
        sum + runs,
      0
    ) / runValues.length;

  const variance =
    runValues.reduce(
      (sum, runs) =>
        sum +
        Math.pow(
          runs - averageRuns,
          2
        ),
      0
    ) / runValues.length;

  const standardDeviation =
    Math.sqrt(variance);

  const consistency =
    Math.max(
      0,
      Math.min(
        100,
        100 -
          (standardDeviation /
            Math.max(
              averageRuns,
              1
            )) *
            100
      )
    );

  // ===================================================
  // STATISTICS
  // ===================================================

  const statistics = {
    matches,
    totalRuns,
    totalBalls,
    battingAverage,
    strikeRate,
    fours: totalFours,
    sixes: totalSixes,
    totalWickets,
    economy,
    recentForm,
    consistency,
  };

  // ===================================================
  // FEATURE ENGINEERING
  // ===================================================

  const features =
    calculateFeatures(
      player,
      statistics
    );

  // ===================================================
  // DETERMINE CURRENT DATA SOURCE
  // ===================================================

  const hasUnifiedData =
    analysisPerformances.some(
      (performance) =>
        performance.source ===
        "UNIFIED"
    );

  let analysisSource = "PLAYER";

  if (hasUnifiedData) {
    analysisSource = "UNIFIED";
  }

  // ===================================================
  // RETURN
  // ===================================================

  return {
    player: {
      id: player._id,
      name: player.name,
      role: player.role,
      age: player.age,
    },

    // Tells ML/AI/frontend what data was used.
    performanceSource:
      analysisSource,

    features,

    statistics,

    performances:
      recentPerformances.map(
        (performance) => ({
          id: performance.id,

          source:
            performance.source,

          runs:
            performance.report.runs,

          balls:
            performance.report.balls,

          fours:
            performance.report.fours,

          sixes:
            performance.report.sixes,

          wickets:
            performance.report.wickets,

          runsConceded:
            performance.report
              .runsConceded,

          oversBowled:
            performance.report
              .oversBowled,

          dismissed:
            performance.report
              .dismissed,

          createdAt:
            performance.createdAt,
        })
      ),
  };
};

module.exports = {
  buildPlayerFeatures,
};