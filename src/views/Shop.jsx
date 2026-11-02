'use client';

/**
 * SKLEP – /sklep (prośba klientki z 14.10.2026: „Produkty zmieniamy na słowo sklep. W sklepie:
 * Pigmenty, Maszynki, Kartridże, Akcesoria do rysunku, Akcesoria do ćwiczeń, Środki zabiegowe,
 * Lampy, Lasery”).
 *
 * Pigmenty i maszynka AS PRINCESS mają własne strony (/pigmenty, /maszynki) – tu prowadzą do nich
 * kafle kategorii. Pozostałe kategorie są sekcjami tej strony (kotwica = id kategorii, te same
 * linki co menu „Sklep” – NAV_ALL[0] w src/lib/site.js).
 *
 * Dane: WYŁĄCZNIE src/data/shop.json – plik ręczny z wiadomości klientki i Kariny
 * (14.10.2026) oraz napisów z opakowań na zdjęciach (decyzja Filipa: nic z dawnego sklepu).
 * Produkty bez ceny – „cena na zapytanie” i link do zapytania. Zdjęcia tylko z /Graphics
 * (src/lib/productPhotos.js). Etykieta przedsprzedaży i odblask kafli – Magic UI (CSS).
 * Zakup = ta sama lista „Twoje zamówienie” co na /pigmenty (wspólna w localStorage), wysyłana
 * jako ZAPYTANIE – bez płatności. Klocki katalogu z src/components/pigments (dialogi, przycisk listy).
 *
 * Układ (rytm tła jak /pigmenty):
 *   01 PageHero band (espresso) – zdanie filaru „Produkty” ze strony głównej
 *   02 Kategorie #kategorie (cream-50) – 8 kart ze zdjęciem w kolejności klientki
 *   03 Produkty #produkty (cream-50, hairline) – redesign 2.11.2026 (projekt w Figmie
 *      „Babushkina Academy – Sklep redesign”): od lg menu kategorii po lewej (przyklejone,
 *      podświetla kategorię w kadrze) | siatka kart produktów (ProductCard) z nagłówkiem
 *      kategorii; telefon i tablet – przyklejony pasek kategorii nad siatką. Sąsiednie kategorie
 *      z jednym produktem (Lampy, Lasery) stoją od lg obok siebie – bez pustych miejsc w siatce.
 *   04 Jak zamówić #zamowienie (cream-100)
 *   05 ClosingCta – „Twoje zamówienie” + kontakt
 *   + pływający przycisk listy i dwa dialogi (szczegóły, zamówienie)
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from '@/components/as/LocaleLink';
import { ArrowLink, ClosingCta, CtaButton, NumberedItem, PageHero, Reveal, SectionLabel } from '@/components/as/Primitives';
import { formatCapacity, formatSyncedDate, localizeProduct, productById, stats as pigmentStats } from '@/lib/pigments';
import { SHOP_PRICE_DATE, shopCategories, shopProducts } from '@/lib/shop';
import { CONTACT } from '@/lib/site';
import { cn, nbspShort } from '@/lib/utils';
import { useContent, useLocale, useSite } from '@/i18n/client';
import { shopDict } from '@/content/views/shop';
import { ProductCard } from '@/components/shop/ProductCard';
import ProductDialog from '@/components/pigments/ProductDialog';
import OrderDialog, { FORM_LIVE } from '@/components/pigments/OrderDialog';
import OrderFab from '@/components/pigments/OrderFab';
import { PricesStaleContext, ProductPhoto } from '@/components/pigments/parts';
import { useOrder } from '@/components/pigments/useOrder';

/* ------------------------------------------------------------------ */
/*  Dane (raz, przy imporcie modułu)                                    */
/* ------------------------------------------------------------------ */

const PRODUCTS = shopProducts();
const CATEGORIES = shopCategories();
const PIGMENT_SHADES = pigmentStats().shades;

/* Produkty kategorii (raz) – liczby w menu i bloki siatki. */
const ROWS_BY_CATEGORY = Object.fromEntries(CATEGORIES.map((c) => [c.id, PRODUCTS.filter((p) => p.collection === c.id)]));

/* Bloki siatki w kolejności klientki; sąsiednie kategorie z jednym produktem (Lampy, Lasery) –
   jeden blok „obok siebie” (od lg trzy kolumny), żeby pojedyncza karta nie stała w pustym rzędzie. */
const BLOCKS = CATEGORIES.reduce((out, c) => {
  const single = ROWS_BY_CATEGORY[c.id].length === 1;
  const last = out[out.length - 1];
  if (single && last?.singles && last.items.length < 3) last.items.push(c);
  else out.push({ singles: single, items: [c] });
  return out;
}, []).flatMap((b) => (b.singles && b.items.length === 1 ? [{ singles: false, items: b.items }] : [b]));

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* id kategorii z linku menu („/sklep#kartridze” → „kartridze”, „/pigmenty” → null) */
const anchorOf = (href) => href.split('#')[1] || null;

/* ================================================================== */
/*  01 – HERO                                                          */
/* ================================================================== */

function Hero() {
  const t = useContent(shopDict);
  return (
    <PageHero variant="band" label={t.hero.label} number="01" title={t.hero.title} titleAccent={t.hero.titleAccent} lead={t.hero.lead}>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
        <CtaButton href="#kategorie" className="as-btn-invert">
          {t.hero.browse}
        </CtaButton>
        <ArrowLink href="#zamowienie" tone="light" className="w-fit">
          {t.hero.how}
        </ArrowLink>
      </div>
    </PageHero>
  );
}

/* ================================================================== */
/*  02 – KATEGORIE                                                     */
/* ================================================================== */

/* Zdjęcie na karcie kategorii – packshot z /Graphics (klientka 26.10.2026: „bardzo dużo tekstów,
   bardzo mało obrazków, po których nie mogę od razu poznać produkty”). */
const TILE_PHOTO = {
  '/pigmenty': 'as-opium-pigments-brazil',
  '/maszynki': 'as-princess-gold',
  kartridze: 'kartridze-flat-supernatural',
  'akcesoria-do-rysunku': 'kredka-czarna',
  'akcesoria-do-cwiczen': 'sztuczna-skorka-do-cwiczen',
  'srodki-zabiegowe': 'ice-gel',
  lampy: 'lampa-pierscieniowa',
  lasery: 'laser-q-switch-ultra',
};

/* Karty kategorii (redesign 2.11.2026): pole zdjęcia 4:3 w tonie cream-100, pod nim numer, nazwa,
   liczba produktów i strzałka (↗ – osobna strona: /pigmenty, /maszynki). Telefon 2 kolumny, od lg 4. */
function Categories({ links }) {
  const t = useContent(shopDict);
  const meta = (link) => {
    if (link.href === '/pigmenty') return t.categories.shades(PIGMENT_SHADES);
    if (link.href === '/maszynki') return t.categories.machine;
    const n = ROWS_BY_CATEGORY[anchorOf(link.href)]?.length ?? 0;
    return n ? t.categories.count(n) : t.categories.onRequest;
  };
  return (
    <section id="kategorie" className="as-section bg-cream-50">
      <div className="as-shell">
        <Reveal>
          <SectionLabel number="02">{t.categories.label}</SectionLabel>
          <h2 className="as-display-section as-text-balance mt-6 text-ink">{t.categories.title}</h2>
        </Reveal>
        <nav aria-label={t.categories.navLabel} className="mt-10 lg:mt-12">
          <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 lg:grid-cols-4 lg:gap-y-12">
            {links.map((link, i) => {
              const photoId = TILE_PHOTO[link.href] || TILE_PHOTO[anchorOf(link.href)];
              const external = !anchorOf(link.href);
              return (
                <li key={link.href}>
                  <Link href={link.href} className="group block">
                    <span className="block overflow-hidden bg-cream-100">
                      {photoId ? (
                        <ProductPhoto
                          product={{ id: photoId }}
                          ratio="4 / 3"
                          sizes="(min-width: 1024px) 22vw, 46vw"
                          pad
                          className="transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]"
                        />
                      ) : (
                        <span className="block aspect-[4/3]" />
                      )}
                    </span>
                    <span className="mt-3 flex items-start gap-3 sm:mt-4">
                      <span aria-hidden="true" className="as-label shrink-0 pt-[0.45rem] text-gold-deep max-sm:hidden">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="as-title block text-ink decoration-1 underline-offset-4 group-hover:underline max-sm:text-[1.25rem]">
                          {link.label}
                        </span>
                        <span className="mt-1 block text-[0.8125rem] text-mocha">{meta(link)}</span>
                      </span>
                      <span aria-hidden="true" className="shrink-0 pt-1 text-ink/60 transition-transform group-hover:translate-x-0.5">
                        {external ? '↗' : '→'}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  03 – PRODUKTY                                                      */
/* ================================================================== */

/* Kategoria w kadrze (scrollspy) – podświetlenie w menu bocznym i w pasku na telefonie.
   Pas obserwacji: od 25% do 40% wysokości okna (pod przyklejonym nagłówkiem). */
function useActiveCategory(ids) {
  const [active, setActive] = useState(ids[0] ?? null);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((x, y) => x.boundingClientRect.top - y.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '-25% 0px -60% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

/* Pasek kategorii na telefonie i tablecie (< lg): przyklejony pod nagłówkiem, przewijany w poziomie;
   aktywna kategoria jest przewijana do widoku w samym pasku (bez ruszania strony). */
function CategoryBar({ items, active, label }) {
  const listRef = useRef(null);
  useEffect(() => {
    const list = listRef.current;
    const el = list?.querySelector('[aria-current="true"]');
    if (!list || !el) return;
    const left = el.offsetLeft - (list.clientWidth - el.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, left), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [active]);
  return (
    <nav aria-label={label} className="sticky top-[var(--as-header-h)] z-20 -mx-5 mt-8 border-b border-ink/10 bg-cream-50/95 backdrop-blur-sm sm:-mx-8 lg:hidden">
      <ul ref={listRef} className="flex gap-2 overflow-x-auto px-5 py-3 [scrollbar-width:none] sm:px-8 [&::-webkit-scrollbar]:hidden">
        {items.map(({ id, label: name, count }) => (
          <li key={id} className="shrink-0">
            <a
              href={`#${id}`}
              aria-current={active === id ? 'true' : undefined}
              className={cn(
                'inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[0.875rem] transition-colors',
                active === id ? 'border-ink bg-ink text-cream-50' : 'border-ink/20 text-ink hover:border-ink/50'
              )}
            >
              {name}
              <span className={cn('text-[0.75rem]', active === id ? 'text-gold-light' : 'text-mocha')}>{count}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function BlockHead({ id, label, count, small = false }) {
  const t = useContent(shopDict);
  return (
    <div className="flex items-end justify-between gap-4 border-b border-ink/15 pb-4">
      {/* projekt w Figmie: 40 px od lg (28 px przy kategoriach obok siebie), 28 px na telefonie */}
      <h3
        id={`${id}-tytul`}
        className={cn('font-display font-normal leading-[1.1] text-ink', small ? 'text-[1.75rem]' : 'text-[1.75rem] sm:text-[2.25rem] lg:text-[2.5rem]')}
      >
        {label}
      </h3>
      <p className="shrink-0 pb-1 text-[0.8125rem] text-mocha">{count ? t.categories.count(count) : t.categories.onRequest}</p>
    </div>
  );
}

function CategoryBlock({ category, label, qtyByProduct, onAdd, onDetails, small = false }) {
  const t = useContent(shopDict);
  const locale = useLocale();
  /* nazwy i dopiski w języku strony (pole `i18n` w src/data/shop.json) */
  const rows = useMemo(() => ROWS_BY_CATEGORY[category.id].map((p) => localizeProduct(p, locale)), [category.id, locale]);
  const single = rows.length === 1;
  return (
    /* < lg nad kategorią stoi przyklejony pasek kategorii (ok. 4 rem) – kotwica schodzi pod niego */
    <div id={category.id} role="region" aria-labelledby={`${category.id}-tytul`} className="max-lg:scroll-mt-[4.5rem]">
      <BlockHead id={category.id} label={label} count={rows.length} small={small} />
      {rows.length ? (
        <ul
          aria-label={t.products.listLabel(label)}
          className={cn(
            'mt-6 grid gap-x-3 gap-y-10 sm:mt-8 sm:gap-x-6',
            single ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3',
            single && !small && 'lg:grid-cols-3'
          )}
        >
          {rows.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} qty={qtyByProduct.get(p.id) || 0} onAdd={onAdd} onDetails={onDetails} split={single} />
            </li>
          ))}
        </ul>
      ) : (
        /* kategoria bez produktów w danych – zapytanie zamiast pustej siatki */
        <div className="pt-5">
          <p className="as-body">{t.products.empty}</p>
          <ArrowLink href="/kontakt?temat=produkty" className="mt-6 w-fit">
            {t.products.ask}
          </ArrowLink>
        </div>
      )}
    </div>
  );
}

function Products({ links, headingRef, qtyByProduct, onAdd, onDetails, onOrder, orderLabel }) {
  const t = useContent(shopDict);
  const locale = useLocale();
  const synced = formatSyncedDate(SHOP_PRICE_DATE, locale);
  /* nazwa kategorii w języku strony – z menu (te same etykiety co „Sklep” w nagłówku) */
  const labelOf = (id) => links.find((l) => anchorOf(l.href) === id)?.label ?? CATEGORIES.find((c) => c.id === id)?.name;
  const ids = useMemo(() => CATEGORIES.map((c) => c.id), []);
  const active = useActiveCategory(ids);
  const items = CATEGORIES.map((c) => ({ id: c.id, label: labelOf(c.id), count: ROWS_BY_CATEGORY[c.id].length }));
  const pages = links.filter((l) => !anchorOf(l.href));

  return (
    <section id="produkty" className="as-section border-t border-ink/10 bg-cream-50">
      <div className="as-shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <Reveal className="lg:col-span-7">
            <SectionLabel number="03">{t.products.label}</SectionLabel>
            <h2 ref={headingRef} tabIndex={-1} className="as-display-section as-text-balance mt-6 text-ink">
              {t.products.title}
            </h2>
          </Reveal>
          <Reveal delay={80} className="lg:col-span-5">
            <p className="as-body">{t.products.lead}</p>
          </Reveal>
        </div>

        <CategoryBar items={items} active={active} label={t.categories.navLabel} />

        <div className="mt-10 lg:mt-14 lg:grid lg:grid-cols-12 lg:gap-8">
          {/* menu kategorii (od lg): przyklejone, podświetla kategorię w kadrze */}
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-[calc(var(--as-header-h)+2rem)]">
              <p className="as-label text-mocha">{t.categories.label}</p>
              <nav aria-label={t.categories.navLabel} className="mt-4">
                <ul className="border-t border-ink/10">
                  {pages.map((l) => (
                    <li key={l.href} className="border-b border-ink/10">
                      <Link href={l.href} className="flex items-center justify-between gap-3 py-3 text-[0.9375rem] text-ink transition-colors hover:text-gold-deep">
                        <span>
                          {l.label} <span aria-hidden="true">↗</span>
                        </span>
                        <span className="text-[0.8125rem] text-mocha">
                          {l.href === '/pigmenty' ? PIGMENT_SHADES : 1}
                        </span>
                      </Link>
                    </li>
                  ))}
                  {items.map(({ id, label, count }) => (
                    <li key={id} className="border-b border-ink/10">
                      <a
                        href={`#${id}`}
                        aria-current={active === id ? 'true' : undefined}
                        className={cn(
                          'flex items-center justify-between gap-3 border-l-2 py-3 text-[0.9375rem] transition-[padding,color,background-color]',
                          active === id ? 'border-gold bg-cream-100 pl-3 font-medium text-ink' : 'border-transparent pl-0 text-ink/80 hover:text-ink'
                        )}
                      >
                        <span>{label}</span>
                        <span className="pr-1 text-[0.8125rem] font-normal text-mocha">{count}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <p className="as-caption mt-6 max-w-none">{t.products.pricesAsOf(synced)}</p>
              <CtaButton onClick={onOrder} aria-haspopup="dialog" className="as-btn-solid mt-6">
                {orderLabel}
              </CtaButton>
            </div>
          </aside>

          <div className="space-y-16 lg:col-span-9 lg:space-y-20">
            {BLOCKS.map((b) =>
              b.singles ? (
                <div key={b.items.map((c) => c.id).join('+')} className="grid gap-16 lg:grid-cols-3 lg:gap-6">
                  {b.items.map((c) => (
                    <CategoryBlock key={c.id} category={c} label={labelOf(c.id)} qtyByProduct={qtyByProduct} onAdd={onAdd} onDetails={onDetails} small />
                  ))}
                </div>
              ) : (
                <CategoryBlock key={b.items[0].id} category={b.items[0]} label={labelOf(b.items[0].id)} qtyByProduct={qtyByProduct} onAdd={onAdd} onDetails={onDetails} />
              )
            )}
          </div>
        </div>

        <div className="mt-14 border-t border-ink/15 pt-5 lg:hidden">
          <p className="as-caption max-w-none">{t.products.pricesAsOf(synced)}</p>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  04 – JAK ZAMÓWIĆ                                                   */
/* ================================================================== */

function HowToOrder() {
  const t = useContent(shopDict);
  /* krok 02 – kanał, który naprawdę działa (jak /pigmenty) */
  const send = `${FORM_LIVE ? t.send.form : t.send.instagram(CONTACT.instagramHandle)} ${t.send.notPurchase}`;
  const steps = t.how.steps.map((s, i) => ({ ...s, number: s.number ?? shopDict.pl.how.steps[i].number, text: s.text || send }));
  return (
    <section id="zamowienie" className="as-section border-t border-ink/10 bg-cream-100">
      <div className="as-shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Reveal>
              <SectionLabel number="04">{t.how.label}</SectionLabel>
              <h2 className="as-display-section as-text-balance mt-6 text-ink">{t.how.title}</h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="as-body mt-6">{t.how.lead}</p>
            </Reveal>
          </div>
          <ol className="grid gap-10 md:grid-cols-3 md:gap-8 lg:col-span-8 lg:col-start-5 lg:grid-cols-1 xl:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.number} delay={i * 80} className="as-cell">
                <NumberedItem number={s.number} title={s.title}>
                  {nbspShort(s.text)}
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

/* Ceny sklepu podała klientka (bez synchronizacji ze sklepem) – nie przeterminowują się. */
export default function Shop() {
  const t = useContent(shopDict);
  const locale = useLocale();
  const { NAV_ALL } = useSite();
  /* 8 kategorii z menu „Sklep” (bez linków tylko do stopki) – etykiety w języku strony */
  const links = useMemo(() => NAV_ALL[0].links.filter((l) => !l.footerOnly), [NAV_ALL]);

  const order = useOrder();
  const { add, qtyByProduct, summary } = order;
  const [detailsId, setDetailsId] = useState(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [announce, setAnnounce] = useState('');

  const headingRef = useRef(null);
  const returnFocus = useRef(null);
  const skipReturn = useRef(false);

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

  const goToProducts = useCallback(() => {
    requestAnimationFrame(() => {
      document.getElementById('produkty')?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      headingRef.current?.focus({ preventScroll: true });
    });
  }, []);

  const onAdd = useCallback(
    (id, label) => {
      add(id, label);
      const p = localizeProduct(productById(id), locale);
      const text = t.order.added(`${p?.name ?? ''}${label ? `, ${formatCapacity(label, locale)}` : ''}`);
      setAnnounce((prev) => (prev === text ? `${text} ` : text));
    },
    [add, t, locale]
  );

  const onDetails = useCallback((id) => {
    rememberTrigger();
    setDetailsId(id);
  }, []);

  const openOrder = useCallback(() => {
    rememberTrigger();
    setOrderOpen(true);
  }, []);

  const closingLead = `${FORM_LIVE ? t.closing.leadForm : t.closing.leadInstagram(CONTACT.instagramHandle)}${t.closing.leadRest}`;

  return (
    <PricesStaleContext.Provider value={false}>
      <Hero />
      <Categories links={links} />
      <Products
        links={links}
        headingRef={headingRef}
        qtyByProduct={qtyByProduct}
        onAdd={onAdd}
        onDetails={onDetails}
        onOrder={openOrder}
        orderLabel={summary.count > 0 ? t.order.yourOrderCount(summary.count) : t.order.yourOrder}
      />
      <HowToOrder />

      <ClosingCta
        number="05"
        label={t.closing.label}
        title={t.closing.title}
        titleAccent={t.closing.titleAccent}
        lead={closingLead}
        primary={{
          onClick: openOrder,
          'aria-haspopup': 'dialog',
          label: summary.count > 0 ? t.order.yourOrderCount(summary.count) : t.order.yourOrder,
        }}
        secondary={{ href: '/kontakt?temat=produkty', label: t.closing.contact }}
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
        syncedAt={SHOP_PRICE_DATE}
        onBrowse={() => {
          skipReturn.current = true;
          setOrderOpen(false);
          goToProducts();
        }}
        onCloseAutoFocus={restoreFocus}
      />
    </PricesStaleContext.Provider>
  );
}
