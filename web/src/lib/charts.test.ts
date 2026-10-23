import { describe, expect, it } from "vitest";

import { describeDips, filterByMinListings } from "./charts";

describe("describeDips", () => {
  it("says rent rises when no group breaks the pattern", () => {
    const items = [
      { label: "1", value: 10, listings: 50 },
      { label: "2", value: 20, listings: 60 },
    ];
    expect(describeDips(items, "bathroom")).toBe(
      "Average rent rises with every extra bathroom in this data.",
    );
  });

  it("flags a dip that rests on few listings", () => {
    const items = [
      { label: "4", value: 100, listings: 100 },
      { label: "5", value: 150, listings: 40 },
      { label: "6", value: 110, listings: 6 },
    ];
    expect(describeDips(items, "bedroom")).toBe(
      "6 bedrooms average less than 5 bedrooms, but it rests on only 6 listings, so the dip may be down to chance.",
    );
  });

  it("adds no caveat when the dipping group is large", () => {
    const items = [
      { label: "3", value: 100, listings: 100 },
      { label: "4", value: 90, listings: 80 },
    ];
    expect(describeDips(items, "bedroom")).toBe("4 bedrooms average less than 3 bedrooms.");
  });

  it("uses singular wording for a group labelled 1", () => {
    const items = [
      { label: "0", value: 50, listings: 100 },
      { label: "1", value: 40, listings: 1 },
    ];
    expect(describeDips(items, "bedroom")).toBe(
      "1 bedroom averages less than 0 bedrooms, but it rests on only 1 listing, so the dip may be down to chance.",
    );
  });
});

describe("filterByMinListings", () => {
  const items = [{ listings: 9 }, { listings: 10 }, { listings: 11 }];

  it("keeps groups at exactly the minimum", () => {
    expect(filterByMinListings(items, 10)).toEqual([{ listings: 10 }, { listings: 11 }]);
  });

  it("returns nothing when no group qualifies", () => {
    expect(filterByMinListings(items, 12)).toEqual([]);
  });
});
