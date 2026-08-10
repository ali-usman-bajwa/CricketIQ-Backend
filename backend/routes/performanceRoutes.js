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


// Player OR Coach can submit performance
router.post(
  "/",
  protect,
  authorize("Player", "Coach"),
  createPerformance
);


// Only Coach/Admin can see all performances
router.get(
  "/",
  protect,
  authorize("Coach", "Admin"),
  getPerformances
);


// Player can see own performance
// Coach/Admin can see player performance
router.get(
  "/player/:playerId",
  protect,
  authorize("Player", "Coach", "Admin"),
  getPlayerPerformances
);


// Player/Coach/Admin can access a specific performance
router.get(
  "/:id",
  protect,
  authorize("Player", "Coach", "Admin"),
  getPerformance
);


// Coach/Admin can delete performance
router.delete(
  "/:id",
  protect,
  authorize("Coach", "Admin"),
  deletePerformance
);


module.exports = router;