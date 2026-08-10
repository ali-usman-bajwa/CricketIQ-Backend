const express = require("express");
const authorize = require("../middleware/roleMiddleware");

const {
  comparePlayersController,
} = require("../controller/playerComparisonController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


router.post("/",protect, authorize("Coach", "Admin"), comparePlayersController);


module.exports = router;

