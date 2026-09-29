'use client';

/* Strona 404 w języku marki – ta sama typografia, jeden komunikat, dwa wyjścia.
   Teksty: src/content/common (notFound), język z adresu (/en/…, /ru/…, reszta = pl). */
import Link from '@/components/as/LocaleLink';
import { useContent } from '@/i18n/client';
import common from '@/content/common';

export default function NotFoundView() {
  const t = useContent(common).notFound;
  return (
    <section className="as-section bg-cream-50">
      <div className="as-shell flex min-h-[60svh] flex-col justify-center py-16">
        <p className="as-label text-ink/70">
          <span className="text-gold-deep">404</span> <span className="text-ink/30">/</span> {t.label}
        </p>
        <h1 className="as-display-lg mt-6 max-w-3xl text-ink">
          {t.title} <span className="italic text-gold-dark">{t.accent}</span>
        </h1>
        <p className="as-body mt-6">{t.body}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/" className="as-btn-solid">
            {t.home}
          </Link>
          <Link href="/kontakt" className="as-btn-ghost">
            {t.contact}
          </Link>
        </div>
      </div>
    </section>
  );
}
