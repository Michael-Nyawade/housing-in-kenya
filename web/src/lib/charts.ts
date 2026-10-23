import { LOW_SAMPLE_LISTINGS } from "./estimate";

export interface ChartItem {
  label: string;
  value: number;
  listings: number;
}

/** Keeps groups with at least min listings, matching how the model groups rare estates. */
export function filterByMinListings<T extends { listings: number }>(items: T[], min: number): T[] {
  return items.filter((item) => item.listings >= min);
}

/**
 * One sentence about whether average rent rises steadily across the groups.
 * It names the first group that breaks the pattern, and says so when that
 * group is too small to trust.
 */
export function describeDips(items: ChartItem[], noun: string): string {
  const index = items.findIndex((item, i) => i > 0 && item.value < items[i - 1].value);
  if (index === -1) {
    return `Average rent rises with every extra ${noun} in this data.`;
  }

  const item = items[index];
  const previous = items[index - 1];
  const name = (entry: ChartItem) => `${entry.label} ${noun}${entry.label === "1" ? "" : "s"}`;
  const verb = item.label === "1" ? "averages" : "average";
  const caveat =
    item.listings < LOW_SAMPLE_LISTINGS
      ? `, but it rests on only ${item.listings} listing${item.listings === 1 ? "" : "s"}, so the dip may be down to chance`
      : "";

  return `${name(item)} ${verb} less than ${name(previous)}${caveat}.`;
}
