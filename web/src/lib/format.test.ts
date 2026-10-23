import { describe, expect, it } from "vitest";

import {
  formatEstate,
  formatKsh,
  formatSignedKsh,
  formatThousands,
  roundToNearest,
} from "./format";

describe("formatKsh", () => {
  it("adds thousands separators", () => {
    expect(formatKsh(111520.4)).toBe("KSh 111,520");
  });

  it("rounds to whole shillings", () => {
    expect(formatKsh(1999.6)).toBe("KSh 2,000");
  });

  it("puts the minus sign before the currency", () => {
    expect(formatKsh(-3649.2)).toBe("-KSh 3,649");
  });

  it("never prints negative zero", () => {
    expect(formatKsh(-0.4)).toBe("KSh 0");
  });
});

describe("formatSignedKsh", () => {
  it("adds a plus sign to gains", () => {
    expect(formatSignedKsh(62595.7)).toBe("+KSh 62,596");
  });

  it("keeps the minus sign for losses", () => {
    expect(formatSignedKsh(-3649.05)).toBe("-KSh 3,649");
  });

  it("leaves zero unsigned", () => {
    expect(formatSignedKsh(0)).toBe("KSh 0");
    expect(formatSignedKsh(0.4)).toBe("KSh 0");
  });
});

describe("formatThousands", () => {
  it("rounds to whole thousands", () => {
    expect(formatThousands(104541.5)).toBe("105k");
    expect(formatThousands(38600)).toBe("39k");
  });

  it("prints plain zero for tiny values", () => {
    expect(formatThousands(0)).toBe("0");
  });
});

describe("formatEstate", () => {
  it("shows the grouped estates as Other areas", () => {
    expect(formatEstate("Other")).toBe("Other areas");
  });

  it("leaves named estates unchanged", () => {
    expect(formatEstate("Westlands")).toBe("Westlands");
  });
});

describe("roundToNearest", () => {
  it("rounds down to the nearest step", () => {
    expect(roundToNearest(23442, 100)).toBe(23400);
  });

  it("rounds halves up", () => {
    expect(roundToNearest(23450, 100)).toBe(23500);
  });
});
