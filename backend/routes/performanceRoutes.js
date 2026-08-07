const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  createPerformance,
  getPerformances,
  getPlayerPerformances,
  getPerformance,
  updatePerformance,
  deletePerformance,
} = require("../controller/performanceController");

const router = express.Router();

router.post("/", protect, createPerformance);

router.get("/", getPerformances);

router.get("/player/:playerId", getPlayerPerformances);

router.get("/:id", getPerformance);

router.put("/:id", updatePerformance);

router.delete("/:id", deletePerformance);

module.exports = router;