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
    const chronologicalPerformances = [
      ...performances,
    ].reverse();

    const recentPerformances =
      chronologicalPerformances
        .slice(-5)
        .map((performance, index) => {
          const runs =
            Number(performance.runs) || 0;

          const balls =
            Number(performance.balls) || 0;

          const wickets =
            Number(performance.wickets) || 0;

          const runsConceded =
            Number(performance.runsConceded) || 0;

          const oversBowled =
            Number(performance.oversBowled) || 0;

          const strikeRate =
            balls > 0
              ? Number(
                  ((runs / balls) * 100).toFixed(2)
                )
              : 0;

          const economy =
            oversBowled > 0
              ? Number(
                  (
                    runsConceded /
                    oversBowled
                  ).toFixed(2)
                )
              : 0;

          return {
            sequence: index + 1,

            source:
              performance.source || "UNKNOWN",

            runs,
            balls,
            fours:
              Number(performance.fours) || 0,
            sixes:
              Number(performance.sixes) || 0,

            wickets,

            runsConceded,
            oversBowled,

            strikeRate,
            economy,

            dismissed:
              performance.dismissed || false,

            createdAt:
              performance.createdAt,
          };
        });

    // --------------------------------------------------
    // TREND INFORMATION
    // --------------------------------------------------

    let trendInformation =
      "INSUFFICIENT DATA";

    if (recentPerformances.length >= 2) {
      const first =
        recentPerformances[0];

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
      } else if (
        strikeRateDifference < 0
      ) {
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
You are CricketIQ, an AI-powered cricket performance
insights and reporting system.

Your task is to generate a professional performance report
using ONLY the information provided below.

Do not invent statistics, matches, injuries, fitness
information, opposition quality, rankings, career history,
technical weaknesses, or any other information that has
not been provided.

PLAYER INFORMATION

Name: ${player.name}
Role: ${player.role}
Age: ${player.age}

OVERALL PERFORMANCE

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

IMPACT METRICS

Batting Impact: ${features.battingImpact}
Bowling Impact: ${features.bowlingImpact}
Power Hitting: ${features.powerHitting}
Overall Impact: ${features.overallImpact}

ML PREDICTION

Potential Score: ${prediction.potentialScore}
Potential Level: ${prediction.potentialLevel}
Prediction Class: ${prediction.prediction}

IMPORTANT:

The ML prediction is only a predictive signal.

It is NOT proof of future performance.

Do not treat the ML prediction as an observed performance
statistic.

RECENT PERFORMANCES

The following performances are provided in:

OLDEST → NEWEST ORDER

Therefore:

Sequence 1 = oldest performance
Sequence ${
      recentPerformances.length
    } = most recent performance

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

IMPORTANT TREND RULES

You MUST interpret performances chronologically.

For example:

82 → 45 → 23

means the run trend is DECLINING.

Do not reverse the order.

If the calculated trend says DECLINING,
do not describe it as improving.

If the calculated trend says IMPROVING,
do not describe it as declining.

ROLE-SPECIFIC ANALYSIS

BATTER:

Focus primarily on:

- runs
- batting average
- strike rate
- boundaries
- recent scoring pattern
- consistency
- power hitting

BOWLER:

Focus primarily on:

- wickets
- economy
- runs conceded
- recent bowling performance
- consistency

ALL-ROUNDER:

Consider both batting and bowling contributions.

IMPORTANT RULES

1. Use ONLY provided information.

2. Clearly distinguish between:
   - observed performance
   - calculated metrics
   - ML prediction
   - AI-generated interpretation

3. Consider the player's role.

4. Consider the number of matches.

5. If the sample size is small, explicitly state that
   the report is preliminary.

6. Never treat the ML prediction as a guarantee.

7. Do not invent causes for performance changes.

8. Do not invent technical weaknesses.

9. Do not describe irrelevant statistics as weaknesses.

10. Do not make medical, fitness, injury, or supplement
    recommendations.

11. Recommendations must be directly connected to
    observable performance data.

12. Avoid exaggerated language.

13. Do not describe a statistic as "poor", "excellent",
    "weak", or "strong" unless the provided data
    reasonably supports that interpretation.

14. The report must be evidence-based.

15. The report should explain the player's current
    performance rather than pretending to know their
    future.

Return ONLY valid JSON.

Do not include Markdown.
Do not include code fences.
Do not include text before or after the JSON.

Use EXACTLY this structure:

{
  "reportSummary": "Overall evidence-based summary of the player's current performance.",

  "performanceTrend": "Description of the observable recent performance trend.",

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
    "Another relevant batting insight."
  ],

  "bowlingInsights": [
    "Evidence-based bowling insight.",
    "Another relevant bowling insight."
  ],

  "formAnalysis": "Analysis of recent form using the provided chronological performances.",

  "consistencyAnalysis": "Analysis of consistency using the provided consistency metric and performance data.",

  "mlInsight": "Explain what the ML prediction indicates using only the provided metrics. Clearly state that it is predictive and not guaranteed.",

  "developmentInsights": [
    "Practical development insight directly connected to the available data.",
    "Another practical development insight."
  ],

  "scoutingInsight": "Overall evidence-based interpretation of the player's current profile.",

  "dataLimitations": "Explain limitations caused by the available performance history and data.",

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

- Evidence-based.
- Cricket-specific.
- Professional.
- Chronological.
- No invented information.
- No guarantees.
- No medical claims.
- Do not confuse ML prediction with actual performance.
`;


    const response =
      await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

    const text =
      response.text.trim();

    const cleanedText = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error(
      "Gemini AI Insights Error:",
      error.message
    );

    throw new Error(
      "Unable to generate player performance report"
    );
  }
};

module.exports = {
  generatePlayerReport,
};