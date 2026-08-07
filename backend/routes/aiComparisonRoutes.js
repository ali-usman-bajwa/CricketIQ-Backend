const express = require("express");

const {
aiComparePlayersController,
} = require("../controller/aiComparisonController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


router.post("/",protect,aiComparePlayersController);

module.exports = router;
