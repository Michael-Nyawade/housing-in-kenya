# Housing in Kenya

Exploring the relationship between property size, location, and rental price in the Kenyan housing market, and predicting price from a small set of listing features.

**Live app:** [housing-in-kenya-lr.streamlit.app](https://housing-in-kenya-lr.streamlit.app/)

## Table of Contents

- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Data Source](#data-source)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Configuration](#configuration)
- [Running the Pipeline](#running-the-pipeline)
- [Web App](#web-app)
- [Data Preparation](#data-preparation)
- [Exploratory Data Analysis](#exploratory-data-analysis)
- [Modeling](#modeling)
- [Results](#results)
- [Recommendations](#recommendations)
- [Limitations](#limitations)

## Project Overview

The Kenyan housing market is shaped by numerous factors, among which size and location stand out. This project explores those dynamics through exploratory data analysis and predicts listing price (`Price_Ksh`) from `Bedrooms`, `Bathrooms`, and `Estate`. A [live web app](https://housing-in-kenya-lr.streamlit.app/) makes the predictor interactive.

## Problem Statement

Investors, homeowners, and policymakers need to understand how property size and location relate to price in order to navigate the Kenyan housing market. This project addresses that through EDA and a baseline predictive model.

**Note on terminology:** the dataset's `Price` values (roughly KSh 12,000 - 240,000) are consistent with *monthly rental prices*, not property sale prices, despite "housing prices" language used in the original data source.

## Data Source

Sourced from [Kaggle: Rental Apartments in Kenya](https://www.kaggle.com/datasets/iamasteriix/rental-apartments-in-kenya), CSV format. Original columns: `Agency`, `Neighborhood`, `Price`, `link`, `sq_mtrs`, `Bedrooms`, `Bathrooms`.

The raw dataset is not committed to this repository (see [Data Preparation](#data-preparation)). To reproduce the pipeline:

1. Download `housing_in_kenya_data.csv` from the Kaggle link above.
2. Place it at `data/raw/housing_in_kenya_data.csv`.

(The web app doesn't need this - see [Web App](#web-app).)

## Project Structure

```bash
.
├── app/
│ ├── streamlit_app.py                 # web app entry point
│ └── data/
│      └── estate_price_summary.csv    # precomputed chart data (tracked)
├── config.yaml                        # paths, feature/model/output settings
├── data/
│ ├── raw/                             # place housing_in_kenya_data.csv here (gitignored)
│ └── processed/                       # cleaned data written here by the pipeline (gitignored)
├── main.py                            # pipeline entry point
├── models/                            # trained model artifacts (gitignored)
├── notebooks/                         # exploratory notebooks
├── reports/
│ ├── figures/                         # generated EDA charts (gitignored)
│ └── model_runs.csv                   # log of every training run's metrics (gitignored)
├── src/
│ ├── data/                            # loading + cleaning
│ ├── features/                        # estate bucketing, encoding, train/test split
│ ├── models/                          # train, evaluate, predict
│ └── visualization/                   # EDA chart functions
├── tests/
└── requirements.txt
```

## Setup

```bash
git clone <repository-url>
cd housing-in-kenya
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Then place the raw dataset as described in [Data Source](#data-source) if you intend to run the pipeline. This isn't needed to run the web app locally.

## Configuration

Project settings live in `config.yaml`:

| Section | Key | Purpose |
|---|---|---|
| `data` | `raw`, `processed`, `raw_filename`, `processed_filename` | dataset paths |
| `features` | `rare_estate_threshold` | minimum listing count for an `Estate` to keep its own category; rarer estates are grouped into `Other` |
| `model` | `random_state`, `test_size` | reproducible train/test split |
| `model_params` | per-model hyperparameters (e.g. `random_forest.n_estimators`) | |
| `output` | `models_dir`, `run_log`, `primary_model` | where artifacts/logs are written, and which trained model is treated as canonical |

## Running the Pipeline

```bash
python main.py                     # run everything: clean, visualize, features, train, evaluate
python main.py --stage clean       # load + clean the raw data only
python main.py --stage visualize   # clean, then regenerate the 3 EDA charts into reports/figures/
python main.py --stage features    # clean, then build features and the train/test split
python main.py --stage train       # ...then train and save both models
python main.py --stage evaluate    # ...then evaluate both models and log results to reports/model_runs.csv
```

Each stage builds on the previous one internally, so e.g. `--stage evaluate` still runs cleaning and feature preparation first.

## Web App

A [Streamlit app](https://housing-in-kenya-lr.streamlit.app/) wraps the primary model in an interactive predictor:

- Enter bedrooms, bathrooms, and estate to get a predicted monthly rental price.
- A chart of average price by estate, sorted highest to lowest, for context.
- States the model's R² (~0.47) alongside every prediction, so the estimate isn't presented as more certain than it is.

Run it locally:

```bash
streamlit run app/streamlit_app.py
```

This only needs `models/linear_regression.pkl` and `app/data/estate_price_summary.csv` (both tracked in the repo, see [Project Structure](#project-structure)) - no raw dataset or retraining required.

## Data Preparation

`src/data/preprocess.py` performs the following cleaning steps:

1. Drop rows with any missing values.
2. Drop unused columns: `link`, `Agency`, `sq_mtrs`.
3. Derive `Estate` from `Neighborhood` (last comma-separated token, whitespace stripped).
4. Parse `Price` (e.g. `"KSh 100,000"` -> `100000.0`) and rename to `Price_Ksh`.
5. Cast `Bedrooms`/`Bathrooms` to integers.

Result: 1,557 rows, 4 columns (`Price_Ksh`, `Bedrooms`, `Bathrooms`, `Estate`).

## Exploratory Data Analysis

Regenerate the charts with `python main.py --stage visualize`. They cover:

- **Distribution of `Price_Ksh`, `Bedrooms`, and `Bathrooms`** - roughly half of listings are priced above KSh 100,000; half have 3+ bedrooms and 2+ bathrooms, indicating a market skewed toward larger, higher-priced units.
- **Average price by estate** - substantial variation across the 37 estates present in the data. Westlands and Thika Road command the highest average prices; Kasarani and Kikuyu are among the more affordable.
- **Average price by bedroom/bathroom count** - a generally positive relationship between room count and price, consistent with larger properties commanding higher prices.

## Modeling

`Estate` values with fewer than `rare_estate_threshold` (default 10) listings are grouped into `Other` before one-hot encoding, to avoid near-empty categories and unseen-category issues between train and test. The train/test split (80/20) is stratified on the bucketed `Estate` so that even the smallest retained categories are represented in both sets.

Two models are trained and compared on the same test set:

- **Linear Regression** - baseline, interpretable coefficients. `Athi River` is the dropped reference category (alphabetically first); every other `Estate_*` coefficient represents a price difference relative to Athi River.
- **Random Forest** - non-linear alternative, `n_estimators` configurable via `config.yaml`.

Every run's hyperparameters and metrics are appended to `reports/model_runs.csv`.

## Results

| Model | RMSE (KSh) | MAE (KSh) | R² |
|---|---:|---:|---:|
| Linear Regression | 29,556 | 23,442 | 0.4695 |
| Random Forest | 29,568 | 23,660 | 0.4691 |

The two models perform statistically indistinguishably. **Linear Regression is the project's designated primary model** (`config.yaml: output.primary_model`, and the model powering the [web app](#web-app)) - with equal accuracy, the simpler, more interpretable model is the better engineering choice; Random Forest's added complexity buys nothing here.

An R² of ~0.47 means `Bedrooms`, `Bathrooms`, and `Estate` explain under half of the variance in price. This is an honest reflection of the feature set's limits, not a modeling error - see [Limitations](#limitations).

## Recommendations

1. **Estate selection:** buyers optimizing for affordability should consider estates with lower average prices, such as Kasarani and Kikuyu.
2. **Property features:** sellers should note that additional bedrooms and bathrooms are positively associated with price.
3. **Affordable housing supply:** policymakers may want to examine incentives for development in lower-average-price areas to address affordability.

## Limitations

- The dataset is a single Kaggle snapshot and may not represent the full diversity of the Kenyan rental market.
- Only `Bedrooms`, `Bathrooms`, and `Estate` are modeled; other likely price drivers (exact amenities, building condition, agency, proximity to amenities) are not captured, which caps achievable model accuracy (R² ≈ 0.47).
- `Estate` values with fewer than 10 listings are grouped into a single `Other` category, which limits location granularity for less common areas.  
