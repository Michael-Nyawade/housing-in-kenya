import type { ReactNode } from "react";

interface PageIntroProps {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}

export function PageIntro({ eyebrow, title, children }: PageIntroProps) {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-8 pt-12 sm:px-8 sm:pt-16">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{eyebrow}</p>
      <h1 className="mt-3 max-w-3xl text-balance font-serif text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
        {title}
      </h1>
      {children && (
        <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-muted">{children}</p>
      )}
    </section>
  );
}
