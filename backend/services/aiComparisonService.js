const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generatePlayerComparison = async (players) => {
  try {
    // =====================================================
    // VALIDATION
    // =====================================================

    if (!Array.isArray(players) || players.length < 2) {
      throw new Error(
        "At least 2 players are required for AI comparison"
      );
    }

    // =====================================================
    // PREPARE DATA FOR GEMINI
    // =====================================================

    const comparisonData = players.map((player) => ({
      rank: player.rank,

      player: {
        name: player.player.name,
        role: player.player.role,
        age: player.player.age,
      },

      features: {
        matches: player.features.matches,
        totalRuns: player.features.totalRuns,
        battingAverage: player.features.battingAverage,
        strikeRate: player.features.strikeRate,
        fours: player.features.fours,
        sixes: player.features.sixes,
        totalWickets: player.features.totalWickets,
        economy: player.features.economy,
        recentForm: player.features.recentForm,
        consistency: player.features.consistency,
        battingImpact: player.features.battingImpact,
        bowlingImpact: player.features.bowlingImpact,
        powerHitting: player.features.powerHitting,
        overallImpact: player.features.overallImpact,
      },

      prediction: {
        potentialLevel:
          player.prediction.potentialLevel,

        potentialScore:
          player.prediction.potentialScore,

        prediction:
          player.prediction.prediction,
      },
    }));

    // =====================================================
    // GEMINI PROMPT
    // =====================================================

    const prompt = `
You are CricketIQ, an AI-powered cricket comparison analyst.

Your job is to compare multiple cricket players using ONLY
the structured data provided below, written simply enough
for a coach to read quickly and act on.

The backend has already calculated:

- performance statistics
- CricketIQ features
- ML predictions
- rankings

You must NOT recalculate these values.

Your job is to explain the differences between the players
in a professional, objective and cricket-specific manner.

PLAYER COMPARISON DATA:

${JSON.stringify(comparisonData, null, 2)}

IMPORTANT RULES:

1. Use ONLY the information provided above.

2. NEVER invent:
- career history
- injuries
- fitness information
- opposition quality
- rankings outside the provided ranking
- team history
- playing conditions
- future performances
- statistics not provided

3. Do NOT modify or recalculate any statistics.

4. Clearly distinguish between:
- observed performance statistics
- calculated CricketIQ metrics
- ML predictions

5. Compare players using statistics relevant to their roles.

6. For BATTERS focus primarily on:
- total runs
- batting average
- strike rate
- boundaries
- power hitting
- recent form
- consistency
- batting impact

7. For BOWLERS focus primarily on:
- wickets
- economy
- runs conceded
- recent form
- consistency
- bowling impact

8. For ALL-ROUNDERS consider both batting and bowling.

9. Do not treat a role-irrelevant statistic as a weakness.

10. Consider sample size carefully.

11. A player with only a few matches may have unstable metrics.

12. Do not assume that the player with the highest
ML potential score is automatically the best player
for every situation.

13. The ML prediction is a predictive signal,
NOT a guarantee of future success.

14. The backend ranking is based on ML potential score.
Do not claim that the ranking represents overall cricket ability.

15. Recommendations must be based only on the provided data.

16. Do not exaggerate differences when sample sizes are small.

17. If players have different roles, avoid directly comparing
role-specific metrics that are not meaningful across roles.

18. If two players have similar values, describe them as
similar rather than inventing a meaningful difference.

19. If the available data is limited, explicitly mention
that the comparison is preliminary.

20. Write in plain, simple English suitable for a coach reading this
quickly on a phone — not academic or analyst jargon. Avoid words like
"trajectory," "efficacy," or "quantify." Prefer short, direct sentences.
Explain any cricket-analytics term in plain words the first time it's
used.

Return ONLY valid JSON.

Do not include Markdown.
Do not include code fences.
Do not include additional text before or after the JSON.

Use exactly this structure:

{
  "overallComparison": "Overall comparison of the players based on the available evidence.",

  "playerAdvantages": [
    {
      "player": "Player name",
      "advantages": [
        "Specific advantage supported by the data.",
        "Another specific advantage."
      ]
    }
  ],

  "categoryComparison": [
    {
      "category": "Category name",
      "leader": "Player name",
      "explanation": "Explain why this player leads this category using the provided statistics."
    }
  ],

  "potentialComparison": "Explain how the ML potential scores and levels compare.",

  "sampleSizeAssessment": "Explain how differences in the number of matches affect the reliability of the comparison.",

  "recommendation": "Provide a practical recommendation based only on the available evidence.",

  "confidence": "LOW"
}

The confidence field must be exactly one of:

LOW
MEDIUM
HIGH

Use LOW when:
- very limited data exists
- or there are major differences in sample size

Use MEDIUM when:
- reasonable data exists
- but additional matches would improve reliability

Use HIGH only when:
- sufficient performance history exists
- and the comparison has relatively balanced sample sizes

Remember:

- Use only provided information.
- Do not invent facts.
- Do not recalculate metrics.
- Do not guarantee future performance.
- Respect player roles.
- Consider sample size.
- Keep the comparison professional and cricket-specific.
`;

    // =====================================================
    // GEMINI REQUEST
    // =====================================================

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    // =====================================================
    // CLEAN RESPONSE
    // =====================================================

    const text = response.text.trim();

    const cleanedText = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    return JSON.parse(cleanedText);

  } catch (error) {
    console.error(
      "Gemini AI Comparison Service Error:",
      error.response?.data || error.message
    );

    throw new Error(
      "Unable to generate AI player comparison"
    );
  }
};

module.exports = {
  generatePlayerComparison,
};