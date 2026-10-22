export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 text-sm text-muted sm:px-8 md:grid-cols-[1fr_auto]">
        <p className="max-w-xl text-pretty">
          Estimates come from a statistical model trained on listing data. They are rough guides, not
          valuations or offers.
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          <li>
            <a
              href="https://www.kaggle.com/datasets/iamasteriix/rental-apartments-in-kenya"
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              Data source
            </a>
          </li>
          <li>
            <a
              href="https://github.com/Michael-Nyawade/housing-in-kenya"
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              Source code
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
