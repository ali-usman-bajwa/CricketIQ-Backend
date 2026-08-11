const mongoose = require("mongoose");

const Performance = require("../models/Performance");
const Player = require("../models/Player");
const Match = require("../models/Match");
const Team = require("../models/Team");

const {
  calculateDerivedStats,
  buildUnifiedPerformance,
} = require("../services/performanceService");


const populatePerformance = (query) => {
  return query
    .populate(
      "player",
      "name role team country"
    )
    .populate({
      path: "match",
      select:
        "format date venue teamA teamB status winner",
      populate: [
        {
          path: "teamA",
          select: "name shortName country",
        },
        {
          path: "teamB",
          select: "name shortName country",
        },
        {
          path: "winner",
          select: "name shortName",
        },
      ],
    })
    .populate(
      "verifiedBy",
      "name email role"
    );
};

const createPerformance = async (
  req,
  res
) => {
  try {
    const {
      player,
      match,
      playerReport,
      coachReport,
      coachEvaluation,
    } = req.body;


    if (!player || !match) {
      return res.status(400).json({
        success: false,
        message:
          "Player and match are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(player) ||
      !mongoose.Types.ObjectId.isValid(match)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid player or match ID",
      });
    }


    const existingMatch =
      await Match.findById(match);

    if (!existingMatch) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    if (
      existingMatch.status !== "completed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Performance can only be recorded for a completed match",
      });
    }

    const existingPlayer =
      await Player.findById(player);

    if (!existingPlayer) {
      return res.status(404).json({
        success: false,
        message: "Player not found",
      });
    }

    if (req.user.role === "Coach") {

      const coachTeam =
        await Team.findOne({
          coach: req.user.id,
        });

      if (!coachTeam) {
        return res.status(403).json({
          success: false,
          message:
            "You are not assigned as the coach of any team",
        });
      }


      const playerBelongsToTeam =
        coachTeam.players.some(
          (playerId) =>
            playerId.toString() ===
            existingPlayer._id.toString()
        );

      if (!playerBelongsToTeam) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to submit performance for this player",
        });
      }


      const teamParticipated =
        existingMatch.teamA.toString() ===
          coachTeam._id.toString() ||
        existingMatch.teamB.toString() ===
          coachTeam._id.toString();

      if (!teamParticipated) {
        return res.status(403).json({
          success: false,
          message:
            "Your team did not participate in this match",
        });
      }
    }

    if (req.user.role === "Player") {
      const playerProfile =
        await Player.findOne({
          user: req.user.id,
        });

      if (!playerProfile) {
        return res.status(404).json({
          success: false,
          message:
            "Player profile not found",
        });
      }


      if (
        playerProfile._id.toString() !==
        player.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only submit your own performance",
        });
      }

      const playerTeam =
        await Team.findOne({
          players: playerProfile._id,
        });

      if (!playerTeam) {
        return res.status(403).json({
          success: false,
          message:
            "Player is not assigned to a team",
        });
      }

      const playerTeamParticipated =
        existingMatch.teamA.toString() ===
          playerTeam._id.toString() ||
        existingMatch.teamB.toString() ===
          playerTeam._id.toString();

      if (!playerTeamParticipated) {
        return res.status(403).json({
          success: false,
          message:
            "Your team did not participate in this match",
        });
      }
    }

    let performance =
      await Performance.findOne({
        player,
        match,
      });


    if (req.user.role === "Player") {

      if (!playerReport) {
        return res.status(400).json({
          success: false,
          message:
            "Player performance data is required",
        });
      }

      if (
        performance &&
        performance.playerReport
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Player performance has already been submitted for this match",
        });
      }

      const calculatedPlayerReport =
        calculateDerivedStats(
          playerReport
        );

      if (!performance) {
        performance =
          await Performance.create({
            player,
            match,

            playerReport:
              calculatedPlayerReport,

            verificationStatus:
              "PLAYER_REPORTED",
          });
      }

      else {
        performance.playerReport =
          calculatedPlayerReport;

        if (performance.coachReport) {
          const unified =
            buildUnifiedPerformance(
              performance
            );

          performance.unifiedPerformance =
            unified.data;

          performance.verificationStatus =
            "COACH_VERIFIED";

          performance.verifiedAt =
            performance.verifiedAt ||
            new Date();

        }


        else {
          performance.verificationStatus =
            "PLAYER_REPORTED";

          performance.unifiedPerformance =
            null;

          performance.verifiedAt =
            null;

          performance.verifiedBy =
            null;
        }

        await performance.save();
      }

      const populatedPerformance =
        await populatePerformance(
          Performance.findById(
            performance._id
          )
        );

      return res.status(201).json({
        success: true,
        message:
          "Player performance submitted successfully",
        data: populatedPerformance,
      });
    }

    if (req.user.role === "Coach") {

      if (!coachReport) {
        return res.status(400).json({
          success: false,
          message:
            "Coach performance data is required",
        });
      }

      if (
        performance &&
        performance.coachReport
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Coach performance has already been submitted for this match",
        });
      }


      const calculatedCoachReport =
        calculateDerivedStats(
          coachReport
        );


      if (!performance) {
        performance =
          await Performance.create({
            player,
            match,

            coachReport:
              calculatedCoachReport,

            coachEvaluation:
              coachEvaluation || null,

            verificationStatus:
              "COACH_REPORTED",

            verifiedBy:
              null,

            verifiedAt:
              null,
          });
      }

      else {
        performance.coachReport =
          calculatedCoachReport;

        performance.coachEvaluation =
          coachEvaluation || null;

        if (
          performance.playerReport
        ) {
          const unified =
            buildUnifiedPerformance(
              performance
            );

          performance.unifiedPerformance =
            unified.data;

          performance.verificationStatus =
            "COACH_VERIFIED";

          performance.verifiedBy =
            req.user.id;

          performance.verifiedAt =
            new Date();
        }


        else {
          performance.unifiedPerformance =
            null;

          performance.verificationStatus =
            "COACH_REPORTED";

          performance.verifiedBy =
            null;

          performance.verifiedAt =
            null;
        }

        await performance.save();
      }

      const populatedPerformance =
        await populatePerformance(
          Performance.findById(
            performance._id
          )
        );

      return res.status(201).json({
        success: true,
        message:
          "Coach performance submitted successfully",
        data: populatedPerformance,
      });
    }

    if (req.user.role === "Admin") {
      if (
        !playerReport &&
        !coachReport
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Performance data is required",
        });
      }


      if (!performance) {
        const calculatedPlayerReport =
          playerReport
            ? calculateDerivedStats(
                playerReport
              )
            : null;

        const calculatedCoachReport =
          coachReport
            ? calculateDerivedStats(
                coachReport
              )
            : null;

        const hasBothReports =
          calculatedPlayerReport &&
          calculatedCoachReport;

        performance =
          await Performance.create({
            player,
            match,

            playerReport:
              calculatedPlayerReport,

            coachReport:
              calculatedCoachReport,

            coachEvaluation:
              coachEvaluation || null,

            verificationStatus:
              hasBothReports
                ? "COACH_VERIFIED"
                : coachReport
                ? "COACH_REPORTED"
                : "PLAYER_REPORTED",

            unifiedPerformance:
              hasBothReports
                ? calculateDerivedStats(
                    calculatedCoachReport
                  )
                : null,

            verifiedBy:
              hasBothReports
                ? req.user.id
                : null,

            verifiedAt:
              hasBothReports
                ? new Date()
                : null,
          });
      }


      else {
        if (playerReport) {
          performance.playerReport =
            calculateDerivedStats(
              playerReport
            );
        }

        if (coachReport) {
          performance.coachReport =
            calculateDerivedStats(
              coachReport
            );

          performance.coachEvaluation =
            coachEvaluation || null;
        }

        if (
          performance.playerReport &&
          performance.coachReport
        ) {
          const unified =
            buildUnifiedPerformance(
              performance
            );

          performance.unifiedPerformance =
            unified.data;

          performance.verificationStatus =
            "COACH_VERIFIED";

          performance.verifiedBy =
            req.user.id;

          performance.verifiedAt =
            new Date();
        }


        else if (
          performance.coachReport
        ) {
          performance.verificationStatus =
            "COACH_REPORTED";

          performance.unifiedPerformance =
            null;

          performance.verifiedBy =
            null;

          performance.verifiedAt =
            null;
        }


        else {
          performance.verificationStatus =
            "PLAYER_REPORTED";

          performance.unifiedPerformance =
            null;

          performance.verifiedBy =
            null;

          performance.verifiedAt =
            null;
        }

        await performance.save();
      }

      const populatedPerformance =
        await populatePerformance(
          Performance.findById(
            performance._id
          )
        );

      return res.status(201).json({
        success: true,
        message:
          "Performance updated successfully",
        data: populatedPerformance,
      });
    }

    return res.status(403).json({
      success: false,
      message:
        "You are not authorized to submit performance",
    });
  } catch (error) {
    console.error(
      "Create Performance Error:",
      error
    );

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPerformances = async (
  req,
  res
) => {
  try {
    const performances =
      await populatePerformance(
        Performance.find().sort({
          createdAt: -1,
        })
      );

    return res.status(200).json({
      success: true,
      count: performances.length,
      data: performances,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPlayerPerformances = async (
  req,
  res
) => {
  try {
    const { playerId } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        playerId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid player ID",
      });
    }

    const player =
      await Player.findById(
        playerId
      );

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player not found",
      });
    }


    if (req.user.role === "Player") {
      const playerProfile =
        await Player.findOne({
          user: req.user.id,
        });

      if (!playerProfile) {
        return res.status(404).json({
          success: false,
          message:
            "Player profile not found",
        });
      }

      if (
        playerProfile._id.toString() !==
        playerId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only view your own performances",
        });
      }
    }

    if (req.user.role === "Coach") {
      const coachTeam =
        await Team.findOne({
          coach: req.user.id,
        });

      if (!coachTeam) {
        return res.status(403).json({
          success: false,
          message:
            "You are not assigned to any team",
        });
      }

      const playerBelongsToTeam =
        coachTeam.players.some(
          (id) =>
            id.toString() ===
            playerId.toString()
        );

      if (!playerBelongsToTeam) {
        return res.status(403).json({
          success: false,
          message:
            "You can only view performances of players in your team",
        });
      }
    }


    const performances =
      await populatePerformance(
        Performance.find({
          player: playerId,
        }).sort({
          createdAt: -1,
        })
      );

    return res.status(200).json({
      success: true,
      count: performances.length,
      data: performances,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPerformance = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid performance ID",
      });
    }

    const performance =
      await Performance.findById(id);

    if (!performance) {
      return res.status(404).json({
        success: false,
        message:
          "Performance not found",
      });
    }


    if (req.user.role === "Player") {
      const playerProfile =
        await Player.findOne({
          user: req.user.id,
        });

      if (!playerProfile) {
        return res.status(404).json({
          success: false,
          message:
            "Player profile not found",
        });
      }

      if (
        playerProfile._id.toString() !==
        performance.player.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only view your own performance",
        });
      }
    }


    if (req.user.role === "Coach") {
      const coachTeam =
        await Team.findOne({
          coach: req.user.id,
        });

      if (!coachTeam) {
        return res.status(403).json({
          success: false,
          message:
            "You are not assigned to any team",
        });
      }

      const playerBelongsToTeam =
        coachTeam.players.some(
          (id) =>
            id.toString() ===
            performance.player.toString()
        );

      if (!playerBelongsToTeam) {
        return res.status(403).json({
          success: false,
          message:
            "You can only view performances of players in your team",
        });
      }
    }


    const populatedPerformance =
      await populatePerformance(
        Performance.findById(id)
      );

    return res.status(200).json({
      success: true,
      data: populatedPerformance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deletePerformance = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid performance ID",
      });
    }

    const performance =
      await Performance.findById(id);

    if (!performance) {
      return res.status(404).json({
        success: false,
        message:
          "Performance not found",
      });
    }


    if (req.user.role === "Coach") {
      const coachTeam =
        await Team.findOne({
          coach: req.user.id,
        });

      if (!coachTeam) {
        return res.status(403).json({
          success: false,
          message:
            "You are not assigned to any team",
        });
      }

      const playerBelongsToTeam =
        coachTeam.players.some(
          (id) =>
            id.toString() ===
            performance.player.toString()
        );

      if (!playerBelongsToTeam) {
        return res.status(403).json({
          success: false,
          message:
            "You can only delete performances of players in your team",
        });
      }
    }

    await Performance.findByIdAndDelete(
      id
    );

    return res.status(200).json({
      success: true,
      message:
        "Performance deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPerformance,
  getPerformances,
  getPlayerPerformances,
  getPerformance,
  deletePerformance,
};