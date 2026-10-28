import { formatEstate, formatKsh } from "./format";
import type { EstateStat } from "./insights";
import { predictPrice } from "./predict";
import type { ModelData, PredictionInput } from "./predict";

const ESTATE_PREFIX = "Estate_";

export interface BreakdownLine {
  label: string;
  detail: string;
  amount: number;
}

export interface Breakdown {
  lines: BreakdownLine[];
  total: number;
}

export interface EstateEffect {
  estate: string;
  effect: number;
  listings: number;
  isBaseline: boolean;
}

function count(value: number, noun: string): string {
  return `${value} ${noun}${value === 1 ? "" : "s"}`;
}

function estateAdjustment(data: ModelData, estate: string): number {
  if (estate === data.baseline_estate) return 0;
  const key = `${ESTATE_PREFIX}${estate}`;
  if (!(key in data.coefficients)) {
    throw new Error(`Model has no coefficient for estate: ${estate}`);
  }
  return data.coefficients[key];
}

/** Splits one estimate into the starting amount plus what each input contributes. */
export function breakdownEstimate(data: ModelData, input: PredictionInput): Breakdown {
  const total = predictPrice(data, input); // throws for an unknown estate
  const isBaseline = input.estate === data.baseline_estate;
  const bedroomRate = data.coefficients.Bedrooms;
  const bathroomRate = data.coefficients.Bathrooms;

  return {
    total,
    lines: [
      {
        label: "Starting amount",
        detail: "The point every calculation begins from",
        amount: data.intercept,
      },
      {
        label: count(input.bedrooms, "bedroom"),
        detail: `${input.bedrooms} × ${formatKsh(bedroomRate)} each`,
        amount: bedroomRate * input.bedrooms,
      },
      {
        label: count(input.bathrooms, "bathroom"),
        detail: `${input.bathrooms} × ${formatKsh(bathroomRate)} each`,
        amount: bathroomRate * input.bathrooms,
      },
      {
        label: formatEstate(input.estate),
        detail: isBaseline
          ? "The comparison estate, so no adjustment"
          : `Adjustment compared with ${formatEstate(data.baseline_estate)}`,
        amount: estateAdjustment(data, input.estate),
      },
    ],
  };
}

/** Each estate's adjustment against the baseline estate, largest first. */
export function estateEffects(data: ModelData, stats: EstateStat[]): EstateEffect[] {
  return data.estates
    .map((estate) => {
      const stat = stats.find((s) => s.estate === estate);
      if (!stat) {
        throw new Error(`No listing statistics for estate: ${estate}`);
      }
      return {
        estate,
        effect: estateAdjustment(data, estate),
        listings: stat.listings,
        isBaseline: estate === data.baseline_estate,
      };
    })
    .sort((a, b) => b.effect - a.effect);
}
