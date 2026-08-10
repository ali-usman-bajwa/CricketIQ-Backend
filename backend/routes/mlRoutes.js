const express = require("express");

const {
  getPlayerFeatures,
  predictPlayer,
} = require("../controller/mlController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/features/:playerId",protect,authorize("Player", "Coach", "Admin"),getPlayerFeatures);


router.post("/predict/:playerId",protect,authorize("Coach", "Admin"),predictPlayer);

module.exports = router;

