import Link from "next/link";

import { PageIntro } from "@/components/page-intro";

export default function NotFound() {
  return (
    <>
      <PageIntro eyebrow="404" title="That page does not exist.">
        The link may be out of date, or the address mistyped.
      </PageIntro>
      <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        <Link
          href="/"
          className="inline-flex items-center rounded-lg bg-accent px-5 py-3 font-medium text-paper transition-colors hover:bg-accent-strong"
        >
          Back to the estimator
        </Link>
      </div>
    </>
  );
}
