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

    if (!performances || performances.length === 0) {
      throw new Error(
        "No performance data available for coaching"
      );
    }
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
            Number(
              performance.runsConceded
            ) || 0;

          const oversBowled =
            Number(
              performance.oversBowled
            ) || 0;

          const strikeRate =
            balls > 0
              ? Number(
                  (
                    (runs / balls) *
                    100
                  ).toFixed(2)
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
              performance.source ||
              "UNKNOWN",

            runs,
            balls,
            strikeRate,

            fours:
              Number(
                performance.fours
              ) || 0,

            sixes:
              Number(
                performance.sixes
              ) || 0,

            wickets,

            runsConceded,

            oversBowled,

            economy,

            dismissed:
              Boolean(
                performance.dismissed
              ),
          };
        });

    let trendInformation = {
      chronologicalOrder:
        "OLDEST_TO_NEWEST",

      sampleSize:
        recentPerformances.length,

      runTrend: "INSUFFICIENT_DATA",

      strikeRateTrend:
        "INSUFFICIENT_DATA",

      wicketTrend:
        "INSUFFICIENT_DATA",

      economyTrend:
        "INSUFFICIENT_DATA",
    };

    if (recentPerformances.length >= 2) {
      const first =
        recentPerformances[0];

      const latest =
        recentPerformances[
          recentPerformances.length - 1
        ];


      const runDifference =
        latest.runs -
        first.runs;

      let runTrend = "STABLE";

      if (runDifference > 0) {
        runTrend = "IMPROVING";
      } else if (
        runDifference < 0
      ) {
        runTrend = "DECLINING";
      }

      const strikeRateDifference =
        latest.strikeRate -
        first.strikeRate;

      let strikeRateTrend =
        "STABLE";

      if (
        strikeRateDifference > 0
      ) {
        strikeRateTrend =
          "IMPROVING";
      } else if (
        strikeRateDifference < 0
      ) {
        strikeRateTrend =
          "DECLINING";
      }


      const wicketDifference =
        latest.wickets -
        first.wickets;

      let wicketTrend = "STABLE";

      if (wicketDifference > 0) {
        wicketTrend =
          "IMPROVING";
      } else if (
        wicketDifference < 0
      ) {
        wicketTrend =
          "DECLINING";
      }


      const economyDifference =
        latest.economy -
        first.economy;

      let economyTrend = "STABLE";

      if (
        latest.oversBowled > 0 &&
        first.oversBowled > 0
      ) {
        if (
          economyDifference < 0
        ) {
          economyTrend =
            "IMPROVING";
        } else if (
          economyDifference > 0
        ) {
          economyTrend =
            "DECLINING";
        }
      }

      trendInformation = {
        chronologicalOrder:
          "OLDEST_TO_NEWEST",

        sampleSize:
          recentPerformances.length,

        runTrend,

        strikeRateTrend,

        wicketTrend,

        economyTrend,

        firstRuns:
          first.runs,

        latestRuns:
          latest.runs,

        firstStrikeRate:
          first.strikeRate,

        latestStrikeRate:
          latest.strikeRate,

        firstWickets:
          first.wickets,

        latestWickets:
          latest.wickets,

        firstEconomy:
          first.economy,

        latestEconomy:
          latest.economy,
      };
    }

    let sampleSizeAssessment =
      "LOW";

    if (features.matches >= 10) {
      sampleSizeAssessment =
        "HIGH";
    } else if (features.matches >= 5) {
      sampleSizeAssessment =
        "MEDIUM";
    }

    const sourceCounts =
      recentPerformances.reduce(
        (counts, performance) => {
          const source =
            performance.source ||
            "UNKNOWN";

          counts[source] =
            (counts[source] || 0) + 1;

          return counts;
        },
        {}
      );

    const prompt = `
You are CricketIQ, an AI-powered cricket performance coach.

Your job is to provide practical and personalized coaching guidance
based ONLY on the player's provided statistics, calculated features,
recent performances, and calculated trends.

You must NOT invent information.

========================
PLAYER
========================

Name: ${player.name}
Role: ${player.role}
Age: ${player.age}

========================
AGGREGATED PERFORMANCE
========================

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

========================
ML PREDICTION
========================

Potential Score: ${prediction.potentialScore}
Potential Level: ${prediction.potentialLevel}
Prediction Class: ${prediction.prediction}

IMPORTANT:

The ML prediction is ONLY a predictive signal.

It is NOT proof that the player will succeed in the future.

Do NOT use the ML potential score as the primary reason
for recommending a training area.

Coaching recommendations must primarily come from:
- observed performance
- recent performance
- calculated trends
- role-specific statistics

========================
RECENT PERFORMANCES
========================

The performances below are ordered:

OLDEST → NEWEST

Sequence 1 = oldest available recent performance.
Sequence ${recentPerformances.length} = newest performance.

${JSON.stringify(
  recentPerformances,
  null,
  2
)}

========================
TREND INFORMATION
========================

${JSON.stringify(
  trendInformation,
  null,
  2
)}

========================
PERFORMANCE SOURCES
========================

${JSON.stringify(
  sourceCounts,
  null,
  2
)}

The source field means:

PLAYER:
Performance data reported by the player.

COACH:
Performance data reported by the coach.

UNIFIED:
Performance data produced after the player and coach
performance reports have been combined/verified by CricketIQ.

The source is informational context only.

Do NOT assume that PLAYER data is inaccurate.

Do NOT assume that COACH data is automatically better
unless the provided verification status/source indicates this.

========================
COACHING RULES
========================

1. Use ONLY the information provided.

2. Never invent:
   - injuries
   - fitness problems
   - training history
   - career history
   - opposition quality
   - match conditions
   - bowling type
   - batting technique
   - footwork
   - shot selection
   - bowling variations
   - psychological issues

3. Do not guarantee future performance.

4. Consider the player's role.

5. For a BATTER, focus primarily on:
   - runs
   - batting average
   - strike rate
   - boundaries
   - recent scoring pattern
   - consistency
   - power hitting

6. For a BOWLER, focus primarily on:
   - wickets
   - economy
   - runs conceded
   - bowling consistency
   - recent bowling performance

7. For an ALL-ROUNDER, consider both batting
   and bowling contributions.

8. Do not treat a role-irrelevant zero as automatically
   being a weakness.

9. Interpret recent performances chronologically.

10. The trend information provided above is calculated
    from oldest to newest performance.

11. Never reverse the trend.

For example:

82 → 45 → 23

means:

DECLINING

not improving.

12. If strike rate changes from:

151.85 → 145.16 → 121.05

the trend is:

DECLINING.

13. For economy:

A lower economy compared with the earlier performance
should be interpreted as improvement, assuming both
performances contain valid bowling data.

14. If there are only a few matches, explicitly state
    that recommendations are preliminary.

15. Training recommendations must be connected directly
    to observable performance metrics.

16. Do not recommend medical treatment, medication,
    supplements, injury rehabilitation, or fitness
    interventions that require information not provided.

17. Do not claim a technical weakness unless the available
    statistics provide reasonable evidence for discussing it.

18. Do not describe a metric as "poor" or "excellent"
    unless the provided information clearly supports it.

19. Prefer specific statistical observations.

20. The ML prediction should never override observed
    performance trends.

21. If the player's recent trend conflicts with the ML
    prediction, explicitly acknowledge the difference
    rather than forcing them to agree.

22. Short-term goals should be measurable whenever possible.

23. Recommendations should be practical for cricket training
    and directly connected to the player's available data.

24. Do not make recommendations that require information
    outside the provided data.

25. Write in plain, simple English suitable for a player reading their
own coaching plan on a phone — not analyst jargon. Avoid words like
"trajectory," "efficacy," or "optimize." Prefer short, direct sentences.
Explain any cricket-analytics term in plain words the first time it's
used.

========================
CONFIDENCE
========================

Use:

LOW:
Only a few matches are available.

MEDIUM:
A reasonable amount of performance history exists,
but more matches would improve confidence.

HIGH:
Sufficient performance history exists to support
a stronger assessment.

Current data-based sample assessment:

${sampleSizeAssessment}

========================
OUTPUT
========================

Return ONLY valid JSON.

Do not return Markdown.

Do not return code fences.

Do not return explanatory text outside the JSON.

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

The confidence field MUST be exactly:

LOW
MEDIUM
HIGH

Remember:

- Evidence-based.
- Practical.
- Role-specific.
- Chronological.
- Data-driven.
- Do not invent information.
- Do not exaggerate.
- Do not guarantee future performance.
- Do not confuse ML prediction with coaching evidence.
`;


    const response =
      await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

    let text =
      response.text.trim();

    text = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();


    const coaching =
      JSON.parse(text);

    const requiredFields = [
      "coachSummary",
      "priorityArea",
      "strengthToMaintain",
      "developmentAreas",
      "trainingFocus",
      "matchPreparation",
      "shortTermGoals",
      "dataLimitations",
      "confidence",
    ];

    for (const field of requiredFields) {
      if (
        coaching[field] === undefined
      ) {
        throw new Error(
          `AI Coach response missing field: ${field}`
        );
      }
    }

    if (
      ![
        "LOW",
        "MEDIUM",
        "HIGH",
      ].includes(
        coaching.confidence
      )
    ) {
      throw new Error(
        "Invalid AI Coach confidence value"
      );
    }

    return coaching;

  } catch (error) {

    console.error(
      "Gemini AI Coach Service Error:",
      error.response?.data ||
        error.message
    );

    throw new Error(
      "Unable to generate personalized coaching"
    );
  }
};

module.exports = {
  generatePlayerCoach,
};