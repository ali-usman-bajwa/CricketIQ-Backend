const express = require("express");
const authorize = require("../middleware/roleMiddleware");

const {
  buildRecommendedTeamController,
} = require("../controller/teamBuilderController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorize("Coach", "Admin"), buildRecommendedTeamController);

module.exports = router;