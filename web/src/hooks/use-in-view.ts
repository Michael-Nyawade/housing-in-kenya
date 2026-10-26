"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";

/** True while the referenced element is at least partly on screen. */
export function useInView(ref: RefObject<Element | null>, threshold = 0.15): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return inView;
}
