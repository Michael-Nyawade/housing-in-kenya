"use client";

import { useId } from "react";
import type { ReactNode } from "react";

interface NumberStepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

interface StepButtonProps {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}

function StepButton({ label, disabled, onClick, children }: StepButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-paper text-ink transition-colors hover:border-accent hover:bg-accent-tint active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:bg-paper"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        {children}
      </svg>
    </button>
  );
}

export function NumberStepper({ label, value, min, max, onChange }: NumberStepperProps) {
  const labelId = useId();
  const unit = label.toLowerCase();

  return (
    <div role="group" aria-labelledby={labelId} className="flex items-center justify-between gap-4">
      <div>
        <p id={labelId} className="text-sm font-medium">
          {label}
        </p>
        <p className="mt-0.5 text-sm text-muted">
          {min} to {max}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <StepButton
          label={`Decrease ${unit}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <path d="M5 12h14" />
        </StepButton>
        <output
          aria-live="off"
          aria-label={`${value} ${unit}`}
          className="w-8 text-center font-serif text-2xl font-semibold tabular-nums"
        >
          {value}
        </output>
        <StepButton
          label={`Increase ${unit}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          <path d="M12 5v14M5 12h14" />
        </StepButton>
      </div>
    </div>
  );
}
