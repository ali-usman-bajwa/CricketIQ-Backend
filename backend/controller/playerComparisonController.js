const {
  comparePlayers,
} = require("../services/playerComparisonService");


const comparePlayersController = async (req, res) => {
  try {
    const { playerIds } = req.body;

    if (!Array.isArray(playerIds)) {
      return res.status(400).json({
        success: false,
        message: "playerIds must be an array",
      });
    }

    if (playerIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: "At least 2 players are required",
      });
    }

    if (playerIds.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 players can be compared",
      });
    }

    const uniquePlayerIds = [...new Set(playerIds)];

    if (uniquePlayerIds.length !== playerIds.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate player IDs are not allowed",
      });
    }

    const comparison = await comparePlayers(
      uniquePlayerIds
    );

    return res.status(200).json({
      success: true,
      data: {
        players: comparison,
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
      error.message === "No performance data found for this player" ||
      error.message === "No valid performance data available for analysis" ||
      error.message.startsWith("Insufficient performance data")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error(
      "Player Comparison Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to compare players",
    });


  }
};

module.exports = {
  comparePlayersController,
};
