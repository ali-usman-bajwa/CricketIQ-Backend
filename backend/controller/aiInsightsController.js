const Player = require("../models/Player");

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
    // Ownership check (Players may only view their own data)
    // -------------------------------------------------

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