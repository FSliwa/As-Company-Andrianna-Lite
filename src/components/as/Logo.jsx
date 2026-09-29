/**
 * Logo AS COMPANY POLAND – oficjalny plik marki (korona, kaligraficzny monogram
 * „AS” z pętlami, ramka, „COMPANY / POLAND”), ten sam co w makiecie i w sklepie
 * klienta (as05.png). Złoty gradient na przezroczystym tle – działa na kremie
 * i na espresso, więc nie potrzebuje wariantu kolorystycznego.
 *
 * Pliki: public/brand/as-company-logo-{96,160,240,320}.{webp,png} + oryginał.
 * Wcześniej była tu uproszczona rekonstrukcja SVG z dopiskiem „LOVELINESS PMU”,
 * który w logo marki nie występuje.
 */

import { cn } from '@/lib/utils';

const SIZES = {
  sm: 'h-14 w-14', // nagłówek na telefonie – 56 px
  md: 'h-14 w-14 lg:h-16 lg:w-16', // nagłówek – 56 / 64 px
  lg: 'h-24 w-24 lg:h-28 lg:w-28', // stopka
};

export default function Logo({ size = 'md', className, priority = false }) {
  return (
    <picture className={cn('block shrink-0', SIZES[size] || SIZES.md, className)}>
      <source
        type="image/webp"
        srcSet="/brand/as-company-logo-96.webp 96w, /brand/as-company-logo-160.webp 160w, /brand/as-company-logo-240.webp 240w, /brand/as-company-logo-320.webp 320w"
        sizes={size === 'lg' ? '112px' : '64px'}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/as-company-logo-160.png"
        srcSet="/brand/as-company-logo-96.png 96w, /brand/as-company-logo-160.png 160w, /brand/as-company-logo-240.png 240w, /brand/as-company-logo-320.png 320w"
        sizes={size === 'lg' ? '112px' : '64px'}
        width={160}
        height={159}
        alt="AS COMPANY POLAND"
        /* Lite: złoty gradient na kremie traci rysunek (napis POLAND ~1,5:1) – lekkie
           przyciemnienie tego samego pliku marki daje ok. 2,7:1, bez nowej grafiki. */
        className="h-full w-full object-contain [filter:brightness(0.78)_saturate(1.1)]"
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : undefined}
      />
    </picture>
  );
}
