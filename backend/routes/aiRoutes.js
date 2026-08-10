const express = require("express");

const {
  generateAnalysis,
} = require("../controller/aiController");

const {
  generateCoach,
} = require("../controller/aiCoachController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();


router.post("/analysis/:playerId",protect,authorize("Player", "Coach", "Admin"),generateAnalysis);

router.post("/coach/:playerId",protect,authorize("Player", "Coach", "Admin"),generateCoach);

module.exports = router;

