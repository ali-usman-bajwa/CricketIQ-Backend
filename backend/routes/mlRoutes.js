const express = require("express");

const {
  getPlayerFeatures,
  predictPlayer,
} = require("../controller/mlController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/features/:playerId",protect,getPlayerFeatures);


router.post("/predict/:playerId",protect,predictPlayer);

module.exports = router;

