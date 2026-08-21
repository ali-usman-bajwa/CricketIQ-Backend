const express = require("express");

const { getRoleTips } = require("../controller/aiTipsController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/:role", protect, authorize("Player", "Coach", "Admin"), getRoleTips);

module.exports = router;