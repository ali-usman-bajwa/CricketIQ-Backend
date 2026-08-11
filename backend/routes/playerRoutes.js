const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

const {
  createPlayer,
  getPlayers,
  getPlayer,
  updatePlayer,
  deletePlayer,
} = require("../controller/playerController");

const router = express.Router();


router.post("/",protect,authorize("Admin"),createPlayer);

router.get("/",protect,authorize("Player", "Coach", "Admin"),getPlayers);

router.get("/:id",protect,authorize("Player", "Coach", "Admin"),validateObjectId(),getPlayer);

router.put("/:id",protect, authorize("Player", "Admin"),validateObjectId(),updatePlayer);

router.delete("/:id",protect, authorize("Admin"),validateObjectId(),deletePlayer);

module.exports = router;