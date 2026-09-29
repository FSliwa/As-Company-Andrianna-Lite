import Link from 'next/link';

/* Strona 404 w języku marki — ta sama typografia, jeden komunikat, dwa wyjścia. */
export const metadata = {
  title: 'Nie znaleziono strony',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="as-section bg-cream-50">
      <div className="as-shell flex min-h-[60svh] flex-col justify-center py-16">
        <p className="as-label text-ink/70">
          <span className="text-gold-dark">404</span> <span className="text-ink/30">/</span> Nie znaleziono
        </p>
        <h1 className="as-display-lg mt-6 max-w-3xl text-ink">
          Tej strony <span className="italic text-gold-dark">nie ma.</span>
        </h1>
        <p className="as-body mt-6">
          Adres mógł się zmienić albo strona została przeniesiona. Zacznij od strony głównej albo
          napisz do nas — pomożemy znaleźć to, czego szukasz.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/" className="as-btn-solid">
            Strona główna
          </Link>
          <Link href="/kontakt" className="as-btn-ghost">
            Kontakt
          </Link>
        </div>
      </div>
    </section>
  );
}
