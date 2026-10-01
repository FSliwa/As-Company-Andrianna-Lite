'use client';

/**
 * PIGMENTY – /pigmenty  („Numer 01")
 *
 * Pełny katalog pigmentów NA TEJ STRONIE, bez przekierowań do zewnętrznego
 * sklepu (prośba klienta, 29.09.2026). Zakup = lista „Twoje zamówienie”
 * wysyłana jako ZAPYTANIE (na tym etapie nic się nie kupuje ani nie płaci).
 *
 * Dane: WYŁĄCZNIE src/data/pigments.json – kopia publicznego Store API
 * sklepu klienta, odświeżana skryptem `node scripts/sync-pigments.mjs`.
 * Każda nazwa, cena, pojemność, stan magazynowy i opis pochodzi z danych;
 * liczby w hero i nagłówkach są z nich wyliczane. Pokazujemy tylko cenę
 * bieżącą – bez cen przekreślonych i bez słowa „promocja” (brak najniższej
 * ceny z 30 dni, Omnibus). Ceny starsze niż PRICE_MAX_AGE_DAYS → „cena do
 * potwierdzenia” (src/lib/pigments.js).
 *
 * Zdjęć produktów ze sklepu nie pokazujemy. Kolor próbki to odcień
 * POGLĄDOWY wyznaczony z miniatury (pole `color`); brak koloru → kreskowanie
 * i „bez próbki”.
 *
 * Układ (rytm tła):
 *   01 PageHero band (cream-100) – liczby z danych, „Przeglądaj katalog” + „Jak zamówić”
 *   02 Katalog #katalog (cream-50) – filtry (chip kolekcji z paskiem jej odcieni),
 *      licznik (aria-live), siatka odcieni (pełne rzędy: 6 do xl, 8 od xl,
 *      potem porcjami po 12 z licznikiem „Pokazano X z N”), zestawy jako cennik
 *      (poniżej lg 4 pierwsze + „Pokaż wszystkie zestawy”), adnotacje
 *   03 Jak zamówić #zamowienie (cream-100, hairline) – 3 kroki + dokumentacja na prośbę
 *   04 ClosingCta – „Twoje zamówienie” (otwiera listę) + kontakt
 *   + pływający przycisk listy i dwa dialogi (szczegóły, zamówienie)
 *
 * Dawna sekcja „Kolekcje” (komórki z paletą) dublowała filtr kolekcji –
 * paleta przeszła na chip filtra, a strona mieści się w limicie długości.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLink,
  ClosingCta,
  CtaButton,
  MobileMore,
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
  pricesExpired,
  productById,
  products as allProducts,
  stats as catalogStats,
  zoneLabel,
  zonesIn,
} from '@/lib/pigments';
import { CONTACT } from '@/lib/site';
import { cn } from '@/lib/utils';
import { ProductCell, SetRow } from '@/components/pigments/ProductCell';
import CatalogFilters from '@/components/pigments/CatalogFilters';
import ProductDialog from '@/components/pigments/ProductDialog';
import OrderDialog, { FORM_LIVE } from '@/components/pigments/OrderDialog';
import OrderFab from '@/components/pigments/OrderFab';
import { NBSP, PricesStaleContext, fold, plural } from '@/components/pigments/parts';
import { useOrder } from '@/components/pigments/useOrder';

/* ------------------------------------------------------------------ */
/*  Dane (raz, przy imporcie modułu)                                   */
/* ------------------------------------------------------------------ */

const PRODUCTS = allProducts();
const COLLECTIONS = allCollections().filter((c) => c.count > 0);
const STATS = catalogStats();
const SYNCED = formatSyncedDate();

/* Pierwsze odcienie widoczne od razu – zawsze PEŁNE rzędy siatki:
   2 kolumny (telefon) → 3 rzędy, 3 kolumny (md) → 2 rzędy = 6 odcieni;
   4 kolumny (xl) → 2 rzędy = 8. Siódmy i ósmy są w DOM, ale poniżej xl
   ukryte klasą (bez mierzenia w JS – ten sam HTML na serwerze i w przeglądarce).
   Dalej porcjami po 12 („Pokaż kolejne 12”): 6 + 12 = 18 i 8 + 12 = 20, więc
   rzędy przy 2, 3 i 4 kolumnach zostają pełne. Jedno dotknięcie dodaje ~6 rzędów
   na telefonie (ok. 2,5 tys. px), a nie całą setkę odcieni (~20 tys. px, 32 ekrany).
   Ten sam limit dotyczy wyników wyszukiwania. Od lg dodatkowo „Pokaż wszystkie”. */
const PAGE_NARROW = 6;
const PAGE_WIDE = 8;
const PAGE_STEP = 12;
const WIDE_MQ = '(min-width: 1280px)';

/* Zestawy: poniżej lg widać 4 pierwsze (cennik 14 pozycji to 2–4,5 ekranu
   telefonu), reszta po „Pokaż wszystkie zestawy”. Od lg – wszystkie w kolumnach. */
const SETS_PREVIEW = 4;

const shadesWord = (n) => plural(n, 'odcień', 'odcienie', 'odcieni');
const setsWord = (n) => plural(n, 'zestaw', 'zestawy', 'zestawów');

/* Kolory odcieni kolekcji (bez zestawów i bez `null`) – pasek na chipie filtra. */
const PALETTES = Object.fromEntries(
  COLLECTIONS.map((c) => [
    c.id,
    PRODUCTS.filter((p) => p.collection === c.id && !p.isSet && p.color).map((p) => p.color),
  ])
);

/* Strefa zostaje przy zmianie kolekcji tylko wtedy, gdy nowa kolekcja ją ma. */
const zoneFits = (zone, collection) =>
  !zone || zonesIn(filterProducts(PRODUCTS, { collection })).some((z) => z.id === zone);

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

/* Krok 02 mówi o kanale, który naprawdę działa (jak BOOKING_STEPS na /kontakt). */
const NOT_A_PURCHASE = 'To zapytanie – na tym etapie nic nie kupujesz ani nie płacisz.';
const STEPS = [
  {
    number: '01',
    title: 'Wybierz odcienie',
    text: 'Dodaj pigmenty do listy „Twoje zamówienie”. Przy odcieniach w kilku pojemnościach wybierz butelkę – ilość zmienisz na liście.',
  },
  {
    number: '02',
    title: 'Wyślij zapytanie',
    text: FORM_LIVE
      ? `Podaj imię i telefon lub e-mail, a potem wyślij listę. ${NOT_A_PURCHASE}`
      : `Skopiuj listę i wyślij ją na Instagramie – ${CONTACT.instagramHandle}. ${NOT_A_PURCHASE}`,
  },
  {
    number: '03',
    title: 'Potwierdzimy szczegóły',
    text: 'Odpiszemy z informacją o dostępności, łączną kwotą oraz sposobem dostawy i płatności.',
  },
];

const CLOSING_LEAD = `${
  FORM_LIVE
    ? 'Wyślij listę jako zapytanie'
    : `Skopiuj listę i wyślij ją na Instagramie (${CONTACT.instagramHandle})`
} – potwierdzimy dostępność, łączną kwotę oraz sposób dostawy i płatności. Nie wiesz, od którego odcienia zacząć? Napisz, do jakiej techniki i strefy szukasz pigmentu.`;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================================================================== */
/*  01 – HERO (pas typograficzny, cream-100)                           */
/* ================================================================== */

function Hero() {
  return (
    <PageHero
      variant="band"
      label="Pigmenty"
      number="01"
      /* bez nazwy dawnej firmy klientki (prośba z 30.09.2026) – układ jak w hero /uslugi */
      title="Pigmenty do makijażu"
      titleAccent="permanentnego."
      /* D2 („linia rzęs” zamiast „kresek”) dotyczy zabiegu Perfect Eyes; tu „kreski” to kategoria
         pigmentów ze sklepu (strefa „Kreski” w danych i w filtrze) – zostaje (raport INNE-03). */
      lead="Pigmenty do brwi, ust i kresek, modyfikatory oraz odcienie do areoli, kamuflażu i trychopigmentacji – AS OPIUM, Light Minerals, AS Classic i kolejne kolekcje. Wybierz odcienie i wyślij zapytanie."
      stats={HERO_STATS}
    >
      <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
        <CtaButton href="#katalog" className="as-btn-solid">
          Przeglądaj katalog
        </CtaButton>
        <ArrowLink href="#zamowienie" className="w-fit">
          Jak zamówić
        </ArrowLink>
      </div>
    </PageHero>
  );
}

/* ================================================================== */
/*  02 – KATALOG                                                       */
/* ================================================================== */

function Catalog({
  headingRef,
  collection,
  setCollection,
  zone,
  setZone,
  query,
  setQuery,
  extra,
  setExtra,
  qtyByProduct,
  onAdd,
  onDetails,
}) {
  const gridRef = useRef(null);
  const filtersRef = useRef(null);
  const focusIndex = useRef(null);
  const stale = React.useContext(PricesStaleContext);
  const [setsOpen, setSetsOpen] = useState(false);

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
  /* Limit widocznych odcieni: telefon/tablet (do xl) i xl+ – dwa progi, ten sam
     HTML (odcienie między progami mają klasę „hidden xl:block”). */
  const total = shades.length;
  const shownNarrow = Math.min(total, PAGE_NARROW + extra);
  const shownWide = Math.min(total, PAGE_WIDE + extra);
  const moreNarrow = total > shownNarrow;
  const moreWide = total > shownWide;
  const visible = shades.slice(0, shownWide);
  const filtered = Boolean(collection || activeZone || q);
  const setsCollapsible = sets.length > SETS_PREVIEW + 1;

  /* po „Pokaż kolejne” fokus na pierwszym nowo pokazanym odcieniu */
  useEffect(() => {
    if (focusIndex.current === null) return;
    gridRef.current?.querySelector(`[data-i="${focusIndex.current}"]`)?.focus();
    focusIndex.current = null;
  }, [extra]);

  const showMore = (all = false) => {
    /* pierwszy NOWO pokazany odcień – zależy od szerokości (6 czy 8 na start) */
    focusIndex.current = window.matchMedia?.(WIDE_MQ).matches ? shownWide : shownNarrow;
    setExtra((n) => (all ? Infinity : n + PAGE_STEP));
  };

  const reset = () => {
    setCollection(null);
    setZone(null);
    setQuery('');
    setExtra(0);
    /* przycisk, który to wywołał, znika – fokus na „Wszystkie” w rzędzie kolekcji */
    requestAnimationFrame(() => filtersRef.current?.querySelector('[role="group"] button')?.focus());
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
    <section id="katalog" className="as-section bg-cream-50">
      <div className="as-shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <Reveal className="lg:col-span-7">
            <SectionLabel number="02">Katalog</SectionLabel>
            <h2 ref={headingRef} tabIndex={-1} className="as-display-section as-text-balance mt-6 text-ink">
              Katalog odcieni.
            </h2>
          </Reveal>
          <Reveal delay={80} className="lg:col-span-5">
            <p className="as-body">
              Wybierz kolekcję i strefę – pasek pod nazwą kolekcji to jej odcienie, poglądowo. Dodane
              pigmenty trafiają na listę „Twoje zamówienie”, którą wysyłasz jako zapytanie.
            </p>
          </Reveal>
        </div>

        <div ref={filtersRef} className="mt-10 lg:mt-12">
          <CatalogFilters
            collections={COLLECTIONS}
            palettes={PALETTES}
            collection={collection}
            onCollection={(id) => {
              setCollection(id);
              if (!zoneFits(zone, id)) setZone(null);
              setExtra(0);
            }}
            zones={zones}
            zone={activeZone}
            onZone={(id) => {
              setZone(id);
              setExtra(0);
            }}
            query={query}
            onQuery={(value) => {
              setQuery(value);
              setExtra(0);
            }}
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
              id="katalog-odcienie"
              aria-label="Odcienie"
              className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-8 md:grid-cols-3 xl:grid-cols-4"
            >
              {visible.map((p, i) => (
                <li
                  key={p.id}
                  data-i={i}
                  tabIndex={-1}
                  className={cn('min-w-0 focus-visible:outline-ink', i >= shownNarrow && 'hidden xl:block')}
                >
                  <ProductCell product={p} qty={qtyByProduct.get(p.id) || 0} onAdd={onAdd} onDetails={onDetails} />
                </li>
              ))}
            </ul>
          )}

          {/* Doładowanie porcjami: licznik „Pokazano X z N” + „Pokaż kolejne 12”.
              Liczby dla telefonu/tabletu i dla xl w osobnych spanach (inny start: 6 / 8). */}
          {moreNarrow && (
            <div
              className={cn(
                'mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-ink/15 pt-6',
                !moreWide && 'xl:hidden'
              )}
            >
              <p className="as-caption max-w-none" aria-live="polite">
                Pokazano <span className="xl:hidden">{shownNarrow}</span>
                <span className="hidden xl:inline">{shownWide}</span> z{NBSP}
                {total} {plural(total, 'odcienia', 'odcieni', 'odcieni')}.
              </p>
              <ArrowLink onClick={() => showMore()} aria-controls="katalog-odcienie" className="w-fit">
                Pokaż kolejne <span className="xl:hidden">{Math.min(PAGE_STEP, total - shownNarrow)}</span>
                <span className="hidden xl:inline">{Math.min(PAGE_STEP, total - shownWide)}</span>
              </ArrowLink>
              {/* desktop: cały katalog jednym kliknięciem (13–16 ekranów, nie 32–52 jak na telefonie) */}
              {total - shownNarrow > PAGE_STEP && (
                <ArrowLink
                  onClick={() => showMore(true)}
                  aria-controls="katalog-odcienie"
                  className="hidden w-fit lg:inline-flex"
                >
                  Pokaż wszystkie ({total})
                </ArrowLink>
              )}
            </div>
          )}

          {sets.length > 0 && (
            <div className="mt-14">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <h3 className="as-title text-ink">Zestawy</h3>
                <p className="as-caption max-w-none">Skład zestawu – po kliknięciu nazwy.</p>
              </div>
              <div className="mt-6 grid gap-x-10 lg:grid-cols-2 xl:grid-cols-3">
                {(setsCollapsible ? sets.slice(0, SETS_PREVIEW) : sets).map((p) => (
                  <SetRow key={p.id} product={p} qty={qtyByProduct.get(p.id) || 0} onAdd={onAdd} onDetails={onDetails} />
                ))}
                {/* reszta zestawów: poniżej lg zwinięta (MobileMore), od lg w tej samej siatce
                    (display: contents – wiersze wchodzą w kolumny rodzica) */}
                {setsCollapsible && (
                  <div id="pig-sets-more" className={cn('contents', !setsOpen && 'max-lg:hidden')}>
                    {sets.slice(SETS_PREVIEW).map((p) => (
                      <SetRow key={p.id} product={p} qty={qtyByProduct.get(p.id) || 0} onAdd={onAdd} onDetails={onDetails} />
                    ))}
                  </div>
                )}
              </div>
              {setsCollapsible && (
                <MobileMore
                  open={setsOpen}
                  onToggle={() => setSetsOpen((o) => !o)}
                  controls="pig-sets-more"
                  label={`Pokaż wszystkie zestawy (${sets.length})`}
                  openLabel="Zwiń zestawy"
                  until="lg"
                />
              )}
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
          <p className="as-caption max-w-none">Kolory próbek są poglądowe – odcień na ekranie różni się od pigmentu.</p>
          <p className="as-caption max-w-none">
            {stale
              ? `Ceny z ${SYNCED} mogą być nieaktualne – potwierdzimy je w odpowiedzi na zapytanie.`
              : `Ceny aktualne na ${SYNCED}, bez kosztów dostawy.`}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  03 – JAK ZAMÓWIĆ                                                   */
/* ================================================================== */

function HowToOrder() {
  return (
    <section id="zamowienie" className="as-section border-t border-ink/10 bg-cream-100">
      <div className="as-shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Reveal>
              <SectionLabel number="03">Zamówienie</SectionLabel>
              <h2 className="as-display-section as-text-balance mt-6 text-ink">Jak zamówić.</h2>
            </Reveal>
            <Reveal delay={80}>
              {/* D9/D10 (INNE-01): z dokumentów tylko to, co ma źródło – karty charakterystyki
                  pigmentów (sklep klientki, /certyfikaty), udostępniane na prośbę. */}
              <p className="as-body mt-6">
                Zamówienie to zapytanie o listę odcieni – odpowiadamy z dostępnością i łączną kwotą.
                Karty charakterystyki pigmentów udostępniamy na prośbę.
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

/**
 * @param {{ pricesStale?: boolean }} props
 *   `pricesStale` – ceny przeterminowane w chwili renderu na serwerze (build);
 *   przeglądarka sprawdza to ponownie po zamontowaniu (strona statyczna może
 *   być oglądana długo po buildzie).
 */
export default function Pigments({ pricesStale = false }) {
  const [stale, setStale] = useState(pricesStale);
  useEffect(() => {
    setStale(pricesExpired());
  }, []);

  const order = useOrder();
  const { add, qtyByProduct, summary } = order;

  const [collection, setCollection] = useState(null);
  const [zone, setZone] = useState(null);
  const [query, setQuery] = useState('');
  /* ile odcieni ponad start (6 / 8) pokazać: +12 na „Pokaż kolejne”, Infinity = wszystkie */
  const [extra, setExtra] = useState(0);
  const [detailsId, setDetailsId] = useState(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [announce, setAnnounce] = useState('');

  const headingRef = useRef(null);
  /* element, który otworzył dialog – po zamknięciu fokus wraca na niego */
  const returnFocus = useRef(null);
  /* przejście dialog → dialog / dialog → katalog: bez powrotu fokusu */
  const skipReturn = useRef(false);

  /* ?kolekcja=as-opium&strefa=usta – wstępny filtr (link z innej strony).
     window.location zamiast useSearchParams: trasa zostaje statyczna. */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get('kolekcja');
    const z = params.get('strefa');
    const coll = c && COLLECTIONS.some((x) => x.id === c) ? c : null;
    if (coll) setCollection(coll);
    if (z && PRODUCTS.some((p) => p.zones.includes(z)) && zoneFits(z, coll)) setZone(z);
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
      /* zmiana znaku na końcu – ten sam komunikat ogłasza się ponownie */
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

  return (
    <PricesStaleContext.Provider value={stale}>
      <Hero />
      <Catalog
        headingRef={headingRef}
        collection={collection}
        setCollection={setCollection}
        zone={zone}
        setZone={setZone}
        query={query}
        setQuery={setQuery}
        extra={extra}
        setExtra={setExtra}
        qtyByProduct={qtyByProduct}
        onAdd={onAdd}
        onDetails={onDetails}
      />
      <HowToOrder />

      <ClosingCta
        number="04"
        label="Zamówienie"
        title="Twoja lista"
        titleAccent="odcieni."
        lead={CLOSING_LEAD}
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
    </PricesStaleContext.Provider>
  );
}
