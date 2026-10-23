import type { ReactNode } from "react";

interface InsightSectionProps {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function InsightSection({ id, title, description, children }: InsightSectionProps) {
  return (
    <section aria-labelledby={`${id}-title`} className="mx-auto max-w-6xl px-5 pb-14 sm:px-8">
      <h2 id={`${id}-title`} className="font-serif text-2xl font-semibold sm:text-3xl">
        {title}
      </h2>
      {description && <p className="mt-2 max-w-2xl text-pretty text-muted">{description}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}
