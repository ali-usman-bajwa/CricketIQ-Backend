const Player = require("../models/Player");
const Performance = require("../models/Performance");

const {
  calculateFeatures,
} = require("./featureEngineering");

const buildPlayerFeatures = async (playerId) => {

  const player = await Player.findById(playerId);

  if (!player) {
    throw new Error("Player not found");
  }


  const performances = await Performance.find({
    player: playerId,
  }).sort({ createdAt: -1 });


  if (performances.length === 0) {
    throw new Error(
      "No performance data found for this player"
    );
  }

  const matches = performances.length;

  const totalRuns = performances.reduce(
    (sum, p) => sum + p.runs,
    0
  );

  const totalBalls = performances.reduce(
    (sum, p) => sum + p.balls,
    0
  );

  const totalFours = performances.reduce(
    (sum, p) => sum + p.fours,
    0
  );

  const totalSixes = performances.reduce(
    (sum, p) => sum + p.sixes,
    0
  );

  const totalWickets = performances.reduce(
    (sum, p) => sum + p.wickets,
    0
  );

  const totalRunsConceded =
    performances.reduce(
      (sum, p) => sum + p.runsConceded,
      0
    );

  const totalOvers =
    performances.reduce(
      (sum, p) => sum + p.oversBowled,
      0
    );

  const dismissals = performances.filter(
    (p) => p.dismissed
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
    performances.slice(0, 5);

  const recentWeights = [
    0.40,
    0.25,
    0.15,
    0.10,
    0.10,
  ];

  let weightedRuns = 0;
  let totalWeight = 0;

  recentPerformances.forEach((performance, index) => {
    const weight = recentWeights[index];

    weightedRuns += performance.runs * weight;
    totalWeight += weight;
  });

  const weightedRecentAverage =
    totalWeight > 0
      ? weightedRuns / totalWeight
      : 0;

  const recentForm = Math.min(
    100,
    (weightedRecentAverage / 50) * 100
  );

  const runValues = performances.map(
    (p) => p.runs
  );


  const averageRuns =
    runValues.reduce(
      (sum, runs) => sum + runs,
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


  const consistency = Math.max(
    0,
    Math.min(
      100,
      100 -
      (standardDeviation /
        Math.max(averageRuns, 1)) *
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


  const features = calculateFeatures(
    player,
    statistics
  );

  return {

    player: {
      id: player._id,
      name: player.name,
      role: player.role,
      age: player.age,
    },

    features,

    performances: recentPerformances.map(
      (performance) => ({
        id: performance._id,
        runs: performance.runs,
        balls: performance.balls,
        fours: performance.fours,
        sixes: performance.sixes,
        wickets: performance.wickets,
        runsConceded:
          performance.runsConceded,
        oversBowled:
          performance.oversBowled,
        dismissed:
          performance.dismissed,
        createdAt:
          performance.createdAt,
      })
    ),
  };
};

module.exports = {
  buildPlayerFeatures,
};
