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
const validateObjectId = require("../middleware/validateObjectId");

const router = express.Router();

router.post("/",protect,authorize("Coach", "Admin"),createTeam);

router.get("/",protect,authorize("Player", "Coach", "Admin"),getTeams);

router.get("/:id",protect,authorize("Player", "Coach", "Admin"),validateObjectId(),getTeam);

router.put("/:id",protect,authorize("Coach", "Admin"), validateObjectId(),updateTeam);

router.delete("/:id",protect,authorize("Admin"),validateObjectId(),deleteTeam);

router.post("/:id/players",protect,authorize("Coach", "Admin"), validateObjectId(),addPlayerToTeam);

router.delete("/:id/players/:playerId",protect,authorize("Coach", "Admin"),validateObjectId(),removePlayerFromTeam);

module.exports = router;