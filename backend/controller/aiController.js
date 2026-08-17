const Player = require("../models/Player");

const {
  buildPlayerFeatures,
} = require("../services/playerFeatureService");

const {
  predictPlayerPotential,
} = require("../services/mlService");

const {
  generatePlayerAnalysis,
} = require("../services/aiService");

const generateAnalysis = async (req, res) => {
  try {
    const { playerId } = req.params;

    if (req.user.role === "Player") {

      const ownedPlayer =
        await Player.findById(playerId);

      if (!ownedPlayer) {
        return res.status(404).json({
          success: false,
          message: "Player not found",
        });
      }

      if (
        ownedPlayer.user.toString() !==
        req.user.id
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to view this player's data",
        });
      }
    }

    const result =
      await buildPlayerFeatures(playerId);

    const prediction =
      await predictPlayerPotential(
        result.features
      );

    const analysis =
      await generatePlayerAnalysis({
        player: result.player,

        features:
          result.features,

        prediction,

        performances:
          result.performances || [],

        performanceSource:
          result.performanceSource ||
          "PLAYER_REPORTED",
      });

    return res.status(200).json({
      success: true,

      data: {
        player:
          result.player,

        performanceSource:
          result.performanceSource ||
          "PLAYER_REPORTED",

        statistics:
          result.statistics || null,

        features:
          result.features,

        prediction,

        performances:
          result.performances || [],

        analysis,
      },
    });

  } catch (error) {

    if (error.message === "Player not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message ===
        "No performance data found for this player" ||

      error.message ===
        "No valid performance data available for analysis" ||

      error.message.startsWith(
        "Insufficient performance data"
      )
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    console.error(
      "AI Scouting Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to generate AI scouting analysis",
    });
  }
};

module.exports = {
  generateAnalysis,
};