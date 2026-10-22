import { describe, expect, it } from "vitest";

import cases from "../../data/parity_cases.json";
import { model, predictPrice } from "./predict";

describe("parity with scikit-learn", () => {
  it("covers every estate the model knows about", () => {
    const covered = [...new Set(cases.map((c) => c.estate))].sort();
    expect(covered).toEqual([...model.estates].sort());
  });

  it.each(cases)(
    "matches sklearn for $estate, $bedrooms bed, $bathrooms bath",
    (testCase) => {
      const result = predictPrice(model, {
        bedrooms: testCase.bedrooms,
        bathrooms: testCase.bathrooms,
        estate: testCase.estate,
      });
      expect(result).toBeCloseTo(testCase.predicted_price, 6);
    },
  );
});

describe("predictPrice behaviour", () => {
  const input = { bedrooms: 3, bathrooms: 2 };

  it("adds no estate effect for the baseline estate", () => {
    const result = predictPrice(model, { ...input, estate: model.baseline_estate });
    const expected =
      model.intercept +
      model.coefficients.Bedrooms * input.bedrooms +
      model.coefficients.Bathrooms * input.bathrooms;
    expect(result).toBeCloseTo(expected, 6);
  });

  it("adds exactly the estate coefficient for any other estate", () => {
    const baseline = predictPrice(model, { ...input, estate: model.baseline_estate });
    const westlands = predictPrice(model, { ...input, estate: "Westlands" });
    expect(westlands - baseline).toBeCloseTo(model.coefficients["Estate_Westlands"], 6);
  });

  it("has a coefficient for every estate except the baseline", () => {
    for (const estate of model.estates) {
      if (estate === model.baseline_estate) continue;
      expect(model.coefficients).toHaveProperty(`Estate_${estate}`);
    }
  });

  it("rejects an unknown estate", () => {
    expect(() => predictPrice(model, { ...input, estate: "Nowhere" })).toThrow(/Unknown estate/);
  });
});
