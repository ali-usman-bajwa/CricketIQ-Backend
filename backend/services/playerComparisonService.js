const {
  buildPlayerFeatures,
} = require("./playerFeatureService");

const {
  predictPlayerPotential,
} = require("./mlService");

// =====================================================
// COMPARE PLAYERS
// =====================================================

const comparePlayers = async (playerIds) => {
  // -------------------------------------------------
  // Validate input
  // -------------------------------------------------

  if (!Array.isArray(playerIds)) {
    throw new Error(
      "playerIds must be an array"
    );
  }

  if (playerIds.length < 2) {
    throw new Error(
      "At least 2 player IDs are required"
    );
  }

  if (playerIds.length > 5) {
    throw new Error(
      "Maximum 5 players can be compared"
    );
  }

  // -------------------------------------------------
  // Prevent duplicate players
  // -------------------------------------------------

  const uniquePlayerIds = [
    ...new Set(
      playerIds.map((id) => id.toString())
    ),
  ];

  if (
    uniquePlayerIds.length !==
    playerIds.length
  ) {
    throw new Error(
      "Duplicate player IDs are not allowed"
    );
  }

  // =================================================
  // BUILD PLAYER COMPARISON
  // =================================================

  const comparison = [];

  for (const playerId of uniquePlayerIds) {

    // -------------------------------------------------
    // Build features
    // -------------------------------------------------

    const result =
      await buildPlayerFeatures(
        playerId
      );

    if (
      !result ||
      !result.player ||
      !result.features
    ) {
      throw new Error(
        `Unable to build features for player ${playerId}`
      );
    }

    // -------------------------------------------------
    // Generate ML prediction
    // -------------------------------------------------

    const prediction =
      await predictPlayerPotential(
        result.features
      );

    if (!prediction) {
      throw new Error(
        `Unable to generate prediction for player ${playerId}`
      );
    }

    // -------------------------------------------------
    // Store comparison data
    // -------------------------------------------------

    comparison.push({
      player: result.player,

      features:
        result.features,

      statistics:
        result.statistics || null,

      prediction,
    });
  }

  // =================================================
  // SORT BY ML POTENTIAL SCORE
  // =================================================

  comparison.sort(
    (a, b) =>
      Number(
        b.prediction.potentialScore
      ) -
      Number(
        a.prediction.potentialScore
      )
  );

  // =================================================
  // ASSIGN RANK
  // =================================================

  const rankedComparison =
    comparison.map(
      (playerData, index) => ({
        rank: index + 1,

        ...playerData,
      })
    );

  return rankedComparison;
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  comparePlayers,
};