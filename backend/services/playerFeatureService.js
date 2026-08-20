const Player = require("../models/Player");
const Performance = require("../models/Performance");

const {
  calculateFeatures,
} = require("./featureEngineering");

const MIN_MATCHES_FOR_PREDICTION = 3;

const getAnalysisReport = (performance) => {

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

  if (
    performance.verificationStatus === "COACH_REPORTED"
  ) {
    if (performance.playerReport) {
      return {
        source: "PLAYER",
        report: performance.playerReport,
      };
    }

    return null;
  }

  return null;
};


const buildPlayerFeatures = async (playerId) => {


  const player = await Player.findById(playerId);

  if (!player) {
    throw new Error("Player not found");
  }

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


  if (analysisPerformances.length === 0) {
    throw new Error(
      "No valid performance data available for analysis"
    );
  }

  if (analysisPerformances.length < MIN_MATCHES_FOR_PREDICTION) {
    throw new Error(
      `Insufficient performance data. Minimum ${MIN_MATCHES_FOR_PREDICTION} matches required, found ${analysisPerformances.length}`
    );
  }

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

  const dismissals =
    analysisPerformances.filter(
      (performance) =>
        performance.report.dismissed === true
    ).length;

  const battingAverage =
    dismissals > 0
      ? totalRuns / dismissals
      : totalRuns;

  const strikeRate =
    totalBalls > 0
      ? (totalRuns / totalBalls) * 100
      : 0;

  const economy =
    totalOvers > 0
      ? totalRunsConceded / totalOvers
      : 0;


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


  const features =
    calculateFeatures(
      player,
      statistics
    );

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

  return {
    player: {
      id: player._id,
      name: player.name,
      role: player.role,
      age: player.age,
    },

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