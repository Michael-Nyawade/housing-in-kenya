import type { Breakdown } from "@/lib/breakdown";
import { formatKsh, formatSignedKsh } from "@/lib/format";

interface EstimateBreakdownProps {
  breakdown: Breakdown;
}

export function EstimateBreakdown({ breakdown }: EstimateBreakdownProps) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5 sm:p-8">
      <ol className="divide-y divide-line">
        {breakdown.lines.map((line) => (
          <li key={line.label} className="flex items-baseline justify-between gap-4 py-4">
            <div>
              <span className="font-medium">{line.label}</span>
              <span className="block text-sm text-muted">{line.detail}</span>
            </div>
            <span className="shrink-0 font-semibold tabular-nums">
              {formatSignedKsh(line.amount)}
            </span>
          </li>
        ))}
      </ol>
      <div className="flex items-baseline justify-between gap-4 border-t-2 border-ink pt-5">
        <span className="font-serif text-xl font-semibold">Estimated monthly rent</span>
        <span className="font-serif text-2xl font-semibold tabular-nums sm:text-3xl">
          {formatKsh(breakdown.total)}
        </span>
      </div>
      <p className="mt-3 text-xs text-muted">
        Each line is rounded to the nearest shilling, so the lines can differ from the total by a
        shilling or two.
      </p>
    </div>
  );
}
