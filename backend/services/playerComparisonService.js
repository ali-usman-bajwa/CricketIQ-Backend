const {
  buildPlayerFeatures,
} = require("./playerFeatureService");

const {
  predictPlayerPotential,
} = require("./mlService");


const comparePlayers = async (playerIds) => {

  if (!Array.isArray(playerIds) || playerIds.length < 2) {
    throw new Error("At least 2 player IDs are required");
  }

  if (playerIds.length > 5) {
    throw new Error("Maximum 5 players can be compared");
  }

  const uniquePlayerIds = [...new Set(playerIds)];

  if (uniquePlayerIds.length !== playerIds.length) {
    throw new Error("Duplicate player IDs are not allowed");
  }

  const comparison = [];

  for (const playerId of uniquePlayerIds) {
    const result = await buildPlayerFeatures(playerId);


    if (!result || !result.player) {
      throw new Error(
        `Unable to build features for player ${playerId}`
      );
    }

    const prediction = await predictPlayerPotential(
      result.features
    );

    comparison.push({
      player: result.player,
      features: result.features,
      prediction,
    });


  }

  comparison.sort(
    (a, b) =>
      b.prediction.potentialScore -
      a.prediction.potentialScore
  );

  const rankedComparison = comparison.map(
    (playerData, index) => ({
      rank: index + 1,
      ...playerData,
    })
  );

  return rankedComparison;
};

module.exports = {
  comparePlayers,
};
