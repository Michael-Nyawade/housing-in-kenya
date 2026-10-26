import type { Metadata } from "next";
import Link from "next/link";

import { AccuracyMeter } from "@/components/accuracy-meter";
import { EstateEffects } from "@/components/estate-effects";
import { EstimateBreakdown } from "@/components/estimate-breakdown";
import { FormulaDetails } from "@/components/formula-details";
import { InsightSection } from "@/components/insight-section";
import { ModelComparison, modelLabel } from "@/components/model-comparison";
import { PageIntro } from "@/components/page-intro";
import { StatCard } from "@/components/stat-card";
import { breakdownEstimate, estateEffects } from "@/lib/breakdown";
import {
  formatEstate,
  formatKsh,
  formatNumber,
  formatSignedKsh,
  roundToNearest,
} from "@/lib/format";
import { insights } from "@/lib/insights";
import { model } from "@/lib/predict";

export const metadata: Metadata = { title: "About the model" };

const { dataset } = insights;
const chosen = model.metrics[model.model_name];

const testPercent = Math.round(model.training.test_size * 100);
const trainPercent = 100 - testPercent;

const effects = estateEffects(model, insights.by_estate_group);
const [topEstate, runnerUp] = effects.filter((entry) => !entry.isBaseline);
const baselineListings =
  insights.by_estate_group.find((stat) => stat.estate === model.baseline_estate)?.listings ?? 0;

const exampleEstate = model.estates.includes("Westlands")
  ? "Westlands"
  : (model.estates.find((estate) => estate !== model.baseline_estate) ?? model.baseline_estate);
const exampleInput = { bedrooms: 3, bathrooms: 2, estate: exampleEstate };
const example = breakdownEstimate(model, exampleInput);

const rival = Object.entries(model.metrics).find(([name]) => name !== model.model_name);
const modelsAreClose = rival !== undefined && Math.abs(rival[1].r2 - chosen.r2) < 0.01;
const shareWording = chosen.r2 < 0.5 ? "less than half of" : "only part of";

const summary = [
  {
    title: "The data",
    body: `${formatNumber(dataset.rows_clean)} real rental listings, each recording the estate, the bedrooms, and the bathrooms.`,
  },
  {
    title: "The method",
    body: "A linear regression: a starting amount, plus an adjustment for each bedroom, each bathroom, and the estate.",
  },
  {
    title: "The accuracy",
    body: `On listings held back for testing, estimates were typically off by about ${formatKsh(roundToNearest(chosen.mae, 100))}.`,
  },
];

const linkClass =
  "font-medium text-accent underline-offset-4 transition-colors hover:text-accent-strong hover:underline";

export default function AboutPage() {
  return (
    <>
      <PageIntro eyebrow="About the model" title="How the estimates are made, and how far to trust them.">
        A plain-language tour of the data, the method, and the limits. Every number on this page is
        read straight from the trained model.
      </PageIntro>

      <section aria-label="Summary" className="mx-auto max-w-6xl px-5 pb-14 sm:px-8">
        <ul className="grid gap-4 md:grid-cols-3">
          {summary.map((item) => (
            <li key={item.title} className="rounded-2xl border border-line bg-card p-6">
              <h2 className="font-serif text-xl font-semibold">{item.title}</h2>
              <p className="mt-2 text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <InsightSection id="data" title="The data behind it">
        <div className="max-w-3xl space-y-4 leading-relaxed text-muted">
          <p>
            {`The model learns from ${formatNumber(dataset.rows_raw)} rental listings (the source is linked in the footer). ${formatNumber(dataset.rows_removed)} were set aside because details such as the bathroom count were missing, leaving ${formatNumber(dataset.rows_clean)} to work with.`}
          </p>
          <p>
            Each listing contributes three facts: the estate (the last part of the listed location,
            such as Westlands), the number of bedrooms, and the number of bathrooms. Floor area was
            left out on purpose, because the recorded values were unreliable, with some listings
            showing implausibly small sizes.
          </p>
          <p>
            {`Estates with fewer than ${dataset.rare_estate_threshold} listings are combined into Other areas, so the model does not draw firm conclusions from a handful of listings. Of the ${formatNumber(dataset.rows_clean)} listings, ${formatNumber(model.training.rows_train)} (${trainPercent}%) were used to learn and ${formatNumber(model.training.rows_test)} (${testPercent}%) were held back to test the result.`}
          </p>
        </div>
      </InsightSection>

      <InsightSection
        id="method"
        title="How an estimate is built"
        description={`A ${exampleInput.bedrooms}-bedroom, ${exampleInput.bathrooms}-bathroom home in ${formatEstate(exampleInput.estate)} is the default in the estimator. Here is exactly how its figure is made.`}
      >
        <div className="space-y-6">
          <EstimateBreakdown breakdown={example} />
          <p className="max-w-3xl leading-relaxed text-muted">
            The starting amount is negative because it is a mathematical anchor, not a real rent. No
            actual home matches all the zeros it assumes, so it only makes sense together with the
            other lines. Change any input in the estimator and only the matching line moves.{" "}
            <Link href="/" className={linkClass}>
              Try it in the estimator
            </Link>
          </p>
        </div>
      </InsightSection>

      <InsightSection
        id="factors"
        title="What each factor adds"
        description="Each figure holds the other inputs fixed, so it isolates one change at a time."
      >
        <div className="space-y-6">
          <p className="max-w-3xl leading-relaxed text-muted">
            {`Each extra bedroom changes the estimate by ${formatSignedKsh(model.coefficients.Bedrooms)} and each extra bathroom by ${formatSignedKsh(model.coefficients.Bathrooms)}, whichever estate the home is in.`}
          </p>
          <p className="max-w-3xl leading-relaxed text-muted">
            {`Estates need a zero point to be measured against, so the model uses ${formatEstate(model.baseline_estate)}. Each figure below is how much more rent the model expects than for the same home in ${formatEstate(model.baseline_estate)}. That estate is the zero point only because it comes first alphabetically. Choosing another would change the figures shown here, but not a single estimate.`}
            {topEstate && runnerUp
              ? ` For example, the same home is expected to rent for about ${formatKsh(topEstate.effect)} more in ${formatEstate(topEstate.estate)} than in ${formatEstate(model.baseline_estate)}. To compare two other estates, subtract their figures: ${formatEstate(topEstate.estate)} comes out about ${formatKsh(topEstate.effect - runnerUp.effect)} above ${formatEstate(runnerUp.estate)}.`
              : ""}
          </p>
          <EstateEffects effects={effects} baseline={model.baseline_estate} />
          <div className="rounded-2xl border-l-4 border-ochre bg-card px-6 py-5">
            <h3 className="font-semibold">How to read these figures</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted marker:text-ochre">
              <li>
                Bedrooms and bathrooms usually come together, so the model cannot cleanly separate
                their effects. Read them as a pair, and avoid over-reading the gap between the two
                figures.
              </li>
              <li>
                {`Every estate is measured against ${formatEstate(model.baseline_estate)}, which has only ${formatNumber(baselineListings)} listings, so each estate figure carries some of that uncertainty.`}
              </li>
              <li>
                These figures describe association, not cause. Moving to a different estate changes
                much more than the address, and the model cannot tell which of those things drives
                the rent.
              </li>
            </ul>
          </div>
        </div>
      </InsightSection>

      <InsightSection
        id="accuracy"
        title="How accurate is it?"
        description={`Measured on the ${formatNumber(model.training.rows_test)} listings held back during training, which the model had never seen.`}
      >
        <div className="space-y-6">
          <dl className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Typical error"
              value={formatKsh(roundToNearest(chosen.mae, 100))}
              detail="The average size of the miss on test listings"
            />
            <StatCard
              label="Larger misses"
              value={formatKsh(roundToNearest(chosen.rmse, 100))}
              detail="Big misses count extra, so this is never below the typical error"
            />
            <StatCard
              label="Variation explained"
              value={`${Math.round(chosen.r2 * 100)}%`}
              detail="The share of rent differences the model accounts for"
            />
          </dl>
          <AccuracyMeter r2={chosen.r2} />
          <p className="max-w-3xl leading-relaxed text-muted">
            {`Typical error is the average size of the miss across the test listings. The larger-misses figure measures the same thing but counts a big miss for more than a small one, so it can never be lower. The gap between the two, about ${formatKsh(roundToNearest(chosen.rmse - chosen.mae, 100))}, shows the misses are uneven: some are much larger than the typical one.`}
          </p>
          <p className="max-w-3xl leading-relaxed text-muted">
            {`The model explains ${shareWording} the differences in rent because rent also depends on things this data does not record, such as finishes, building quality, the exact street, amenities, and negotiation.`}
          </p>
        </div>
      </InsightSection>

      <InsightSection
        id="models"
        title="Two models, one choice"
        description="Both were trained on the same listings and tested on the same held-back ones."
      >
        <div className="space-y-6">
          <ModelComparison metrics={model.metrics} chosen={model.model_name} />
          {modelsAreClose && rival && (
            <p className="max-w-3xl leading-relaxed text-muted">
              {`${modelLabel(rival[0])} was trained and tested the same way. Its typical error differs by only about ${formatKsh(Math.abs(rival[1].mae - chosen.mae))}, and it explains almost exactly the same share of the variation. When two models perform this alike, the simpler and more transparent one is the better choice, so ${modelLabel(model.model_name).toLowerCase()} is used here.`}
            </p>
          )}
        </div>
      </InsightSection>

      <InsightSection id="limits" title="Where it falls short">
        <div className="rounded-2xl border border-line bg-card p-6 sm:p-8">
          <ul className="list-disc space-y-3 pl-5 text-muted marker:text-accent">
            <li>These are listed rents, not prices paid. Landlords often negotiate.</li>
            <li>
              The data is a single snapshot. Rents move over time, and this model does not.
            </li>
            <li>
              Only three factors are used. Amenities, condition, floor level, security, and distance
              to transport are not captured.
            </li>
            <li>
              The picture is strongest for the Nairobi area. A few listings come from Mombasa,
              Kisumu, and other towns, and smaller estates are grouped together.
            </li>
            <li>
              Estimates are least reliable at the edges. Homes with no bedrooms or with six are rare
              in the data, and some combinations give figures below the cheapest listing. The
              estimator flags these when they happen.
            </li>
            <li>
              This is not a valuation. For a decision that matters, check current listings and talk
              to local agents.
            </li>
          </ul>
        </div>
      </InsightSection>

      <InsightSection
        id="formula"
        title="The exact formula"
        description="For anyone who wants to check the arithmetic."
      >
        <FormulaDetails data={model} effects={effects} />
      </InsightSection>

      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-5 pb-20 sm:px-8">
        <Link
          href="/"
          className="inline-flex items-center rounded-lg bg-accent px-5 py-3 font-medium text-paper transition-colors hover:bg-accent-strong"
        >
          Try the estimator
        </Link>
        <Link
          href="/insights"
          className="inline-flex items-center rounded-lg border border-line bg-card px-5 py-3 font-medium transition-colors hover:border-accent"
        >
          Browse market insights
        </Link>
      </div>
    </>
  );
}
