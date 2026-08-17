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
    // =====================================================
    // VALIDATION
    // =====================================================

    if (!Array.isArray(recommendedXI) || recommendedXI.length === 0) {
      throw new Error(
        "Recommended XI is required"
      );
    }

    // =====================================================
    // PREPARE TEAM DATA FOR AI
    // =====================================================

    const teamData = recommendedXI.map((item) => ({
      name: item.player.name,
      role: item.role,
      age: item.player.age,

      matches:
        item.features.matches,

      battingAverage:
        item.features.battingAverage,

      strikeRate:
        item.features.strikeRate,

      totalRuns:
        item.features.totalRuns,

      fours:
        item.features.fours,

      sixes:
        item.features.sixes,

      totalWickets:
        item.features.totalWickets,

      economy:
        item.features.economy,

      recentForm:
        item.features.recentForm,

      consistency:
        item.features.consistency,

      battingImpact:
        item.features.battingImpact,

      bowlingImpact:
        item.features.bowlingImpact,

      powerHitting:
        item.features.powerHitting,

      overallImpact:
        item.features.overallImpact,

      potentialScore:
        item.prediction.potentialScore,

      potentialLevel:
        item.prediction.potentialLevel,

      prediction:
        item.prediction.prediction,
    }));

    // =====================================================
    // GEMINI PROMPT
    // =====================================================

    const prompt = `
You are CricketIQ, an AI-powered cricket team selection analyst.

Your task is to analyze a recommended cricket XI using ONLY
the structured information provided below.

The backend has already:

- processed player performance data
- calculated player features
- generated ML predictions
- selected the recommended XI
- calculated role distribution
- calculated team-level metrics

You must NOT recalculate these values.

Your responsibility is to explain the selected team objectively.

====================================================
TEAM INFORMATION
====================================================

Format: ${format}

Team Size: ${recommendedXI.length}

Batters:
${roleDistribution.batters}

Wicket-Keepers:
${roleDistribution.wicketkeepers}

All-Rounders:
${roleDistribution.allRounders}

Bowlers:
${roleDistribution.bowlers}

Average Potential:
${teamMetrics.averagePotential}

Average Overall Impact:
${teamMetrics.averageOverallImpact}

====================================================
SELECTED PLAYERS
====================================================

${JSON.stringify(teamData, null, 2)}

====================================================
ANALYSIS RULES
====================================================

1. Use ONLY the information provided above.

2. NEVER invent:

- player history
- injuries
- fitness information
- opposition quality
- match conditions
- rankings
- career achievements
- playing style
- technical weaknesses
- statistics not provided

3. Do not modify or recalculate backend metrics.

4. Clearly distinguish between:

- observed performance statistics
- calculated CricketIQ metrics
- ML potential prediction
- AI-generated team interpretation

5. Evaluate the overall structure of the selected XI.

6. Consider:

- batting depth
- wicketkeeping coverage
- all-rounder contribution
- bowling coverage
- recent form
- consistency
- overall impact
- ML potential

7. Respect player roles.

8. Do not treat irrelevant statistics as weaknesses.

9. A high ML potential score does NOT guarantee future success.

10. Do not claim that this XI will win a match.

11. Captain and vice-captain recommendations are AI recommendations
based ONLY on the provided statistics and metrics.

12. Do not invent leadership qualities, experience,
personality, or captaincy history.

13. If the selected players have limited match history,
explicitly mention that this reduces confidence.

14. Do not exaggerate small statistical differences.

15. The team selection itself has already been performed by the
backend. Explain the selection rather than replacing it.

16. Write in plain, simple English suitable for a coach reading this
quickly on a phone — not academic jargon. Avoid words like "trajectory,"
"efficacy," or "quantify." Prefer short, direct sentences. Explain any
cricket-analytics term in plain words the first time it's used.

====================================================
CAPTAIN / VICE-CAPTAIN
====================================================

Recommend a captain and vice-captain ONLY from the selected XI.

Base the recommendation on:

- overallImpact
- recentForm
- consistency
- role contribution
- battingImpact
- bowlingImpact
- potentialScore

Do NOT claim leadership ability unless leadership information
is explicitly provided.

====================================================
OUTPUT
====================================================

Return ONLY valid JSON.

Do not include Markdown.
Do not include code fences.
Do not include text before or after the JSON.

Use exactly this structure:

{
  "teamSummary": "Overall assessment of the selected XI.",

  "teamStrengths": [
    "Evidence-based team strength.",
    "Another evidence-based team strength."
  ],

  "teamWeaknesses": [
    "Potential weakness based only on the provided data.",
    "Another potential weakness."
  ],

  "battingAnalysis": "Assessment of the batting structure and available batting contribution.",

  "bowlingAnalysis": "Assessment of the bowling structure and available bowling contribution.",

  "teamBalance": "Assessment of overall team balance.",

  "captainRecommendation": {
    "player": "Player name",
    "reason": "Evidence-based reason using only the provided metrics."
  },

  "viceCaptainRecommendation": {
    "player": "Player name",
    "reason": "Evidence-based reason using only the provided metrics."
  },

  "keyPlayers": [
    {
      "player": "Player name",
      "reason": "Why this player is important based on the provided data."
    },
    {
      "player": "Player name",
      "reason": "Why this player is important based on the provided data."
    }
  ],

  "selectionAssessment": "Explain how the backend-selected XI is supported by the available performance metrics, role distribution and ML predictions.",

  "dataLimitations": "Explain limitations caused by the available performance data.",

  "confidence": "LOW"
}

The confidence field MUST be exactly one of:

LOW
MEDIUM
HIGH

LOW:
Several players have very limited performance data.

MEDIUM:
Reasonable performance history exists, but more matches would
improve reliability.

HIGH:
Sufficient and relatively balanced performance history exists.

Remember:

- Evidence-based.
- Professional.
- Cricket-specific.
- Respect player roles.
- Do not invent information.
- Do not guarantee future success.
- Do not treat ML prediction as certainty.
- Do not replace backend team selection.
`;

    // =====================================================
    // GEMINI REQUEST
    // =====================================================

    const response =
      await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

    // =====================================================
    // PARSE JSON
    // =====================================================

    const text =
      response.text.trim();

    const cleanedText =
      text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    return JSON.parse(cleanedText);

  } catch (error) {

    console.error(
      "Gemini AI Team Builder Error:",
      error.response?.data ||
        error.message
    );

    throw new Error(
      "Unable to generate AI team analysis"
    );
  }
};

module.exports = {
  generateTeamAnalysis,
};