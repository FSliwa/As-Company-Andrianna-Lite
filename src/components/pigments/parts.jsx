'use client';

/**
 * Drobne klocki katalogu pigmentów: próbka koloru, pole zdjęcia butelki, pasek palety
 * kolekcji, wybór pojemności, opis produktu, cena i odmiana liczebników.
 * Wszystkie teksty i liczby pochodzą z src/data/pigments.json (przez
 * src/lib/pigments.js), zdjęcia – z /Graphics (src/lib/productPhotos.js) –
 * tu jest tylko prezentacja.
 */

import React, { createContext, useContext } from 'react';
import { Figure } from '@/components/as/Primitives';
import { cn } from '@/lib/utils';
import { collectionLabel, formatCapacity, formatPrice, zoneLabel } from '@/lib/pigments';
import { productPhoto } from '@/lib/productPhotos';

export const NBSP = '\u00a0';

/* Separator list „A · B · C”: twarda spacja PRZED kropką – wiersz łamie się
   tylko po „·”, więc żadna linia nie zaczyna się od kropki. */
export const DOT = `${NBSP}· `;

/* ---------------- ceny: aktualne czy do potwierdzenia ---------------- */

/**
 * `true`, gdy ceny w danych są starsze niż PRICE_MAX_AGE_DAYS (src/lib/pigments.js)
 * – wtedy zamiast kwot piszemy „cena do potwierdzenia”, a suma się nie liczy.
 * Wartość ustala widok /pigmenty (serwer przy renderze + przeglądarka po
 * zamontowaniu), komponenty tylko ją czytają.
 */
export const PricesStaleContext = createContext(false);
export const usePricesStale = () => useContext(PricesStaleContext);

export const PRICE_TBC = 'cena do potwierdzenia';

/* ---------------- tekst ---------------- */

/** Polska odmiana: plural(2, 'odcień', 'odcienie', 'odcieni') → 'odcienie'. */
export function plural(n, one, few, many) {
  if (n === 1) return one;
  const d = n % 10;
  const h = n % 100;
  return d >= 2 && d <= 4 && (h < 12 || h > 14) ? few : many;
}

/* Serie ze sklepu (COLORS / ORGANIC / CLASSIC / CONCENTRATE) zapisujemy jak
   nazwy własne – tak samo jak dotąd w tekstach strony („seria Concentrate”). */
export function seriesLabel(series) {
  if (!series) return null;
  return series.charAt(0) + series.slice(1).toLowerCase();
}

/** „AS OPIUM · Colors” – kolekcja i seria nad nazwą. Seria powtarzająca nazwę
    kolekcji („AS Classic · Classic”) jest pomijana. */
export function kickerFor(product) {
  const collection = collectionLabel(product.collection);
  const series = seriesLabel(product.series);
  const repeats = series && fold(collection).split(/\s+/).includes(fold(series));
  return [collection, repeats ? null : series].filter(Boolean).join(DOT);
}

/** „Brwi · Usta · Kreski” (bez kropki na początku linii – DOT) */
export function zonesText(product) {
  return product.zones.map((z) => zoneLabel(z)).join(DOT);
}

/** Nazwa do wyświetlenia: „+” między słowami nie zostaje sam w linii
    („Hybrid + Organic” → twarde spacje). Dane (i tekst do schowka) bez zmian. */
export function displayName(name) {
  return String(name || '').replace(/ \+ /g, `${NBSP}+${NBSP}`);
}

/** Porównanie bez wielkości liter i polskich znaków (wyszukiwarka). */
export function fold(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .toLowerCase();
}

/* ---------------- próbka koloru ---------------- */

/* Kreskowanie dla produktów bez wiarygodnego koloru (zestawy, biały pigment). */
const HATCH = {
  backgroundImage: 'repeating-linear-gradient(135deg, rgba(36,27,20,0.32) 0 1px, transparent 1px 6px)',
};
/* Cienka wewnętrzna obwódka – jasne odcienie nie zlewają się z kremem. */
const RING = { boxShadow: 'inset 0 0 0 1px rgba(36,27,20,0.12)' };

/**
 * Próbka odcienia. `color` = '#rrggbb' (odcień poglądowy z danych) albo null.
 * Dekoracyjna dla czytnika – nazwa produktu stoi obok; brak koloru jest
 * opisany tekstem „bez próbki” przez komponent nadrzędny.
 */
export function Swatch({ color, className }) {
  return (
    <span
      aria-hidden="true"
      className={cn('block', !color && 'border border-ink/20', className)}
      style={color ? { backgroundColor: color, ...RING } : HATCH}
    />
  );
}

/* ---------------- zdjęcie butelki albo próbka w polu karty ---------------- */

/* Tło pola: cream-100 na kremie sekcji (cream-50). Packshot mnożony przez ten ton
   (mix-blend-multiply) traci białe tło, a barwa pigmentu przesuwa się minimalnie
   (cream-200 z .as-media ocieplał ją wyraźniej). Widoczne pole jest potrzebne:
   rozmaz koloru na zdjęciach dochodzi do lewej krawędzi kadru – na niewidocznym
   polu wyglądałby na ucięty. Ten sam ton w polu bez zdjęcia (ProductTile). */

/**
 * Zdjęcie produktu w polu o proporcji `ratio` (object-contain – nic nie ucina;
 * mix-blend-multiply, gdy packshot jest na białym tle). `null`, gdy zdjęcia nie ma.
 * `!object-contain`: reguła `.as-media img` (index.css) ma object-cover i wyższą
 * specyficzność niż sama klasa narzędziowa – bez `!` kadr inny niż kwadrat (dialog 4:3)
 * ucinał górę i dół packshotu.
 * Zdjęcie na czarnym tle (blend: false) dostaje czarne pole – przy proporcji innej
 * niż kwadrat (dialog) boki nie odcinają się kremem.
 */
export function ProductPhoto({ product, ratio = '1 / 1', sizes, alt = '', className }) {
  const photo = productPhoto(product.id);
  if (!photo) return null;
  return (
    <Figure
      image={photo.image}
      alt={alt}
      ratio={ratio}
      sizes={sizes}
      zoom={false}
      className={cn(photo.blend ? '[&_.as-media]:bg-cream-100' : '[&_.as-media]:bg-black', className)}
      imgClassName={cn('!object-contain', photo.blend && 'mix-blend-multiply')}
    />
  );
}

/**
 * Pole na górze komórki katalogu: zdjęcie butelki, a bez zdjęcia – w tym samym polu
 * i tej samej proporcji – próbka koloru: koło na środku (tam, gdzie na zdjęciu stoi
 * butelka) w złotej linii jak .as-photo-frame i podpis „próbka koloru” (bez koloru:
 * kreskowanie i „bez próbki” – ten podpis czyta też czytnik). Wysokość pola zależy
 * tylko od szerokości kolumny, więc rzędy siatki się nie rozjeżdżają.
 */
export function ProductTile({ product, sizes, className }) {
  const photo = productPhoto(product.id);
  if (photo) return <ProductPhoto product={product} sizes={sizes} className={className} />;
  return (
    /* poniżej 340 px koło jest mniejsze i stoi wyżej – podpis łamie się tam na 2 linie
       i inaczej nachodzi na złotą obwódkę */
    <div
      className={cn(
        'relative flex aspect-square items-center justify-center bg-cream-100 max-[339px]:items-start max-[339px]:pt-[14%]',
        className
      )}
    >
      <Swatch
        color={product.color}
        className="aspect-square w-[34%] rounded-full outline outline-1 outline-offset-[6px] outline-gold/40 min-[340px]:w-[42%]"
      />
      <span
        aria-hidden={product.color ? 'true' : undefined}
        className="as-label absolute inset-x-2 bottom-[7%] text-center text-ink/65"
      >
        {product.color ? 'próbka koloru' : 'bez próbki'}
      </span>
    </div>
  );
}

/** Pasek odcieni kolekcji – segment na każdy kolor (bez zestawów i bez `null`). */
export function PaletteStrip({ colors, className }) {
  if (!colors.length) return <Swatch color={null} className={className} />;
  return (
    <span aria-hidden="true" className={cn('flex overflow-hidden', className)} style={RING}>
      {colors.map((c, i) => (
        <span key={`${c}-${i}`} className="h-full flex-1" style={{ backgroundColor: c }} />
      ))}
    </span>
  );
}

/* ---------------- cena ---------------- */

/**
 * `showStock` – przy pojemności bez stanu dopisek „(brak)” (komórka katalogu,
 * gdy produkt jako całość jest dostępny).
 *
 * Cena jak `priceLabel()` z src/lib/pigments.js („6 ml 149 zł · 15 ml 219 zł”),
 * tylko złożona w spany: pojemność Jost 13 px, kwota Bodoni 22 px, każda para
 * nie łamie się w środku. Kropka rozdzielająca stoi PRZED parą i jest przycięta,
 * gdy para zaczyna wiersz (wąska komórka: bez wiszącej „·” na końcu linii).
 * Bez cen przekreślonych i bez „promocji”. Ceny przeterminowane → „cena do
 * potwierdzenia” (pojemności zostają).
 */
export function PriceLine({ variants, showStock = false, className }) {
  const stale = usePricesStale();
  if (!variants?.length) return null;
  const labels = variants.filter((v) => v.label);
  if (stale) {
    return (
      <p className={cn('text-[0.8125rem] leading-relaxed text-mocha', className)}>
        {labels.length > 0 && `${labels.map((v) => formatCapacity(v.label)).join(' · ')} – `}
        {PRICE_TBC}
      </p>
    );
  }
  return (
    /* -ml-4 + overflow-hidden: kropka pary, która zaczyna wiersz, wypada poza kadr */
    <div className={cn('overflow-hidden', className)}>
      <p className="-ml-4 flex flex-wrap items-baseline gap-y-1 py-0.5 text-ink">
        {variants.map((v) => (
          <span key={v.sourceId} className="relative whitespace-nowrap pl-4">
            <span aria-hidden="true" className="absolute left-[0.3rem] text-ink/40">
              ·
            </span>
            {v.label && <span className="mr-1.5 text-[0.8125rem] text-mocha">{formatCapacity(v.label)}</span>}
            <span className="font-display text-[1.375rem] leading-none">{formatPrice(v.price)}</span>
            {/* poniżej 340 px (kolumna 110–130 px) „(brak)” schodzi pod parę – inaczej
                overflow-hidden ucina go do „(b” */}
            {showStock && !v.inStock && (
              <span className="ml-1.5 text-[0.8125rem] text-mocha max-[339px]:ml-0 max-[339px]:block">
                <span aria-hidden="true">(brak)</span>
                <span className="sr-only">brak w magazynie</span>
              </span>
            )}
          </span>
        ))}
      </p>
    </div>
  );
}

/* ---------------- wybór pojemności ---------------- */

/**
 * Natywne radio (strzałki, Tab, czytnik za darmo) wystylizowane na segmenty
 * 44 px. Pojemność bez stanu magazynowego jest nieaktywna; pod segmentami
 * pada zdanie, której butelki brakuje.
 */
export function VariantPicker({ product, value, onChange, name, showPrice = false, note = true, className }) {
  const stale = usePricesStale();
  return (
    <fieldset className={className}>
      <legend className="sr-only">Pojemność – {product.name}</legend>
      <div className="flex flex-wrap">
        {product.variants.map((v, i) => {
          const id = `${name}-${i}`;
          return (
            <label key={v.sourceId} htmlFor={id} className={cn('relative scroll-mb-24 sm:scroll-mb-40', i > 0 && '-ml-px')}>
              <input
                id={id}
                type="radio"
                name={name}
                value={v.label ?? ''}
                checked={value === v.label}
                disabled={!v.inStock}
                onChange={() => onChange(v.label)}
                onFocus={(e) => e.currentTarget.parentElement.scrollIntoView({ block: 'nearest' })}
                className="peer sr-only"
              />
              <span
                className={cn(
                  'flex h-11 min-w-[3.75rem] cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap border px-3 text-[0.8125rem] transition-colors',
                  'border-ink/25 text-ink hover:border-ink',
                  'peer-checked:relative peer-checked:z-[1] peer-checked:border-ink peer-checked:bg-ink peer-checked:text-cream-50',
                  'peer-focus-visible:relative peer-focus-visible:z-[2] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink',
                  'peer-disabled:cursor-not-allowed peer-disabled:border-dashed peer-disabled:border-ink/25 peer-disabled:text-ink/45 peer-disabled:hover:border-ink/25'
                )}
              >
                {formatCapacity(v.label)}
                {showPrice && !stale && <span className="opacity-80">· {formatPrice(v.price)}</span>}
                {!v.inStock && <span className="sr-only"> – brak w magazynie</span>}
              </span>
            </label>
          );
        })}
      </div>
      {note && <StockNote product={product} className="mt-2" />}
    </fieldset>
  );
}

/** „15 ml – brak w magazynie” dla pojemności bez stanu (gdy produkt jako całość jest dostępny). */
export function StockNote({ product, className }) {
  const out = product.variants.filter((v) => !v.inStock && v.label);
  if (!out.length || !product.inStock) return null;
  return (
    <p className={cn('text-[0.8125rem] leading-snug text-mocha', className)}>
      {out.map((v) => formatCapacity(v.label)).join(', ')} – brak w{NBSP}magazynie
    </p>
  );
}

/** Pierwsza dostępna pojemność (albo pierwsza w ogóle, gdy nic nie ma). */
export function defaultLabel(product) {
  return (product.variants.find((v) => v.inStock) ?? product.variants[0])?.label ?? null;
}

/* ---------------- opis produktu ---------------- */

/**
 * Opis ze sklepu jako czysty tekst: akapity rozdzielone pustą linią,
 * punkty jako linie „• …”. Punkty składamy w listę ze złotą kreską.
 */
export function Description({ text, className }) {
  if (!text) return null;
  const blocks = [];
  text.split(/\n{2,}/).forEach((para) => {
    const lines = para.split('\n').map((l) => l.trim()).filter(Boolean);
    let list = null;
    lines.forEach((line) => {
      if (/^•\s*/.test(line)) {
        if (!list) {
          list = [];
          blocks.push({ type: 'ul', items: list });
        }
        list.push(line.replace(/^•\s*/, ''));
      } else {
        list = null;
        blocks.push({ type: 'p', text: line });
      }
    });
  });
  return (
    <div className={cn('space-y-3 text-[0.9375rem] leading-[1.65] text-ink/80', className)}>
      {blocks.map((b, i) =>
        b.type === 'ul' ? (
          <ul key={i} className="space-y-1.5">
            {b.items.map((it, j) => (
              <li key={j} className="flex gap-3">
                <span className="as-dash" aria-hidden="true" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>{b.text}</p>
        )
      )}
    </div>
  );
}

/* ---------------- przycisk „Dodaj” ---------------- */

/* Kompaktowy przycisk kontrolki katalogu (44 px) – ten sam język co .as-btn-ghost. */
export const ADD_BTN =
  'inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap border border-ink/25 px-4 text-[0.6875rem] font-medium uppercase tracking-wider2 text-ink transition-colors hover:border-ink hover:bg-ink hover:text-cream-50 focus-visible:outline-ink';
