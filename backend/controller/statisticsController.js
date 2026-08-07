const Performance = require("../models/Performance");
const Player = require("../models/Player");

const getPlayerStatistics = async (req, res) => {
  try {
    const { playerId } = req.params;

    const player = await Player.findById(playerId);

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player not found",
      });
    }

    const performances = await Performance.find({player: playerId}).sort({ createdAt: -1 });

    if (performances.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No performance data found for this player",
      });
    }


    const matches = performances.length;

    const totalRuns = performances.reduce(
      (total, performance) => total + performance.runs,
      0
    );

    const totalBalls = performances.reduce(
      (total, performance) => total + performance.balls,
      0
    );

    const totalFours = performances.reduce(
      (total, performance) => total + performance.fours,
      0
    );

    const totalSixes = performances.reduce(
      (total, performance) => total + performance.sixes,
      0
    );

    const totalWickets = performances.reduce(
      (total, performance) => total + performance.wickets,
      0
    );

    const totalRunsConceded = performances.reduce(
      (total, performance) =>
        total + performance.runsConceded,
      0
    );

    const totalOversBowled = performances.reduce(
      (total, performance) =>
        total + performance.oversBowled,
      0
    );


    const dismissals = performances.filter(
      (performance) => performance.dismissed
    ).length;

    const battingAverage = dismissals > 0 ? totalRuns / dismissals : totalRuns;


    const strikeRate = totalBalls > 0 ? (totalRuns / totalBalls) * 100 : 0;


    const economy = totalOversBowled > 0 ? totalRunsConceded / totalOversBowled : 0;


    const recentPerformances = performances.slice(0, 5);

    const recentRuns = recentPerformances.reduce(
      (total, performance) =>
        total + performance.runs,
      0
    );

    const recentAverage = recentPerformances.length > 0 ? recentRuns / recentPerformances.length : 0;

    const recentForm = Math.min(
      100,
      (recentAverage / 50) * 100
    );


    const runValues = performances.map(
      (performance) => performance.runs
    );

    const averageRuns =
      runValues.reduce(
        (total, runs) => total + runs,
        0
      ) / runValues.length;

    const variance =
      runValues.reduce(
        (total, runs) =>
          total + Math.pow(runs - averageRuns, 2),
        0
      ) / runValues.length;

    const standardDeviation = Math.sqrt(variance);

    const consistency = Math.max(
      0,
      Math.min(100,100 -(standardDeviation / Math.max(averageRuns, 1)) * 100)
    );


    res.status(200).json({
      success: true,

      data: {
        player: {
          id: player._id,
          name: player.name,
          role: player.role,
          team: player.team,
        },

        statistics: {
          matches,

          totalRuns,

          battingAverage: Number(
            battingAverage.toFixed(2)
          ),

          strikeRate: Number(
            strikeRate.toFixed(2)
          ),

          fours: totalFours,

          sixes: totalSixes,

          totalWickets,

          economy: Number(
            economy.toFixed(2)
          ),

          recentForm: Number(
            recentForm.toFixed(2)
          ),

          consistency: Number(
            consistency.toFixed(2)
          ),
        },
      },
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
    
  }
};

module.exports = {
  getPlayerStatistics,
};