import { findBinIndex } from "@/lib/estimate";
import { formatKsh, formatNumber } from "@/lib/format";
import type { PriceBin } from "@/lib/insights";

interface PriceDistributionProps {
  bins: PriceBin[];
  estimate: number;
  typicalError: number;
}

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));
const formatTick = (value: number) => (value === 0 ? "0" : `${Math.round(value / 1000)}k`);

export function PriceDistribution({ bins, estimate, typicalError }: PriceDistributionProps) {
  const maxEdge = bins[bins.length - 1].to;
  const maxCount = Math.max(...bins.map((bin) => bin.listings));
  const activeIndex = findBinIndex(bins, estimate);

  const markerAt = clampPercent((estimate / maxEdge) * 100);
  const bandStart = clampPercent(((estimate - typicalError) / maxEdge) * 100);
  const bandEnd = clampPercent(((estimate + typicalError) / maxEdge) * 100);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((fraction) => fraction * maxEdge);

  return (
    <figure className="mt-8">
      <figcaption>
        <span className="text-sm font-medium">Where this sits among all listings</span>
        <span className="mt-1 block text-sm text-muted">
          Each bar counts the listings in a {formatKsh(bins[0].to - bins[0].from)} rent range.
        </span>
      </figcaption>

      <div className="relative mt-4 h-36" aria-hidden="true">
        <div
          className="absolute inset-y-0 rounded-md bg-accent-tint transition-[left,width] duration-500 ease-out"
          style={{ left: `${bandStart}%`, width: `${bandEnd - bandStart}%` }}
        />
        <div className="relative flex h-full items-end">
          {bins.map((bin, index) => (
            <div key={bin.from} className="flex h-full flex-1 items-end px-px">
              <div
                className={`w-full rounded-t-sm transition-colors duration-300 ${
                  index === activeIndex ? "bg-accent" : "bg-bar-muted"
                }`}
                style={{
                  height: `${Math.max((bin.listings / maxCount) * 100, bin.listings > 0 ? 2 : 0)}%`,
                }}
              />
            </div>
          ))}
        </div>
        <div
          className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-ochre transition-[left] duration-500 ease-out"
          style={{ left: `${markerAt}%` }}
        />
      </div>

      <div className="relative mt-2 h-5 text-xs tabular-nums text-muted" aria-hidden="true">
        {ticks.map((tick) => (
          <span
            key={tick}
            className="absolute -translate-x-1/2"
            style={{ left: `${(tick / maxEdge) * 100}%` }}
          >
            {formatTick(tick)}
          </span>
        ))}
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted" aria-hidden="true">
        <li className="flex items-center gap-2">
          <span className="h-3 w-0.5 bg-ochre" />
          Your estimate
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-accent-tint ring-1 ring-line" />
          Typical error either side
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-accent" />
          Rent range holding your estimate
        </li>
      </ul>

      <table className="sr-only">
        <caption>Number of listings by monthly rent range</caption>
        <thead>
          <tr>
            <th scope="col">Rent range</th>
            <th scope="col">Listings</th>
          </tr>
        </thead>
        <tbody>
          {bins.map((bin) => (
            <tr key={bin.from}>
              <th scope="row">
                {formatKsh(bin.from)} to {formatKsh(bin.to)}
              </th>
              <td>{formatNumber(bin.listings)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
