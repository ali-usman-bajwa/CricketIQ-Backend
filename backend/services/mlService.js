const axios = require("axios");

const ML_SERVICE_URL =
  "http://localhost:8000";

const predictPlayerPotential = async (
  playerData
) => {
  try {
    if (!playerData) {
      throw new Error(
        "Player data is required"
      );
    }

    const mlFeatures = {
      age: Number(playerData.age || 0),
      matches: Number(playerData.matches || 0),
      totalRuns: Number(
        playerData.totalRuns || 0
      ),
      battingAverage: Number(
        playerData.battingAverage || 0
      ),
      strikeRate: Number(
        playerData.strikeRate || 0
      ),
      fours: Number(
        playerData.fours || 0
      ),
      sixes: Number(
        playerData.sixes || 0
      ),
      totalWickets: Number(
        playerData.totalWickets || 0
      ),
      economy: Number(
        playerData.economy || 0
      ),
      recentForm: Number(
        playerData.recentForm || 0
      ),
      consistency: Number(
        playerData.consistency || 0
      ),
    };

    const response = await axios.post(
      `${ML_SERVICE_URL}/predict`,
      mlFeatures
    );

    return response.data;

  } catch (error) {
    console.error(
      "ML Service Error:",
      error.response?.data ||
        error.message
    );

    throw new Error(
      "Unable to get prediction from ML service"
    );
  }
};

module.exports = {
  predictPlayerPotential,
};