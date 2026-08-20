"""Generate predictions from a saved model artifact."""

import pandas as pd

from src.models.train import load_model


def predict(model_name: str, X: pd.DataFrame, config: dict) -> pd.Series:
    """Predict Price_Ksh for new feature rows using a saved model."""
    model = load_model(model_name, config)
    return pd.Series(model.predict(X), index=X.index, name="predicted_price_ksh")
