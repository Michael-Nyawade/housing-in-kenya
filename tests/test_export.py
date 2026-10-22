"""Tests for src/models/export.py."""

import json

import pandas as pd
import pytest
from sklearn.linear_model import LinearRegression

from src.features.feature_engineering import bucket_rare_estates, split_X_y
from src.models.export import (
    build_insights,
    build_model_payload,
    build_parity_cases,
    export_web_data,
)
from src.models.train import save_model, train_model

METRICS = {"linear_regression": {"rmse": 1.0, "mae": 1.0, "r2": 0.5}}


def _config(tmp_path):
    return {
        "features": {"rare_estate_threshold": 5},
        "model": {"random_state": 42, "test_size": 0.2},
        "model_params": {"random_forest": {"n_estimators": 5}},
        "output": {
            "models_dir": str(tmp_path / "models"),
            "web_data_dir": str(tmp_path / "web_data"),
            "primary_model": "linear_regression",
        },
    }


def _toy_clean():
    """14 listings: estates A and B are frequent, C is rare and becomes 'Other'."""
    rows = []
    for estate, count in (("A", 6), ("B", 6), ("C", 2)):
        for i in range(count):
            price = 20000.0 + 7000 * i + 1500 * (i % 3)
            price += {"A": 0, "B": 15000, "C": 5000}[estate]
            rows.append(
                {"Price_Ksh": price, "Bedrooms": i % 4, "Bathrooms": 1 + (i % 3), "Estate": estate}
            )
    return pd.DataFrame(rows)


def _toy_model(clean, config):
    bucketed = bucket_rare_estates(clean, config["features"]["rare_estate_threshold"])
    features = pd.get_dummies(bucketed, columns=["Estate"], drop_first=True)
    X, y = split_X_y(features)
    return LinearRegression().fit(X, y), X, y


def test_model_payload_identifies_baseline_and_coefficients(tmp_path):
    config = _config(tmp_path)
    clean = _toy_clean()
    model, _, _ = _toy_model(clean, config)

    payload = build_model_payload(model, ["A", "B", "Other"], clean, METRICS, 3, config)

    assert payload["baseline_estate"] == "A"
    assert payload["intercept"] == float(model.intercept_)
    assert list(payload["coefficients"]) == list(model.feature_names_in_)
    assert payload["input_ranges"]["bedrooms"] == {"min": 0, "max": 3}
    assert payload["input_ranges"]["bathrooms"] == {"min": 1, "max": 3}


def test_model_payload_rejects_stale_model(tmp_path):
    config = _config(tmp_path)
    clean = _toy_clean()
    model, _, _ = _toy_model(clean, config)

    # The model has an Estate_B column, but "B" is missing from the categories.
    with pytest.raises(ValueError):
        build_model_payload(model, ["A", "Other"], clean, METRICS, 3, config)


def test_model_payload_requires_exactly_one_baseline(tmp_path):
    config = _config(tmp_path)
    clean = _toy_clean()
    model, _, _ = _toy_model(clean, config)

    # "Z" has no dummy column either, so there would be two baselines.
    with pytest.raises(ValueError):
        build_model_payload(model, ["A", "B", "Other", "Z"], clean, METRICS, 3, config)


def test_parity_cases_match_the_intercept_plus_weighted_sum_formula(tmp_path):
    config = _config(tmp_path)
    clean = _toy_clean()
    model, _, _ = _toy_model(clean, config)
    categories = ["A", "B", "Other"]

    cases = build_parity_cases(model, categories)
    coefs = dict(zip(model.feature_names_in_, model.coef_))

    assert len(cases) == len(categories) * 4 * 3
    for case in cases:
        expected = (
            model.intercept_
            + coefs["Bedrooms"] * case["bedrooms"]
            + coefs["Bathrooms"] * case["bathrooms"]
            + coefs.get(f"Estate_{case['estate']}", 0.0)
        )
        assert case["predicted_price"] == pytest.approx(expected, rel=1e-9, abs=1e-6)


def test_insights_aggregates_are_consistent():
    clean = _toy_clean()
    bucketed = bucket_rare_estates(clean, 5)

    insights = build_insights(clean, bucketed, len(clean) + 3, {"features": {"rare_estate_threshold": 5}})

    assert insights["dataset"]["rows_removed"] == 3
    assert sum(e["listings"] for e in insights["by_estate"]) == len(clean)

    means = [e["mean_price"] for e in insights["by_estate"]]
    assert means == sorted(means, reverse=True)

    bedrooms = [b["bedrooms"] for b in insights["by_bedrooms"]]
    assert bedrooms == sorted(bedrooms)

    assert sum(b["listings"] for b in insights["price_distribution"]) == len(clean)
    assert {e["estate"] for e in insights["by_estate_group"]} == {"A", "B", "Other"}


def test_export_writes_valid_json_files(tmp_path):
    config = _config(tmp_path)
    clean = _toy_clean()
    model, X, y = _toy_model(clean, config)
    save_model(model, "linear_regression", config)

    paths = export_web_data(config, clean, X, y, len(clean) + 3, ["linear_regression"])

    assert {p.name for p in paths} == {"model.json", "insights.json", "parity_cases.json"}
    payload = json.loads((tmp_path / "web_data" / "model.json").read_text())
    assert set(payload["metrics"]["linear_regression"]) == {"rmse", "mae", "r2"}
    assert payload["baseline_estate"] == "A"


def test_export_rejects_a_non_linear_primary_model(tmp_path):
    config = _config(tmp_path)
    config["output"]["primary_model"] = "random_forest"
    clean = _toy_clean()
    _, X, y = _toy_model(clean, config)
    save_model(train_model("random_forest", X, y, config), "random_forest", config)

    with pytest.raises(ValueError):
        export_web_data(config, clean, X, y, len(clean), ["random_forest"])
