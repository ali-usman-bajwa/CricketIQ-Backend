const express = require("express");

const {
  createPerformance,
  getPerformances,
  getPlayerPerformances,
  getPerformance,
  deletePerformance,
} = require("../controller/performanceController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();


router.post("/",protect,authorize("Player", "Coach"),createPerformance);

router.get("/",protect,authorize("Coach", "Admin"),getPerformances);

router.get("/player/:playerId", protect,authorize("Player", "Coach", "Admin"),getPlayerPerformances);

router.get("/:id", protect,authorize("Player", "Coach", "Admin"),getPerformance);

router.delete("/:id", protect,authorize("Coach", "Admin"),deletePerformance);

module.exports = router;