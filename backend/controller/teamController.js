const mongoose = require("mongoose");

const Team = require("../models/Team");
const Player = require("../models/Player");

const checkTeamManagementAccess = (team, user) => {
  if (user.role === "Admin") {
    return true;
  }

  if (user.role === "Coach") {
    if (
      !team.coach ||
      team.coach.toString() !== user.id.toString()
    ) {
      return false;
    }

    return true;
  }

  return false;
};

const populateTeam = (query) => {
  return query
    .populate(
      "coach",
      "name email role"
    )
    .populate(
      "players",
      "name role age battingStyle bowlingStyle team country image"
    )
    .populate(
      "captain",
      "name role battingStyle bowlingStyle"
    );
};

const createTeam = async (req, res) => {
  try {
    const {
      name,
      shortName,
      country,
    } = req.body;


    if (!name || !shortName || !country) {
      return res.status(400).json({
        success: false,
        message:
          "Name, short name and country are required",
      });
    }
    
    const existingTeam =
      await Team.findOne({
        $or: [
          {
            name: name.trim(),
          },
          {
            shortName:
              shortName.trim().toUpperCase(),
          },
        ],
      });

    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message:
          "A team with this name or short name already exists",
      });
    }

    const teamData = {
      name: name.trim(),
      shortName:
        shortName.trim().toUpperCase(),
      country: country.trim(),
      players: [],
      captain: null,
    };

    if (req.user.role === "Coach") {
      teamData.coach = req.user.id;
    }


    if (req.user.role === "Admin") {
      teamData.coach = null;
    }

    const team =
      await Team.create(teamData);

    const populatedTeam =
      await populateTeam(
        Team.findById(team._id)
      );

    return res.status(201).json({
      success: true,
      message: "Team created successfully",
      data: populatedTeam,
    });

  } catch (error) {
    console.error(
      "Create Team Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTeams = async (req, res) => {
  try {

    const teams =
      await populateTeam(
        Team.find().sort({
          createdAt: -1,
        })
      );

    return res.status(200).json({
      success: true,
      count: teams.length,
      data: teams,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

const getTeam = async (req, res) => {
  try {

    const team =
      await populateTeam(
        Team.findById(
          req.params.id
        )
      );

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: team,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


const updateTeam = async (req, res) => {
  try {

    const team =
      await Team.findById(
        req.params.id
      );

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    if (
      !checkTeamManagementAccess(
        team,
        req.user
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to manage this team",
      });
    }

    if (
      req.user.role === "Coach" &&
      req.body.coach !== undefined
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Coach cannot change team ownership",
      });
    }

    if (req.body.captain !== undefined) {

      const captainId =
        req.body.captain;

      if (captainId === null) {

        team.captain = null;

      } else {

        if (
          !mongoose.Types.ObjectId.isValid(
            captainId
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid captain ID",
          });
        }

        const captain =
          await Player.findById(
            captainId
          );

        if (!captain) {
          return res.status(404).json({
            success: false,
            message:
              "Captain player not found",
          });
        }
        const isCaptainInTeam =
          team.players.some(
            (playerId) =>
              playerId.toString() ===
              captainId.toString()
          );

        if (!isCaptainInTeam) {
          return res.status(400).json({
            success: false,
            message:
              "Captain must be a player in this team",
          });
        }

        team.captain =
          captainId;
      }
    }

    if (req.body.players !== undefined) {

      const players =
        req.body.players;

      if (!Array.isArray(players)) {
        return res.status(400).json({
          success: false,
          message:
            "Players must be an array",
        });
      }

      const uniquePlayers =
        [
          ...new Set(
            players.map(
              (id) => id.toString()
            )
          ),
        ];

      if (
        uniquePlayers.length !==
        players.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Duplicate players are not allowed",
        });
      }

      for (
        const playerId of players
      ) {
        if (
          !mongoose.Types.ObjectId.isValid(
            playerId
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid player ID: ${playerId}`,
          });
        }
      }

      const existingPlayers =
        await Player.find({
          _id: {
            $in: players,
          },
        });

      if (
        existingPlayers.length !==
        players.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "One or more players do not exist",
        });
      }

      for (
        const player of existingPlayers
      ) {

        if (
          player.team &&
          !players.some(
            (id) =>
              id.toString() ===
              player._id.toString()
          )
        ) {
          continue;
        }

        if (
          player.team &&
          player.team.toString() !==
            team._id.toString()
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Player ${player.name} already belongs to another team`,
          });
        }
      }


      const oldPlayerIds =
        team.players.map(
          (id) => id.toString()
        );

      const newPlayerIds =
        players.map(
          (id) => id.toString()
        );

      const removedPlayers =
        oldPlayerIds.filter(
          (id) =>
            !newPlayerIds.includes(id)
        );

      if (
        removedPlayers.length > 0
      ) {

        await Player.updateMany(
          {
            _id: {
              $in: removedPlayers,
            },
            team: team._id,
          },
          {
            $set: {
              team: null,
            },
          }
        );

        if (
          team.captain &&
          removedPlayers.includes(
            team.captain.toString()
          )
        ) {
          team.captain = null;
        }
      }

      await Player.updateMany(
        {
          _id: {
            $in: players,
          },
        },
        {
          $set: {
            team: team._id,
          },
        }
      );

      team.players =
        players;
    }


    if (req.body.name !== undefined) {

      const name =
        req.body.name.trim();

      const duplicateName =
        await Team.findOne({
          name,
          _id: {
            $ne: team._id,
          },
        });

      if (duplicateName) {
        return res.status(400).json({
          success: false,
          message:
            "Another team already uses this name",
        });
      }

      team.name = name;
    }

    if (
      req.body.shortName !==
      undefined
    ) {

      const shortName =
        req.body.shortName
          .trim()
          .toUpperCase();

      const duplicateShortName =
        await Team.findOne({
          shortName,
          _id: {
            $ne: team._id,
          },
        });

      if (duplicateShortName) {
        return res.status(400).json({
          success: false,
          message:
            "Another team already uses this short name",
        });
      }

      team.shortName =
        shortName;
    }

    if (
      req.body.country !==
      undefined
    ) {
      team.country =
        req.body.country.trim();
    }

    await team.save();

    const updatedTeam =
      await populateTeam(
        Team.findById(
          team._id
        )
      );

    return res.status(200).json({
      success: true,
      message:
        "Team updated successfully",
      data: updatedTeam,
    });

  } catch (error) {

    console.error(
      "Update Team Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

const deleteTeam = async (req, res) => {
  try {

    const team =
      await Team.findById(
        req.params.id
      );

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    if (
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only Admin can delete a team",
      });
    }

    await Player.updateMany(
      {
        team: team._id,
      },
      {
        $set: {
          team: null,
        },
      }
    );

    await Team.findByIdAndDelete(
      team._id
    );

    return res.status(200).json({
      success: true,
      message:
        "Team deleted successfully",
    });

  } catch (error) {

    console.error(
      "Delete Team Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

const addPlayerToTeam = async (
  req,
  res
) => {
  try {

    const {
      playerId,
    } = req.body;

    if (!playerId) {
      return res.status(400).json({
        success: false,
        message:
          "Player ID is required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        playerId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid player ID",
      });
    }

    const team =
      await Team.findById(
        req.params.id
      );

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    if (
      !checkTeamManagementAccess(
        team,
        req.user
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to manage this team",
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


    const alreadyExists =
      team.players.some(
        (id) =>
          id.toString() ===
          playerId.toString()
      );

    if (alreadyExists) {
      return res.status(400).json({
        success: false,
        message:
          "Player already exists in this team",
      });
    }

    if (player.team) {
      return res.status(400).json({
        success: false,
        message:
          "Player already belongs to another team. Remove the player from the current team first.",
      });
    }

    team.players.push(
      player._id
    );

    player.team =
      team._id;

    await team.save();
    await player.save();

    const updatedTeam =
      await populateTeam(
        Team.findById(
          team._id
        )
      );

    return res.status(200).json({
      success: true,
      message:
        "Player added to team successfully",
      data: updatedTeam,
    });

  } catch (error) {

    console.error(
      "Add Player To Team Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

const removePlayerFromTeam = async (
  req,
  res
) => {
  try {

    const {
      id,
      playerId,
    } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      ) ||
      !mongoose.Types.ObjectId.isValid(
        playerId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid team or player ID",
      });
    }


    const team =
      await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    if (
      !checkTeamManagementAccess(
        team,
        req.user
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to manage this team",
      });
    }


    const playerExists =
      team.players.some(
        (playerIdFromTeam) =>
          playerIdFromTeam.toString() ===
          playerId.toString()
      );

    if (!playerExists) {
      return res.status(404).json({
        success: false,
        message:
          "Player is not part of this team",
      });
    }

    team.players =
      team.players.filter(
        (playerIdFromTeam) =>
          playerIdFromTeam.toString() !==
          playerId.toString()
      );


    if (
      team.captain &&
      team.captain.toString() ===
        playerId.toString()
    ) {
      team.captain = null;
    }


    await Player.findByIdAndUpdate(
      playerId,
      {
        $set: {
          team: null,
        },
      }
    );

    await team.save();

    const updatedTeam =
      await populateTeam(
        Team.findById(
          team._id
        )
      );

    return res.status(200).json({
      success: true,
      message:
        "Player removed from team successfully",
      data: updatedTeam,
    });

  } catch (error) {

    console.error(
      "Remove Player From Team Error:",
      error
    );

    return res.status(500).json({
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