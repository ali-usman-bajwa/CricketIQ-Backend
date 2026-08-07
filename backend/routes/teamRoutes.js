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
const router = express.Router();

router.post("/", protect, createTeam);

router.get("/", protect, getTeams);

router.get("/:id", protect, getTeam);

router.put("/:id", protect, updateTeam);

router.delete("/:id", protect, deleteTeam);

router.post("/:id/players", protect, addPlayerToTeam);

router.delete("/:id/players/:playerId",protect,removePlayerFromTeam);

module.exports = router;