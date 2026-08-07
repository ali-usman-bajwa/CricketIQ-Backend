import os
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

DATA_PATH = os.path.join(
    BASE_DIR,
    "data",
    "players.csv"
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "player_potential_model.pkl"
)

data = pd.read_csv(DATA_PATH)

print("Dataset loaded successfully.")
print(f"Total records: {len(data)}")


print("\nDataset columns:")
print(data.columns.tolist())

print("\nPotential distribution:")
print(data["potential"].value_counts())


X = data.drop(
    "potential",
    axis=1
)

y = data["potential"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


print("\nTraining records:")
print(len(X_train))

print("Testing records:")
print(len(X_test))


model = RandomForestClassifier(
    n_estimators=200,
    max_depth=8,
    random_state=42,
    class_weight="balanced"
)

print("\nTraining model...")

model.fit(
    X_train,
    y_train
)

print("Model trained successfully.")


predictions = model.predict(
    X_test
)


accuracy = accuracy_score(
    y_test,
    predictions
)

print("\n================")
print("MODEL ACCURACY")
print("==================")

print(
    f"{accuracy:.2%}"
)


print("\n======================")
print("CLASSIFICATION REPORT")
print("========================")

print(
    classification_report(
        y_test,
        predictions,
        zero_division=0
    )
)


print("\n================")
print("CONFUSION MATRIX")
print("==================")

print(
    confusion_matrix(
        y_test,
        predictions
    )
)


feature_importance = pd.DataFrame({

    "feature": X.columns,

    "importance": model.feature_importances_

})


feature_importance = (
    feature_importance
    .sort_values(
        by="importance",
        ascending=False
    )
)


print("\n===================")
print("FEATURE IMPORTANCE")
print("=====================")

print(
    feature_importance.to_string(
        index=False
    )
)

os.makedirs(
    os.path.dirname(MODEL_PATH),
    exist_ok=True
)


joblib.dump(
    model,
    MODEL_PATH
)


print("\n===========")
print("MODEL SAVED")
print("=============")

print(
    MODEL_PATH
)