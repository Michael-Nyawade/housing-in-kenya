import type { ChartItem } from "@/lib/charts";
import { LOW_SAMPLE_LISTINGS } from "@/lib/estimate";
import { formatKsh, formatNumber, formatThousands } from "@/lib/format";

interface ColumnChartProps {
  title: string;
  noun: string;
  items: ChartItem[];
  maxValue: number;
  note: string;
}

export function ColumnChart({ title, noun, items, maxValue, note }: ColumnChartProps) {
  return (
    <figure className="rounded-2xl border border-line bg-card p-5 sm:p-8">
      <figcaption className="font-serif text-xl font-semibold">{title}</figcaption>

      <div className="mt-6" aria-hidden="true">
        <div className="flex h-52 items-end gap-2">
          {items.map((item) => (
            <div key={item.label} className="flex h-full flex-1 flex-col justify-end">
              <span className="mb-1 text-center text-[11px] font-medium tabular-nums sm:text-xs">
                {formatThousands(item.value)}
              </span>
              <div
                className={`origin-bottom animate-grow-y rounded-t-md ${
                  item.listings < LOW_SAMPLE_LISTINGS ? "bg-bar-muted" : "bg-accent"
                }`}
                style={{ height: `${(item.value / maxValue) * 82}%` }}
              />
            </div>
          ))}
        </div>

        <div className="mt-2 flex gap-2 border-t border-line pt-2">
          {items.map((item) => (
            <div key={item.label} className="flex-1 text-center">
              <div className="text-sm font-semibold tabular-nums">{item.label}</div>
              <div className="text-[11px] tabular-nums text-muted sm:text-xs">
                {formatNumber(item.listings)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">
        Bars show average monthly rent in KSh thousands. The grey number under each bar is how many
        listings it rests on, and lighter bars rest on fewer than {LOW_SAMPLE_LISTINGS}.
      </p>
      <p className="mt-2 text-sm">{note}</p>

      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Number of {noun}s</th>
            <th scope="col">Average monthly rent</th>
            <th scope="col">Listings</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.label}>
              <th scope="row">{item.label}</th>
              <td>{formatKsh(item.value)}</td>
              <td>{formatNumber(item.listings)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
