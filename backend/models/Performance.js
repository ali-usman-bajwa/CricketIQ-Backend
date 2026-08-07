const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema(
  {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },

    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },

    runs: {
      type: Number,
      default: 0,
      min: 0,
    },

    balls: {
      type: Number,
      default: 0,
      min: 0,
    },

    fours: {
      type: Number,
      default: 0,
      min: 0,
    },

    sixes: {
      type: Number,
      default: 0,
      min: 0,
    },

    wickets: {
      type: Number,
      default: 0,
      min: 0,
    },

    runsConceded: {
      type: Number,
      default: 0,
      min: 0,
    },

    oversBowled: {
      type: Number,
      default: 0,
      min: 0,
    },

    strikeRate: {
      type: Number,
      default: 0,
      min: 0,
    },

    economy: {
      type: Number,
      default: 0,
      min: 0,
    },

    dismissed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

performanceSchema.index(
  { player: 1, match: 1 },
  { unique: true }
);

const Performance = mongoose.model(
  "Performance",
  performanceSchema
);

module.exports = Performance;