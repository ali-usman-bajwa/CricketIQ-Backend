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
const validateObjectId = require("../middleware/validateObjectId");

const router = express.Router();

router.post("/",protect,authorize("Coach", "Admin"),createMatch);

router.get("/",protect,authorize("Player", "Coach", "Admin"),getMatches);

router.get("/:id",protect,authorize("Player", "Coach", "Admin"),validateObjectId(),getMatch);

router.put("/:id",protect,authorize("Coach", "Admin"),validateObjectId(),updateMatch);

router.delete("/:id",protect,authorize("Admin"),validateObjectId(),deleteMatch);

module.exports = router;