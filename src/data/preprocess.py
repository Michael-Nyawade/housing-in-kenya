"""Functions for cleaning the raw housing dataset."""

from pathlib import Path

import pandas as pd


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Clean the raw housing dataframe into its analysis-ready form.

      1. Drop rows with any missing values.
      2. Drop unused columns: link, Agency, sq_mtrs.
      3. Derive `Estate` from `Neighborhood` (last comma-separated token).
      4. Parse `Price` ("KSh 100,000" -> 100000.0), rename to Price_Ksh.
      5. Cast Bedrooms/Bathrooms to int.
    """
    df = df.dropna()

    df = df.drop(columns=["link", "Agency", "sq_mtrs"])

    df["Estate"] = df["Neighborhood"].str.split(",").apply(lambda parts: parts[-1].strip())
    df = df.drop(columns=["Neighborhood"])

    df["Price"] = (
        df["Price"]
        .str.replace("KSh ", "", regex=False)
        .str.replace(",", "", regex=False)
        .astype(float)
    )
    df = df.rename(columns={"Price": "Price_Ksh"})

    df[["Bedrooms", "Bathrooms"]] = df[["Bedrooms", "Bathrooms"]].astype(int)

    return df


def save_processed_data(df: pd.DataFrame, config: dict) -> None:
    """Save the cleaned dataframe to the processed data directory."""
    processed_dir = Path(config["data"]["processed"])
    processed_dir.mkdir(parents=True, exist_ok=True)
    filename = config["data"]["processed_filename"]
    df.to_csv(processed_dir / filename, index=False)
