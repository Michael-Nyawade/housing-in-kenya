import type { Metadata } from "next";

import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "About the model" };

export default function AboutPage() {
  return (
    <PageIntro eyebrow="About the model" title="How the estimates are made, and how far to trust them.">
      The full explanation arrives in a later step.
    </PageIntro>
  );
}
