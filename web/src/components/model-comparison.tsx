import { formatKsh } from "@/lib/format";
import type { ModelMetrics } from "@/lib/predict";

const LABELS: Record<string, string> = {
  linear_regression: "Linear regression",
  random_forest: "Random forest",
};

export function modelLabel(name: string): string {
  return LABELS[name] ?? name;
}

interface ModelComparisonProps {
  metrics: Record<string, ModelMetrics>;
  chosen: string;
}

export function ModelComparison({ metrics, chosen }: ModelComparisonProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-card">
      <table className="w-full min-w-[34rem] text-left text-sm">
        <caption className="sr-only">
          Accuracy of each model on listings held back for testing
        </caption>
        <thead className="border-b border-line text-muted">
          <tr>
            <th scope="col" className="px-5 py-4 font-medium">
              Model
            </th>
            <th scope="col" className="px-5 py-4 font-medium">
              Typical error
            </th>
            <th scope="col" className="px-5 py-4 font-medium">
              Larger misses
            </th>
            <th scope="col" className="px-5 py-4 font-medium">
              Variation explained
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {Object.entries(metrics).map(([name, values]) => (
            <tr key={name} className={name === chosen ? "bg-accent-tint" : ""}>
              <th scope="row" className="px-5 py-4 font-medium">
                {modelLabel(name)}
                {name === chosen && (
                  <span className="ml-2 rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-paper">
                    Used here
                  </span>
                )}
              </th>
              <td className="px-5 py-4 tabular-nums">{formatKsh(values.mae)}</td>
              <td className="px-5 py-4 tabular-nums">{formatKsh(values.rmse)}</td>
              <td className="px-5 py-4 tabular-nums">{(values.r2 * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
