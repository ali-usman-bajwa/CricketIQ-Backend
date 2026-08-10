const express = require("express");

const {
  generatePlayerReportController,
} = require("../controller/aiInsightsController");

const protect =
  require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/player/:playerId",protect,authorize("Player", "Coach", "Admin"),generatePlayerReportController);

module.exports = router;