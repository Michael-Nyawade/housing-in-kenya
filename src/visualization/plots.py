"""Functions for producing the project's EDA visualizations."""

from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd


def plot_price_distribution(df: pd.DataFrame, output_path: str) -> None:
    """Boxplots showing the distribution of Price_Ksh, Bedrooms, and Bathrooms."""
    fig, axs = plt.subplots(1, 3, figsize=(15, 4))

    axs[0].boxplot(df["Price_Ksh"], vert=False)
    axs[0].set_xlabel("House Prices")
    axs[0].set_title("Distribution of House Prices")

    axs[1].boxplot(df["Bedrooms"], vert=False)
    axs[1].set_xlabel("Bedrooms")
    axs[1].set_title("Distribution of Bedrooms")

    axs[2].boxplot(df["Bathrooms"], vert=False)
    axs[2].set_xlabel("Bathrooms")
    axs[2].set_title("Distribution of Bathrooms")

    _save_and_close(fig, output_path)


def plot_price_by_estate(df: pd.DataFrame, output_path: str) -> None:
    """Bar chart of average house price per estate."""
    fig, ax = plt.subplots(figsize=(13, 5))
    df.groupby("Estate")["Price_Ksh"].mean().plot(
        kind="bar",
        xlabel="Estate",
        ylabel="Average Price in Ksh",
        ax=ax,
    )
    _save_and_close(fig, output_path)


def plot_price_by_bedrooms_bathrooms(df: pd.DataFrame, output_path: str) -> None:
    """Bar charts of average house price by bedroom count and by bathroom count."""
    fig, axs = plt.subplots(1, 2, figsize=(14, 4))

    df.groupby("Bedrooms")["Price_Ksh"].mean().plot(kind="bar", ax=axs[0])
    axs[0].set_ylabel("House Price in Ksh")
    axs[0].set_title("The Price of a House by the Number of Bedrooms")

    df.groupby("Bathrooms")["Price_Ksh"].mean().plot(kind="bar", ax=axs[1])
    axs[1].set_ylabel("House Price in Ksh")
    axs[1].set_title("The Price of a House by the Number of Bathrooms")

    _save_and_close(fig, output_path)


def _save_and_close(fig, output_path: str) -> None:
    """Save a figure to disk, creating parent directories if needed."""
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(path, bbox_inches="tight")
    plt.close(fig)
