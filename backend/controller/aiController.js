const {
  buildPlayerFeatures,
} = require("../services/playerFeatureService");

const {
  predictPlayerPotential,
} = require("../services/mlService");

const {
  generatePlayerAnalysis,
} = require("../services/aiService");


// =====================================================
// GENERATE AI PLAYER SCOUTING ANALYSIS
// =====================================================

const generateAnalysis = async (req, res) => {
  try {
    const { playerId } = req.params;

    // -------------------------------------------------
    // Build player features
    // -------------------------------------------------

    const result =
      await buildPlayerFeatures(playerId);

    // -------------------------------------------------
    // Generate ML prediction
    // -------------------------------------------------

    const prediction =
      await predictPlayerPotential(
        result.features
      );

    // -------------------------------------------------
    // Generate AI scouting analysis
    // -------------------------------------------------

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

    // -------------------------------------------------
    // Return complete analysis
    // -------------------------------------------------

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

    // -------------------------------------------------
    // Known errors
    // -------------------------------------------------

    if (
      error.message ===
        "Player not found" ||

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
    // Unexpected error
    // -------------------------------------------------

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


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  generateAnalysis,
};