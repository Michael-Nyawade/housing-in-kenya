interface StatCardProps {
  label: string;
  value: string;
  detail: string;
}

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5 sm:p-6">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-2 font-serif text-3xl font-semibold tabular-nums sm:text-4xl">{value}</dd>
      <dd className="mt-1 text-sm text-muted">{detail}</dd>
    </div>
  );
}
