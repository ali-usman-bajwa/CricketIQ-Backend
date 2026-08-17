const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generatePlayerAnalysis = async ({
  player,
  features,
  prediction,
  performances = [],
  performanceSource = "PLAYER_REPORTED",
}) => {
  try {
    const sourceDescription =
      performanceSource === "COACH_VERIFIED"
        ? "COACH_VERIFIED / UNIFIED PERFORMANCE"
        : "PLAYER_REPORTED PERFORMANCE";

    const chronologicalPerformances = [...performances]
      .sort(
        (a, b) =>
          new Date(a.createdAt) - new Date(b.createdAt)
      )
      .slice(-5);

    const recentPerformances =
      chronologicalPerformances.map(
        (performance, index) => ({
          sequence: index + 1,

          runs: performance.runs ?? 0,
          balls: performance.balls ?? 0,

          strikeRate:
            performance.balls > 0
              ? Number(
                  (
                    (performance.runs /
                      performance.balls) *
                    100
                  ).toFixed(2)
                )
              : 0,

          fours: performance.fours ?? 0,
          sixes: performance.sixes ?? 0,

          wickets: performance.wickets ?? 0,
          runsConceded:
            performance.runsConceded ?? 0,

          oversBowled:
            performance.oversBowled ?? 0,

          economy:
            performance.oversBowled > 0
              ? Number(
                  (
                    performance.runsConceded /
                    performance.oversBowled
                  ).toFixed(2)
                )
              : 0,

          dismissed:
            performance.dismissed ?? false,

          createdAt:
            performance.createdAt,
        })
      );

    let trendInformation =
      "INSUFFICIENT DATA";

    if (recentPerformances.length >= 2) {
      const first = recentPerformances[0];

      const latest =
        recentPerformances[
          recentPerformances.length - 1
        ];

      const runDifference =
        latest.runs - first.runs;

      const strikeRateDifference =
        latest.strikeRate -
        first.strikeRate;

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
        chronologicalOrder:
          "OLDEST_TO_NEWEST",

        runTrend,
        strikeRateTrend,

        firstRuns: first.runs,
        latestRuns: latest.runs,

        firstStrikeRate:
          first.strikeRate,

        latestStrikeRate:
          latest.strikeRate,
      };
    }

    const prompt = `
You are CricketIQ, an AI-powered cricket performance and scouting analyst.

Your job is to generate an objective scouting analysis of a cricket player,
written simply enough for the player themselves to read and understand it.

IMPORTANT DATA SOURCE:

The performance data used for this analysis comes from:

${sourceDescription}

This distinction is important.

If the source is PLAYER_REPORTED:
- The performance information was submitted by the player.
- Treat it as player-reported data.
- Do not describe it as coach-verified.

If the source is COACH_VERIFIED / UNIFIED PERFORMANCE:
- The performance has been verified through the coach's report.
- The analysis may describe the performance as coach-verified.
- This is the stronger performance source for CricketIQ's verified analysis.

PLAYER INFORMATION

Name: ${player.name}
Role: ${player.role}
Age: ${player.age}

PERFORMANCE FEATURES

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

CALCULATED IMPACT FEATURES

Batting Impact: ${features.battingImpact}
Bowling Impact: ${features.bowlingImpact}
Power Hitting: ${features.powerHitting}
Overall Impact: ${features.overallImpact}

ML PREDICTION

Potential Score: ${prediction.potentialScore}
Potential Level: ${prediction.potentialLevel}
Prediction Class: ${prediction.prediction}

The ML prediction is a predictive signal.

It is NOT:
- proof of future success
- a guarantee
- a scouting decision by itself
- a replacement for actual performance analysis

RECENT PERFORMANCES

The performances below are ordered:

OLDEST → NEWEST

${JSON.stringify(
  recentPerformances,
  null,
  2
)}

CALCULATED TREND INFORMATION

${JSON.stringify(
  trendInformation,
  null,
  2
)}

ANALYSIS RULES

1. Use ONLY the information provided in this prompt.

2. Never invent:
- statistics
- matches
- injuries
- fitness information
- career history
- opposition quality
- match conditions
- technical weaknesses
- training history
- rankings
- future results

3. Respect the player's role.

For BATTER:
Focus primarily on:
- runs
- batting average
- strike rate
- fours
- sixes
- recent form
- consistency
- power hitting

For BOWLER:
Focus primarily on:
- wickets
- economy
- runs conceded
- recent form
- consistency
- bowling impact

For ALL-ROUNDER:
Consider both batting and bowling.

4. Do not treat irrelevant zero values as weaknesses.

5. Consider the number of matches.

6. If only a small number of matches are available,
explicitly state that the assessment is preliminary.

7. Do not call a metric poor, excellent, high, or low
unless the provided information reasonably supports that
description.

8. Explain the ML prediction using ONLY the provided features.

9. Do not claim that the ML model used features that are
not shown here.

10. Do not confuse ML prediction with observed performance.

11. Recent performances MUST be interpreted chronologically.

12. If the calculated trend says DECLINING, do not describe
the player as improving.

13. If the calculated trend says IMPROVING, do not describe
the player as declining.

14. Recommendations must be directly connected to the
available performance data.

15. Do not provide medical advice.

16. Do not guarantee future performance.

17. The scouting recommendation should describe what the
available evidence suggests, not make an absolute selection
decision.

18. Clearly identify whether the analysis is based on
PLAYER_REPORTED or COACH_VERIFIED data.

19. The potential score should be presented as an ML-based
predictive signal, not as a direct measure of current ability.

20. Do not use the ML potential score as the primary evidence
for strengths or weaknesses. Current performance statistics
and recent trends should be the primary evidence.

21. Write in plain, simple English suitable for a player reading their
own report on a phone — not analyst or scout jargon. Avoid words like
"trajectory," "efficacy," or "quantum." Prefer short sentences. Explain
any cricket-analytics term in plain words the first time it's used
(e.g. say "how many runs he scores per 100 balls faced" instead of
just "strike rate" alone, if the term itself might be unfamiliar to
a young player).

Return ONLY valid JSON.

Do not include Markdown.
Do not include code fences.
Do not include text outside the JSON.

Use exactly this structure:

{
  "performanceSource": "${sourceDescription}",
  "overallAssessment": "Concise evidence-based assessment of the player's current performance.",
  "strengths": [
    "Strength supported by the available statistics.",
    "Another relevant strength."
  ],
  "areasForImprovement": [
    "Specific improvement area supported by the available data.",
    "Another relevant improvement area."
  ],
  "recentTrend": {
    "runTrend": "IMPROVING, DECLINING, STABLE, or INSUFFICIENT_DATA",
    "strikeRateTrend": "IMPROVING, DECLINING, STABLE, or INSUFFICIENT_DATA",
    "summary": "Evidence-based explanation of the recent trend."
  },
  "mlExplanation": "Explain why the ML system produced the given potential score and level using only the provided features.",
  "potentialAssessment": "Explain what the ML prediction suggests while clearly stating that it is not a guarantee of future success.",
  "sampleSizeAssessment": "Explain how reliable the assessment is based on the number of matches available.",
  "scoutingRecommendation": "Practical scouting recommendation based only on the available evidence.",
  "confidence": "LOW"
}

The confidence field must be exactly one of:

LOW
MEDIUM
HIGH

Use:

LOW:
Very limited performance data.

MEDIUM:
A reasonable amount of performance data exists, but additional
matches would improve confidence.

HIGH:
A sufficiently large performance sample exists to support a
stronger assessment.

Remember:

- Evidence first.
- Statistics first.
- Recent trends matter.
- Role matters.
- ML is predictive, not certain.
- Never invent information.
- Never exaggerate.
- Never guarantee future success.
- Clearly distinguish player-reported and coach-verified data.
`;

    const response =
      await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

    const text =
      response.text?.trim();

    if (!text) {
      throw new Error(
        "Empty response received from Gemini"
      );
    }

    const cleanedText = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error(
      "Gemini AI Scouting Service Error:",
      error.response?.data ||
        error.message
    );

    throw new Error(
      "Unable to generate AI player analysis"
    );
  }
};

module.exports = {
  generatePlayerAnalysis,
};