import { ImageResponse } from "next/og";

import { formatNumber } from "@/lib/format";
import { insights } from "@/lib/insights";
import { siteName } from "@/lib/site";

export const alt = `${siteName}: monthly rent estimates by estate, bedrooms, and bathrooms`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#faf8f4",
          color: "#1c2421",
          padding: "72px 80px",
          borderLeft: "16px solid #0e5a48",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="8" fill="#0e5a48" />
            <path d="M8 15.2 16 8l8 7.2V24h-5.5v-5.5h-5V24H8z" fill="#faf8f4" />
          </svg>
          <div style={{ display: "flex", fontSize: 38, fontWeight: 700 }}>{siteName}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              maxWidth: 980,
            }}
          >
            <div style={{ display: "flex" }}>What should a</div>
            <div style={{ display: "flex" }}>rental cost?</div>
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#5e6a64", maxWidth: 1000 }}>
            Estimate monthly rent by estate, bedrooms, and bathrooms.
          </div>
        </div>

        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              background: "#e4f0eb",
              color: "#0a4638",
              borderRadius: 999,
              padding: "12px 28px",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            {`Based on ${formatNumber(insights.dataset.rows_clean)} real listings`}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
