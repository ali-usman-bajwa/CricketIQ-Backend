const calculateFeatures = (player, statistics) => {
  const {
    matches,
    totalRuns,
    battingAverage,
    strikeRate,
    fours,
    sixes,
    totalWickets,
    economy,
    recentForm,
    consistency,
  } = statistics;

  const age = player.age || 0;

  const battingAverageScore = Math.min(
    100,
    (battingAverage / 50) * 100
  );

  const strikeRateScore = Math.min(
    100,
    (strikeRate / 150) * 100
  );

  const battingImpact =
    battingAverageScore * 0.4 +
    strikeRateScore * 0.35 +
    recentForm * 0.25;


  let bowlingImpact = 0;

  if (
    player.role === "Bowler" ||
    player.role === "All-Rounder"
  ) {
    const wicketScore = Math.min(
      100,
      totalWickets * 20
    );

    const economyScore =
      economy > 0
        ? Math.max(
            0,
            Math.min(
              100,
              ((10 - economy) / 4) * 100
            )
          )
        : 0;

    bowlingImpact =
      wicketScore * 0.55 +
      economyScore * 0.25 +
      recentForm * 0.20;
  }

  const totalBalls =
    statistics.totalBalls || 0;

  let boundaryRate = 0;

  if (totalBalls > 0) {
    boundaryRate =
      ((fours + sixes) / totalBalls) * 100;
  }

  const boundaryScore = Math.min(
    100,
    (boundaryRate / 20) * 100
  );

  const sixRate =
    totalBalls > 0
      ? (sixes / totalBalls) * 100
      : 0;

  const sixScore = Math.min(
    100,
    (sixRate / 8) * 100
  );

  const strikeRatePowerScore = Math.min(
    100,
    (strikeRate / 170) * 100
  );

  const powerHitting =
    boundaryScore * 0.4 +
    sixScore * 0.3 +
    strikeRatePowerScore * 0.3;


  let overallImpact = 0;


  if (player.role === "Batter") {
    overallImpact =
      battingImpact * 0.55 +
      powerHitting * 0.15 +
      recentForm * 0.15 +
      consistency * 0.15;
  }

  else if (player.role === "Bowler") {
    overallImpact =
      bowlingImpact * 0.55 +
      recentForm * 0.20 +
      consistency * 0.25;
  }


  else if (player.role === "All-Rounder") {
    overallImpact =
      battingImpact * 0.30 +
      bowlingImpact * 0.30 +
      powerHitting * 0.10 +
      recentForm * 0.15 +
      consistency * 0.15;
  }


  else if (player.role === "Wicket-Keeper") {
    overallImpact =
      battingImpact * 0.50 +
      powerHitting * 0.15 +
      recentForm * 0.20 +
      consistency * 0.15;
  }

  else {
    overallImpact =
      battingImpact * 0.45 +
      recentForm * 0.20 +
      consistency * 0.25 +
      powerHitting * 0.10;
  }

  return {
    age,
    matches,
    totalRuns,
    battingAverage,
    strikeRate,
    fours,
    sixes,
    totalWickets,
    economy,
    recentForm,
    consistency,

    battingImpact: Number(
      Math.min(
        100,
        battingImpact
      ).toFixed(2)
    ),

    bowlingImpact: Number(
      Math.min(
        100,
        bowlingImpact
      ).toFixed(2)
    ),

    powerHitting: Number(
      Math.min(
        100,
        powerHitting
      ).toFixed(2)
    ),

    overallImpact: Number(
      Math.min(
        100,
        overallImpact
      ).toFixed(2)
    ),
  };
};

module.exports = {
  calculateFeatures,
};