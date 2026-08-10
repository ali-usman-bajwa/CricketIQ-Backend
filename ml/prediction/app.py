from flask import Flask, request, jsonify
import pandas as pd
import joblib
import os

app = Flask(__name__)

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "player_potential_model.pkl"
)

model = joblib.load(MODEL_PATH)

print("ML model loaded successfully.")


# =====================================================
# PREDICT PLAYER POTENTIAL
# =====================================================

@app.route("/predict", methods=["POST"])
def predict():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "Request body is required"
            }), 400

        required_features = [
            "age",
            "matches",
            "totalRuns",
            "battingAverage",
            "strikeRate",
            "fours",
            "sixes",
            "totalWickets",
            "economy",
            "recentForm",
            "consistency"
        ]

        # =================================================
        # CHECK MISSING FEATURES
        # =================================================

        missing_features = [
            feature
            for feature in required_features
            if feature not in data
        ]

        if missing_features:
            return jsonify({
                "success": False,
                "message": "Missing required features",
                "missing": missing_features
            }), 400

        # =================================================
        # BUILD MODEL INPUT
        # =================================================

        input_data = pd.DataFrame(
            [[
                data[feature]
                for feature in required_features
            ]],
            columns=required_features
        )

        # =================================================
        # MODEL PREDICTION
        # =================================================

        prediction = model.predict(
            input_data
        )[0]

        probabilities = model.predict_proba(
            input_data
        )[0]

        # =================================================
        # POTENTIAL SCORE
        # =================================================

        potential_score = (
            probabilities[1] * 100
        )

        # =================================================
        # POTENTIAL LEVEL
        # =================================================

        if potential_score >= 75:

            potential_level = "HIGH"

        elif potential_score >= 50:

            potential_level = "MEDIUM"

        else:

            potential_level = "LOW"

        # =================================================
        # RESPONSE
        # =================================================

        return jsonify({

            "success": True,

            "prediction": int(
                prediction
            ),

            "potentialScore": round(
                float(potential_score),
                2
            ),

            "potentialLevel":
                potential_level

        })

    except Exception as error:

        print(
            "Prediction Error:",
            str(error)
        )

        return jsonify({

            "success": False,

            "message":
                "Unable to generate prediction"

        }), 500


# =====================================================
# HEALTH CHECK
# =====================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({

        "success": True,

        "message":
            "CricketIQ ML Service is running"

    })


# =====================================================
# START SERVER
# =====================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=8000,
        debug=True
    )