/**
 * Logo Babushkina Academy – znak słowny wg logo przysłanego przez klientkę (30.09.2026):
 * „BABUSHKINA” wersalikami o wysokim kontraście, mała korona nad pierwszym „A”,
 * pod spodem rozstrzelone „ACADEMY”.
 *
 * Plików logo od klientki (SVG/PNG) nie ma jeszcze w repo – wysłała je tylko jako obrazy
 * na WhatsAppie. Do czasu dostarczenia plików znak składamy z fontów serwisu (Bodoni Moda
 * + Jost) i korony w SVG, więc jest ostry w każdym rozmiarze i nie potrzebuje pobierania.
 * Po dostarczeniu plików wystarczy podmienić zawartość tego komponentu – nagłówek i menu
 * korzystają tylko z niego. Ikony (src/app/icon.png, apple-icon.png) i public/brand/
 * babushkina-academy-logo.png (logo w JSON-LD, src/lib/seo.jsx) to rendery tego znaku –
 * po zmianie znaku trzeba je odświeżyć.
 *
 * Znak jest dekoracją (aria-hidden): nazwę dostępną daje link, w którym stoi
 * (aria-label „Babushkina Academy – strona główna”).
 */

import { cn } from '@/lib/utils';

/* wysokość wersalików „BABUSHKINA” – reszta znaku skaluje się w em */
const SIZES = {
  sm: 'text-[1.1875rem]', // telefon w poziomie (nagłówek 64 px)
  md: 'text-[1.3125rem] lg:text-[1.5rem]', // nagłówek i menu – 21 / 24 px
  lg: 'text-[2rem] lg:text-[2.5rem]', // duży znak (np. stopka)
};

/* ink – na kremie; light – na espresso; korona zawsze złota (odcień pod tło) */
const TONES = {
  ink: { word: 'text-ink', sub: 'text-ink/75', crown: 'text-gold-dark' },
  light: { word: 'text-cream-50', sub: 'text-cream-200/80', crown: 'text-gold-light' },
};

/* Korona: trzy szczyty z kulkami, obrys jak w logo klientki. viewBox 24 × 12. */
function Crown({ className }) {
  return (
    <svg viewBox="0 0 24 12" fill="none" className={className} aria-hidden="true" focusable="false">
      <path
        d="M3.2 10.6 1.9 3.9l5.2 3.6L12 1.9l4.9 5.6 5.2-3.6-1.3 6.7Z"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      <path d="M3.4 9.2h17.2" stroke="currentColor" strokeWidth="0.7" />
      <circle cx="1.9" cy="3.1" r="0.95" fill="currentColor" />
      <circle cx="12" cy="1.05" r="0.95" fill="currentColor" />
      <circle cx="22.1" cy="3.1" r="0.95" fill="currentColor" />
    </svg>
  );
}

export default function Logo({ size = 'md', tone = 'ink', className }) {
  const c = TONES[tone] || TONES.ink;
  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex shrink-0 select-none flex-col items-center leading-none', SIZES[size] || SIZES.md, className)}
    >
      {/* Bodoni Moda 400 (najcieńsza odmiana fontu), lekko rozstrzelony; korona stoi nad
          wierzchołkiem pierwszego „A” z małym odstępem (jak w logo klientki) – margines
          górny 0,5 em rezerwuje na nią miejsce */}
      <span
        className={cn('relative block whitespace-nowrap pt-[0.5em] font-display font-normal tracking-[0.045em]', c.word)}
        style={{ fontVariationSettings: '"opsz" 28' }}
      >
        B
        <span className="relative inline-block">
          A
          <Crown className={cn('absolute bottom-[1.28em] left-1/2 h-[0.36em] w-[0.72em] -translate-x-1/2', c.crown)} />
        </span>
        BUSHKINA
      </span>
      {/* spacja między wierszami znaku: tekst linku to „BABUSHKINA ACADEMY” (WCAG 2.5.3 – nazwa
          dostępna linku zawiera widoczny napis), w kolumnie flex nie zmienia układu */}{' '}
      <span className={cn('mt-[0.32em] block whitespace-nowrap pl-[0.42em] font-sans text-[0.4em] font-normal tracking-[0.42em]', c.sub)}>
        ACADEMY
      </span>
    </span>
  );
}
