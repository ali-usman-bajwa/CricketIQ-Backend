const Team = require("../models/Team");
const Player = require("../models/Player");


const createTeam = async (req, res) => {
  try {

    const team = await Team.create(req.body);

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      data: team,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

const getTeams = async (req, res) => {
  try {

    const teams = await Team.find()
      .populate("players", "name role team")
      .populate("captain", "name role");

    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

const getTeam = async (req, res) => {
  try {

    const team = await Team.findById(req.params.id)
      .populate("players", "name role team")
      .populate("captain", "name role");

    if (!team) {

      return res.status(404).json({
        success: false,
        message: "Team not found",
      });

    }

    res.status(200).json({
      success: true,
      data: team,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

const updateTeam = async (req, res) => {
  try {

    const team = await Team.findById(req.params.id);

    if (!team) {

      return res.status(404).json({
        success: false,
        message: "Team not found",
      });

    }


    if (req.body.captain) {

      const captainId = req.body.captain;

      const captain = await Player.findById(captainId);

      if (!captain) {

        return res.status(404).json({
          success: false,
          message: "Captain player not found",
        });

      }


      const isCaptainInTeam = team.players.some((playerId) => playerId.toString() === captainId.toString());


      if (!isCaptainInTeam) {

        return res.status(400).json({
          success: false,
          message:
            "Captain must be a player in this team",
        });

      }

    }


    if (req.body.players) {

      const players = req.body.players;

      const existingPlayers = await Player.find({_id: { $in: players }});


      if (existingPlayers.length !== players.length) {

        return res.status(400).json({
          success: false,
          message:
            "One or more players do not exist",
        });

      }

    }


    Object.assign(team, req.body);

    await team.save();


    const updatedTeam = await Team.findById(team._id)
      .populate("players", "name role team")
      .populate("captain", "name role");


    res.status(200).json({
      success: true,
      message: "Team updated successfully",
      data: updatedTeam,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

const deleteTeam = async (req, res) => {
  try {

    const team = await Team.findByIdAndDelete(req.params.id);

    if (!team) {

      return res.status(404).json({
        success: false,
        message: "Team not found",
      });

    }

    res.status(200).json({
      success: true,
      message: "Team deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

const addPlayerToTeam = async (req, res) => {
  try {

    const { playerId } = req.body;


    const team = await Team.findById(req.params.id);

    if (!team) {

      return res.status(404).json({
        success: false,
        message: "Team not found",
      });

    }


    const player = await Player.findById(playerId);

    if (!player) {

      return res.status(404).json({
        success: false,
        message: "Player not found",
      });

    }

    const alreadyExists = team.players.some(
      (id) =>
        id.toString() === playerId.toString()
    );


    if (alreadyExists) {

      return res.status(400).json({
        success: false,
        message: "Player already exists in this team",
      });

    }


    team.players.push(playerId);

    await team.save();


    const updatedTeam = await Team.findById(team._id)
      .populate("players", "name role team")
      .populate("captain", "name role");


    res.status(200).json({
      success: true,
      message: "Player added to team",
      data: updatedTeam,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

const removePlayerFromTeam = async (req, res) => {
  try {

    const team = await Team.findById(req.params.id);

    if (!team) {

      return res.status(404).json({
        success: false,
        message: "Team not found",
      });

    }


    const playerExists = team.players.some(
      (playerId) =>
        playerId.toString() === req.params.playerId
    );


    if (!playerExists) {

      return res.status(404).json({
        success: false,
        message: "Player is not part of this team",
      });

    }


    team.players = team.players.filter(
      (playerId) =>
        playerId.toString() !== req.params.playerId
    );


    if (
      team.captain &&
      team.captain.toString() === req.params.playerId
    ) {

      team.captain = null;

    }


    await team.save();


    const updatedTeam = await Team.findById(team._id)
      .populate("players", "name role team")
      .populate("captain", "name role");


    res.status(200).json({
      success: true,
      message: "Player removed from team",
      data: updatedTeam,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

module.exports = {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  addPlayerToTeam,
  removePlayerFromTeam,
};
