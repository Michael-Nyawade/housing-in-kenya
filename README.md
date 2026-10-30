# Housing in Kenya

Estimate monthly rent for Kenyan estates from bedrooms, bathrooms, and location, and explore what drives rental prices.

**Live site:** [housing-in-kenya.vercel.app](https://housing-in-kenya.vercel.app)

## Table of Contents

- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Data Source](#data-source)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Configuration](#configuration)
- [Running the Pipeline](#running-the-pipeline)
- [Data Preparation](#data-preparation)
- [Exploratory Data Analysis](#exploratory-data-analysis)
- [Modeling](#modeling)
- [Results](#results)
- [The Website](#the-website)
- [Testing](#testing)
- [Recommendations](#recommendations)
- [Limitations](#limitations)

## Project Overview

The Kenyan housing market is shaped by many factors, and size and location stand out. This project cleans a Kaggle dataset of rental listings, explores how rent varies by estate, bedrooms, and bathrooms, trains a model that predicts monthly rent from those three inputs, and publishes the result as a website with a rent estimator, a market insights page, and a plain-language explanation of the model.

A Python pipeline cleans the data, trains and compares two models, and exports what the website needs. The website is a Next.js app that computes estimates in the browser, so there is no server to keep running.

## Problem Statement

Investors, homeowners, and policymakers need to understand how property size and location relate to price in order to navigate the Kenyan housing market. This project addresses that through exploratory data analysis and a baseline predictive model.

**Note on terminology:** the dataset's `Price` values (roughly KSh 12,000 to 240,000) are consistent with *monthly rental prices*, not property sale prices, despite the "housing prices" language used in the original data source.

## Data Source

Sourced from [Kaggle: Rental Apartments in Kenya](https://www.kaggle.com/datasets/iamasteriix/rental-apartments-in-kenya), CSV format. Original columns: `Agency`, `Neighborhood`, `Price`, `link`, `sq_mtrs`, `Bedrooms`, `Bathrooms`.

The raw dataset is not committed to this repository. To run the pipeline:

1. Download `housing_in_kenya_data.csv` from the Kaggle link above.
2. Place it at `data/raw/housing_in_kenya_data.csv`.

Running the website does not need the dataset (see [The Website](#the-website)).

## Project Structure

```
.
├── config.yaml              # paths, feature, model, and output settings
├── main.py                  # pipeline entry point
├── requirements.txt         # Python dependencies
├── data/
│   ├── raw/                 # place housing_in_kenya_data.csv here (gitignored)
│   └── processed/           # cleaned data written by the pipeline (gitignored)
├── models/                  # trained model files (gitignored)
├── notebooks/               # four notebooks that call into src/
├── reports/
│   ├── figures/             # generated EDA charts (gitignored)
│   └── model_runs.csv       # log of every evaluation run (gitignored)
├── src/
│   ├── data/                # loading and cleaning
│   ├── features/            # estate bucketing, encoding, train/test split
│   ├── models/              # train, evaluate, predict, export
│   └── visualization/       # EDA chart functions
├── tests/                   # Python tests
└── web/                     # the website (Next.js)
    ├── data/                # model.json, insights.json, parity_cases.json (tracked)
    └── src/                 # app pages, components, hooks, and lib
```

Raw and processed data, trained model files, generated charts, and the run log are regenerable from `src/`, so they are kept out of version control. The three JSON files in `web/data/` are the exception: they are tracked on purpose, because the website is built from the repository alone and has no access to the raw dataset.

## Setup

**Python pipeline and notebooks** (developed with Python 3.12):

```bash
git clone https://github.com/Michael-Nyawade/housing-in-kenya.git
cd housing-in-kenya
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Then place the raw dataset as described in [Data Source](#data-source). To open the notebooks, run `jupyter lab` and open the files in `notebooks/`.

**Website** (developed with Node.js 22):

```bash
cd web
npm install
npm run dev   # http://localhost:3000
```

## Configuration

Project settings live in `config.yaml`:

| Section | Key | Purpose |
|---|---|---|
| `data` | `raw`, `processed`, `raw_filename`, `processed_filename` | dataset paths |
| `features` | `rare_estate_threshold` | minimum listings for an estate to keep its own category; rarer estates are grouped into `Other` |
| `model` | `random_state`, `test_size` | reproducible train/test split |
| `model_params` | per-model hyperparameters (for example `random_forest.n_estimators`) | |
| `output` | `models_dir`, `run_log`, `web_data_dir`, `primary_model` | where artifacts and logs are written, and which trained model the website uses |

## Running the Pipeline

```bash
python main.py                     # everything: clean, charts, features, train, evaluate, export
python main.py --stage clean       # load and clean the data, print descriptive statistics
python main.py --stage visualize   # clean, then regenerate the 3 EDA charts into reports/figures/
python main.py --stage features    # clean, then build features and the train/test split
python main.py --stage train       # ...then train and save both models
python main.py --stage evaluate    # ...then evaluate both models and log results to reports/model_runs.csv
python main.py --stage export      # ...train, then write the website's data files to web/data/
```

Each stage builds on the previous ones, so `--stage evaluate` still cleans, builds features, and trains first. The `export` stage skips evaluation, so it does not add a row to the run log.

## Data Preparation

`src/data/preprocess.py` performs the following cleaning steps:

1. Drop rows with any missing values.
2. Drop unused columns: `link`, `Agency`, `sq_mtrs`. Floor area is left out because its recorded values are unreliable, with some listings showing implausibly small sizes.
3. Derive `Estate` from `Neighborhood` (last comma-separated part, whitespace stripped).
4. Parse `Price` (for example `"KSh 100,000"` becomes `100000.0`) and rename it to `Price_Ksh`.
5. Cast `Bedrooms` and `Bathrooms` to integers.

Result: 1,557 of the 1,848 listings remain, with 4 columns (`Price_Ksh`, `Bedrooms`, `Bathrooms`, `Estate`) and 37 distinct estates.

## Exploratory Data Analysis

Regenerate the charts with `python main.py --stage visualize`, or explore them in `notebooks/02_exploratory_data_analysis.ipynb`. The same analysis is on the website's Market insights page.

- **Distribution of rent, bedrooms, and bathrooms:** the median rent is KSh 95,000 and the middle half of listings fall between KSh 70,000 and 130,000. Half of the listings have 3 or more bedrooms and 2 or more bathrooms, which points to a market leaning toward larger homes.
- **Average rent by estate:** it varies widely. Among estates with large samples, Westlands (about KSh 118,000 across 547 listings) and Dagoretti North (about KSh 101,500 across 715) are the highest. Thika Road and Muthaiga look just as expensive, but they rest on only 5 and 3 listings. At the other end, Kasarani (about KSh 16,000) and Kikuyu (about KSh 22,200) have the lowest averages, from 2 and 5 listings. Among estates with at least 30 listings, Kiambaa is the cheapest, at about KSh 37,200 across 60 listings.
- **Average rent by bedrooms and bathrooms:** rent rises with every extra bathroom, and with every extra bedroom up to five. Six-bedroom homes average less than five-bedroom ones, but there are very few of them, so that dip is probably down to chance.

## Modeling

Estates with fewer than `rare_estate_threshold` (default 10) listings are grouped into `Other` before one-hot encoding. This avoids near-empty columns and the risk of an estate appearing in only one of the train and test sets. Encoding drops the first category alphabetically, so `Athi River` becomes the comparison estate: every other estate's coefficient is the extra rent compared with Athi River, for the same bedrooms and bathrooms. The 80/20 train/test split is stratified on the grouped estate so that even the smallest categories appear in both sets.

Two models are trained and compared on the same held-out listings:

- **Linear regression:** the baseline, with coefficients that can be read directly.
- **Random forest:** a non-linear alternative, with `n_estimators` set in `config.yaml`.

Every evaluation is appended to `reports/model_runs.csv`.

## Results

| Model | Typical error (MAE) | Larger misses (RMSE) | R² |
|---|---:|---:|---:|
| Linear regression | KSh 23,442 | KSh 29,556 | 0.4695 |
| Random forest | KSh 23,660 | KSh 29,568 | 0.4691 |

The two models perform almost identically, so **linear regression is the designated primary model** (`config.yaml: output.primary_model`, and the model behind the website). With equal accuracy, the simpler and more transparent model is the better choice.

An R² of about 0.47 means bedrooms, bathrooms, and estate account for under half of the variation in rent. That reflects the limits of three inputs rather than a modeling error. Typical error is the average miss on listings the model had not seen. Larger misses is the same idea but counts big misses for more, so it can never be lower.

The fitted model, in Kenyan shillings:

| Term | Value |
|---|---:|
| Starting amount | -3,649 |
| Per bedroom | +5,027 |
| Per bathroom | +10,811 |
| Westlands | +78,465 |
| Dagoretti North | +62,596 |
| Langata | +49,488 |
| Ngong Road | +28,125 |
| Roysambu | +26,948 |
| Kiambu Road | +26,680 |
| Nyali | +25,489 |
| Other areas | +18,804 |
| Kiambaa | +10,544 |
| Athi River (comparison estate) | 0 |

Estimated rent is the starting amount, plus the per-bedroom amount times the bedrooms, plus the per-bathroom amount times the bathrooms, plus the estate's adjustment. Read these as associations, not causes. Bedrooms and bathrooms usually come together, so the model cannot cleanly separate their effects, and Athi River has only 10 listings, so each estate figure carries some of that uncertainty.

## The Website

The site has three pages:

- **Predict:** choose an estate, bedrooms, and bathrooms and get a live estimate, the model's typical error, where the estimate sits among all listings, and plain-language cautions when an estimate is less reliable.
- **Market insights:** the distribution of rents, average rent by estate with a filter that hides thin samples, and average rent by bedrooms and bathrooms.
- **About the model:** the data, a worked example of one estimate, what each factor adds, accuracy, the model comparison, limits, and the exact formula.

**How it works.** Because a linear model is just an intercept plus weighted inputs, the website needs no Python at runtime. `python main.py --stage export` writes three files to `web/data/`:

- `model.json`: the intercept, coefficients, estates, input ranges, and test metrics.
- `insights.json`: the aggregates behind the Market insights page.
- `parity_cases.json`: inputs paired with scikit-learn's predictions, used by the tests.


**After retraining**, run the export then run the website tests to confirm the two sides still agree:

```bash
python main.py --stage export
cd web && npm test
```

## Testing

```bash
python -m pytest tests/                       # cleaning, features, models, export
cd web && npm test && npm run lint && npm run build
```

The website tests include a parity check: every estate is combined with a range of bedroom and bathroom counts, and the TypeScript prediction must match scikit-learn's output.

## Recommendations

1. **Choosing an estate:** renters watching their budget have two kinds of evidence to weigh. Kasarani (about KSh 16,000, from 2 listings) and Kikuyu (about KSh 22,200, from 5) have the lowest averages, but too few listings to rely on. Among estates with at least 30 listings, Kiambaa is the cheapest, at about KSh 37,200 across 60 listings.
2. **Property features:** landlords should note that extra bedrooms and bathrooms are associated with higher rent. The two tend to come together, so the model cannot cleanly separate their effects.
3. **Affordable housing supply:** policymakers may want to look at estates that combine lower rents with solid listing counts, such as Kiambaa, when considering where to encourage supply.

## Limitations

- The dataset is a single snapshot of listed rents, not prices paid, and rents move over time.
- Only bedrooms, bathrooms, and estate are modeled. Amenities, building condition, floor level, security, and distance to transport are not captured, which caps accuracy at an R² of about 0.47.
- Most listings are in Nairobi and the counties around it, with a few from Mombasa, Kisumu, and other towns, so the picture is strongest for the Nairobi area.
- Estates with fewer than 10 listings are grouped into `Other`, which limits location detail for smaller areas.
- Estimates are least reliable at the edges, such as homes with no bedrooms or six, where listings are rare.
