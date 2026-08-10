const Match = require("../models/Match");
const Team = require("../models/Team");

// =====================================================
// CREATE MATCH
// =====================================================

const createMatch = async (req, res) => {
  try {
    const {
      teamA,
      teamB,
      format,
      date,
      venue,
    } = req.body;

    // -------------------------------------------------
    // Validate required fields
    // -------------------------------------------------

    if (
      !teamA ||
      !teamB ||
      !format ||
      !date ||
      !venue
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Team A, Team B, format, date and venue are required",
      });
    }

    // -------------------------------------------------
    // Teams cannot be the same
    // -------------------------------------------------

    if (
      teamA.toString() ===
      teamB.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A team cannot play against itself",
      });
    }

    // -------------------------------------------------
    // Check teams
    // -------------------------------------------------

    const teamAData =
      await Team.findById(teamA);

    const teamBData =
      await Team.findById(teamB);

    if (!teamAData) {
      return res.status(404).json({
        success: false,
        message: "Team A not found",
      });
    }

    if (!teamBData) {
      return res.status(404).json({
        success: false,
        message: "Team B not found",
      });
    }

    // =================================================
    // COACH AUTHORIZATION
    // =================================================

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

      const coachTeamId =
        coachTeam._id.toString();

      const isParticipating =
        teamA.toString() === coachTeamId ||
        teamB.toString() === coachTeamId;

      if (!isParticipating) {
        return res.status(403).json({
          success: false,
          message:
            "You can only create matches involving your team",
        });
      }
    }

    // -------------------------------------------------
    // Create match
    // -------------------------------------------------

    const match =
      await Match.create({
        teamA,
        teamB,
        format,
        date,
        venue,
        status: "scheduled",
      });

    // -------------------------------------------------
    // Populate response
    // -------------------------------------------------

    const populatedMatch =
      await Match.findById(match._id)
        .populate(
          "teamA",
          "name shortName country"
        )
        .populate(
          "teamB",
          "name shortName country"
        );

    return res.status(201).json({
      success: true,
      message: "Match created successfully",
      data: populatedMatch,
    });

  } catch (error) {
    console.error(
      "Create Match Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET ALL MATCHES
// =====================================================

const getMatches = async (req, res) => {
  try {
    let query = {};

    // -------------------------------------------------
    // Coach → only matches involving coach's team
    // -------------------------------------------------

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

      query = {
        $or: [
          {
            teamA: coachTeam._id,
          },
          {
            teamB: coachTeam._id,
          },
        ],
      };
    }

    // -------------------------------------------------
    // Player → only matches involving player's team
    // -------------------------------------------------

    if (req.user.role === "Player") {
      const Player = require("../models/Player");

      const player =
        await Player.findOne({
          user: req.user.id,
        });

      if (!player) {
        return res.status(404).json({
          success: false,
          message:
            "Player profile not found",
        });
      }

      if (!player.team) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
        });
      }

      query = {
        $or: [
          {
            teamA: player.team,
          },
          {
            teamB: player.team,
          },
        ],
      };
    }

    // -------------------------------------------------
    // Admin → no filter
    // -------------------------------------------------

    const matches =
      await Match.find(query)
        .populate(
          "teamA",
          "name shortName country"
        )
        .populate(
          "teamB",
          "name shortName country"
        )
        .populate(
          "winner",
          "name shortName"
        )
        .sort({
          date: -1,
        });

    return res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET SINGLE MATCH
// =====================================================

const getMatch = async (req, res) => {
  try {
    const match =
      await Match.findById(
        req.params.id
      );

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    // =================================================
    // COACH AUTHORIZATION
    // =================================================

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

      const coachTeamId =
        coachTeam._id.toString();

      const hasAccess =
        match.teamA.toString() ===
          coachTeamId ||
        match.teamB.toString() ===
          coachTeamId;

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to view this match",
        });
      }
    }

    // =================================================
    // PLAYER AUTHORIZATION
    // =================================================

    if (req.user.role === "Player") {
      const Player = require("../models/Player");

      const player =
        await Player.findOne({
          user: req.user.id,
        });

      if (!player) {
        return res.status(404).json({
          success: false,
          message:
            "Player profile not found",
        });
      }

      if (!player.team) {
        return res.status(403).json({
          success: false,
          message:
            "You are not assigned to a team",
        });
      }

      const playerTeamId =
        player.team.toString();

      const hasAccess =
        match.teamA.toString() ===
          playerTeamId ||
        match.teamB.toString() ===
          playerTeamId;

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to view this match",
        });
      }
    }

    const populatedMatch =
      await Match.findById(
        req.params.id
      )
        .populate(
          "teamA",
          "name shortName country"
        )
        .populate(
          "teamB",
          "name shortName country"
        )
        .populate(
          "winner",
          "name shortName"
        );

    return res.status(200).json({
      success: true,
      data: populatedMatch,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE MATCH
// =====================================================

const updateMatch = async (req, res) => {
  try {
    const match =
      await Match.findById(
        req.params.id
      );

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    // =================================================
    // COACH AUTHORIZATION
    // =================================================

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

      const coachTeamId =
        coachTeam._id.toString();

      const hasAccess =
        match.teamA.toString() ===
          coachTeamId ||
        match.teamB.toString() ===
          coachTeamId;

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to update this match",
        });
      }
    }

    // -------------------------------------------------
    // Prevent changing teams after completion
    // -------------------------------------------------

    if (
      match.status === "completed" &&
      (req.body.teamA ||
        req.body.teamB)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Completed match teams cannot be changed",
      });
    }

    // -------------------------------------------------
    // Update allowed fields
    // -------------------------------------------------

    const allowedFields = [
      "teamA",
      "teamB",
      "format",
      "date",
      "venue",
      "status",
      "winner",
    ];

    allowedFields.forEach((field) => {
      if (
        req.body[field] !== undefined
      ) {
        match[field] =
          req.body[field];
      }
    });

    await match.save();

    const updatedMatch =
      await Match.findById(
        match._id
      )
        .populate(
          "teamA",
          "name shortName country"
        )
        .populate(
          "teamB",
          "name shortName country"
        )
        .populate(
          "winner",
          "name shortName"
        );

    return res.status(200).json({
      success: true,
      message:
        "Match updated successfully",
      data: updatedMatch,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// DELETE MATCH
// =====================================================

const deleteMatch = async (req, res) => {
  try {
    const match =
      await Match.findById(
        req.params.id
      );

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    // Only Admin can delete
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message:
          "Only Admin can delete matches",
      });
    }

    await Match.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        "Match deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createMatch,
  getMatches,
  getMatch,
  updateMatch,
  deleteMatch,
};