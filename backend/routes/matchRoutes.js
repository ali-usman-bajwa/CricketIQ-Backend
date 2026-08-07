const express = require("express");

const {
  createMatch,
  getMatches,
  getMatch,
  updateMatch,
  deleteMatch,
  completeMatch,
} = require("../controller/matchController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createMatch);

router.get("/", protect, getMatches);

router.get("/:id", protect, getMatch);

router.put("/:id", protect, updateMatch);

router.delete("/:id", protect, deleteMatch);

router.patch("/:id/complete", protect, completeMatch);

module.exports = router;