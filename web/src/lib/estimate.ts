import { formatEstate, formatKsh, formatNumber } from "./format";
import type { InsightsData, PriceBin } from "./insights";
import type { PredictionInput } from "./predict";

/** Groups with fewer listings than this are flagged as less reliable. */
export const LOW_SAMPLE_LISTINGS = 30;

export interface EstimateContext {
  estate: { listings: number; meanPrice: number };
  cautions: string[];
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/** Estate statistics plus plain-language notes on when an estimate deserves extra care. */
export function describeEstimate(
  input: PredictionInput,
  estimate: number,
  insights: InsightsData,
): EstimateContext {
  const estateStat = insights.by_estate_group.find((s) => s.estate === input.estate);
  if (!estateStat) {
    throw new Error(`No listing statistics for estate: ${input.estate}`);
  }

  const bedroomListings =
    insights.by_bedrooms.find((s) => s.bedrooms === input.bedrooms)?.listings ?? 0;
  const bathroomListings =
    insights.by_bathrooms.find((s) => s.bathrooms === input.bathrooms)?.listings ?? 0;

  const cautions: string[] = [];

  if (input.estate === "Other") {
    cautions.push(
      `Other areas combines many estates with fewer than ${insights.dataset.rare_estate_threshold} listings each, so this is a broad average, not a figure for one place.`,
    );
  } else if (estateStat.listings < LOW_SAMPLE_LISTINGS) {
    cautions.push(
      `Only ${formatNumber(estateStat.listings)} listings in ${formatEstate(input.estate)}, so its average is less reliable.`,
    );
  }

  if (bedroomListings < LOW_SAMPLE_LISTINGS) {
    cautions.push(
      `Few listings have ${plural(input.bedrooms, "bedroom")} (${bedroomListings} in the data), so this estimate is less reliable.`,
    );
  }

  if (bathroomListings < LOW_SAMPLE_LISTINGS) {
    cautions.push(
      `Few listings have ${plural(input.bathrooms, "bathroom")} (${bathroomListings} in the data), so this estimate is less reliable.`,
    );
  }

  const { min, max } = insights.price_summary;
  if (estimate < min) {
    cautions.push(`This is below the cheapest listing in the data (${formatKsh(min)}).`);
  }
  if (estimate > max) {
    cautions.push(`This is above the most expensive listing in the data (${formatKsh(max)}).`);
  }

  return {
    estate: { listings: estateStat.listings, meanPrice: estateStat.mean_price },
    cautions,
  };
}

/** Index of the histogram bin holding value, or -1 if it falls outside every bin. */
export function findBinIndex(bins: PriceBin[], value: number): number {
  const last = bins.length - 1;
  for (let i = 0; i < bins.length; i++) {
    const bin = bins[i];
    const inRange = value >= bin.from && (value < bin.to || (i === last && value === bin.to));
    if (inRange) return i;
  }
  return -1;
}

/** Alphabetical order with the grouped "Other" estate last. */
export function sortEstatesForDisplay(estates: string[]): string[] {
  return [...estates].sort((a, b) => {
    if (a === b) return 0;
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return a.localeCompare(b);
  });
}
