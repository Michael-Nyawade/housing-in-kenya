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

/** The model groups rarely listed estates under "Other"; show that as "Other areas". */
export function formatEstate(estate: string): string {
  return estate === "Other" ? "Other areas" : estate;
}
