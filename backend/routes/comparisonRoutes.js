const express = require("express");

const {
  comparePlayersController,
} = require("../controller/playerComparisonController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


router.post("/",protect,comparePlayersController);


module.exports = router;

