"""Feature engineering for the housing price model."""

import pandas as pd


def bucket_rare_estates(
    df: pd.DataFrame, min_count: int, estate_col: str = "Estate"
) -> pd.DataFrame:
    """Group estates with fewer than min_count listings into 'Other'.

    Prevents one-hot encoding from producing near-empty columns for
    estates with only a handful of listings, and avoids the risk of a
    rare estate appearing in only one of the train/test splits.
    """
    df = df.copy()
    counts = df[estate_col].value_counts()
    frequent_estates = counts[counts >= min_count].index
    df[estate_col] = df[estate_col].where(df[estate_col].isin(frequent_estates), "Other")
    return df


def build_features(df: pd.DataFrame, config: dict) -> pd.DataFrame:
    """Bucket rare estates and one-hot encode Estate into model-ready features.

    Bedrooms and Bathrooms are left as-is (already clean small integers,
    scale-invariant for tree models, and interpretable as raw counts for
    linear models).
    """
    min_count = config["features"]["rare_estate_threshold"]
    df = bucket_rare_estates(df, min_count)
    df = pd.get_dummies(df, columns=["Estate"], drop_first=True)
    return df


def split_data(df: pd.DataFrame, config: dict):
    """Stratified train/test split on the bucketed Estate column.

    Stratification (rather than a plain random split) ensures each
    Estate bucket - including the smallest ones, down to
    rare_estate_threshold rows - is represented proportionally in both
    train and test, rather than risking a rare bucket landing almost
    entirely in one split by chance.
    """
    from sklearn.model_selection import train_test_split

    min_count = config["features"]["rare_estate_threshold"]
    bucketed = bucket_rare_estates(df, min_count)

    train_df, test_df = train_test_split(
        bucketed,
        test_size=config["model"]["test_size"],
        random_state=config["model"]["random_state"],
        stratify=bucketed["Estate"],
    )

    train_features = pd.get_dummies(train_df, columns=["Estate"], drop_first=True)
    test_features = pd.get_dummies(test_df, columns=["Estate"], drop_first=True)

    return train_features, test_features
