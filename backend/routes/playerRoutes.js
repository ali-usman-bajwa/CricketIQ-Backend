const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  createPlayer,
  getPlayers,
  getPlayer,
  updatePlayer,
  deletePlayer,
} = require("../controller/playerController");

const router = express.Router();

router.post("/", protect, createPlayer);

router.get("/", getPlayers);

router.get("/:id", getPlayer);

router.put("/:id", protect, updatePlayer);

router.delete("/:id", protect, deletePlayer);

module.exports = router;