const mongoose = require("mongoose");

const performanceDataSchema = new mongoose.Schema(
  {
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
  { _id: false }
);

const coachEvaluationSchema = new mongoose.Schema(
  {
    shotSelection: {
      type: Number,
      min: 0,
      max: 10,
    },

    decisionMaking: {
      type: Number,
      min: 0,
      max: 10,
    },

    pressureHandling: {
      type: Number,
      min: 0,
      max: 10,
    },

    fieldAwareness: {
      type: Number,
      min: 0,
      max: 10,
    },

    communication: {
      type: Number,
      min: 0,
      max: 10,
    },

    comments: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

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

    // Data submitted by the player
    playerReport: {
      type: performanceDataSchema,
      default: null,
    },

    // Data submitted/verified by the coach
    coachReport: {
      type: performanceDataSchema,
      default: null,
    },

    // Professional observations made by the coach
    coachEvaluation: {
      type: coachEvaluationSchema,
      default: null,
    },

    // Final data used by CricketIQ intelligence
    unifiedPerformance: {
      type: performanceDataSchema,
      default: null,
    },

    verificationStatus: {
      type: String,
      enum: [
        "PLAYER_REPORTED",
        "COACH_REPORTED",
        "COACH_VERIFIED",
      ],
      default: "PLAYER_REPORTED",
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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