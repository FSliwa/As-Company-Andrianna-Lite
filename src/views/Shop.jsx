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
 *   02 Kategorie #kategorie (cream-50) – 8 kafli w kolejności klientki
 *   03 Produkty #produkty (cream-50, hairline) – blok na kategorię: nazwa, liczba, zdjęcie
 *      kategorii (lampa – jedyny produkt) | wiersze cennika (ShopRow); kategoria bez
 *      produktów (Akcesoria do ćwiczeń, Lasery) – „zapytaj”
 *   04 Jak zamówić #zamowienie (cream-100)
 *   05 ClosingCta – „Twoje zamówienie” + kontakt
 *   + pływający przycisk listy i dwa dialogi (szczegóły, zamówienie)
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import Link from '@/components/as/LocaleLink';
import { ArrowLink, ClosingCta, CtaButton, NumberedItem, PageHero, Reveal, SectionLabel } from '@/components/as/Primitives';
import { formatCapacity, formatSyncedDate, productById, stats as pigmentStats } from '@/lib/pigments';
import { SHOP_PRICE_DATE, shopCategories, shopProducts } from '@/lib/shop';
import { productPhoto } from '@/lib/productPhotos';
import { CONTACT } from '@/lib/site';
import { cn, nbspShort } from '@/lib/utils';
import { useContent, useLocale, useSite } from '@/i18n/client';
import { shopDict } from '@/content/views/shop';
import { ShopRow } from '@/components/shop/ShopRow';
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

/* Zdjęcie kategorii w lewej kolumnie bloku: lampa (jedyny produkt kategorii – wiersz jest
   wtedy bez miniatury). */
const CATEGORY_PHOTO = { lampy: 'lampa-pierscieniowa' };

/* Długa lista (od 13 pozycji) – 8 wierszy od razu, reszta po „Pokaż wszystkie”; krótsze
   kategorie (do 12) zawsze w całości. */
const ROWS_PREVIEW = 8;
const ROWS_COLLAPSE_FROM = 13;

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

function Categories({ links }) {
  const t = useContent(shopDict);
  const meta = (link) => {
    if (link.href === '/pigmenty') return t.categories.shades(PIGMENT_SHADES);
    if (link.href === '/maszynki') return t.categories.machine;
    const n = CATEGORIES.find((c) => c.id === anchorOf(link.href))?.count ?? 0;
    return n ? t.categories.count(n) : t.categories.onRequest;
  };
  return (
    <section id="kategorie" className="as-section bg-cream-50">
      <div className="as-shell">
        <Reveal>
          <SectionLabel number="02">{t.categories.label}</SectionLabel>
          <h2 className="as-display-section as-text-balance mt-6 text-ink">{t.categories.title}</h2>
        </Reveal>
        {/* 8 kafli: telefon 1 kolumna (od 400 px 2), od lg 4 – dwa pełne rzędy */}
        <nav aria-label={t.categories.navLabel} className="mt-10 lg:mt-12">
          <ul className="grid grid-cols-1 gap-x-8 border-t border-ink/15 min-[400px]:grid-cols-2 lg:grid-cols-4">
            {links.map((link, i) => (
              <li key={link.href} className="border-b border-ink/15">
                <Link
                  href={link.href}
                  /* as-glare – Magic UI „glare-hover” (CSS): złoty odblask przy najechaniu myszą */
                  className="as-glare group flex min-h-[5.5rem] items-start gap-4 py-5 sm:min-h-[7.5rem] sm:flex-col sm:justify-between"
                >
                  <span aria-hidden="true" className="as-label w-6 shrink-0 pt-1 text-gold-deep">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0">
                    <span className="as-title block text-ink decoration-1 underline-offset-4 group-hover:underline">
                      {link.label}
                    </span>
                    <span className="mt-1.5 block text-[0.8125rem] text-mocha">{meta(link)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  03 – PRODUKTY                                                      */
/* ================================================================== */

function CategoryBlock({ category, label, qtyByProduct, onAdd, onDetails }) {
  const t = useContent(shopDict);
  const [open, setOpen] = useState(false);
  const rows = PRODUCTS.filter((p) => p.collection === category.id);
  const photoId = CATEGORY_PHOTO[category.id];
  /* miniatury w wierszach, gdy kategoria nie ma wspólnego zdjęcia, a choć jeden produkt ma packshot */
  const thumbs = !photoId && rows.some((p) => productPhoto(p.id));
  const collapsible = rows.length >= ROWS_COLLAPSE_FROM;
  const listId = `sklep-${category.id}`;

  return (
    <div id={category.id} className="grid gap-6 border-t border-ink/15 pt-8 lg:grid-cols-12 lg:gap-8 lg:pt-10">
      <div className="lg:col-span-4">
        <h3 className="as-display-md text-ink">{label}</h3>
        <p className="as-caption mt-3 max-w-none">{rows.length ? t.categories.count(rows.length) : t.categories.onRequest}</p>
        {photoId && (
          <ProductPhoto
            product={{ id: photoId }}
            ratio="1 / 1"
            sizes="(min-width: 1024px) 28vw, 14rem"
            alt={label}
            className="mt-6 max-w-[14rem] lg:max-w-[20rem]"
          />
        )}
      </div>

      <div className="lg:col-span-8">
        {rows.length ? (
          <>
            <div id={listId} role="list" aria-label={t.products.listLabel(label)}>
              {rows.map((p, i) => (
                <div key={p.id} role="listitem" className={cn(collapsible && !open && i >= ROWS_PREVIEW && 'hidden')}>
                  <ShopRow product={p} qty={qtyByProduct.get(p.id) || 0} onAdd={onAdd} onDetails={onDetails} thumbs={thumbs} />
                </div>
              ))}
            </div>
            {collapsible && (
              <div className="border-t border-ink/15 pt-5">
                <ArrowLink onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={listId} className="w-fit">
                  {open ? t.products.showLess : t.products.showAll(rows.length)}
                </ArrowLink>
              </div>
            )}
          </>
        ) : (
          /* kategoria bez produktów w danych (Lasery) – zapytanie zamiast pustej listy */
          <div className="border-t border-ink/15 pt-5">
            <p className="as-body">{t.products.empty}</p>
            <ArrowLink href="/kontakt?temat=produkty" className="mt-6 w-fit">
              {t.products.ask}
            </ArrowLink>
          </div>
        )}
      </div>
    </div>
  );
}

function Products({ links, headingRef, qtyByProduct, onAdd, onDetails }) {
  const t = useContent(shopDict);
  const locale = useLocale();
  const synced = formatSyncedDate(SHOP_PRICE_DATE, locale);
  /* nazwa kategorii w języku strony – z menu (te same etykiety co „Sklep” w nagłówku) */
  const labelOf = (id) => links.find((l) => anchorOf(l.href) === id)?.label ?? CATEGORIES.find((c) => c.id === id)?.name;
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

        <div className="mt-10 space-y-14 lg:mt-12 lg:space-y-20">
          {CATEGORIES.map((c) => (
            <CategoryBlock
              key={c.id}
              category={c}
              label={labelOf(c.id)}
              qtyByProduct={qtyByProduct}
              onAdd={onAdd}
              onDetails={onDetails}
            />
          ))}
        </div>

        <div className="mt-14 border-t border-ink/15 pt-5">
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
      const p = productById(id);
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
      <Products links={links} headingRef={headingRef} qtyByProduct={qtyByProduct} onAdd={onAdd} onDetails={onDetails} />
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
