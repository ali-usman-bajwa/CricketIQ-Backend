const Player = require("../models/Player");

const {
  buildPlayerFeatures,
} = require("../services/playerFeatureService");

const {
  predictPlayerPotential,
} = require("../services/mlService");


const getPlayerFeatures = async (req, res) => {
  try {

    const { playerId } = req.params;

    if (req.user.role === "Player") {

      const player = await Player.findById(playerId);

      if (!player) {
        return res.status(404).json({
          success: false,
          message: "Player not found",
        });
      }

      if (player.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to view this player's data",
        });
      }
    }

    const result =
      await buildPlayerFeatures(playerId);

    res.status(200).json({
      success: true,
      data: result,
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
      error.message.startsWith(
        "Insufficient performance data"
      )
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const predictPlayer = async (req, res) => {
  try {

    const { playerId } = req.params;

   
    const result =
      await buildPlayerFeatures(playerId);

    const prediction =
      await predictPlayerPotential(
        result.features
      );

    res.status(200).json({
      success: true,

      data: {
        player: result.player,
        features: result.features,
        prediction,
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
      error.message.startsWith(
        "Insufficient performance data"
      )
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getPlayerFeatures,
  predictPlayer,
};