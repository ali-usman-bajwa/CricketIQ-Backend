const express = require("express");

const {
  generatePlayerReportController,
} = require("../controller/aiInsightsController");

const protect =
  require("../middleware/authMiddleware");

const router = express.Router();

router.get("/player/:playerId",protect,generatePlayerReportController);

module.exports = router;