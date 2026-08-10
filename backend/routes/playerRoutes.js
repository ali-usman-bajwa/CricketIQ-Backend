const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  createPlayer,
  getPlayers,
  getPlayer,
  updatePlayer,
  deletePlayer,
} = require("../controller/playerController");

const router = express.Router();


// =====================================================
// CREATE PLAYER
// =====================================================
// Normal player registration happens through:
// POST /api/auth/register
//
// This route is only for Admin.
router.post(
  "/",
  protect,
  authorize("Admin"),
  createPlayer
);


// =====================================================
// GET ALL PLAYERS
// =====================================================
// Player, Coach and Admin can view players.
router.get(
  "/",
  protect,
  authorize("Player", "Coach", "Admin"),
  getPlayers
);


// =====================================================
// GET SINGLE PLAYER
// =====================================================
// Player, Coach and Admin can view a player.
router.get(
  "/:id",
  protect,
  authorize("Player", "Coach", "Admin"),
  getPlayer
);


// =====================================================
// UPDATE PLAYER
// =====================================================
// Player → can update own profile
// Admin  → can update any player
router.put(
  "/:id",
  protect,
  authorize("Player", "Admin"),
  updatePlayer
);


// =====================================================
// DELETE PLAYER
// =====================================================
// Admin only.
router.delete(
  "/:id",
  protect,
  authorize("Admin"),
  deletePlayer
);


module.exports = router;