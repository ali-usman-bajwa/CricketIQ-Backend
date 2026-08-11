const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Player = require("../models/Player");

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      age,
      playerRole,
      battingStyle,
      bowlingStyle,
      team,
      country,
      image,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const allowedRoles = ["Player", "Coach"];

    const userRole = role || "Player";

    if (!allowedRoles.includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    if (userRole === "Player") {
      if (
        age === undefined ||
        !playerRole ||
        !battingStyle ||
        !country
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Age, player role, batting style and country are required for players",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: userRole,
    });

    let player = null;

    if (userRole === "Player") {
      player = await Player.create({
        user: user._id,
        name: user.name,
        age,
        role: playerRole,
        battingStyle,
        bowlingStyle: bowlingStyle || "None",
        team: null,
        country,
        image,
      });
    }


    return res.status(201).json({
      success: true,
      message: "User registered successfully",

      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },

        player: player
          ? {
              id: player._id,
              name: player.name,
              role: player.role,
              battingStyle: player.battingStyle,
              bowlingStyle: player.bowlingStyle,
              team: player.team,
              country: player.country,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let player = null;

    if (user.role === "Player") {
      player = await Player.findOne({
        user: user._id,
      }).lean();
    }

    return res.status(200).json({
      success: true,

      data: {
        user,
        player,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to get current user",
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
};