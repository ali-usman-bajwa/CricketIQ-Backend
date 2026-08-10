const {
  comparePlayers,
} = require("../services/playerComparisonService");

const {
  generatePlayerComparison,
} = require("../services/aiComparisonService");

// =====================================================
// AI PLAYER COMPARISON
// =====================================================

const aiComparePlayersController = async (req, res) => {
  try {
    const { playerIds } = req.body;

    // -------------------------------------------------
    // Validate playerIds
    // -------------------------------------------------

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

    // Prevent comparing the same player multiple times
    const uniquePlayerIds = [
      ...new Set(playerIds.map((id) => id.toString())),
    ];

    if (uniquePlayerIds.length !== playerIds.length) {
      return res.status(400).json({
        success: false,
        message:
          "Duplicate player IDs are not allowed",
      });
    }

    // -------------------------------------------------
    // Build comparison
    //
    // playerComparisonService should use the same
    // performance-selection logic as:
    //
    // PLAYER_REPORTED
    // COACH_REPORTED
    // COACH_VERIFIED -> UNIFIED PERFORMANCE
    // -------------------------------------------------

    const comparison = await comparePlayers(
      uniquePlayerIds
    );

    // -------------------------------------------------
    // Generate AI comparison
    // -------------------------------------------------

    const aiComparison =
      await generatePlayerComparison(
        comparison
      );

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    return res.status(200).json({
      success: true,

      data: {
        players: comparison,
        aiComparison,
      },
    });
  } catch (error) {
    // -------------------------------------------------
    // Known errors
    // -------------------------------------------------

    if (
      error.message === "Player not found" ||
      error.message ===
        "No performance data found for this player" ||
      error.message ===
        "No valid performance data available for analysis"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    // -------------------------------------------------
    // Unexpected errors
    // -------------------------------------------------

    console.error(
      "AI Player Comparison Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to generate AI player comparison",
    });
  }
};

module.exports = {
  aiComparePlayersController,
};