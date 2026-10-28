import rawModel from "../../data/model.json";

export interface ModelMetrics {
  rmse: number;
  mae: number;
  r2: number;
}

export interface ModelData {
  model_name: string;
  target: string;
  intercept: number;
  coefficients: Record<string, number>;
  estates: string[];
  baseline_estate: string;
  input_ranges: {
    bedrooms: { min: number; max: number };
    bathrooms: { min: number; max: number };
  };
  metrics: Record<string, ModelMetrics>;
  training: {
    rows_clean: number;
    rows_train: number;
    rows_test: number;
    test_size: number;
    random_state: number;
    rare_estate_threshold: number;
    sklearn_version: string;
  };
}

export interface PredictionInput {
  bedrooms: number;
  bathrooms: number;
  estate: string;
}

export const model = rawModel as ModelData;

const ESTATE_PREFIX = "Estate_";

/**
 * Reproduces the trained linear regression: intercept plus the weighted sum
 * of the inputs. The baseline estate has no coefficient of its own because
 * its effect is already part of the intercept.
 */
export function predictPrice(data: ModelData, input: PredictionInput): number {
  if (!data.estates.includes(input.estate)) {
    throw new Error(`Unknown estate: ${input.estate}`);
  }

  let estateEffect = 0;
  if (input.estate !== data.baseline_estate) {
    const key = `${ESTATE_PREFIX}${input.estate}`;
    if (!(key in data.coefficients)) {
      throw new Error(`Model has no coefficient for estate: ${input.estate}`);
    }
    estateEffect = data.coefficients[key];
  }

  return (
    data.intercept +
    data.coefficients.Bedrooms * input.bedrooms +
    data.coefficients.Bathrooms * input.bathrooms +
    estateEffect
  );
}
