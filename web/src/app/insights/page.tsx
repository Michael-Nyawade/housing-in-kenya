import type { Metadata } from "next";
import Link from "next/link";

import { ColumnChart } from "@/components/column-chart";
import { EstateRankings } from "@/components/estate-rankings";
import { InsightSection } from "@/components/insight-section";
import { PageIntro } from "@/components/page-intro";
import { RentHistogram } from "@/components/rent-histogram";
import { StatCard } from "@/components/stat-card";
import { describeDips } from "@/lib/charts";
import type { ChartItem } from "@/lib/charts";
import { formatKsh, formatNumber, formatThousands } from "@/lib/format";
import { insights } from "@/lib/insights";

export const metadata: Metadata = { title: "Market insights" };

const { dataset, price_summary: summary } = insights;

const bedroomItems: ChartItem[] = insights.by_bedrooms.map((stat) => ({
  label: String(stat.bedrooms),
  value: stat.mean_price,
  listings: stat.listings,
}));

const bathroomItems: ChartItem[] = insights.by_bathrooms.map((stat) => ({
  label: String(stat.bathrooms),
  value: stat.mean_price,
  listings: stat.listings,
}));

const sharedMax = Math.max(...bedroomItems.map((i) => i.value), ...bathroomItems.map((i) => i.value));
const namedEstates = insights.by_estate_group.filter((stat) => stat.estate !== "Other").length;

export default function InsightsPage() {
  return (
    <>
      <PageIntro eyebrow="Market insights" title="How rents vary across estates and homes.">
        {`What the ${formatNumber(dataset.rows_clean)} listings behind the estimator show: where rents run high or low, and how much extra bedrooms and bathrooms tend to cost.`}
      </PageIntro>

      <section aria-label="Key figures" className="mx-auto max-w-6xl px-5 pb-14 sm:px-8">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Listings analysed"
            value={formatNumber(dataset.rows_clean)}
            detail={`${formatNumber(dataset.rows_removed)} more were set aside for missing details`}
          />
          <StatCard
            label="Estates covered"
            value={formatNumber(dataset.estates)}
            detail={`${namedEstates} have ${dataset.rare_estate_threshold} or more listings`}
          />
          <StatCard
            label="Median monthly rent"
            value={formatKsh(summary.median)}
            detail="Half of listings cost more, half less"
          />
          <StatCard
            label="Typical range, KSh"
            value={`${formatThousands(summary.p25)} to ${formatThousands(summary.p75)}`}
            detail="The middle half of all listings"
          />
        </dl>
      </section>

      <InsightSection
        id="spread"
        title="How rents spread out"
        description={`How the ${formatNumber(dataset.rows_clean)} listings fall across monthly rent bands.`}
      >
        <RentHistogram bins={insights.price_distribution} median={summary.median} />
      </InsightSection>

      <InsightSection
        id="estates"
        title="Where rent is highest"
        description="Average monthly rent by estate. Use the filter to hide estates with few listings."
      >
        <EstateRankings estates={insights.by_estate} />
      </InsightSection>

      <InsightSection
        id="homes"
        title="What bedrooms and bathrooms add"
        description="Average monthly rent for each bedroom and bathroom count, on one shared scale."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <ColumnChart
            title="Rent by bedrooms"
            noun="bedroom"
            items={bedroomItems}
            maxValue={sharedMax}
            note={describeDips(bedroomItems, "bedroom")}
          />
          <ColumnChart
            title="Rent by bathrooms"
            noun="bathroom"
            items={bathroomItems}
            maxValue={sharedMax}
            note={describeDips(bathroomItems, "bathroom")}
          />
        </div>
      </InsightSection>

      <InsightSection id="data" title="About this data">
        <div className="rounded-2xl border border-line bg-card p-6 sm:p-8">
          <ul className="list-disc space-y-3 pl-5 text-muted marker:text-accent">
            <li>
              These are listed rents from a single dataset snapshot, not confirmed prices paid by
              tenants.
            </li>
            <li>
              {formatNumber(dataset.rows_clean)} of {formatNumber(dataset.rows_raw)} listings were
              kept. The rest were set aside because details such as the bathroom count were missing.
            </li>
            <li>
              Most listings are in Nairobi and the counties around it. A few come from Mombasa,
              Kisumu, and elsewhere, so the picture is strongest for the Nairobi area.
            </li>
            <li>
              Averages show association, not cause. Homes with more bedrooms also tend to have more
              bathrooms and sit in different estates, so no single average isolates one factor.
            </li>
          </ul>
          <p className="mt-6">
            <Link
              href="/about"
              className="font-medium text-accent underline-offset-4 transition-colors hover:text-accent-strong hover:underline"
            >
              See how the estimator uses this data
            </Link>
          </p>
        </div>
      </InsightSection>
    </>
  );
}
