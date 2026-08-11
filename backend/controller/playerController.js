const Player = require("../models/Player");

const createPlayer = async (req, res) => {
  try {
    const player = await Player.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Player created successfully",
      data: player,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPlayers = async (req, res) => {
  try {
    const players = await Player.find()
      .populate("user", "name email role");

    return res.status(200).json({
      success: true,
      count: players.length,
      data: players,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id)
      .populate("user", "name email role");

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: player,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updatePlayer = async (req, res) => {
  try {
    const player = await Player.findById(
      req.params.id
    );

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player not found",
      });
    }


    // ---------------------------------------------
    // Player can update ONLY his own profile
    // ---------------------------------------------

    if (req.user.role === "Player") {

      if (
        player.user.toString() !==
        req.user.id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only update your own profile",
        });
      }
    }


    // ---------------------------------------------
    // Prevent changing ownership
    // ---------------------------------------------

    delete req.body.user;


    // ---------------------------------------------
    // Update
    // ---------------------------------------------

    Object.assign(player, req.body);

    await player.save();

    return res.status(200).json({
      success: true,
      message: "Player updated successfully",
      data: player,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deletePlayer = async (req, res) => {
  try {
    const player =
      await Player.findByIdAndDelete(
        req.params.id
      );

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Player deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPlayer,
  getPlayers,
  getPlayer,
  updatePlayer,
  deletePlayer,
};