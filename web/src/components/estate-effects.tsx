import type { EstateEffect } from "@/lib/breakdown";
import { LOW_SAMPLE_LISTINGS } from "@/lib/estimate";
import { formatEstate, formatNumber, formatSignedKsh } from "@/lib/format";

interface EstateEffectsProps {
  effects: EstateEffect[];
  baseline: string;
}

function barClass(entry: EstateEffect): string {
  if (entry.effect < 0) return "bg-ochre";
  return entry.listings < LOW_SAMPLE_LISTINGS ? "bg-bar-muted" : "bg-accent";
}

export function EstateEffects({ effects, baseline }: EstateEffectsProps) {
  const maxEffect = Math.max(...effects.map((entry) => Math.abs(entry.effect))) || 1;
  const showsThinGroups = effects.some(
    (entry) => !entry.isBaseline && entry.listings < LOW_SAMPLE_LISTINGS,
  );

  return (
    <div className="rounded-2xl border border-line bg-card p-5 sm:p-8">
      <p className="max-w-2xl text-sm text-muted">
        Extra monthly rent compared with {formatEstate(baseline)}, for the same number of bedrooms
        and bathrooms.
      </p>

      <ol className="mt-6 space-y-4">
        {effects.map((entry) => (
          <li
            key={entry.estate}
            className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 sm:grid-cols-[12rem_minmax(0,1fr)_8rem]"
          >
            <div>
              <span className="font-medium">{formatEstate(entry.estate)}</span>
              <span className="block text-sm text-muted">
                {formatNumber(entry.listings)} {entry.listings === 1 ? "listing" : "listings"}
                {entry.isBaseline ? " · comparison estate" : ""}
              </span>
            </div>
            <span className="text-right font-semibold tabular-nums sm:order-3">
              {formatSignedKsh(entry.effect)}
            </span>
            <div
              className="col-span-2 h-3 rounded-full bg-paper sm:order-2 sm:col-span-1"
              aria-hidden="true"
            >
              {entry.effect !== 0 && (
                <div
                  className={`h-full origin-left animate-grow-x rounded-full ${barClass(entry)}`}
                  style={{ width: `${(Math.abs(entry.effect) / maxEffect) * 100}%` }}
                />
              )}
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
    </div>
  );
}
