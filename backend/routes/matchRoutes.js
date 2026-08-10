const express = require("express");

const {
  createMatch,
  getMatches,
  getMatch,
  updateMatch,
  deleteMatch,
} = require("../controller/matchController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Create match
router.post(
  "/",
  protect,
  authorize("Coach", "Admin"),
  createMatch
);

// Get matches
router.get(
  "/",
  protect,
  authorize("Player", "Coach", "Admin"),
  getMatches
);

// Get single match
router.get(
  "/:id",
  protect,
  authorize("Player", "Coach", "Admin"),
  getMatch
);

// Update match
router.put(
  "/:id",
  protect,
  authorize("Coach", "Admin"),
  updateMatch
);

// Delete match
router.delete(
  "/:id",
  protect,
  authorize("Admin"),
  deleteMatch
);

module.exports = router;