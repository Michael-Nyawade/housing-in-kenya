"""Export the trained primary model and dataset aggregates for the website.

The website predicts in the browser from the exported intercept and
coefficients, so no Python runtime is needed to serve it. Every file
written here is derived from the pipeline and should never be hand-edited.
"""

import json
from pathlib import Path

import numpy as np
import pandas as pd
import sklearn

from src.features.feature_engineering import bucket_rare_estates
from src.models.evaluate import compute_metrics
from src.models.train import load_model

ESTATE_PREFIX = "Estate_"
PRICE_BIN_WIDTH = 20_000


def _group_stats(df: pd.DataFrame, group_col: str, label: str, by_mean: bool) -> list:
    """Listing count, mean and median price for each value of group_col."""
    grouped = df.groupby(group_col)["Price_Ksh"].agg(["count", "mean", "median"])
    grouped = grouped.sort_values("mean", ascending=False) if by_mean else grouped.sort_index()
    return [
        {
            label: key.item() if hasattr(key, "item") else key,
            "listings": int(row["count"]),
            "mean_price": round(float(row["mean"]), 2),
            "median_price": round(float(row["median"]), 2),
        }
        for key, row in grouped.iterrows()
    ]


def build_insights(clean: pd.DataFrame, bucketed: pd.DataFrame, rows_raw: int, config: dict) -> dict:
    """Aggregates powering the Market insights page."""
    prices = clean["Price_Ksh"]
    upper = int(np.ceil(prices.max() / PRICE_BIN_WIDTH) * PRICE_BIN_WIDTH)
    edges = list(range(0, upper + 1, PRICE_BIN_WIDTH))
    counts, _ = np.histogram(prices, bins=edges)

    return {
        "dataset": {
            "rows_raw": int(rows_raw),
            "rows_clean": int(len(clean)),
            "rows_removed": int(rows_raw - len(clean)),
            "estates": int(clean["Estate"].nunique()),
            "rare_estate_threshold": config["features"]["rare_estate_threshold"],
        },
        "price_summary": {
            "min": float(prices.min()),
            "p25": float(prices.quantile(0.25)),
            "median": float(prices.median()),
            "mean": round(float(prices.mean()), 2),
            "p75": float(prices.quantile(0.75)),
            "max": float(prices.max()),
        },
        "price_distribution": [
            {"from": edges[i], "to": edges[i + 1], "listings": int(count)}
            for i, count in enumerate(counts)
        ],
        "by_estate": _group_stats(clean, "Estate", "estate", by_mean=True),
        "by_estate_group": _group_stats(bucketed, "Estate", "estate", by_mean=True),
        "by_bedrooms": _group_stats(clean, "Bedrooms", "bedrooms", by_mean=False),
        "by_bathrooms": _group_stats(clean, "Bathrooms", "bathrooms", by_mean=False),
    }


def build_model_payload(model, categories: list, clean: pd.DataFrame, metrics: dict,
                        n_test: int, config: dict) -> dict:
    """Everything the browser needs to reproduce the model's predictions."""
    feature_names = list(model.feature_names_in_)
    dummy_estates = {
        name[len(ESTATE_PREFIX):] for name in feature_names if name.startswith(ESTATE_PREFIX)
    }

    unknown = dummy_estates - set(categories)
    if unknown:
        raise ValueError(
            f"Model expects estates not found in the current data: {sorted(unknown)}. "
            "The saved model is out of date with the config; retrain it."
        )

    baseline = sorted(set(categories) - dummy_estates)
    if len(baseline) != 1:
        raise ValueError(f"Expected exactly one baseline estate, found: {baseline}")

    return {
        "model_name": config["output"]["primary_model"],
        "target": "Price_Ksh",
        "intercept": float(model.intercept_),
        "coefficients": {name: float(coef) for name, coef in zip(feature_names, model.coef_)},
        "estates": categories,
        "baseline_estate": baseline[0],
        "input_ranges": {
            "bedrooms": {"min": int(clean["Bedrooms"].min()), "max": int(clean["Bedrooms"].max())},
            "bathrooms": {"min": int(clean["Bathrooms"].min()), "max": int(clean["Bathrooms"].max())},
        },
        "metrics": metrics,
        "training": {
            "rows_clean": int(len(clean)),
            "rows_train": int(len(clean) - n_test),
            "rows_test": int(n_test),
            "test_size": config["model"]["test_size"],
            "random_state": config["model"]["random_state"],
            "rare_estate_threshold": config["features"]["rare_estate_threshold"],
            "sklearn_version": sklearn.__version__,
        },
    }


def build_parity_cases(model, categories: list) -> list:
    """Inputs paired with sklearn's predictions, used to test the TypeScript implementation."""
    feature_names = list(model.feature_names_in_)
    cases, rows = [], []

    for estate in categories:
        for bedrooms in (0, 2, 3, 6):
            for bathrooms in (1, 2, 6):
                row = {name: 0 for name in feature_names}
                row["Bedrooms"] = bedrooms
                row["Bathrooms"] = bathrooms
                estate_col = f"{ESTATE_PREFIX}{estate}"
                if estate_col in row:
                    row[estate_col] = 1
                rows.append(row)
                cases.append({"estate": estate, "bedrooms": bedrooms, "bathrooms": bathrooms})

    predictions = model.predict(pd.DataFrame(rows, columns=feature_names))
    for case, prediction in zip(cases, predictions):
        case["predicted_price"] = float(prediction)
    return cases


def export_web_data(config: dict, clean: pd.DataFrame, X_test, y_test,
                    rows_raw: int, model_names: list) -> list:
    """Write model.json, insights.json and parity_cases.json; return their paths."""
    primary_name = config["output"]["primary_model"]
    model = load_model(primary_name, config)
    if not (hasattr(model, "coef_") and hasattr(model, "intercept_")):
        raise ValueError(
            f"Primary model '{primary_name}' is not a linear model, so it cannot be "
            "exported as coefficients for in-browser prediction."
        )

    bucketed = bucket_rare_estates(clean, config["features"]["rare_estate_threshold"])
    categories = [str(estate) for estate in sorted(bucketed["Estate"].unique())]

    metrics = {}
    for name in model_names:
        values = compute_metrics(load_model(name, config), X_test, y_test)
        metrics[name] = {key: float(value) for key, value in values.items()}

    files = {
        "model.json": build_model_payload(model, categories, clean, metrics, len(X_test), config),
        "insights.json": build_insights(clean, bucketed, rows_raw, config),
        "parity_cases.json": build_parity_cases(model, categories),
    }

    out_dir = Path(config["output"]["web_data_dir"])
    out_dir.mkdir(parents=True, exist_ok=True)

    paths = []
    for filename, payload in files.items():
        path = out_dir / filename
        with open(path, "w") as f:
            json.dump(payload, f, indent=2)
            f.write("\n")
        paths.append(path)
    return paths
