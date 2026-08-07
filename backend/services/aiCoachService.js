
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generatePlayerCoach = async ({
  player,
  features,
  prediction,
  performances,
}) => {
  try {

    const chronologicalPerformances = [...performances].reverse();

    const recentPerformances = chronologicalPerformances
      .slice(-5)
      .map((performance, index) => {
        const strikeRate = performance.balls > 0
          ? Number(
            ((performance.runs / performance.balls) * 100).toFixed(2)
          )
          : 0;

        const economy = performance.oversBowled > 0
          ? Number(
            (
              performance.runsConceded /
              performance.oversBowled
            ).toFixed(2)
          )
          : 0;

        return {
          sequence: index + 1,
          runs: performance.runs,
          balls: performance.balls,
          strikeRate,
          fours: performance.fours,
          sixes: performance.sixes,
          wickets: performance.wickets,
          runsConceded: performance.runsConceded,
          oversBowled: performance.oversBowled,
          economy,
          dismissed: performance.dismissed,
        };
      });

    let trendInformation = "INSUFFICIENT DATA";

    if (recentPerformances.length >= 2) {

      const first = recentPerformances[0];
      const latest = recentPerformances[recentPerformances.length - 1];

      const runDifference = latest.runs - first.runs;
      const strikeRateDifference =
        latest.strikeRate - first.strikeRate;

      let runTrend = "STABLE";

      if (runDifference > 0) {
        runTrend = "IMPROVING";
      } else if (runDifference < 0) {
        runTrend = "DECLINING";
      }

      let strikeRateTrend = "STABLE";

      if (strikeRateDifference > 0) {
        strikeRateTrend = "IMPROVING";
      } else if (strikeRateDifference < 0) {
        strikeRateTrend = "DECLINING";
      }

      trendInformation = {
        chronologicalOrder: "OLDEST_TO_NEWEST",
        runTrend,
        strikeRateTrend,
        firstRuns: first.runs,
        latestRuns: latest.runs,
        firstStrikeRate: first.strikeRate,
        latestStrikeRate: latest.strikeRate,
      };
    }

    const prompt = `
You are CricketIQ, an AI-powered cricket performance coach.

Your job is to provide practical and personalized coaching guidance
based ONLY on the player's provided statistics and recent performances.

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

IMPORTANT:
The ML prediction is only a predictive signal.
It must NOT be treated as proof of future performance.

==================================================
RECENT PERFORMANCES
==================================================

The following performances are provided in:

OLDEST → NEWEST ORDER

Therefore:

Sequence 1 = oldest performance
Sequence ${recentPerformances.length} = most recent performance

${JSON.stringify(recentPerformances, null, 2)}

==================================================
CALCULATED TREND INFORMATION
==================================================

${JSON.stringify(trendInformation, null, 2)}

IMPORTANT TREND RULE:

You MUST interpret the performances chronologically.

For example:

If runs are:

82 → 45 → 23

the trend is DECLINING.

It must NOT be described as improving.

If strike rates are:

151.85 → 145.16 → 121.05

the strike-rate trend is DECLINING.

Never reverse the chronological direction.

==================================================
COACHING RULES
==================================================

1. Use ONLY the information provided.

2. Never invent injuries, weaknesses, training history,
fitness information, career history, opposition quality,
bowling types, match conditions, or other facts.

3. Do not guarantee future performance.

4. Consider the player's role.

5. For a BATTER, focus primarily on:

   - run scoring
   - batting average
   - strike rate
   - boundary frequency
   - consistency
   - recent scoring pattern
   - recent strike-rate pattern

6. For a BOWLER, focus primarily on:

   - wickets
   - economy
   - runs conceded
   - bowling consistency
   - recent performance

7. For an ALL-ROUNDER, consider both batting and bowling.

8. Analyze the recent performances in chronological order.

9. Use the provided trend information as the authoritative
reference for identifying improving, declining, or stable trends.

10. Do not claim a player is improving when the calculated
trend information says DECLINING.

11. Do not claim a player is declining when the calculated
trend information says IMPROVING.

12. Do not call a calculated metric "poor" or "excellent"
unless the provided data clearly supports that interpretation.

13. If the sample size is small, explicitly state that
recommendations are preliminary.

14. Recommendations must be practical and directly connected
to the player's available data.

15. Training recommendations must be related to observable
performance metrics.

16. Do not recommend medical treatment, supplements,
medication, injury rehabilitation, or fitness interventions
that require information not provided.

17. Do not invent technical weaknesses such as footwork,
shot selection, bowling variation, or technique unless the
provided data supports them.

18. Do not treat the ML potential score as a coaching metric.
The coaching recommendations should primarily come from
performance data and recent trends.

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

Do not include Markdown.
Do not include code fences.
Do not include additional text before or after the JSON.

Use exactly this structure:

{
  "coachSummary": "Short personalized coaching assessment based on current performance and recent trend.",
  "priorityArea": "The single most important area the player should focus on.",
  "strengthToMaintain": "A current strength supported by the available data.",
  "developmentAreas": [
    "Specific development recommendation supported by the data.",
    "Specific development recommendation supported by the data."
  ],
  "trainingFocus": [
    "Practical cricket training focus supported by the data.",
    "Practical cricket training focus supported by the data.",
    "Practical cricket training focus supported by the data."
  ],
  "matchPreparation": [
    "Practical match preparation recommendation supported by the data.",
    "Practical match preparation recommendation supported by the data."
  ],
  "shortTermGoals": [
    "Measurable or clearly defined short-term goal based on available data.",
    "Another measurable or clearly defined short-term goal."
  ],
  "dataLimitations": "Explain limitations caused by the available data.",
  "confidence": "LOW"
}

The confidence field must be exactly:

LOW
MEDIUM
HIGH

Use:

LOW:
Only a few matches are available.

MEDIUM:
A reasonable amount of performance history exists,
but more matches would improve confidence.

HIGH:
Sufficient performance history exists to support
a stronger assessment.

Remember:

- Be evidence-based.
- Be practical.
- Be role-specific.
- Respect chronological order.
- Use the calculated trend information.
- Do not invent information.
- Do not exaggerate.
- Do not guarantee future performance.
- Do not confuse ML prediction with coaching evidence.
`;

    const response = await ai.models.generateContent({
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
      "Gemini AI Coach Service Error:",
      error.response?.data || error.message
    );

    throw new Error(
      "Unable to generate personalized coaching"
    );
  }
};

module.exports = {
  generatePlayerCoach,
};
