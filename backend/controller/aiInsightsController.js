const {
  buildPlayerFeatures,
} = require("../services/playerFeatureService");

const {
  predictPlayerPotential,
} = require("../services/mlService");

const {
  generatePlayerReport,
} = require("../services/aiInsightsService");

const Player = require("../models/Player");
const Performance = require("../models/Performance");

const generatePlayerReportController = async (req,res) => {
  try {
    const { playerId } = req.params;

    const player = await Player.findById(playerId);

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player not found",
      });
    }

    const result =
      await buildPlayerFeatures(playerId);

    const prediction =
      await predictPlayerPotential(
        result.features
      );

    const performances =
      await Performance.find({
        player: playerId,
      })
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .lean();

    if (!performances.length) {
      return res.status(404).json({
        success: false,
        message:
          "No performance data found for this player",
      });
    }

    const report =
      await generatePlayerReport({
        player: result.player,
        features: result.features,
        prediction,
        performances,
      });

    return res.status(200).json({
      success: true,

      data: {
        player: result.player,

        features: result.features,

        prediction,

        report,
      },
    });

  } catch (error) {

    if (
      error.message ===
        "No performance data found for this player"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error(
      "AI Insights Controller Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to generate player performance report",
    });
  }
};

module.exports = {
  generatePlayerReportController,
};