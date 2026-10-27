import { formatNumber } from "./format";
import { insights } from "./insights";

export const siteName = "Housing in Kenya";

const listingCount = formatNumber(insights.dataset.rows_clean);

export const siteDescription = `Estimate monthly rent for Kenyan estates and explore what drives rental prices, based on ${listingCount} real listings.`;

/** The production address on Vercel; localhost everywhere else. */
const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const siteUrl = productionHost
  ? `https://${productionHost}`
  : "http://localhost:3000";
