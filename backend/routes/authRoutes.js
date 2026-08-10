const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  register,
  login,
  getCurrentUser
} = require("../controller/authController");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", protect, getCurrentUser);

module.exports = router;