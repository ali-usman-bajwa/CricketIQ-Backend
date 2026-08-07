import os
import random
import pandas as pd


NUM_PLAYERS = 1000

random.seed(42)

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

DATA_DIR = os.path.join(
    BASE_DIR,
    "data"
)

DATA_PATH = os.path.join(
    DATA_DIR,
    "players.csv"
)

os.makedirs(DATA_DIR, exist_ok=True)

records = []


for _ in range(NUM_PLAYERS):

    age = random.randint(18, 35)

    matches = random.randint(10, 80)

    batting_average = round(
        random.uniform(20, 55),
        2
    )

    strike_rate = round(
        random.uniform(90, 160),
        2
    )

    matches_factor = matches / 50

    total_runs = int(
        batting_average
        * matches
        * random.uniform(0.8, 1.2)
    )

    fours = int(
        total_runs
        / random.uniform(8, 15)
    )

    sixes = int(
        total_runs
        / random.uniform(20, 40)
    )

    total_wickets = random.randint(
        0,
        60
    )

    if total_wickets > 0:
        economy = round(
            random.uniform(5.0, 9.5),
            2
        )
    else:
        economy = 0

    consistency = round(
        random.uniform(45, 95),
        2
    )

    recent_form = round(
        random.uniform(45, 100),
        2
    )


    potential_score = (

        batting_average * 1.2

        + strike_rate * 0.25

        + recent_form * 0.25

        + consistency * 0.15

        + matches_factor * 10

        + total_wickets * 0.15

    )


    potential = (
        1
        if potential_score >= 110
        else 0
    )


    records.append({

        "age": age,

        "matches": matches,

        "totalRuns": total_runs,

        "battingAverage": batting_average,

        "strikeRate": strike_rate,

        "fours": fours,

        "sixes": sixes,

        "totalWickets": total_wickets,

        "economy": economy,

        "recentForm": recent_form,

        "consistency": consistency,

        "potential": potential,
    })



data = pd.DataFrame(records)

data.to_csv(
    DATA_PATH,
    index=False
)

print(
    "Dataset generated successfully."
)

print(
    f"Total records: {len(data)}"
)

print(
    f"Potential = 1: "
    f"{(data['potential'] == 1).sum()}"
)

print(
    f"Potential = 0: "
    f"{(data['potential'] == 0).sum()}"
)

print(
    f"Saved to: {DATA_PATH}"
)