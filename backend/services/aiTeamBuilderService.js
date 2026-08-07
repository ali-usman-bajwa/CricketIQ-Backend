const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generateTeamAnalysis = async ({
  format,
  recommendedXI,
  roleDistribution,
  teamMetrics,
}) => {
  try {
    const teamData = recommendedXI.map((item) => ({
      name: item.player.name,
      role: item.role,
      age: item.player.age,

      battingAverage: item.features.battingAverage,
      strikeRate: item.features.strikeRate,
      totalRuns: item.features.totalRuns,
      fours: item.features.fours,
      sixes: item.features.sixes,

      totalWickets: item.features.totalWickets,
      economy: item.features.economy,

      recentForm: item.features.recentForm,
      consistency: item.features.consistency,

      battingImpact: item.features.battingImpact,
      bowlingImpact: item.features.bowlingImpact,
      powerHitting: item.features.powerHitting,
      overallImpact: item.features.overallImpact,

      potentialScore:
        item.prediction.potentialScore,

      potentialLevel:
        item.prediction.potentialLevel,
    }));

    const prompt = `
You are CricketIQ, an AI-powered cricket team selection analyst.

Your job is to analyze the recommended cricket team using ONLY
the information provided below.

Do not invent player history, injuries, opposition quality,
match conditions, rankings, career statistics, or any other
information that is not provided.

==================================================
TEAM INFORMATION
==================================================

Format: ${format}

Team Size: ${recommendedXI.length}

==================================================
ROLE DISTRIBUTION
==================================================

Batters: ${roleDistribution.batters}
Wicket-Keepers: ${roleDistribution.wicketkeepers}
All-Rounders: ${roleDistribution.allRounders}
Bowlers: ${roleDistribution.bowlers}

==================================================
TEAM METRICS
==================================================

Average Potential:
${teamMetrics.averagePotential}

Average Overall Impact:
${teamMetrics.averageOverallImpact}

==================================================
SELECTED PLAYERS
==================================================

${JSON.stringify(teamData, null, 2)}

==================================================
ANALYSIS RULES
==================================================

1. Use ONLY the provided information.

2. Do not invent statistics or player characteristics.

3. Evaluate the balance of the selected XI.

4. Consider batting depth, bowling coverage,
   all-rounder contribution and wicketkeeping.

5. Consider player potential scores and overall impact.

6. Do not assume that a higher ML score guarantees
   better future performance.

7. Clearly distinguish between:
   - player statistics
   - calculated performance metrics
   - ML potential prediction
   - AI team recommendation

8. If the team contains players with very limited
   performance data, mention that this reduces
   confidence in the team assessment.

9. Do not criticize a player based on statistics
   that are irrelevant to their role.

10. Do not claim that the team is guaranteed to win.

11. Captain and vice-captain recommendations must be
    based only on the provided performance metrics.

12. Explain why the selected captain and vice-captain
    were chosen.

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

Use exactly this structure:

{
  "teamSummary": "Overall assessment of the selected XI.",
  "teamStrengths": [
    "Strength of the selected team.",
    "Another team strength."
  ],
  "teamWeaknesses": [
    "Potential weakness based only on provided data.",
    "Another potential weakness."
  ],
  "battingAnalysis": "Assessment of the batting structure and available batting contribution.",
  "bowlingAnalysis": "Assessment of the bowling structure and available bowling contribution.",
  "teamBalance": "Assessment of overall team balance.",
  "captainRecommendation": {
    "player": "Player name",
    "reason": "Evidence-based reason for selecting the captain."
  },
  "viceCaptainRecommendation": {
    "player": "Player name",
    "reason": "Evidence-based reason for selecting the vice-captain."
  },
  "keyPlayers": [
    {
      "player": "Player name",
      "reason": "Why this player is important to the team."
    },
    {
      "player": "Player name",
      "reason": "Why this player is important to the team."
    }
  ],
  "selectionAssessment": "Explain why the ML-ranked players and role distribution resulted in this XI.",
  "dataLimitations": "Explain limitations caused by the available performance data.",
  "confidence": "LOW"
}

The confidence field must be exactly:

LOW
MEDIUM
HIGH

Use LOW when several players have very limited performance data.

Use MEDIUM when the team has a reasonable amount of
performance data but more matches would improve reliability.

Use HIGH only when the available performance history
is sufficiently large.

Remember:

- Be objective.
- Be cricket-specific.
- Use evidence.
- Do not invent information.
- Do not guarantee future success.
- Do not confuse ML predictions with certainty.
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
      "Gemini AI Team Builder Error:",
      error.response?.data || error.message
    );

    throw new Error(
      "Unable to generate AI team analysis"
    );
  }
};

module.exports = {
  generateTeamAnalysis,
};