"""Evaluate a trained model against the test set and log the results."""

import csv
from datetime import datetime
from pathlib import Path

from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from src.models.train import load_model


def compute_metrics(model, X_test, y_test) -> dict:
    """Compute RMSE, MAE, and R^2 for a model's predictions on the test set."""
    predictions = model.predict(X_test)
    rmse = mean_squared_error(y_test, predictions) ** 0.5
    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)
    return {"rmse": rmse, "mae": mae, "r2": r2}


def log_run(model_name: str, hyperparameters: dict, metrics: dict, config: dict) -> None:
    """Append a run's results to the run log, creating it with a header if new."""
    log_path = Path(config["output"]["run_log"])
    log_path.parent.mkdir(parents=True, exist_ok=True)
    file_exists = log_path.exists()

    with open(log_path, "a", newline="") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["timestamp", "model_name", "hyperparameters", "rmse", "mae", "r2"])
        writer.writerow([
            datetime.now().isoformat(timespec="seconds"),
            model_name,
            hyperparameters,
            f"{metrics['rmse']:.2f}",
            f"{metrics['mae']:.2f}",
            f"{metrics['r2']:.4f}",
        ])


def evaluate_model(model_name: str, X_test, y_test, config: dict) -> dict:
    """Load a saved model, score it on the test set, and log the run."""
    model = load_model(model_name, config)
    metrics = compute_metrics(model, X_test, y_test)
    log_run(model_name, model.get_params(), metrics, config)
    return metrics
