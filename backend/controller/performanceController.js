const Performance = require("../models/Performance");
const Player = require("../models/Player");
const Match = require("../models/Match");

const populatePerformance = (query) => {
  
  return query
    .populate("player", "name role team")
    .populate({
      path: "match",
      select: "format date venue teamA teamB status winner",
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
    });
};

const createPerformance = async (req, res) => {

  try {
    const {
      player,
      match,
      runs = 0,
      balls = 0,
      fours = 0,
      sixes = 0,
      wickets = 0,
      runsConceded = 0,
      oversBowled = 0,
      dismissed = false,
    } = req.body;


    const existingPlayer =
      await Player.findById(player);

    if (!existingPlayer) {
      return res.status(404).json({
        success: false,
        message: "Player not found",
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

    if (existingMatch.status !== "completed") {
      return res.status(400).json({
        success: false,
        message:
          "Performance can only be recorded for a completed match",
      });
    }

    const existingPerformance =
      await Performance.findOne({
        player,
        match,
      });

    if (existingPerformance) {
      return res.status(400).json({
        success: false,
        message:
          "Performance already recorded for this player in this match",
      });
    }

    const strikeRate =
      balls > 0
        ? (runs / balls) * 100
        : 0;

    const economy =
      oversBowled > 0
        ? runsConceded / oversBowled
        : 0;

    const performance =
      await Performance.create({
        player,
        match,
        runs,
        balls,
        fours,
        sixes,
        wickets,
        runsConceded,
        oversBowled,
        strikeRate,
        economy,
        dismissed,
      });


    const populatedPerformance =
      await populatePerformance(
        Performance.findById(
          performance._id
        )
      );


    res.status(201).json({
      success: true,
      message:
        "Performance recorded successfully",
      data: populatedPerformance,
    });

  } catch (error) {

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "Performance already recorded for this player in this match",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPerformances = async (req, res) => {
  try {

    const performances =
      await populatePerformance(
        Performance.find().sort({
          createdAt: -1,
        })
      );

    res.status(200).json({
      success: true,
      count: performances.length,
      data: performances,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPlayerPerformances = async (req,res) => {
  try {

    const player = await Player.findById(req.params.playerId);

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player not found",
      });
    }


    const performances =
      await populatePerformance(
        Performance.find({
          player: req.params.playerId,
        }).sort({
          createdAt: -1,
        })
      );


    res.status(200).json({
      success: true,
      count: performances.length,
      data: performances,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPerformance = async (req,res) => {
  try {

    const performance =
      await populatePerformance(
        Performance.findById(
          req.params.id
        )
      );

    if (!performance) {
      return res.status(404).json({
        success: false,
        message: "Performance not found",
      });
    }


    res.status(200).json({
      success: true,
      data: performance,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updatePerformance = async (req,res) => {
  try {

    const performance =
      await Performance.findById(
        req.params.id
      );

    if (!performance) {
      return res.status(404).json({
        success: false,
        message: "Performance not found",
      });
    }


    const {
      runs,
      balls,
      fours,
      sixes,
      wickets,
      runsConceded,
      oversBowled,
      dismissed,
    } = req.body;


    if (runs !== undefined) {
      performance.runs = runs;
    }

    if (balls !== undefined) {
      performance.balls = balls;
    }

    if (fours !== undefined) {
      performance.fours = fours;
    }

    if (sixes !== undefined) {
      performance.sixes = sixes;
    }

    if (wickets !== undefined) {
      performance.wickets = wickets;
    }

    if (runsConceded !== undefined) {
      performance.runsConceded =
        runsConceded;
    }

    if (oversBowled !== undefined) {
      performance.oversBowled =
        oversBowled;
    }

    if (dismissed !== undefined) {
      performance.dismissed =
        dismissed;
    }

    performance.strikeRate =
      performance.balls > 0
        ? (performance.runs /
            performance.balls) *
          100
        : 0;


    performance.economy =
      performance.oversBowled > 0
        ? performance.runsConceded /
          performance.oversBowled
        : 0;


    await performance.save();


    const updatedPerformance =
      await populatePerformance(
        Performance.findById(
          performance._id
        )
      );


    res.status(200).json({
      success: true,
      message:
        "Performance updated successfully",
      data: updatedPerformance,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deletePerformance = async (req,res) => {
  try {

    const performance =
      await Performance.findByIdAndDelete(
        req.params.id
      );

    if (!performance) {
      return res.status(404).json({
        success: false,
        message: "Performance not found",
      });
    }


    res.status(200).json({
      success: true,
      message:
        "Performance deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
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
  updatePerformance,
  deletePerformance,
};