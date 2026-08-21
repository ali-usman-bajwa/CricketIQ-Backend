const { generateRoleTips } = require("../services/aiTipsService");

const ALLOWED_ROLES = ["Batter", "Bowler", "All-Rounder", "Wicket-Keeper"];

const getRoleTips = async (req, res) => {
  try {
    const { role } = req.params;

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be one of: " + ALLOWED_ROLES.join(", "),
      });
    }

    const result = await generateRoleTips({ role });

    return res.status(200).json({
      success: true,
      data: {
        role,
        tips: result.tips,
      },
    });
  } catch (error) {
    console.error("AI Tips Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate tips right now",
    });
  }
};

module.exports = {
  getRoleTips,
};