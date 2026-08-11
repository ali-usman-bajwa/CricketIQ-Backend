import os
import numpy as np
import pandas as pd


NUM_PLAYERS = 1000

np.random.seed(42)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DATA_PATH = os.path.join(DATA_DIR, "players.csv")

os.makedirs(DATA_DIR, exist_ok=True)

records = []

for _ in range(NUM_PLAYERS):
    
    true_talent = float(np.clip(np.random.normal(65, 15), 20, 100))
    
    age = int(np.random.randint(18, 35))

    matches = int(
        np.clip((age - 18) * 3.5 + np.random.uniform(-10, 10), 10, 80)
    )

    batting_average = round(float(np.clip(
        20 + true_talent * 0.35 + np.random.normal(0, 7), 15, 60
    )), 2)

    strike_rate = round(float(np.clip(
        90 + true_talent * 0.7 + np.random.normal(0, 10), 80, 170
    )), 2)

    recent_form = round(float(np.clip(
        true_talent + np.random.normal(0, 14), 20, 100
    )), 2)

    consistency = round(float(np.clip(
        30 + true_talent * 0.65 + np.random.normal(0, 10), 30, 98
    )), 2)

    total_runs = int(max(0, batting_average * matches * np.random.uniform(0.8, 1.2)))
    fours = int(total_runs / np.random.uniform(8, 15)) if total_runs > 0 else 0
    sixes = int(total_runs / np.random.uniform(20, 40)) if total_runs > 0 else 0

    total_wickets = int(np.clip(
        true_talent * 0.5 + np.random.normal(0, 15), 0, 70
    ))

    economy = (
        round(float(np.clip(9.5 - true_talent * 0.03 + np.random.normal(0, 0.9), 4.5, 10)), 2)
        if total_wickets > 0
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
        "_true_talent": true_talent,
    })


data = pd.DataFrame(records)

threshold = data["_true_talent"].median()

data["potential"] = (data["_true_talent"] >= threshold).astype(int)

data = data.drop(columns=["_true_talent"])

data.to_csv(DATA_PATH, index=False)

print("Dataset generated successfully.")
print(f"Total records: {len(data)}")
print(f"Potential = 1: {(data['potential'] == 1).sum()}")
print(f"Potential = 0: {(data['potential'] == 0).sum()}")
print(f"Saved to: {DATA_PATH}")