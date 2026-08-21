export interface CricketTip {
  title: string;
  description: string;
  icon: string;
}

export const TIPS_BY_ROLE: Record<string, CricketTip[]> = {
  Batter: [
    { title: "Watch the ball, not the bowler", description: "Keep your eyes on the ball from the bowler's hand all the way to the bat — head position matters more than footwork.", icon: "eye-outline" },
    { title: "Play close to your body", description: "Keeping your bat and pads close together reduces the gap the ball can sneak through.", icon: "body-outline" },
    { title: "Rotate strike early", description: "Singles and twos build innings and ease pressure — boundaries will come once you're set.", icon: "swap-horizontal-outline" },
  ],
  Bowler: [
    { title: "Consistency over pace", description: "A tight line and length beats raw speed — most wickets come from pressure built over overs, not one unplayable ball.", icon: "locate-outline" },
    { title: "Vary your pace", description: "A well-disguised slower ball is one of the most effective wicket-taking deliveries in the game.", icon: "speedometer-outline" },
    { title: "Set the field with intent", description: "Talk to your captain about field placements that match your plan for each batter, not a generic setup.", icon: "grid-outline" },
  ],
  "All-Rounder": [
    { title: "Know your primary role each match", description: "Even as an all-rounder, decide before the game whether you're batting-first or bowling-first that day — it sharpens your focus.", icon: "sync-outline" },
    { title: "Manage your energy", description: "Bowling and batting in the same match is demanding — pace your intensity so you're sharp for both.", icon: "battery-charging-outline" },
    { title: "Communicate with your captain", description: "Make sure the team knows how you're feeling physically so your overs/batting order can be planned around it.", icon: "chatbubbles-outline" },
  ],
  "Wicket-Keeper": [
    { title: "Stay low and still", description: "A stable, low stance behind the stumps gives you more time to react to any deviation.", icon: "arrow-down-outline" },
    { title: "Call the game", description: "Keepers see the whole field — communicate with bowlers and fielders constantly, it's part of the job.", icon: "megaphone-outline" },
    { title: "Practice without the ball", description: "Footwork and glove position drills without a ball build the muscle memory that matters most under pressure.", icon: "footsteps-outline" },
  ],
};

export const GENERAL_TIPS: CricketTip[] = [
  { title: "Play at least 3 matches", description: "CricketIQ needs a minimum of 3 recorded performances to generate reliable stats and AI insights for you.", icon: "stats-chart-outline" },
  { title: "Submit your performance promptly", description: "Head to the Performance tab after every completed match to log your runs, balls, and dismissals.", icon: "create-outline" },
];