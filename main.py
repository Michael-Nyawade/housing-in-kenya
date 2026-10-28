"""Pipeline entry point for the housing-in-kenya project.

Usage:
    python main.py                     # run the full pipeline
    python main.py --stage clean       # just load + clean the data
    python main.py --stage visualize   # clean, then regenerate the 3 EDA charts
    python main.py --stage features    # clean, then build features + split
    python main.py --stage train       # ...then train both models
    python main.py --stage evaluate    # ...then evaluate both models
    python main.py --stage export      # ...train, then write the website's data files
"""

import argparse

from src.data.load_data import load_config, load_raw_data
from src.data.preprocess import clean_data, describe_data, save_processed_data
from src.features.feature_engineering import split_data, split_X_y
from src.models.evaluate import evaluate_model
from src.models.export import export_web_data
from src.models.train import save_model, train_model
from src.visualization.plots import (
    plot_price_by_bedrooms_bathrooms,
    plot_price_by_estate,
    plot_price_distribution,
)

MODEL_NAMES = ["linear_regression", "random_forest"]


def run_clean(config):
    raw = load_raw_data(config)
    clean = clean_data(raw)
    save_processed_data(clean, config)
    print(f"Cleaned data: {clean.shape[0]} rows, {clean.shape[1]} columns")
    print()
    print("Descriptive statistics:")
    print(describe_data(clean))
    return clean


def run_visualize(config, clean):
    print()
    print("Generating EDA charts...")
    plot_price_distribution(clean, "reports/figures/price_distribution.png")
    plot_price_by_estate(clean, "reports/figures/price_by_estate.png")
    plot_price_by_bedrooms_bathrooms(clean, "reports/figures/price_by_bedrooms_bathrooms.png")
    print("Saved 3 EDA charts to reports/figures/")


def run_features(config, clean):
    print()
    print("Building features and splitting data...")
    train_df, test_df = split_data(clean, config)
    X_train, y_train = split_X_y(train_df)
    X_test, y_test = split_X_y(test_df)
    print(f"Train: {X_train.shape}, Test: {X_test.shape}")
    return X_train, y_train, X_test, y_test


def run_train(config, X_train, y_train):
    print()
    print("Training models...")
    for model_name in MODEL_NAMES:
        model = train_model(model_name, X_train, y_train, config)
        save_model(model, model_name, config)
        print(f"Trained and saved {model_name}")


def run_evaluate(config, X_test, y_test):
    print()
    print("Evaluating models...")
    for model_name in MODEL_NAMES:
        metrics = evaluate_model(model_name, X_test, y_test, config)
        print(f"{model_name}: {metrics}")


def run_export(config, clean, X_test, y_test):
    print()
    print("Exporting website data...")
    rows_raw = len(load_raw_data(config))
    for path in export_web_data(config, clean, X_test, y_test, rows_raw, MODEL_NAMES):
        print(f"Wrote {path}")


def main():
    parser = argparse.ArgumentParser(description="Housing-in-Kenya pipeline")
    parser.add_argument(
        "--stage",
        choices=["clean", "visualize", "features", "train", "evaluate", "export", "all"],
        default="all",
        help="Which pipeline stage to run (default: all)",
    )
    stage = parser.parse_args().stage

    config = load_config()
    clean = run_clean(config)
    if stage == "clean":
        return

    if stage in ("visualize", "all"):
        run_visualize(config, clean)
        if stage == "visualize":
            return

    X_train, y_train, X_test, y_test = run_features(config, clean)
    if stage == "features":
        return

    run_train(config, X_train, y_train)
    if stage == "train":
        return

    if stage in ("evaluate", "all"):
        run_evaluate(config, X_test, y_test)
        if stage == "evaluate":
            return

    run_export(config, clean, X_test, y_test)


if __name__ == "__main__":
    main()
