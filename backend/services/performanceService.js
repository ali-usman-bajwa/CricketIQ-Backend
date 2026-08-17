const calculateDerivedStats = (data) => {
  if (!data) {
    return null;
  }

  const runs = Number(data.runs || 0);
  const balls = Number(data.balls || 0);
  const fours = Number(data.fours || 0);
  const sixes = Number(data.sixes || 0);
  const wickets = Number(data.wickets || 0);

  const runsConceded = Number(
    data.runsConceded || 0
  );

  const oversBowled = Number(
    data.oversBowled || 0
  );

  const dismissed =
    Boolean(data.dismissed);

  const strikeRate =
    balls > 0
      ? (runs / balls) * 100
      : 0;

  const economy =
    oversBowled > 0
      ? runsConceded / oversBowled
      : 0;

  return {
    runs,
    balls,
    fours,
    sixes,
    wickets,
    runsConceded,
    oversBowled,

    strikeRate:
      Number(strikeRate.toFixed(2)),

    economy:
      Number(economy.toFixed(2)),

    dismissed,
  };
};


const buildUnifiedPerformance = (
  performance
) => {

  const playerReport =
    performance.playerReport;

  const coachReport =
    performance.coachReport;

  if (!playerReport && coachReport) {
    return {
      status: "COACH_REPORTED",
      source: "COACH",
      verified: false,
      data:
        calculateDerivedStats(
          coachReport
        ),
    };
  }

  if (playerReport && !coachReport) {
    return {
      status: "PLAYER_REPORTED",
      source: "PLAYER",
      verified: false,
      data:
        calculateDerivedStats(
          playerReport
        ),
    };
  }

  if (playerReport && coachReport) {
    return {
      status: "COACH_VERIFIED",
      source: "UNIFIED",
      verified: true,

      data:
        calculateDerivedStats(
          coachReport
        ),
    };
  }


  return {
    status: "NO_REPORT",
    source: null,
    verified: false,
    data: null,
  };
};


module.exports = {
  calculateDerivedStats,
  buildUnifiedPerformance,
};