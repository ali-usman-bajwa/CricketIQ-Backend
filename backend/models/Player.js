const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "Batter",
        "Bowler",
        "All-Rounder",
        "Wicket-Keeper",
      ],
      required: true,
    },

    battingStyle: {
      type: String,
      enum: [
        "Right Hand",
        "Left Hand",
      ],
    },

    bowlingStyle: {
      type: String,
      enum: [
        "Right Arm Fast",
        "Left Arm Fast",
        "Right Arm Medium",
        "Left Arm Medium",
        "Right Arm Spin",
        "Left Arm Spin",
        "None",
      ],
      default: "None",
    },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },

    country: {
      type: String,
      required: true,
    },

    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Player = mongoose.model("Player", playerSchema);

module.exports = Player;