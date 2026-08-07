const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generatePlayerReport = async ({
  player,
  features,
  prediction,
  performances,
}) => {
  try {
    const recentPerformances = performances
      .slice(0, 5)
      .map((performance) => ({
        runs: performance.runs,
        balls: performance.balls,
        fours: performance.fours,
        sixes: performance.sixes,
        wickets: performance.wickets,
        runsConceded: performance.runsConceded,
        oversBowled: performance.oversBowled,
        dismissed: performance.dismissed,
        createdAt: performance.createdAt,
      }));

    const prompt = `
You are CricketIQ, an AI-powered cricket performance
insights and reporting system.

Your task is to generate a comprehensive performance report
for the player using ONLY the information provided below.

Do not invent statistics, match history, injuries, opposition,
fitness information, rankings, career achievements, or any
other information that is not provided.

==================================================
PLAYER
==================================================

Name: ${player.name}
Role: ${player.role}
Age: ${player.age}

==================================================
PLAYER FEATURES
==================================================

Matches: ${features.matches}
Total Runs: ${features.totalRuns}
Batting Average: ${features.battingAverage}
Strike Rate: ${features.strikeRate}
Fours: ${features.fours}
Sixes: ${features.sixes}

Total Wickets: ${features.totalWickets}
Economy: ${features.economy}

Recent Form: ${features.recentForm}
Consistency: ${features.consistency}

Batting Impact: ${features.battingImpact}
Bowling Impact: ${features.bowlingImpact}
Power Hitting: ${features.powerHitting}
Overall Impact: ${features.overallImpact}

==================================================
ML PREDICTION
==================================================

Potential Score: ${prediction.potentialScore}
Potential Level: ${prediction.potentialLevel}
Prediction Class: ${prediction.prediction}

==================================================
RECENT PERFORMANCES
==================================================

${JSON.stringify(recentPerformances, null, 2)}

==================================================
REPORTING RULES
==================================================

1. Use ONLY the provided information.

2. Clearly distinguish between observed statistics,
   calculated metrics, ML prediction and AI-generated insights.

3. Consider the player's role when interpreting statistics.

4. Identify meaningful performance trends from the
   available recent performances.

5. Consider the number of matches when evaluating reliability.

6. If only a few matches are available, explicitly state
   that the report is preliminary.

7. Do not treat the ML prediction as a guarantee.

8. Do not invent causes for performance changes.

9. Do not describe irrelevant statistics as weaknesses.

10. Do not make medical, fitness or injury recommendations.

11. Recommendations must be directly connected to
    the available statistics.

12. Avoid exaggerated language.

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

Use exactly this structure:

{
  "reportSummary": "Overall summary of the player's performance.",
  "performanceTrend": "Describe the observable trend in the available performance data.",
  "keyStatistics": [
    {
      "metric": "Metric name",
      "value": "Metric value",
      "observation": "Evidence-based observation."
    },
    {
      "metric": "Metric name",
      "value": "Metric value",
      "observation": "Evidence-based observation."
    },
    {
      "metric": "Metric name",
      "value": "Metric value",
      "observation": "Evidence-based observation."
    }
  ],
  "battingInsights": [
    "Evidence-based batting insight.",
    "Another batting insight."
  ],
  "bowlingInsights": [
    "Evidence-based bowling insight.",
    "Another bowling insight."
  ],
  "formAnalysis": "Analysis of recent form using only the available performances.",
  "consistencyAnalysis": "Analysis of consistency using the provided consistency metric and performance data.",
  "mlInsight": "Explain what the ML prediction indicates using the provided metrics.",
  "developmentInsights": [
    "Practical development insight based on the data.",
    "Another development insight."
  ],
  "scoutingInsight": "Overall scouting interpretation of the player's current profile.",
  "dataLimitations": "Explain limitations caused by the available data.",
  "confidence": "LOW"
}

The confidence field must be exactly:

LOW
MEDIUM
HIGH

Use LOW when the player has only a few matches.

Use MEDIUM when a reasonable amount of performance
history is available.

Use HIGH only when sufficient performance history exists.

Remember:

- Evidence-based.
- Cricket-specific.
- Professional.
- No invented information.
- No guarantees.
- No medical claims.
`;

    const response =
      await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

    const text = response.text.trim();

    const cleanedText = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    return JSON.parse(cleanedText);

  } catch (error) {
    console.error(
      "Gemini AI Insights Error:",
      error.response?.data || error.message
    );

    throw new Error(
      "Unable to generate player performance report"
    );
  }
};

module.exports = {
  generatePlayerReport,
};