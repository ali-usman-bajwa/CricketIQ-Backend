const express = require("express");
const cors = require("cors");
const playerRoutes = require("./routes/playerRoutes");
const performanceRoutes = require("./routes/performanceRoutes");
const authRoutes = require("./routes/authRoutes");
const teamRoutes = require("./routes/teamRoutes");
const matchRoutes = require("./routes/matchRoutes");
const statisticsRoutes = require("./routes/statisticsRoutes");
const mlRoutes = require("./routes/mlRoutes");
const aiRoutes = require("./routes/aiRoutes");
const comparisonRoutes = require("./routes/comparisonRoutes");
const aiComparisonRoutes = require("./routes/aiComparisonRoutes");
const teamBuilderRoutes = require("./routes/teamBuilderRoutes");
const aiInsightsRoutes = require("./routes/aiInsightsRoute");
const errorMiddleware = require("./middleware/errorMiddleware");
const aiTipsRoutes = require("./routes/aiTipsRoutes");

const app = express();

app.use(cors());
app.use(express.json());



app.get("/", (req, res) => {

  res.json({
    message: "CricketIQ API is running",
  });
  
});

app.use("/api/auth", authRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/performances", performanceRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/ml", mlRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/comparison",comparisonRoutes);
app.use("/api/ai-comparison",aiComparisonRoutes);
app.use("/api/team-builder",teamBuilderRoutes);
app.use("/api/ai-insights", aiInsightsRoutes);
app.use(errorMiddleware);
app.use("/api/ai-tips", aiTipsRoutes);

module.exports = app;