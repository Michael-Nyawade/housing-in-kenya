"""Tests for src/models/train.py and src/models/evaluate.py."""

import pandas as pd

from src.models.evaluate import compute_metrics
from src.models.train import get_model, train_model

TEST_CONFIG = {
    "model": {"random_state": 42},
    "model_params": {"random_forest": {"n_estimators": 5}},
}


def _toy_data():
    X = pd.DataFrame({"Bedrooms": [1, 2, 3, 4, 5, 6], "Bathrooms": [1, 1, 2, 2, 3, 3]})
    y = pd.Series([50000.0, 70000.0, 90000.0, 110000.0, 130000.0, 150000.0])
    return X, y


def test_get_model_raises_on_unknown_model_name():
    try:
        get_model("not_a_real_model", TEST_CONFIG)
        assert False, "Expected ValueError for an unknown model name"
    except ValueError:
        pass


def test_train_model_returns_a_fitted_model():
    X, y = _toy_data()
    model = train_model("linear_regression", X, y, TEST_CONFIG)
    assert hasattr(model, "predict")
    predictions = model.predict(X)
    assert len(predictions) == len(X)


def test_random_forest_uses_configured_hyperparameters():
    X, y = _toy_data()
    model = train_model("random_forest", X, y, TEST_CONFIG)
    assert model.n_estimators == 5
    assert model.random_state == 42


def test_compute_metrics_returns_expected_keys():
    X, y = _toy_data()
    model = train_model("linear_regression", X, y, TEST_CONFIG)
    metrics = compute_metrics(model, X, y)
    assert set(metrics.keys()) == {"rmse", "mae", "r2"}
    assert all(isinstance(v, float) for v in metrics.values())
