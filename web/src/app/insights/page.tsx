import type { Metadata } from "next";

import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Market insights" };

export default function InsightsPage() {
  return (
    <PageIntro eyebrow="Market insights" title="How rents vary across estates and homes.">
      Charts arrive in a later step.
    </PageIntro>
  );
}
