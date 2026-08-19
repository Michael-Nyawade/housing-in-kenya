"""Tests for src/data/preprocess.py and src/features/feature_engineering.py."""

import pandas as pd

from src.data.preprocess import clean_data
from src.features.feature_engineering import bucket_rare_estates, split_X_y


def _raw_row(price="KSh 100,000", neighborhood="Kilimani, Dagoretti North", **overrides):
    """Build one raw-schema row, with sensible defaults, as a single-row DataFrame."""
    row = {
        "Agency": "Some Agency",
        "Neighborhood": neighborhood,
        "Price": price,
        "link": "/listings/example",
        "sq_mtrs": 100.0,
        "Bedrooms": 3.0,
        "Bathrooms": 2.0,
    }
    row.update(overrides)
    return row


def test_clean_data_parses_price_and_renames_column():
    df = pd.DataFrame([_raw_row(price="KSh 155,000")])
    result = clean_data(df)
    assert "Price_Ksh" in result.columns
    assert "Price" not in result.columns
    assert result.iloc[0]["Price_Ksh"] == 155000.0


def test_clean_data_derives_estate_and_strips_whitespace():
    df = pd.DataFrame([_raw_row(neighborhood="Hatheru Rd,, Lavington, Dagoretti North")])
    result = clean_data(df)
    assert result.iloc[0]["Estate"] == "Dagoretti North"
    assert not result.iloc[0]["Estate"].startswith(" ")


def test_clean_data_drops_unused_columns():
    df = pd.DataFrame([_raw_row()])
    result = clean_data(df)
    for col in ["Agency", "link", "sq_mtrs", "Neighborhood"]:
        assert col not in result.columns


def test_clean_data_drops_rows_with_missing_values():
    df = pd.DataFrame([
        _raw_row(),
        _raw_row(Bathrooms=None),
    ])
    result = clean_data(df)
    assert len(result) == 1


def test_clean_data_casts_bedrooms_and_bathrooms_to_int():
    df = pd.DataFrame([_raw_row(Bedrooms=4.0, Bathrooms=2.0)])
    result = clean_data(df)
    assert result.iloc[0]["Bedrooms"] == 4
    assert result.iloc[0]["Bathrooms"] == 2
    assert pd.api.types.is_integer_dtype(result["Bedrooms"])


def test_bucket_rare_estates_keeps_frequent_estates():
    df = pd.DataFrame({"Estate": ["Westlands"] * 5 + ["Kilimani"] * 5})
    result = bucket_rare_estates(df, min_count=5)
    assert set(result["Estate"]) == {"Westlands", "Kilimani"}


def test_bucket_rare_estates_groups_rare_estates_into_other():
    df = pd.DataFrame({"Estate": ["Westlands"] * 5 + ["Rareville"] * 2})
    result = bucket_rare_estates(df, min_count=5)
    assert (result.loc[df["Estate"] == "Rareville", "Estate"] == "Other").all()
    assert (result.loc[df["Estate"] == "Westlands", "Estate"] == "Westlands").all()


def test_bucket_rare_estates_boundary_is_inclusive():
    # Exactly min_count rows should be KEPT, not bucketed - value_counts >= min_count.
    df = pd.DataFrame({"Estate": ["Boundary"] * 5 + ["Westlands"] * 5})
    result = bucket_rare_estates(df, min_count=5)
    assert "Boundary" in set(result["Estate"])


def test_split_X_y_removes_target_from_features():
    df = pd.DataFrame({"Price_Ksh": [100.0, 200.0], "Bedrooms": [2, 3]})
    X, y = split_X_y(df)
    assert "Price_Ksh" not in X.columns
    assert list(y) == [100.0, 200.0]
