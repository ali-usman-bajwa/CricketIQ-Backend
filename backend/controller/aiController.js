const {
  buildPlayerFeatures,
} = require("../services/playerFeatureService");

const {
  predictPlayerPotential,
} = require("../services/mlService");

const {
  generatePlayerAnalysis,
} = require("../services/aiService");

const generateAnalysis = async (req, res) => {
  try {
    const { playerId } = req.params;


    const result = await buildPlayerFeatures(playerId);

    const prediction = await predictPlayerPotential(
      result.features
    );

    const analysis = await generatePlayerAnalysis({
        player: result.player,
        features: result.features,
        prediction,
      });

    res.status(200).json({
      success: true,
      data: {
        player: result.player,
        features: result.features,
        prediction,
        analysis,
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

    res.status(500).json({
      success: false,
      message: error.message,
    });


  }
};

module.exports = {
  generateAnalysis,
};
