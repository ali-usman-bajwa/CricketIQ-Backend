const express = require("express");

const {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  addPlayerToTeam,
  removePlayerFromTeam,
} = require("../controller/teamController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("Coach", "Admin"),
  createTeam
);

router.get(
  "/",
  protect,
  authorize("Player", "Coach", "Admin"),
  getTeams
);

router.get(
  "/:id",
  protect,
  authorize("Player", "Coach", "Admin"),
  getTeam
);

router.put(
  "/:id",
  protect,
  authorize("Coach", "Admin"),
  updateTeam
);

router.delete(
  "/:id",
  protect,
  authorize("Admin"),
  deleteTeam
);

router.post(
  "/:id/players",
  protect,
  authorize("Coach", "Admin"),
  addPlayerToTeam
);

router.delete(
  "/:id/players/:playerId",
  protect,
  authorize("Coach", "Admin"),
  removePlayerFromTeam
);

module.exports = router;