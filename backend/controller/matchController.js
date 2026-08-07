const Match = require("../models/Match");
const Team = require("../models/Team");

const createMatch = async (req, res) => {
  try {
    const { teamA, teamB, format, date, venue } = req.body;

    if (teamA === teamB) {
      return res.status(400).json({
        success: false,
        message: "A team cannot play against itself",
      });
    }

    const existingTeamA = await Team.findById(teamA);

    if (!existingTeamA) {
      return res.status(404).json({
        success: false,
        message: "Team A not found",
      });
    }

    const existingTeamB = await Team.findById(teamB);

    if (!existingTeamB) {
      return res.status(404).json({
        success: false,
        message: "Team B not found",
      });
    }

    const match = await Match.create({
      teamA,
      teamB,
      format,
      date,
      venue,
    });

    const populatedMatch = await Match.findById(match._id)
      .populate("teamA", "name shortName country")
      .populate("teamB", "name shortName country");

    res.status(201).json({
      success: true,
      message: "Match created successfully",
      data: populatedMatch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMatches = async (req, res) => {
  try {
    const matches = await Match.find()
      .populate("teamA", "name shortName country")
      .populate("teamB", "name shortName country")
      .populate("winner", "name shortName");

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("teamA", "name shortName country")
      .populate("teamB", "name shortName country")
      .populate("winner", "name shortName");

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    res.status(200).json({
      success: true,
      data: match,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateMatch = async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("teamA", "name shortName country")
      .populate("teamB", "name shortName country")
      .populate("winner", "name shortName");

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Match updated successfully",
      data: match,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteMatch = async (req, res) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Match deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const completeMatch = async (req, res) => {
  try {
    const { winner } = req.body;

    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    if (
      winner &&
      winner !== match.teamA.toString() &&
      winner !== match.teamB.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Winner must be one of the teams",
      });
    }

    match.status = "completed";
    match.winner = winner || null;

    await match.save();

    const updatedMatch = await Match.findById(match._id)
      .populate("teamA", "name shortName country")
      .populate("teamB", "name shortName country")
      .populate("winner", "name shortName");

    res.status(200).json({
      success: true,
      message: "Match completed successfully",
      data: updatedMatch,
    });
  } catch (error) {
    res.status(500).json({
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
  completeMatch,
};