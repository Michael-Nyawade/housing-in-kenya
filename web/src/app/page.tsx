import { Estimator } from "@/components/estimator";
import { PageIntro } from "@/components/page-intro";
import { formatNumber } from "@/lib/format";
import { insights } from "@/lib/insights";

export default function PredictPage() {
  return (
    <>
      <PageIntro eyebrow="Rent estimator" title="What should a rental cost in Kenya?">
        Choose an estate, bedrooms, and bathrooms to see a typical monthly rent, based on{" "}
        {formatNumber(insights.dataset.rows_clean)} real listings.
      </PageIntro>
      <Estimator />
    </>
  );
}
