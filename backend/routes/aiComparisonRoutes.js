const express = require("express");

const {
aiComparePlayersController,
} = require("../controller/aiComparisonController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();


router.post("/",protect, authorize("Coach", "Admin"),aiComparePlayersController);

module.exports = router;
