const numberFormatter = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** Whole shillings with a thousands separator, e.g. "KSh 111,520". */
export function formatKsh(value: number): string {
  const rounded = Math.round(value);
  // Covers -0 as well: Math.round(-0.4) is -0, which would otherwise print as "-0".
  if (rounded === 0) return "KSh 0";
  return rounded < 0 ? `-KSh ${formatNumber(-rounded)}` : `KSh ${formatNumber(rounded)}`;
}

/** Whole thousands for tight spaces, e.g. "105k". */
export function formatThousands(value: number): string {
  const thousands = Math.round(value / 1000);
  return thousands === 0 ? "0" : `${formatNumber(thousands)}k`;
}

/** The model groups rarely listed estates under "Other"; show that as "Other areas". */
export function formatEstate(estate: string): string {
  return estate === "Other" ? "Other areas" : estate;
}

/** Rounds to the nearest multiple of step, e.g. roundToNearest(23442, 100) is 23400. */
export function roundToNearest(value: number, step: number): number {
  return Math.round(value / step) * step;
}
