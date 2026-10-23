import { describe, expect, it } from "vitest";

import {
  LOW_SAMPLE_LISTINGS,
  describeEstimate,
  findBinIndex,
  sortEstatesForDisplay,
} from "./estimate";
import { insights } from "./insights";
import { model } from "./predict";

const bins = [
  { from: 0, to: 10, listings: 1 },
  { from: 10, to: 20, listings: 2 },
  { from: 20, to: 30, listings: 3 },
];

describe("findBinIndex", () => {
  it("finds the bin containing a value", () => {
    expect(findBinIndex(bins, 5)).toBe(0);
  });

  it("puts a boundary value in the upper bin", () => {
    expect(findBinIndex(bins, 10)).toBe(1);
  });

  it("includes the final edge in the last bin", () => {
    expect(findBinIndex(bins, 30)).toBe(2);
  });

  it("returns -1 outside every bin", () => {
    expect(findBinIndex(bins, 31)).toBe(-1);
    expect(findBinIndex(bins, -1)).toBe(-1);
  });
});

describe("sortEstatesForDisplay", () => {
  it("sorts alphabetically with Other last", () => {
    expect(sortEstatesForDisplay(["Westlands", "Other", "Athi River", "Nyali"])).toEqual([
      "Athi River",
      "Nyali",
      "Westlands",
      "Other",
    ]);
  });
});

describe("describeEstimate", () => {
  const typical = { bedrooms: 3, bathrooms: 2, estate: "Westlands" };

  const thinEstate = insights.by_estate_group.find(
    (s) => s.estate !== "Other" && s.listings < LOW_SAMPLE_LISTINGS,
  );
  const thinBedrooms = insights.by_bedrooms.find((s) => s.listings < LOW_SAMPLE_LISTINGS);

  it("has listing statistics for every estate the model knows about", () => {
    for (const estate of model.estates) {
      expect(() => describeEstimate({ ...typical, estate }, 100000, insights)).not.toThrow();
    }
  });

  it("reports the average and listing count for the chosen estate", () => {
    const stat = insights.by_estate_group.find((s) => s.estate === "Westlands");
    const context = describeEstimate(typical, 100000, insights);
    expect(context.estate).toEqual({ listings: stat?.listings, meanPrice: stat?.mean_price });
  });

  it("stays quiet for a typical request", () => {
    expect(describeEstimate(typical, 100000, insights).cautions).toEqual([]);
  });

  it("explains that Other areas is a broad average", () => {
    const context = describeEstimate({ ...typical, estate: "Other" }, 100000, insights);
    expect(context.cautions.join(" ")).toContain("Other areas");
  });

  it.skipIf(!thinEstate)("flags an estate with few listings", () => {
    const estate = thinEstate?.estate ?? "Other";
    const context = describeEstimate({ ...typical, estate }, 100000, insights);
    expect(context.cautions.join(" ")).toContain("less reliable");
  });

  it.skipIf(!thinBedrooms)("flags a bedroom count with few listings", () => {
    const bedrooms = thinBedrooms?.bedrooms ?? 0;
    const context = describeEstimate({ ...typical, bedrooms }, 100000, insights);
    expect(context.cautions.join(" ")).toContain("Few listings have");
  });

  it("flags an estimate below the cheapest listing", () => {
    const context = describeEstimate(typical, insights.price_summary.min - 1000, insights);
    expect(context.cautions.join(" ")).toContain("below the cheapest listing");
  });

  it("flags an estimate above the most expensive listing", () => {
    const context = describeEstimate(typical, insights.price_summary.max + 1000, insights);
    expect(context.cautions.join(" ")).toContain("above the most expensive listing");
  });
});
