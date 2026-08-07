const express = require("express");

const {
  getPlayerStatistics,
} = require("../controller/statisticsController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/player/:playerId",protect,getPlayerStatistics);

module.exports = router;