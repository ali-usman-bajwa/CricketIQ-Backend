const express = require("express");

const {
  buildRecommendedTeamController,
} = require("../controller/teamBuilderController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, buildRecommendedTeamController);

module.exports = router;