const Player = require("../models/Player");

const {
  buildPlayerFeatures,
} = require("./playerFeatureService");

const {
  predictPlayerPotential,
} = require("./mlService");

// =====================================================
// BUILD RECOMMENDED TEAM
// =====================================================

const buildRecommendedTeam = async ({
  playerIds,
  format,
}) => {

  // ===================================================
  // VALIDATE PLAYER IDS
  // ===================================================

  if (!Array.isArray(playerIds)) {
    throw new Error(
      "playerIds must be an array"
    );
  }

  if (playerIds.length < 11) {
    throw new Error(
      "At least 11 players are required"
    );
  }

  if (playerIds.length > 30) {
    throw new Error(
      "Maximum 30 players can be provided"
    );
  }

  // ===================================================
  // REMOVE DUPLICATES
  // ===================================================

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
    throw new Error(
      "Duplicate player IDs are not allowed"
    );
  }

  // ===================================================
  // VALIDATE FORMAT
  // ===================================================

  const allowedFormats = [
    "T20",
    "ODI",
    "TEST",
  ];

  if (
    !allowedFormats.includes(format)
  ) {
    throw new Error(
      "Format must be T20, ODI, or TEST"
    );
  }

  // ===================================================
  // GET PLAYERS
  // ===================================================

  const players =
    await Player.find({
      _id: {
        $in: uniquePlayerIds,
      },
    });

  if (
    players.length !==
    uniquePlayerIds.length
  ) {
    throw new Error(
      "One or more players not found"
    );
  }

  // ===================================================
  // BUILD PLAYER DATA
  // ===================================================

  const playerData = [];

  for (const player of players) {

    try {

      const result =
        await buildPlayerFeatures(
          player._id.toString()
        );

      const prediction =
        await predictPlayerPotential(
          result.features
        );

      playerData.push({
        player: result.player,
        features: result.features,
        prediction,
      });

    } catch (error) {

      console.log(
        `Skipping ${player.name}: ${error.message}`
      );

    }
  }

  // ===================================================
  // MINIMUM PERFORMANCE DATA
  // ===================================================

  if (playerData.length < 11) {
    throw new Error(
      "At least 11 players with performance data are required"
    );
  }

  // ===================================================
  // SORTING
  // ===================================================

  const sortByPotential = (
    a,
    b
  ) =>
    b.prediction.potentialScore -
    a.prediction.potentialScore;

  const sortByImpact = (
    a,
    b
  ) =>
    b.features.overallImpact -
    a.features.overallImpact;

  // ===================================================
  // ROLE GROUPS
  // ===================================================

  const wicketkeepers =
    playerData
      .filter(
        (item) =>
          item.player.role ===
          "Wicket-Keeper"
      )
      .sort(sortByPotential);

  const batters =
    playerData
      .filter(
        (item) =>
          item.player.role ===
          "Batter"
      )
      .sort(sortByPotential);

  const allRounders =
    playerData
      .filter(
        (item) =>
          item.player.role ===
          "All-Rounder"
      )
      .sort(sortByPotential);

  const bowlers =
    playerData
      .filter(
        (item) =>
          item.player.role ===
          "Bowler"
      )
      .sort(sortByPotential);

  // ===================================================
  // ROLE VALIDATION
  // ===================================================

  if (
    wicketkeepers.length === 0
  ) {
    throw new Error(
      "At least 1 wicketkeeper is required"
    );
  }

  if (
    batters.length < 3
  ) {
    throw new Error(
      "At least 3 specialist batters are required"
    );
  }

  if (
    allRounders.length < 1
  ) {
    throw new Error(
      "At least 1 all-rounder is required"
    );
  }

  if (
    bowlers.length < 3
  ) {
    throw new Error(
      "At least 3 specialist bowlers are required"
    );
  }

  // ===================================================
  // SELECT XI
  // ===================================================

  const selected = [];

  const addPlayer = (
    player
  ) => {

    if (
      !player ||
      selected.length >= 11
    ) {
      return;
    }

    const alreadySelected =
      selected.some(
        (item) =>
          item.player.id.toString() ===
          player.player.id.toString()
      );

    if (!alreadySelected) {
      selected.push(player);
    }
  };

  // ===================================================
  // GUARANTEED ROLE REQUIREMENTS
  // ===================================================

  addPlayer(
    wicketkeepers[0]
  );

  batters
    .slice(0, 3)
    .forEach(addPlayer);

  allRounders
    .slice(0, 1)
    .forEach(addPlayer);

  bowlers
    .slice(0, 3)
    .forEach(addPlayer);

  // ===================================================
  // FILL REMAINING POSITIONS
  // ===================================================

  if (
    selected.length < 11
  ) {

    const remaining =
      playerData
        .filter(
          (item) =>
            !selected.some(
              (selectedPlayer) =>
                selectedPlayer.player.id
                  .toString() ===
                item.player.id
                  .toString()
            )
        )
        .sort(
          (a, b) => {

            // First compare overall impact
            const impactDifference =
              b.features.overallImpact -
              a.features.overallImpact;

            if (
              impactDifference !== 0
            ) {
              return impactDifference;
            }

            // Then use potential score
            return (
              b.prediction.potentialScore -
              a.prediction.potentialScore
            );
          }
        );

    remaining.forEach(
      addPlayer
    );
  }

  // ===================================================
  // FINAL VALIDATION
  // ===================================================

  if (
    selected.length !== 11
  ) {
    throw new Error(
      "Unable to build a complete XI from the provided players"
    );
  }

  // ===================================================
  // ROLE DISTRIBUTION
  // ===================================================

  const finalRoleDistribution = {

    batters:
      selected.filter(
        (item) =>
          item.player.role ===
          "Batter"
      ).length,

    wicketkeepers:
      selected.filter(
        (item) =>
          item.player.role ===
          "Wicket-Keeper"
      ).length,

    allRounders:
      selected.filter(
        (item) =>
          item.player.role ===
          "All-Rounder"
      ).length,

    bowlers:
      selected.filter(
        (item) =>
          item.player.role ===
          "Bowler"
      ).length,
  };

  // ===================================================
  // FINAL ROLE VALIDATION
  // ===================================================

  if (
    finalRoleDistribution.wicketkeepers < 1
  ) {
    throw new Error(
      "At least 1 wicketkeeper is required"
    );
  }

  if (
    finalRoleDistribution.batters < 3
  ) {
    throw new Error(
      "At least 3 specialist batters are required"
    );
  }

  if (
    finalRoleDistribution.allRounders < 1
  ) {
    throw new Error(
      "At least 1 all-rounder is required"
    );
  }

  if (
    finalRoleDistribution.bowlers < 3
  ) {
    throw new Error(
      "At least 3 specialist bowlers are required"
    );
  }

  // ===================================================
  // ROLE ORDER FOR RESPONSE
  // ===================================================

  const roleOrder = {
    "Wicket-Keeper": 1,
    "Batter": 2,
    "All-Rounder": 3,
    "Bowler": 4,
  };

  selected.sort(
    (a, b) =>
      (roleOrder[
        a.player.role
      ] || 5) -
      (roleOrder[
        b.player.role
      ] || 5)
  );

  // ===================================================
  // BUILD RECOMMENDED XI
  // ===================================================

  const recommendedXI =
    selected.map(
      (item, index) => ({

        selectionRank:
          index + 1,

        player:
          item.player,

        role:
          item.player.role,

        features:
          item.features,

        prediction:
          item.prediction,

      })
    );

  // ===================================================
  // TEAM METRICS
  // ===================================================

  const averagePotential =
    recommendedXI.reduce(
      (sum, item) =>
        sum +
        Number(
          item.prediction
            .potentialScore || 0
        ),
      0
    ) /
    recommendedXI.length;

  const averageOverallImpact =
    recommendedXI.reduce(
      (sum, item) =>
        sum +
        Number(
          item.features
            .overallImpact || 0
        ),
      0
    ) /
    recommendedXI.length;

  // ===================================================
  // RETURN
  // ===================================================

  return {

    format,

    teamSize:
      recommendedXI.length,

    recommendedXI,

    roleDistribution:
      finalRoleDistribution,

    teamMetrics: {

      averagePotential:
        Number(
          averagePotential.toFixed(2)
        ),

      averageOverallImpact:
        Number(
          averageOverallImpact.toFixed(2)
        ),

    },

  };
};

module.exports = {
  buildRecommendedTeam,
};