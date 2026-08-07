const express = require("express");

const {
  generateAnalysis,
} = require("../controller/aiController");

const {
  generateCoach,
} = require("../controller/aiCoachController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


router.post("/analysis/:playerId",protect,generateAnalysis);

router.post("/coach/:playerId",protect,generateCoach);

module.exports = router;

