const {
  buildPlayerFeatures,
} = require("../services/playerFeatureService");

const {
  predictPlayerPotential,
} = require("../services/mlService");

const {
  generatePlayerReport,
} = require("../services/aiInsightsService");

// =====================================================
// GENERATE PLAYER INSIGHTS / PERFORMANCE REPORT
// =====================================================

const generatePlayerReportController = async (req, res) => {
  try {
    const { playerId } = req.params;

    // -------------------------------------------------
    // Build features using the centralized performance
    // selection logic.
    //
    // This means:
    // PLAYER_REPORTED  -> player report
    // COACH_REPORTED   -> player report if available,
    //                    otherwise coach report
    // COACH_VERIFIED   -> unified performance
    // -------------------------------------------------

    const result = await buildPlayerFeatures(playerId);

    // -------------------------------------------------
    // Generate ML prediction
    // -------------------------------------------------

    const prediction = await predictPlayerPotential(
      result.features
    );

    // -------------------------------------------------
    // Generate AI insights
    // -------------------------------------------------

    const report = await generatePlayerReport({
      player: result.player,

      features: result.features,

      prediction,

      // These performances have already been selected
      // by playerFeatureService according to their
      // verification status.
      performances: result.performances,
    });

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

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
      "AI Insights Controller Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to generate player performance report",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  generatePlayerReportController,
};