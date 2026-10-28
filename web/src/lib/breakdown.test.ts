import { describe, expect, it } from "vitest";

import { breakdownEstimate, estateEffects } from "./breakdown";
import { insights } from "./insights";
import { model, predictPrice } from "./predict";

describe("breakdownEstimate", () => {
  it("adds up to the same figure as predictPrice for every estate", () => {
    for (const estate of model.estates) {
      const input = { bedrooms: 3, bathrooms: 2, estate };
      const { lines, total } = breakdownEstimate(model, input);
      const sum = lines.reduce((acc, line) => acc + line.amount, 0);
      expect(sum).toBeCloseTo(total, 6);
      expect(total).toBeCloseTo(predictPrice(model, input), 6);
    }
  });

  it("starts from the intercept", () => {
    const { lines } = breakdownEstimate(model, { bedrooms: 3, bathrooms: 2, estate: "Westlands" });
    expect(lines[0].label).toBe("Starting amount");
    expect(lines[0].amount).toBe(model.intercept);
  });

  it("uses singular wording for one bathroom", () => {
    const { lines } = breakdownEstimate(model, { bedrooms: 2, bathrooms: 1, estate: "Westlands" });
    expect(lines[2].label).toBe("1 bathroom");
  });

  it("shows no adjustment for the baseline estate", () => {
    const input = { bedrooms: 3, bathrooms: 2, estate: model.baseline_estate };
    const { lines } = breakdownEstimate(model, input);
    expect(lines[3].amount).toBe(0);
    expect(lines[3].detail).toContain("no adjustment");
  });

  it("describes other estates relative to the baseline", () => {
    const { lines } = breakdownEstimate(model, { bedrooms: 3, bathrooms: 2, estate: "Westlands" });
    expect(lines[3].detail).toContain(model.baseline_estate);
    expect(lines[3].amount).toBe(model.coefficients["Estate_Westlands"]);
  });

  it("rejects an unknown estate", () => {
    expect(() =>
      breakdownEstimate(model, { bedrooms: 3, bathrooms: 2, estate: "Nowhere" }),
    ).toThrow(/Unknown estate/);
  });
});

describe("estateEffects", () => {
  const effects = estateEffects(model, insights.by_estate_group);

  it("lists every estate exactly once", () => {
    expect(effects.map((e) => e.estate).sort()).toEqual([...model.estates].sort());
  });

  it("gives only the baseline a zero effect", () => {
    const zero = effects.filter((e) => e.effect === 0).map((e) => e.estate);
    expect(zero).toEqual([model.baseline_estate]);
    expect(effects.find((e) => e.isBaseline)?.estate).toBe(model.baseline_estate);
  });

  it("is sorted from largest to smallest effect", () => {
    const values = effects.map((e) => e.effect);
    expect(values).toEqual([...values].sort((a, b) => b - a));
  });

  it("matches the model coefficients", () => {
    for (const entry of effects) {
      if (entry.isBaseline) continue;
      expect(entry.effect).toBe(model.coefficients[`Estate_${entry.estate}`]);
    }
  });

  it("takes listing counts from the insights", () => {
    for (const entry of effects) {
      const stat = insights.by_estate_group.find((s) => s.estate === entry.estate);
      expect(entry.listings).toBe(stat?.listings);
    }
  });

  it("throws when listing statistics are missing", () => {
    expect(() => estateEffects(model, [])).toThrow(/No listing statistics/);
  });
});
