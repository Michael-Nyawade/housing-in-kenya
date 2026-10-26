import { formatKsh, formatNumber } from "@/lib/format";

interface EstimateBarProps {
  visible: boolean;
  animatedEstimate: number;
  estimate: number;
}

/** Small-screen summary that keeps the live estimate in view while the inputs are on screen. */
export function EstimateBar({ visible, animatedEstimate, estimate }: EstimateBarProps) {
  return (
    <div
      inert={!visible}
      className={`fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/95 backdrop-blur transition-transform duration-300 ease-out lg:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <a
        href="#result"
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-8"
      >
        <span>
          <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-accent">
            Estimated monthly rent
          </span>
          <span className="block font-serif text-2xl font-semibold tabular-nums">
            <span aria-hidden="true">KSh {formatNumber(Math.round(animatedEstimate))}</span>
            <span className="sr-only">{formatKsh(estimate)}</span>
          </span>
        </span>
        <span className="shrink-0 text-sm font-medium text-accent">See details</span>
      </a>
    </div>
  );
}
