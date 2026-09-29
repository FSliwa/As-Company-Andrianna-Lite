'use client';

/**
 * PIGMENTY — /pigmenty  („Numer 01")
 *
 * Pełny katalog pigmentów NA TEJ STRONIE, bez przekierowań do zewnętrznego
 * sklepu (prośba klienta, 29.09.2026). Zakup = lista „Twoje zamówienie”
 * wysyłana jako zapytanie (bez płatności online).
 *
 * Dane: WYŁĄCZNIE src/data/pigments.json — kopia publicznego Store API
 * sklepu klienta (kategoria „Pigmenty”), odświeżana skryptem
 * `node scripts/sync-pigments.mjs`. Każda nazwa, cena, pojemność, stan
 * magazynowy i opis pochodzi z danych; liczby w hero i nagłówkach są
 * z nich wyliczane. Pokazujemy tylko cenę bieżącą — bez cen przekreślonych
 * i bez słowa „promocja” (brak najniższej ceny z 30 dni, Omnibus).
 *
 * Zdjęć produktów ze sklepu nie pokazujemy. Kolor próbki to odcień
 * POGLĄDOWY wyznaczony z miniatury (pole `color`); brak koloru → kreskowanie
 * i „bez próbki”.
 *
 * Układ (rytm tła):
 *   01 PageHero band (espresso) — liczby z danych, „Przeglądaj katalog” + „Jak zamówić”
 *   02 Kolekcje #kolekcje (cream-50) — .as-cell z paskiem odcieni; klik filtruje katalog
 *   03 Katalog #katalog (cream-100, hairline) — filtry, licznik (aria-live), siatka
 *      odcieni (pierwsze 12 + „Pokaż wszystkie”), zestawy jako cennik, adnotacje
 *   04 Jak zamówić #zamowienie (cream-50, hairline) — 3 kroki + dokumentacja na prośbę
 *   05 ClosingCta — „Twoje zamówienie” (otwiera listę) + kontakt
 *   + pływający przycisk listy i dwa dialogi (szczegóły, zamówienie)
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLink,
  ClosingCta,
  CtaButton,
  NumberedItem,
  PageHero,
  Reveal,
  SectionLabel,
} from '@/components/as/Primitives';
import {
  collectionById,
  collectionLabel,
  collections as allCollections,
  filterProducts,
  formatCapacity,
  formatSyncedDate,
  productById,
  products as allProducts,
  stats as catalogStats,
  zoneLabel,
  zonesIn,
} from '@/lib/pigments';
import { ProductCell, SetRow } from '@/components/pigments/ProductCell';
import CatalogFilters from '@/components/pigments/CatalogFilters';
import ProductDialog from '@/components/pigments/ProductDialog';
import OrderDialog from '@/components/pigments/OrderDialog';
import OrderFab from '@/components/pigments/OrderFab';
import { NBSP, PaletteStrip, fold, plural } from '@/components/pigments/parts';
import { useOrder } from '@/components/pigments/useOrder';

/* ------------------------------------------------------------------ */
/*  Dane (raz, przy imporcie modułu)                                   */
/* ------------------------------------------------------------------ */

const PRODUCTS = allProducts();
const COLLECTIONS = allCollections().filter((c) => c.count > 0);
const STATS = catalogStats();
const SYNCED = formatSyncedDate();

/* Pierwsze odcienie widoczne od razu (2 rzędy @1440); reszta po „Pokaż
   wszystkie” — pełny przegląd kolekcji daje sekcja 02, a filtr kolekcji
   ze 102 odcieni zostawia 4–28. Wyszukiwanie pokazuje zawsze wszystkie trafienia. */
const PAGE = 8;

const COUNT_WORDS = ['', 'Jedna', 'Dwie', 'Trzy', 'Cztery', 'Pięć', 'Sześć', 'Siedem', 'Osiem', 'Dziewięć', 'Dziesięć'];
const shadesWord = (n) => plural(n, 'odcień', 'odcienie', 'odcieni');
const setsWord = (n) => plural(n, 'zestaw', 'zestawy', 'zestawów');

/* Nazwa kolekcji do nagłówka komórki: łamanie po „/” i miękki dywiz
   w złożeniach z „pigment…” — w kolumnie telefonu (~165 px) słowo
   „Trichopigmentation” nie mieści się w 24 px Bodoni. */
const displayName = (name) => name.replace('/', '/\u200b').replace(/(\w{4,})(pigment)/i, '$1\u00ad$2');

/* Kolory odcieni kolekcji (bez zestawów i bez `null`) — pasek w sekcji 02. */
const PALETTES = Object.fromEntries(
  COLLECTIONS.map((c) => [
    c.id,
    PRODUCTS.filter((p) => p.collection === c.id && !p.isSet && p.color).map((p) => p.color),
  ])
);

/* „6–15 ml” z pojemności odcieni w danych */
const ml = (label) => Number(String(label).replace(',', '.').replace(/\s*ml$/, ''));
const CAPACITY_RANGE =
  STATS.capacities.length > 1
    ? `${ml(STATS.capacities[0])}–${ml(STATS.capacities[STATS.capacities.length - 1])}${NBSP}ml`
    : formatCapacity(STATS.capacities[0] || '');

const HERO_STATS = [
  { value: String(STATS.shades), label: `${shadesWord(STATS.shades)} w katalogu` },
  { value: String(STATS.collections), label: plural(STATS.collections, 'kolekcja', 'kolekcje', 'kolekcji') },
  { value: CAPACITY_RANGE, label: 'pojemność butelki' },
];

const STEPS = [
  {
    number: '01',
    title: 'Wybierz odcienie',
    text: 'Dodaj pigmenty do listy „Twoje zamówienie”. Przy odcieniach w kilku pojemnościach wybierz butelkę — ilość zmienisz na liście.',
  },
  {
    number: '02',
    title: 'Wyślij zapytanie',
    text: 'Podaj imię, telefon i e-mail i wyślij listę jako zapytanie — bez płatności online.',
  },
  {
    number: '03',
    title: 'Potwierdzimy szczegóły',
    text: 'Odpiszemy z informacją o dostępności, łączną kwotą oraz sposobem dostawy i płatności.',
  },
];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================================================================== */
/*  01 — HERO (pas typograficzny, espresso)                            */
/* ================================================================== */

function Hero() {
  return (
    <PageHero
      variant="band"
      label="Pigmenty"
      number="01"
      title="Pigmenty"
      titleAccent="AS COMPANY."
      lead="Pigmenty do brwi, ust i kresek, modyfikatory oraz odcienie do areoli, kamuflażu i trychopigmentacji — AS OPIUM, Light Minerals, AS Classic i kolejne kolekcje. Wybierz odcienie i wyślij zapytanie."
      stats={HERO_STATS}
    >
      <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
        <CtaButton href="#katalog" className="as-btn-invert">
          Przeglądaj katalog
        </CtaButton>
        <ArrowLink href="#zamowienie" tone="light" className="w-fit">
          Jak zamówić
        </ArrowLink>
      </div>
    </PageHero>
  );
}

/* ================================================================== */
/*  02 — KOLEKCJE (klik filtruje katalog)                              */
/* ================================================================== */

function Collections({ onPick }) {
  const n = COLLECTIONS.length;
  return (
    <section id="kolekcje" className="as-section scroll-mt-24 bg-cream-50">
      <div className="as-shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <Reveal className="lg:col-span-7">
            <SectionLabel number="02">Kolekcje</SectionLabel>
            <h2 className="as-display-section as-text-balance mt-6 text-ink">
              {COUNT_WORDS[n] || n} {plural(n, 'kolekcja', 'kolekcje', 'kolekcji')}.
            </h2>
          </Reveal>
          <Reveal delay={80} className="lg:col-span-5">
            <p className="as-body">
              Wybierz kolekcję, a katalog pokaże tylko jej odcienie i zestawy. Pasek pod nazwą to
              odcienie kolekcji — poglądowo.
            </p>
          </Reveal>
        </div>

        {/* komórka: hairline → nazwa → pasek odcieni → liczby → strefy → akcja;
            cała komórka klikalna (akcja rozciągnięta na komórkę) */}
        <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-8 lg:grid-cols-4">
          {COLLECTIONS.map((c) => (
            <li key={c.id} className="as-cell group relative flex min-w-0 flex-col">
              {/* nazwy kolekcji są angielskie — lang="en" daje poprawne dzielenie
                  długich słów w wąskiej kolumnie telefonu (Trichopigmentation) */}
              <h3
                lang="en"
                className="as-title as-text-balance hyphens-auto break-words text-ink transition-colors group-hover:text-gold-dark"
              >
                {displayName(c.name)}
              </h3>
              <PaletteStrip colors={PALETTES[c.id] || []} className="mt-4 h-2 w-full" />
              <p className="mt-4 text-[0.9375rem] leading-[1.6] text-ink/75">
                {c.shades} {shadesWord(c.shades)}
                {c.sets > 0 && ` · ${c.sets} ${setsWord(c.sets)}`}
              </p>
              <p className="as-kicker mt-2 leading-relaxed">{c.zones.map((z) => zoneLabel(z)).join(' · ')}</p>
              <div className="mt-auto pt-6">
                <button
                  type="button"
                  onClick={() => onPick(c.id)}
                  aria-controls="katalog-wyniki"
                  className="as-arrow-dark group static w-fit after:absolute after:inset-0 after:content-['']"
                >
                  <span>Pokaż w katalogu</span>
                  <span className="as-arrow-glyph" aria-hidden="true">
                    &#8594;
                  </span>
                  <span className="sr-only">: {c.name}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  03 — KATALOG                                                       */
/* ================================================================== */

function Catalog({
  headingRef,
  collection,
  setCollection,
  zone,
  setZone,
  query,
  setQuery,
  expanded,
  setExpanded,
  qtyByProduct,
  onAdd,
  onDetails,
}) {
  const gridRef = useRef(null);
  const focusIndex = useRef(null);

  const base = useMemo(() => filterProducts(PRODUCTS, { collection }), [collection]);
  const zones = useMemo(() => zonesIn(base), [base]);
  /* strefa, której nie ma w wybranej kolekcji, przestaje filtrować */
  const activeZone = zone && zones.some((z) => z.id === zone) ? zone : null;
  const q = fold(query.trim());

  const results = useMemo(() => {
    const list = filterProducts(base, { zone: activeZone });
    if (!q) return list;
    return list.filter((p) =>
      fold(`${p.name} ${p.fullName} ${collectionLabel(p.collection)} ${p.series || ''}`).includes(q)
    );
  }, [base, activeZone, q]);

  const shades = useMemo(() => results.filter((p) => !p.isSet), [results]);
  const sets = useMemo(() => results.filter((p) => p.isSet), [results]);
  const limited = !expanded && !q && shades.length > PAGE;
  const visible = limited ? shades.slice(0, PAGE) : shades;
  const filtered = Boolean(collection || activeZone || q);

  /* po „Pokaż wszystkie” fokus na pierwszym nowo pokazanym odcieniu */
  useEffect(() => {
    if (!expanded || focusIndex.current === null) return;
    gridRef.current?.querySelector(`[data-i="${focusIndex.current}"]`)?.focus();
    focusIndex.current = null;
  }, [expanded]);

  const reset = () => {
    setCollection(null);
    setZone(null);
    setQuery('');
    setExpanded(false);
  };

  const summary =
    results.length === 0
      ? 'Brak pigmentów dla wybranych filtrów.'
      : [
          shades.length ? `${shades.length} ${shadesWord(shades.length)}` : null,
          sets.length ? `${sets.length} ${setsWord(sets.length)}` : null,
        ]
          .filter(Boolean)
          .join(' i ') +
        (collection ? ` · ${collectionById(collection)?.name}` : '') +
        (activeZone ? ` · ${zoneLabel(activeZone)}` : '');

  return (
    <section id="katalog" className="as-section scroll-mt-24 border-t border-ink/10 bg-cream-100">
      <div className="as-shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <Reveal className="lg:col-span-7">
            <SectionLabel number="03">Katalog</SectionLabel>
            <h2 ref={headingRef} tabIndex={-1} className="as-display-section as-text-balance mt-6 text-ink">
              Katalog odcieni.
            </h2>
          </Reveal>
          <Reveal delay={80} className="lg:col-span-5">
            <p className="as-body">
              Dodaj odcienie do zamówienia i wyślij listę jako zapytanie — bez płatności online.
              Przy pigmentach w kilku pojemnościach wybierz butelkę.
            </p>
          </Reveal>
        </div>

        <div className="mt-10 lg:mt-12">
          <CatalogFilters
            collections={COLLECTIONS}
            collection={collection}
            onCollection={(id) => {
              setCollection(id);
              setExpanded(false);
            }}
            zones={zones}
            zone={activeZone}
            onZone={(id) => {
              setZone(id);
              setExpanded(false);
            }}
            query={query}
            onQuery={setQuery}
            controls="katalog-wyniki"
          />
        </div>

        <div className="mt-8 flex min-h-[2.75rem] flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-ink/15 pt-4">
          <p role="status" aria-live="polite" className="text-[0.9375rem] text-ink">
            {summary}
          </p>
          {filtered && (
            <button
              type="button"
              onClick={reset}
              className="as-label h-11 text-ink/70 underline decoration-ink/30 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
            >
              Wyczyść filtry
            </button>
          )}
        </div>

        <div id="katalog-wyniki">
          {visible.length > 0 && (
            <ul
              ref={gridRef}
              aria-label="Odcienie"
              className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-8 md:grid-cols-3 xl:grid-cols-4"
            >
              {visible.map((p, i) => (
                <li key={p.id} data-i={i} tabIndex={-1} className="min-w-0">
                  <ProductCell product={p} qty={qtyByProduct.get(p.id) || 0} onAdd={onAdd} onDetails={onDetails} />
                </li>
              ))}
            </ul>
          )}

          {limited && (
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-ink/15 pt-6">
              <p className="as-caption max-w-none">
                Pokazano {PAGE} z{NBSP}{shades.length} {plural(shades.length, 'odcienia', 'odcieni', 'odcieni')}.
              </p>
              <ArrowLink
                onClick={() => {
                  focusIndex.current = PAGE;
                  setExpanded(true);
                }}
                className="w-fit"
              >
                Pokaż wszystkie odcienie ({shades.length})
              </ArrowLink>
            </div>
          )}

          {sets.length > 0 && (
            <div className="mt-14">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <h3 className="as-title text-ink">Zestawy</h3>
                <p className="as-caption max-w-none">Skład zestawu — po kliknięciu nazwy.</p>
              </div>
              <div className="mt-6 grid gap-x-10 lg:grid-cols-2 xl:grid-cols-3">
                {sets.map((p) => (
                  <SetRow key={p.id} product={p} qty={qtyByProduct.get(p.id) || 0} onAdd={onAdd} onDetails={onDetails} />
                ))}
              </div>
            </div>
          )}

          {results.length === 0 && (
            <div className="mt-10">
              <p className="as-body">Nie znaleźliśmy pigmentu dla tych filtrów.</p>
              <ArrowLink onClick={reset} className="mt-6 w-fit">
                Pokaż cały katalog
              </ArrowLink>
            </div>
          )}
        </div>

        <div className="mt-10 space-y-1 border-t border-ink/15 pt-5">
          <p className="as-caption max-w-none">Kolory próbek są poglądowe — odcień na ekranie różni się od pigmentu.</p>
          <p className="as-caption max-w-none">Ceny aktualne na {SYNCED}.</p>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  04 — JAK ZAMÓWIĆ                                                   */
/* ================================================================== */

function HowToOrder() {
  return (
    <section id="zamowienie" className="as-section scroll-mt-24 border-t border-ink/10 bg-cream-50">
      <div className="as-shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Reveal>
              <SectionLabel number="04">Zamówienie</SectionLabel>
              <h2 className="as-display-section as-text-balance mt-6 text-ink">Jak zamówić.</h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="as-body mt-6">
                Dokumentację udostępniamy na prośbę — napisz, której linii i których odcieni dotyczy
                pytanie.
              </p>
              <ArrowLink href="/certyfikaty" className="mt-8 w-fit">
                Dokumentacja produktów
              </ArrowLink>
            </Reveal>
          </div>

          <ol className="grid gap-10 sm:grid-cols-3 sm:gap-8 lg:col-span-8 lg:col-start-5">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.number} delay={i * 80} className="as-cell">
                <NumberedItem number={s.number} title={s.title}>
                  {s.text}
                </NumberedItem>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */

export default function Pigments() {
  const order = useOrder();
  const { add, qtyByProduct, summary } = order;

  const [collection, setCollection] = useState(null);
  const [zone, setZone] = useState(null);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [detailsId, setDetailsId] = useState(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [announce, setAnnounce] = useState('');

  const headingRef = useRef(null);
  /* element, który otworzył dialog — po zamknięciu fokus wraca na niego */
  const returnFocus = useRef(null);
  /* przejście dialog → dialog / dialog → katalog: bez powrotu fokusu */
  const skipReturn = useRef(false);

  /* ?kolekcja=as-opium&strefa=usta — wstępny filtr (link z innej strony).
     window.location zamiast useSearchParams: trasa zostaje statyczna. */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get('kolekcja');
    const z = params.get('strefa');
    if (c && COLLECTIONS.some((x) => x.id === c)) setCollection(c);
    if (z && PRODUCTS.some((p) => p.zones.includes(z))) setZone(z);
  }, []);

  const rememberTrigger = () => {
    if (typeof document !== 'undefined') returnFocus.current = document.activeElement;
  };

  const restoreFocus = useCallback((e) => {
    if (skipReturn.current) {
      e.preventDefault();
      skipReturn.current = false;
      return;
    }
    const el = returnFocus.current;
    if (el && el.isConnected) {
      e.preventDefault();
      el.focus();
    }
  }, []);

  const goToCatalog = useCallback(() => {
    requestAnimationFrame(() => {
      document
        .getElementById('katalog')
        ?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      headingRef.current?.focus({ preventScroll: true });
    });
  }, []);

  const onAdd = useCallback(
    (id, label) => {
      add(id, label);
      const p = productById(id);
      const text = `Dodano do zamówienia: ${p?.name ?? ''}${label ? `, ${formatCapacity(label)}` : ''}.`;
      /* zmiana znaku na końcu — ten sam komunikat ogłasza się ponownie */
      setAnnounce((prev) => (prev === text ? `${text}\u00a0` : text));
    },
    [add]
  );

  const onDetails = useCallback((id) => {
    rememberTrigger();
    setDetailsId(id);
  }, []);

  const openOrder = useCallback(() => {
    rememberTrigger();
    setOrderOpen(true);
  }, []);

  const pickCollection = useCallback(
    (id) => {
      setCollection(id);
      setZone(null);
      setQuery('');
      setExpanded(false);
      goToCatalog();
    },
    [goToCatalog]
  );

  return (
    <>
      <Hero />
      <Collections onPick={pickCollection} />
      <Catalog
        headingRef={headingRef}
        collection={collection}
        setCollection={setCollection}
        zone={zone}
        setZone={setZone}
        query={query}
        setQuery={setQuery}
        expanded={expanded}
        setExpanded={setExpanded}
        qtyByProduct={qtyByProduct}
        onAdd={onAdd}
        onDetails={onDetails}
      />
      <HowToOrder />

      <ClosingCta
        number="05"
        label="Zamówienie"
        title="Twoja lista"
        titleAccent="odcieni."
        lead="Wyślij listę jako zapytanie — potwierdzimy dostępność, łączną kwotę oraz sposób dostawy i płatności. Nie wiesz, od którego odcienia zacząć? Napisz, do jakiej techniki i strefy szukasz pigmentu."
        primary={{
          onClick: openOrder,
          'aria-haspopup': 'dialog',
          label: summary.count > 0 ? `Twoje zamówienie (${summary.count})` : 'Twoje zamówienie',
        }}
        secondary={{ href: '/kontakt?temat=produkty', label: 'Napisz do nas' }}
      />

      <p className="sr-only" role="status" aria-live="polite">
        {announce}
      </p>

      <OrderFab count={order.ready ? summary.count : 0} onOpen={openOrder} />

      <ProductDialog
        productId={detailsId}
        onClose={() => setDetailsId(null)}
        onAdd={onAdd}
        qtyByProduct={qtyByProduct}
        onShowOrder={() => {
          skipReturn.current = true;
          setDetailsId(null);
          setOrderOpen(true);
        }}
        onCloseAutoFocus={restoreFocus}
      />

      <OrderDialog
        open={orderOpen}
        onOpenChange={setOrderOpen}
        order={order}
        onBrowse={() => {
          skipReturn.current = true;
          setOrderOpen(false);
          goToCatalog();
        }}
        onCloseAutoFocus={restoreFocus}
      />
    </>
  );
}
