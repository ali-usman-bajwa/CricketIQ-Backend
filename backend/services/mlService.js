
const axios = require("axios");

const ML_SERVICE_URL = "http://localhost:8000";

const predictPlayerPotential = async (playerData) => {
  try {

    const mlFeatures = {
      age: playerData.age,
      matches: playerData.matches,
      totalRuns: playerData.totalRuns,
      battingAverage: playerData.battingAverage,
      strikeRate: playerData.strikeRate,
      fours: playerData.fours,
      sixes: playerData.sixes,
      totalWickets: playerData.totalWickets,
      economy: playerData.economy,
      recentForm: playerData.recentForm,
      consistency: playerData.consistency,
    };


    const response = await axios.post(
      `${ML_SERVICE_URL}/predict`,
      mlFeatures
    );


    return response.data;

  } catch (error) {

    console.error(
      "ML Service Error:",
      error.response?.data || error.message
    );

    throw new Error(
      "Unable to get prediction from ML service"
    );
  }
};

module.exports = {
  predictPlayerPotential,
};

