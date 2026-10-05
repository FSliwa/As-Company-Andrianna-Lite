'use client';

/* Strona 404 w języku marki – ta sama typografia, jeden komunikat, dwa wyjścia:
   przycisk (strona główna) i link ze strzałką (kontakt) – jak w nagłówkach podstron.
   Etykieta przez SectionLabel (numer gold-deep, ukośnik aria-hidden), odstępy jak
   PageHero: 96/56 px, od lg 96/80. Na telefonie i tablecie treść od góry (96 px pod
   nagłówkiem jak na pozostałych podstronach, bez wyśrodkowania w pionie zależnego od
   wysokości ekranu); od lg wyśrodkowana w min. 60svh.
   Teksty: src/content/common (notFound), język z adresu (/en/…, /ru/…, reszta = pl). */
import Link from '@/components/as/LocaleLink';
import { ArrowLink, SectionLabel } from '@/components/as/Primitives';
import { useContent } from '@/i18n/client';
import common from '@/content/common';

/* Twarda spacja przed ostatnim słowem akcentu i akapitu – „ma.” / „exist.” / „szukasz.”
   nie zostaje samo w linii. */
const keepLastWord = (text) => String(text).replace(/ (\S+)$/, ' $1');

export default function NotFoundView() {
  const t = useContent(common).notFound;
  return (
    <section className="bg-cream-50">
      <div className="as-shell flex flex-col pb-14 pt-24 lg:min-h-[60svh] lg:justify-center lg:pb-20 short:pb-10 short:pt-8">
        <SectionLabel number="404" line={false}>
          {t.label}
        </SectionLabel>
        <h1 className="as-display-lg as-text-balance mt-6 max-w-3xl text-ink">
          {t.title} <span className="italic text-gold-dark">{keepLastWord(t.accent)}</span>
        </h1>
        {/* telefon w poziomie (short:): akapit pod przyciskami, jak lead w PageHero – przy
            568 × 320 trzy linie akapitu spychały przycisk „Strona główna” pod pierwszy ekran */}
        <p className="as-body mt-6 short:order-last short:mt-4">{keepLastWord(t.body)}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5 short:mt-5">
          <Link href="/" className="as-btn-solid">
            {t.home}
          </Link>
          <ArrowLink href="/kontakt" className="w-fit">
            {t.contact}
          </ArrowLink>
        </div>
      </div>
    </section>
  );
}
