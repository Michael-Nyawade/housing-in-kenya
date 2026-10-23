"use client";

import { useId, useState } from "react";

import { filterByMinListings } from "@/lib/charts";
import { LOW_SAMPLE_LISTINGS } from "@/lib/estimate";
import { formatEstate, formatKsh, formatNumber } from "@/lib/format";
import type { EstateStat } from "@/lib/insights";

const MIN_LISTING_OPTIONS = [1, 5, 10, 30];
const DEFAULT_MIN_LISTINGS = 10;

interface EstateRankingsProps {
  estates: EstateStat[];
}

export function EstateRankings({ estates }: EstateRankingsProps) {
  const [minListings, setMinListings] = useState(DEFAULT_MIN_LISTINGS);
  const groupName = useId();

  const ranked = [...estates].sort((a, b) => b.mean_price - a.mean_price);
  const visible = filterByMinListings(ranked, minListings);
  const maxMean = Math.max(...ranked.map((estate) => estate.mean_price));
  const showsThinGroups = visible.some((estate) => estate.listings < LOW_SAMPLE_LISTINGS);

  return (
    <div className="rounded-2xl border border-line bg-card p-5 sm:p-8">
      <fieldset className="min-w-0">
        <legend className="text-sm font-medium">Show estates with at least this many listings</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {MIN_LISTING_OPTIONS.map((option) => {
            const id = `${groupName}-${option}`;
            return (
              <div key={option}>
                <input
                  id={id}
                  type="radio"
                  name={groupName}
                  value={option}
                  checked={minListings === option}
                  onChange={() => setMinListings(option)}
                  className="peer sr-only"
                />
                <label
                  htmlFor={id}
                  className="inline-flex h-10 min-w-12 cursor-pointer items-center justify-center rounded-full border border-line bg-paper px-4 text-sm font-medium tabular-nums transition-colors hover:border-accent peer-checked:border-accent peer-checked:bg-accent peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent"
                >
                  {option === 1 ? "All" : `${option}+`}
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>

      <p aria-live="polite" className="mt-4 text-sm text-muted">
        Showing {visible.length} of {ranked.length} estates, highest average rent first.
      </p>

      <ol className="mt-6 space-y-4">
        {visible.map((estate) => (
          <li
            key={estate.estate}
            className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 sm:grid-cols-[12rem_minmax(0,1fr)_7rem]"
          >
            <div>
              <span className="font-medium">{formatEstate(estate.estate)}</span>
              <span className="block text-sm text-muted">
                {formatNumber(estate.listings)} {estate.listings === 1 ? "listing" : "listings"}
              </span>
            </div>
            <span className="text-right font-semibold tabular-nums sm:order-3">
              {formatKsh(estate.mean_price)}
            </span>
            <div
              className="col-span-2 h-3 rounded-full bg-paper sm:order-2 sm:col-span-1"
              aria-hidden="true"
            >
              <div
                className={`h-full origin-left animate-grow-x rounded-full ${
                  estate.listings < LOW_SAMPLE_LISTINGS ? "bg-bar-muted" : "bg-accent"
                }`}
                style={{ width: `${(estate.mean_price / maxMean) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ol>

      {showsThinGroups && (
        <p className="mt-6 flex items-center gap-3 text-sm text-muted">
          <span className="inline-block h-2.5 w-8 shrink-0 rounded-full bg-bar-muted" />
          Lighter bars rest on fewer than {LOW_SAMPLE_LISTINGS} listings, so treat them as rough.
        </p>
      )}

      <p className="mt-4 text-sm text-muted">
        Averages built on a handful of listings can swing widely, which is why estates with fewer
        than {DEFAULT_MIN_LISTINGS} are hidden by default.
      </p>
    </div>
  );
}
