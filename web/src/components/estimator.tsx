"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { EstateSelect } from "@/components/estate-select";
import { EstimateBar } from "@/components/estimate-bar";
import { NumberStepper } from "@/components/number-stepper";
import { PriceDistribution } from "@/components/price-distribution";
import { useAnimatedNumber } from "@/hooks/use-animated-number";
import { useInView } from "@/hooks/use-in-view";
import { describeEstimate, sortEstatesForDisplay } from "@/lib/estimate";
import { formatEstate, formatKsh, formatNumber, roundToNearest } from "@/lib/format";
import { insights } from "@/lib/insights";
import { model, predictPrice } from "@/lib/predict";

const estateOptions = sortEstatesForDisplay(model.estates);
const defaultEstate = model.estates.includes("Westlands") ? "Westlands" : estateOptions[0];
const typicalError = model.metrics[model.model_name].mae;

export function Estimator() {
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [estate, setEstate] = useState(defaultEstate);

  const inputsRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const inputsInView = useInView(inputsRef);
  const resultInView = useInView(resultRef);

  const input = { bedrooms, bathrooms, estate };
  const estimate = predictPrice(model, input);
  const context = describeEstimate(input, estimate, insights);
  const animatedEstimate = useAnimatedNumber(estimate);

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-5 pb-20 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
      <div ref={inputsRef} className="rounded-2xl border border-line bg-card p-6 sm:p-8">
        <h2 className="font-serif text-2xl font-semibold">Describe the home</h2>
        <div className="mt-6 space-y-6">
          <EstateSelect
            value={estate}
            options={estateOptions}
            onChange={setEstate}
            hint={`Estates with fewer than ${model.training.rare_estate_threshold} listings are grouped under Other areas.`}
          />
          <NumberStepper
            label="Bedrooms"
            value={bedrooms}
            min={model.input_ranges.bedrooms.min}
            max={model.input_ranges.bedrooms.max}
            onChange={setBedrooms}
          />
          <NumberStepper
            label="Bathrooms"
            value={bathrooms}
            min={model.input_ranges.bathrooms.min}
            max={model.input_ranges.bathrooms.max}
            onChange={setBathrooms}
          />
        </div>
      </div>

      <div
        id="result"
        ref={resultRef}
        className="scroll-mt-24 rounded-2xl border border-line bg-card p-6 sm:p-8"
      >
        <h2 className="sr-only">Your estimate</h2>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">
          Estimated monthly rent
        </p>
        <p className="mt-3 font-serif font-semibold leading-none tabular-nums" aria-hidden="true">
          <span className="mr-2 font-sans text-2xl font-medium text-muted">KSh</span>
          <span className="text-6xl sm:text-7xl">{formatNumber(Math.round(animatedEstimate))}</span>
        </p>
        <p role="status" className="sr-only">
          Estimated monthly rent: {formatKsh(estimate)}
        </p>
        <p className="mt-4 max-w-prose text-pretty text-muted">
          On listings the model had not seen, estimates like this were typically off by about{" "}
          {formatKsh(roundToNearest(typicalError, 100))}. Treat it as a guide, not a quote.
        </p>

        <PriceDistribution
          bins={insights.price_distribution}
          estimate={estimate}
          typicalError={typicalError}
        />

        <dl className="mt-8 grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted">Average in {formatEstate(estate)}</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums">
              {formatKsh(context.estate.meanPrice)}
            </dd>
            <dd className="text-sm text-muted">
              from {formatNumber(context.estate.listings)} listings
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Median across all listings</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums">
              {formatKsh(insights.price_summary.median)}
            </dd>
            <dd className="text-sm text-muted">
              from {formatNumber(insights.dataset.rows_clean)} listings
            </dd>
          </div>
        </dl>

        {context.cautions.length > 0 && (
          <div className="mt-6 rounded-xl border-l-4 border-ochre bg-paper px-5 py-4">
            <h3 className="text-sm font-semibold">Read with care</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-muted">
              {context.cautions.map((caution) => (
                <li key={caution}>{caution}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-6 text-sm">
          <Link
            href="/about"
            className="font-medium text-accent underline-offset-4 transition-colors hover:text-accent-strong hover:underline"
          >
            How is this calculated?
          </Link>
        </p>
      </div>

      <EstimateBar
        visible={inputsInView && !resultInView}
        animatedEstimate={animatedEstimate}
        estimate={estimate}
      />
    </section>
  );
}
