"""Train and persist housing price models."""

import pickle
from pathlib import Path

from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression

MODEL_REGISTRY = {
    "linear_regression": LinearRegression,
    "random_forest": RandomForestRegressor,
}


def get_model(model_name: str, config: dict):
    """Instantiate a model by name using hyperparameters from config."""
    if model_name not in MODEL_REGISTRY:
        raise ValueError(f"Unknown model_name '{model_name}'. Options: {list(MODEL_REGISTRY)}")

    model_cls = MODEL_REGISTRY[model_name]
    params = dict(config.get("model_params", {}).get(model_name, {}))

    if model_name == "random_forest":
        params["random_state"] = config["model"]["random_state"]

    return model_cls(**params)


def train_model(model_name: str, X_train, y_train, config: dict):
    """Fit a model on the training set and return it."""
    model = get_model(model_name, config)
    model.fit(X_train, y_train)
    return model


def save_model(model, model_name: str, config: dict) -> Path:
    """Save a fitted model artifact to the models directory."""
    models_dir = Path(config["output"]["models_dir"])
    models_dir.mkdir(parents=True, exist_ok=True)
    path = models_dir / f"{model_name}.pkl"
    with open(path, "wb") as f:
        pickle.dump(model, f)
    return path


def load_model(model_name: str, config: dict):
    """Load a previously saved model artifact."""
    models_dir = Path(config["output"]["models_dir"])
    path = models_dir / f"{model_name}.pkl"
    with open(path, "rb") as f:
        return pickle.load(f)
