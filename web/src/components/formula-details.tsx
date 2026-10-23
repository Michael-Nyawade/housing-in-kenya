import type { EstateEffect } from "@/lib/breakdown";
import { formatEstate } from "@/lib/format";
import type { ModelData } from "@/lib/predict";

const preciseFormat = new Intl.NumberFormat("en-KE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function precise(value: number): string {
  return value < 0 ? `-${preciseFormat.format(-value)}` : preciseFormat.format(value);
}

interface FormulaDetailsProps {
  data: ModelData;
  effects: EstateEffect[];
}

export function FormulaDetails({ data, effects }: FormulaDetailsProps) {
  const rows = [
    { term: "Starting amount", value: data.intercept },
    { term: "Per bedroom", value: data.coefficients.Bedrooms },
    { term: "Per bathroom", value: data.coefficients.Bathrooms },
    ...effects.map((entry) => ({
      term: entry.isBaseline
        ? `${formatEstate(entry.estate)} (comparison estate)`
        : `${formatEstate(entry.estate)} adjustment`,
      value: entry.effect,
    })),
  ];

  return (
    <details className="group rounded-2xl border border-line bg-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium sm:px-8 [&::-webkit-details-marker]:hidden">
        See the exact formula and every coefficient
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>

      <div className="border-t border-line px-5 py-6 sm:px-8">
        <p className="rounded-xl bg-paper px-4 py-3 font-mono text-sm leading-relaxed">
          rent = starting amount + (per bedroom × bedrooms) + (per bathroom × bathrooms) + estate
          adjustment
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[20rem] text-left text-sm">
            <caption className="sr-only">Every number the model uses, in Kenyan shillings</caption>
            <thead className="border-b border-line text-muted">
              <tr>
                <th scope="col" className="py-3 pr-4 font-medium">
                  Term
                </th>
                <th scope="col" className="py-3 text-right font-medium">
                  Value (KSh)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row) => (
                <tr key={row.term}>
                  <th scope="row" className="py-3 pr-4 font-normal">
                    {row.term}
                  </th>
                  <td className="py-3 text-right tabular-nums">{precise(row.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-sm text-muted">
          {`Trained on ${data.training.rows_train} listings and tested on ${data.training.rows_test}, using scikit-learn ${data.training.sklearn_version} with random state ${data.training.random_state}.`}
        </p>
      </div>
    </details>
  );
}
