const {
  buildRecommendedTeam,
} = require("../services/teamBuilderService");

const {
  generateTeamAnalysis,
} = require("../services/aiTeamBuilderService");

const buildRecommendedTeamController = async (
  req,
  res
) => {
  try {
    const {
      playerIds,
      format,
    } = req.body;

    if (!Array.isArray(playerIds)) {
      return res.status(400).json({
        success: false,
        message:
          "playerIds must be an array",
      });
    }

    if (playerIds.length < 11) {
      return res.status(400).json({
        success: false,
        message:
          "At least 11 players are required",
      });
    }

    if (playerIds.length > 30) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum 30 players can be provided",
      });
    }

    const uniquePlayerIds = [
      ...new Set(
        playerIds.map((id) =>
          id.toString()
        )
      ),
    ];

    if (
      uniquePlayerIds.length !==
      playerIds.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Duplicate player IDs are not allowed",
      });
    }

    const allowedFormats = [
      "T20",
      "ODI",
      "TEST",
    ];

    if (
      !allowedFormats.includes(format)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Format must be T20, ODI, or TEST",
      });
    }


    const result =
      await buildRecommendedTeam({
        playerIds:
          uniquePlayerIds,
        format,
      });

    const aiTeamAnalysis =
      await generateTeamAnalysis({
        format,

        recommendedXI:
          result.recommendedXI,

        roleDistribution:
          result.roleDistribution,

        teamMetrics:
          result.teamMetrics,
      });

    return res.status(200).json({
      success: true,

      data: {
        ...result,

        aiTeamAnalysis,
      },
    });

  } catch (error) {

    const expectedErrors = [
      "One or more players not found",

      "At least 11 players with performance data are required",

      "Unable to build a complete XI from the provided players",

      "At least 1 wicketkeeper is required",

      "At least 3 specialist batters are required",

      "At least 1 all-rounder is required",

      "At least 3 specialist bowlers are required",
    ];

    if (
      expectedErrors.includes(
        error.message
      )
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error(
      "Team Builder Controller Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to build recommended team",
    });
  }
};

module.exports = {
  buildRecommendedTeamController,
};