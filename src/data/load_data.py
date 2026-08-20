"""Functions for loading raw project data and configuration."""

from pathlib import Path

import pandas as pd
import yaml


def load_config(config_path: str = "config.yaml") -> dict:
    """Load project configuration from a YAML file."""
    with open(config_path, "r") as f:
        return yaml.safe_load(f)


def load_raw_data(config: dict) -> pd.DataFrame:
    """Load the raw housing dataset described in the project config."""
    raw_dir = Path(config["data"]["raw"])
    filename = config["data"]["raw_filename"]
    return pd.read_csv(raw_dir / filename)
