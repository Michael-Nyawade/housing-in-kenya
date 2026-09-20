"""Streamlit app for the housing-in-kenya rental price predictor."""

import sys
from pathlib import Path

import altair as alt
import pandas as pd
import streamlit as st

# Make src/ importable regardless of where Streamlit is launched from.
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from src.data.load_data import load_config
from src.models.train import load_model

APP_DIR = Path(__file__).resolve().parent


@st.cache_resource
def get_model_and_config():
    config = load_config(str(project_root / "config.yaml"))
    model = load_model("linear_regression", config)
    return model, config


@st.cache_data
def get_estate_summary():
    return pd.read_csv(APP_DIR / "data" / "estate_price_summary.csv")


def build_feature_row(model, bedrooms: int, bathrooms: int, estate: str) -> pd.DataFrame:
    """Construct a single-row feature DataFrame matching the model's expected columns.

    Any Estate not present as a column (the one dropped as the baseline
    category during training) is correctly represented by leaving every
    Estate_* column at 0 - no hardcoded assumption about which estate
    that is.
    """
    row = {col: 0 for col in model.feature_names_in_}
    row["Bedrooms"] = bedrooms
    row["Bathrooms"] = bathrooms

    estate_col = f"Estate_{estate}"
    if estate_col in row:
        row[estate_col] = 1

    return pd.DataFrame([row], columns=model.feature_names_in_)


def main():
    st.set_page_config(
        page_title="Housing in Kenya - Price Predictor",
        page_icon="🏠",
        layout="wide",
    )
    st.title("Housing in Kenya: Rental Price Predictor")
    st.markdown(
        "Estimate monthly rental price (KSh) from bedrooms, bathrooms, and estate, "
        "using a Linear Regression model trained on Kenyan rental listings."
    )

    model, config = get_model_and_config()
    estate_summary = get_estate_summary()
    estate_options = sorted(estate_summary["Estate"])

    left, right = st.columns([1, 1])

    with left:
        st.header("Predict a price")
        col1, col2 = st.columns(2)
        with col1:
            bedrooms = st.number_input("Bedrooms", min_value=0, max_value=10, value=3, step=1)
        with col2:
            bathrooms = st.number_input("Bathrooms", min_value=1, max_value=10, value=2, step=1)

        estate = st.selectbox("Estate", estate_options, index=estate_options.index("Westlands"))

        if st.button("Predict price"):
            X = build_feature_row(model, bedrooms, bathrooms, estate)
            prediction = model.predict(X)[0]
            st.metric("Predicted monthly rent", f"KSh {prediction:,.0f}")
            st.caption(
                "This model explains roughly 47% of the variance in price (R² ≈ 0.47). "
                "Predictions are a rough estimate, not an appraisal - factors like exact "
                "amenities, building condition, and agency aren't captured in this data."
            )

    with right:
        st.header("Average price by estate")
        chart = (
            alt.Chart(estate_summary)
            .mark_bar()
            .encode(
                x=alt.X("Estate", sort="-y", title="Estate"),
                y=alt.Y("mean_price_ksh", title="Mean price (KSh)"),
                tooltip=["Estate", "mean_price_ksh"],
            )
        )
        st.altair_chart(chart, width="stretch")
        st.caption(
            "Estates with fewer than 10 listings in the training data are grouped into 'Other'."
        )


if __name__ == "__main__":
    main()
