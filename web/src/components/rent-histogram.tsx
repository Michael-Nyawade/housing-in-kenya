import { findBinIndex } from "@/lib/estimate";
import { formatKsh, formatNumber } from "@/lib/format";
import type { PriceBin } from "@/lib/insights";

interface RentHistogramProps {
  bins: PriceBin[];
  median: number;
}

const formatTick = (value: number) => (value === 0 ? "0" : `${value / 1000}k`);

export function RentHistogram({ bins, median }: RentHistogramProps) {
  const maxCount = Math.max(...bins.map((bin) => bin.listings));
  const maxEdge = bins[bins.length - 1].to;
  const medianIndex = findBinIndex(bins, median);
  const edges = [bins[0].from, ...bins.map((bin) => bin.to)];

  return (
    <figure className="rounded-2xl border border-line bg-card p-5 sm:p-8">
      <figcaption className="max-w-2xl text-sm text-muted">
        Number of listings in each {formatKsh(bins[0].to - bins[0].from)} monthly rent band. The
        darker bar holds the median listing, {formatKsh(median)}.
      </figcaption>

      <div className="mt-6" aria-hidden="true">
        <div className="flex h-56 items-end gap-1 sm:gap-1.5">
          {bins.map((bin, index) => (
            <div key={bin.from} className="flex h-full flex-1 flex-col justify-end">
              <span className="mb-1 text-center text-[11px] tabular-nums text-muted sm:text-xs">
                {formatNumber(bin.listings)}
              </span>
              <div
                className={`origin-bottom animate-grow-y rounded-t-md ${
                  index === medianIndex ? "bg-accent" : "bg-bar-muted"
                }`}
                style={{
                  height: `${Math.max((bin.listings / maxCount) * 85, bin.listings > 0 ? 2 : 0)}%`,
                }}
              />
            </div>
          ))}
        </div>

        <div className="relative mt-2 h-5 border-t border-line pt-1 text-xs tabular-nums text-muted">
          {edges.map((edge, index) => (
            <span
              key={edge}
              className={`absolute -translate-x-1/2 ${index % 2 === 1 ? "hidden sm:block" : ""}`}
              style={{ left: `${(edge / maxEdge) * 100}%` }}
            >
              {formatTick(edge)}
            </span>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-muted">Monthly rent in KSh</p>
      </div>

      <table className="sr-only">
        <caption>Number of listings by monthly rent band</caption>
        <thead>
          <tr>
            <th scope="col">Rent band</th>
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
