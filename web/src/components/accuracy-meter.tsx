interface AccuracyMeterProps {
  r2: number;
}

export function AccuracyMeter({ r2 }: AccuracyMeterProps) {
  const explained = Math.round(r2 * 100);

  return (
    <div className="rounded-2xl border border-line bg-card p-5 sm:p-8">
      <div
        role="img"
        aria-label={`The model accounts for about ${explained} percent of the differences in rent`}
        className="flex h-4 overflow-hidden rounded-full bg-paper ring-1 ring-line"
      >
        <div
          className="origin-left animate-grow-x bg-accent"
          style={{ width: `${Math.min(100, Math.max(0, r2 * 100))}%` }}
        />
      </div>
      <div className="mt-3 flex flex-wrap justify-between gap-x-6 gap-y-1 text-sm text-muted">
        <span>{explained}% accounted for by estate, bedrooms, and bathrooms</span>
        <span>{100 - explained}% down to everything else</span>
      </div>
    </div>
  );
}
