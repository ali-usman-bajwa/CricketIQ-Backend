const Player = require("../models/Player");

const {
  buildPlayerFeatures,
} = require("./playerFeatureService");

const {
  predictPlayerPotential,
} = require("./mlService");


const buildRecommendedTeam = async ({ playerIds, format }) => {

  if (!Array.isArray(playerIds)) {
    throw new Error("playerIds must be an array");
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

  const allowedFormats = [
    "T20",
    "ODI",
    "TEST",
  ];

  if (!allowedFormats.includes(format)) {
    throw new Error(
      "Format must be T20, ODI, or TEST"
    );
  }

  const players = await Player.find({
    _id: { $in: playerIds },
  });

  if (players.length !== playerIds.length) {
    throw new Error(
      "One or more players not found"
    );
  }

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

  if (playerData.length < 11) {
    throw new Error(
      "At least 11 players with performance data are required"
    );
  }

  const sortByPotential = (a, b) =>
    b.prediction.potentialScore -
    a.prediction.potentialScore;

  const wicketkeepers = playerData
    .filter(
      (item) =>
        item.player.role === "Wicket-Keeper"
    )
    .sort(sortByPotential);

  const batters = playerData
    .filter(
      (item) =>
        item.player.role === "Batter"
    )
    .sort(sortByPotential);

  const allRounders = playerData
    .filter(
      (item) =>
        item.player.role === "All-Rounder"
    )
    .sort(sortByPotential);

  const bowlers = playerData
    .filter(
      (item) =>
        item.player.role === "Bowler"
    )
    .sort(sortByPotential);


  if (wicketkeepers.length === 0) {
    throw new Error(
      "At least 1 wicketkeeper is required"
    );
  }

  if (batters.length < 3) {
    throw new Error(
      "At least 3 specialist batters are required"
    );
  }

  if (allRounders.length < 1) {
    throw new Error(
      "At least 1 all-rounder is required"
    );
  }

  if (bowlers.length < 3) {
    throw new Error(
      "At least 3 specialist bowlers are required"
    );
  }
  const selected = [];

  const addPlayer = (player) => {

    if (
      player &&
      selected.length < 11 &&
      !selected.some(
        (item) =>
          item.player.id ===
          player.player.id
      )
    ) {
      selected.push(player);
    }


  };

  addPlayer(wicketkeepers[0]);

  batters
    .slice(0, 3)
    .forEach(addPlayer);

  allRounders
    .slice(0, 1)
    .forEach(addPlayer);

  bowlers
    .slice(0, 3)
    .forEach(addPlayer);


  if (selected.length < 11) {

    const remaining = playerData
      .filter(
        (item) =>
          !selected.some(
            (selectedPlayer) =>
              selectedPlayer.player.id ===
              item.player.id
          )
      )
      .sort(sortByPotential);

    remaining.forEach((player) => {

      if (selected.length < 11) {
        addPlayer(player);
      }

    });


  }

  if (selected.length < 11) {
    throw new Error(
      "Unable to build a complete XI from the provided players"
    );
  }

  const finalRoleDistribution = {
    batters: selected.filter(
      (item) =>
        item.player.role === "Batter"
    ).length,


    wicketkeepers: selected.filter(
      (item) =>
        item.player.role === "Wicket-Keeper"
    ).length,

    allRounders: selected.filter(
      (item) =>
        item.player.role === "All-Rounder"
    ).length,

    bowlers: selected.filter(
      (item) =>
        item.player.role === "Bowler"
    ).length,


  };

  const roleOrder = {
    "Wicket-Keeper": 1,
    "Batter": 2,
    "All-Rounder": 3,
    "Bowler": 4,
  };

  selected.sort(
    (a, b) =>
      (roleOrder[a.player.role] || 5) -
      (roleOrder[b.player.role] || 5)
  );

  const recommendedXI =
    selected.map((item, index) => ({


      selectionRank: index + 1,

      player: item.player,

      role: item.player.role,

      features: item.features,

      prediction: item.prediction,

    }));

  const averagePotential =
    recommendedXI.reduce(
      (sum, item) =>
        sum +
        item.prediction.potentialScore,
      0
    ) / recommendedXI.length;

  const averageOverallImpact =
    recommendedXI.reduce(
      (sum, item) =>
        sum +
        item.features.overallImpact,
      0
    ) / recommendedXI.length;


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
