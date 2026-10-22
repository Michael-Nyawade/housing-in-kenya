import rawInsights from "../../data/insights.json";

export interface GroupStat {
  listings: number;
  mean_price: number;
  median_price: number;
}

export interface EstateStat extends GroupStat {
  estate: string;
}

export interface BedroomStat extends GroupStat {
  bedrooms: number;
}

export interface BathroomStat extends GroupStat {
  bathrooms: number;
}

export interface PriceBin {
  from: number;
  to: number;
  listings: number;
}

export interface InsightsData {
  dataset: {
    rows_raw: number;
    rows_clean: number;
    rows_removed: number;
    estates: number;
    rare_estate_threshold: number;
  };
  price_summary: {
    min: number;
    p25: number;
    median: number;
    mean: number;
    p75: number;
    max: number;
  };
  price_distribution: PriceBin[];
  by_estate: EstateStat[];
  by_estate_group: EstateStat[];
  by_bedrooms: BedroomStat[];
  by_bathrooms: BathroomStat[];
}

export const insights = rawInsights as InsightsData;
