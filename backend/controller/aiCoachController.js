const {
  buildPlayerFeatures,
} = require("../services/playerFeatureService");

const {
  predictPlayerPotential,
} = require("../services/mlService");

const {
  generatePlayerCoach,
} = require("../services/aiCoachService");


const generateCoach = async (req, res) => {

  try {

    const { playerId } = req.params;

    const result = await buildPlayerFeatures(playerId);


    const prediction = await predictPlayerPotential(
        result.features
      );

    const coaching = await generatePlayerCoach({

        player: result.player,

        features: result.features,

        prediction,

        performances: result.performances,

      });

    res.status(200).json({

      success: true,

      data: {

        player: result.player,

        features: result.features,

        prediction,

        coaching,

      },

    });

  } catch (error) {

    if (
      error.message === "Player not found" ||
      error.message ===
        "No performance data found for this player"
    ) {

      return res.status(404).json({

        success: false,

        message: error.message,

      });

    }


    console.error(
      "AI Coach Controller Error:",
      error.message
    );


    res.status(500).json({

      success: false,

      message:
        "Unable to generate personalized coaching",

    });

  }

};


module.exports = {
  generateCoach,
};

