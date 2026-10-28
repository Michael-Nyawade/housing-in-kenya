"use client";

import { useId } from "react";

import { formatEstate } from "@/lib/format";

interface EstateSelectProps {
  value: string;
  options: string[];
  onChange: (estate: string) => void;
  hint: string;
}

export function EstateSelect({ value, options, onChange, hint }: EstateSelectProps) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        Estate
      </label>
      <div className="relative mt-2">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full appearance-none rounded-xl border border-line bg-paper pl-4 pr-11 text-base transition-colors hover:border-accent focus-visible:border-accent"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {formatEstate(option)}
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      <p className="mt-2 text-sm text-muted">{hint}</p>
    </div>
  );
}
