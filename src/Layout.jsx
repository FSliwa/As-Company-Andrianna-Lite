'use client';

/**
 * Wspólny interfejs wszystkich wersji językowych: nagłówek, menu, stopka, pasek CTA.
 * Teksty – src/content/common (useContent), dane nawigacji – useSite(), linki
 * wewnętrzne – LocaleLink (polska ścieżka → adres bieżącego języka), język z adresu.
 *
 * Kontrakt z src/index.css (nie zmieniać bez zmiany selektorów tam):
 * - wysokość nagłówka h-20 / lg:h-24 / short:h-16 (+ linia 1 px) = zmienna --as-header-h;
 * - pasek CTA ma id="as-sticky" i zawsze atrybut aria-hidden="true" | "false" –
 *   od niego zależą baner cookies, komunikaty (toast) i OrderFab na /pigmenty.
 */

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import Link from '@/components/as/LocaleLink';
import { usePathname } from 'next/navigation';
import { Instagram, Menu, X } from 'lucide-react';
import Logo from '@/components/as/Logo';
import LanguageSwitcher from '@/components/as/LanguageSwitcher';
import { BOOKING_PAGE } from '@/lib/site';
import { useBookingHref, useContent, usePathInfo, useSite } from '@/i18n/client';
import common from '@/content/common';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/i18n/routes';
import { openConsentSettings } from '@/lib/consent';
import CookieConsent from '@/components/as/CookieConsent';

/* Dokumenty prawne w stopce (treść: src/content/legal, dane firmy: LEGAL w site.js). */
const LEGAL_LINKS = [
  { key: 'privacy', route: ROUTES.privacy },
  { key: 'cookiesPolicy', route: ROUTES.cookies },
  { key: 'terms', route: ROUTES.terms },
];

/* Telefon w poziomie od 640 px: pigułka „Umów wizytę” jest w nagłówku, więc pasek CTA
   znika (nagłówek + pasek zabierały 138 z 390 px). Poniżej 640 px pigułki nie ma –
   pasek zostaje. Wysokość jak w wariancie short: z tailwind.config.js. */
const SHORT_WITH_PILL = '(min-width: 640px) and (max-width: 1023px) and (max-height: 500px)';

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, [query]);
  return matches;
}

/* Otwarty dialog Radix (zapytanie o szkolenie, wynajem, zamówienie pigmentów): Radix
   ustawia wtedy body[data-scroll-locked]. Portal dialogu montuje się poza <main> i po
   wejściu na trasę, więc obserwator formularzy w pasku CTA go nie widzi. */
function useDialogOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (typeof MutationObserver === 'undefined') return undefined;
    const body = document.body;
    const update = () => setOpen(body.hasAttribute('data-scroll-locked'));
    update();
    const mo = new MutationObserver(update);
    mo.observe(body, { attributes: true, attributeFilter: ['data-scroll-locked'] });
    return () => mo.disconnect();
  }, []);
  return open;
}

/* Strony spoza nawigacji głównej (bez kotwic do sekcji) – druga, drobniejsza lista
   w menu. Pozycje główne i kursy (kotwice /szkolenia#…) się nie powtarzają. */
function extraPages(NAV_ALL, NAV_MAIN) {
  const seen = new Set(NAV_MAIN.map((m) => m.href));
  return NAV_ALL.flatMap((g) => g.links).filter((l) => {
    if (l.href.includes('#') || seen.has(l.href)) return false;
    seen.add(l.href);
    return true;
  });
}

/* ------------------------------------------------------------------ */
/*  Nagłówek + menu (telefon, tablet)                                  */
/* ------------------------------------------------------------------ */

function Header({ menuOpen, setMenuOpen }) {
  const pathname = usePathname();
  const { canonical, locale } = usePathInfo();
  const t = useContent(common);
  const { CONTACT, NAV_ALL, NAV_MAIN } = useSite();
  /* EN/RU: dłuższe etykiety („О НАС”, „ПРОЦЕДУРЫ”) – pozycja menu nie łamie się,
     a między lg i xl odstęp jest ciaśniejszy, żeby zmieścił się przełącznik języka.
     Wersja polska bez zmian. */
  const longLabels = locale !== 'pl';
  const bookingHref = useBookingHref();
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef(null);
  const closeButton = useRef(null);
  const skipLink = useRef(null);
  const headerRef = useRef(null);
  /* true = po zamknięciu oddać fokus przyciskowi „Otwórz menu” (Escape, ×);
     false = zamknięcie przez nawigację – fokus przejmuje nowa strona. */
  const returnFocus = useRef(false);
  const extra = extraPages(NAV_ALL, NAV_MAIN);

  const closeMenu = useCallback(
    (refocus) => {
      returnFocus.current = refocus;
      setMenuOpen(false);
    },
    [setMenuOpen]
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Zamknij menu przy zmianie trasy
  useEffect(() => closeMenu(false), [pathname, closeMenu]);

  // Menu jako dialog: blokada przewijania, reszta strony (także nagłówek i skip link)
  // „inert”, fokus na przycisku zamknięcia w dialogu. Escape i × zamykają i oddają
  // fokus przyciskowi menu – bez przewijania strony (preventScroll; wcześniej skok
  // o 400–1000 px przez scroll-padding). Od lg menu nie ma, więc poszerzenie okna je zamyka.
  useEffect(() => {
    if (!menuOpen) {
      if (returnFocus.current) {
        returnFocus.current = false;
        menuButton.current?.focus({ preventScroll: true });
      }
      return undefined;
    }
    const outside = [
      skipLink.current,
      headerRef.current,
      document.querySelector('main'),
      document.querySelector('footer'),
      document.getElementById('as-sticky'),
    ];
    document.body.style.overflow = 'hidden';
    outside.forEach((el) => el && (el.inert = true));
    closeButton.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'Escape') closeMenu(true);
    };
    const wide = window.matchMedia('(min-width: 1024px)');
    const onWide = () => wide.matches && closeMenu(false);
    document.addEventListener('keydown', onKey);
    wide.addEventListener?.('change', onWide);
    return () => {
      document.removeEventListener('keydown', onKey);
      wide.removeEventListener?.('change', onWide);
      document.body.style.overflow = '';
      outside.forEach((el) => el && (el.inert = false));
    };
  }, [menuOpen, closeMenu]);

  return (
    <>
      {/* focus:px/py stoją w CSS po not-sr-only (które zeruje padding), więc wygrywają;
          link wypełniony ink na kremie → obrys ink (as-focus-ink), nie kremowy */}
      <a
        ref={skipLink}
        href="#main"
        className="as-label as-focus-ink sr-only z-[60] bg-ink text-cream-50 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:px-5 focus:py-3.5"
      >
        {t.skipLink}
      </a>
      <header
        ref={headerRef}
        className={cn(
          'sticky top-0 z-50 transition-colors duration-300',
          scrolled ? 'border-b border-ink/10 bg-cream-50' : 'border-b border-transparent bg-cream-50/70 backdrop-blur-sm'
        )}
      >
        {/* short: telefon w poziomie – nagłówek 64 px zamiast 80 (logo 48 px) */}
        <div className="as-shell flex h-20 items-center justify-between gap-6 lg:h-24 short:h-16">
          {/* D9: „AS COMPANY POLAND” to napis w logo (plik marki z makiety i sklepu) – nazwa
              dostępna opisuje logo, więc zostaje; w tekstach strony: AS COMPANY / AS COMPANY LOVELINESS. */}
          <Link href="/" className="shrink-0" aria-label={t.homeAria}>
            <Logo priority className="short:h-12 short:w-12" />
          </Link>

          <nav
            className={longLabels ? 'hidden items-center gap-6 lg:flex xl:gap-9' : 'hidden items-center gap-9 lg:flex'}
            aria-label={t.mainNavAria}
          >
            {NAV_MAIN.map((item) => {
              const active = canonical === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group relative py-1 text-[0.75rem] font-medium uppercase tracking-[0.12em] transition-colors',
                    active ? 'text-ink' : 'text-ink/65 hover:text-ink',
                    longLabels && 'whitespace-nowrap'
                  )}
                >
                  {item.label}
                  {/* złoto tylko w linii: gold-dark 3,7:1 na kremie (gold 2,6:1 – za mało
                      na wskaźnik stanu). Aktywna pozycja: pełna linia + aria-current;
                      hover: linia dorysowuje się, tekst zostaje ink. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute -bottom-0.5 left-0 h-px bg-gold-dark transition-all duration-300',
                      active ? 'w-full' : 'w-0 group-hover:w-full'
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4 sm:gap-5">
            {/* przełącznik języka od lg – po nawigacji, przed pigułką; niżej w menu i stopce */}
            <LanguageSwitcher tone="dark" className="hidden lg:flex" />
            {/* Pigułka – jedyny zaokrąglony element (makieta). 44 px wysokości (pole dotyku
                na tablecie); po najechaniu wypełnia się ink, więc obrys fokusu też ink. */}
            <Link
              href={bookingHref}
              className="as-focus-ink hidden h-11 items-center gap-2 rounded-full border border-ink/25 px-6 text-[0.75rem] transition-colors hover:border-ink hover:bg-ink hover:text-cream-50 sm:inline-flex"
            >
              {t.book}
              <span aria-hidden="true" className="text-[0.7rem]">
                &#8599;
              </span>
            </Link>

            <button
              ref={menuButton}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="as-menu"
              aria-label={t.menuOpen}
              className="-mr-2.5 grid h-11 w-11 place-items-center text-ink lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Pełnoekranowe menu (telefon, tablet) – dialog z własnym paskiem u góry: logo
          i przycisk zamknięcia stoją dokładnie tam, gdzie logo i „Otwórz menu” w nagłówku,
          więc nic nie skacze, a zamknięcie jest WEWNĄTRZ role=dialog (czytnik ekranu
          ograniczony do dialogu ma je pod ręką).
          Kolejność: 5 pozycji głównych → „Umów wizytę” → strony spoza nawigacji głównej
          → salon i Instagram. Kursy (kotwice /szkolenia#…) są w stopce i na /szkolenia.
          Mieści się bez przewijania przy 390×844, 375×667 i 844×390; od 640 px dwie kolumny
          (telefon w poziomie i tablet). Pola dotyku ≥ 44 px.
          Uwaga: short:X stoi w CSS PRZED sm:/md:X – przy konflikcie z sm: trzeba short:sm:X. */}
      <div
        id="as-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t.menuAria}
        hidden={!menuOpen}
        className="fixed inset-0 z-[55] animate-as-in overflow-y-auto overscroll-contain bg-espresso text-cream-50 lg:hidden"
      >
        <div className="sticky top-0 z-10 border-b border-cream-200/10 bg-espresso">
          <div className="as-shell flex h-20 items-center justify-between gap-4 short:h-16">
            <Link href="/" className="shrink-0" aria-label={t.homeAria} onClick={() => closeMenu(false)}>
              <Logo className="short:h-12 short:w-12" />
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* przełącznik języka na górze menu (renderuje się, gdy języków jest więcej niż 1) */}
              <LanguageSwitcher tone="light" />
              <button
                ref={closeButton}
                type="button"
                onClick={() => closeMenu(true)}
                aria-label={t.menuClose}
                className="-mr-2.5 grid h-11 w-11 place-items-center text-cream-100"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="as-shell grid gap-x-10 gap-y-6 pb-8 pt-4 sm:grid-cols-12 sm:pt-8 short:pb-5 short:pt-3 short:sm:pt-3">
          <nav className="sm:col-span-7" aria-label={t.mainNavAria}>
            <ul>
              {NAV_MAIN.map((item, i) => {
                const active = canonical === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => closeMenu(false)}
                      className="group flex min-h-[2.75rem] items-baseline gap-5 py-1.5"
                    >
                      <span aria-hidden="true" className="as-label w-6 shrink-0 text-gold-light">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {/* bieżąca strona: złota linia pod nazwą (+ aria-current); hover: kremowa
                          linia – tekst nie zmienia koloru */}
                      <span
                        className={cn(
                          'as-display-md decoration-1 underline-offset-[0.14em]',
                          active ? 'underline decoration-gold-light' : 'decoration-cream-200/40 group-hover:underline'
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex flex-col gap-6 sm:col-span-5 sm:pt-2 short:gap-4">
            <Link href={bookingHref} onClick={() => closeMenu(false)} className="as-btn-invert w-full sm:w-auto sm:self-start">
              {t.book}
            </Link>

            {extra.length > 0 && (
              <ul className="grid grid-cols-1 gap-x-6 border-t border-cream-200/15 pt-2 min-[360px]:grid-cols-2 sm:grid-cols-1 short:sm:grid-cols-2">
                {extra.map((link) => {
                  const active = canonical === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={active ? 'page' : undefined}
                        onClick={() => closeMenu(false)}
                        className={cn(
                          'flex min-h-[2.75rem] items-center py-1 text-[0.9375rem] leading-snug transition-colors hover:text-cream-50',
                          active ? 'text-cream-50 underline decoration-gold-light decoration-1 underline-offset-4' : 'text-cream-200/85'
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="flex flex-wrap items-center justify-between gap-x-6 border-t border-cream-200/15 pt-2">
              <p className="as-label text-cream-200/75">
                {CONTACT.venue} · {CONTACT.city}
              </p>
              <a
                href={CONTACT.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-[2.75rem] items-center gap-2 text-[0.9375rem] text-cream-200/85 transition-colors hover:text-cream-50"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
                {CONTACT.instagramHandle}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Stopka                                                              */
/* ------------------------------------------------------------------ */

/* Grupa nawigacji w stopce. Poniżej md zwinięta do wiersza 48 px z przyciskiem
   (stopka na telefonie mieści się w jednym ekranie), od md zawsze rozwinięta. */
function FooterGroup({ group }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="border-t border-cream-200/10 md:border-t-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className="as-focus-inset flex min-h-[3rem] w-full items-center justify-between gap-4 text-left md:hidden"
      >
        <span className="as-label text-gold-light">{group.title}</span>
        {/* plus / minus – dwie linie 1 px, pionowa znika po rozwinięciu */}
        <span aria-hidden="true" className="relative h-3 w-3 shrink-0">
          <span className="absolute left-0 top-1/2 h-px w-3 bg-cream-200/70" />
          <span
            className={cn(
              'absolute left-1/2 top-0 h-3 w-px bg-cream-200/70 transition-transform duration-200',
              open && 'scale-y-0'
            )}
          />
        </span>
      </button>
      <p className="as-label hidden text-gold-light md:block">{group.title}</p>
      <ul id={id} className={cn('pb-3 md:mt-3 md:pb-0 lg:mt-4', !open && 'max-md:hidden')}>
        {group.links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="flex min-h-[2.75rem] items-center py-1 text-[0.8125rem] leading-snug text-cream-200/80 transition-colors hover:text-cream-50 lg:min-h-0 lg:py-1.5"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Footer({ year }) {
  const t = useContent(common);
  const { BRAND, CONTACT, LEGAL, NAV_ALL } = useSite();

  /* Linie: border-cream-200/10 (dawne /12 nie istnieje w skali krycia Tailwinda –
     linie spadały na pełny #E0D8CC, 12:1 zamiast delikatnego hairline'u). */
  return (
    <footer className="relative overflow-hidden border-t border-cream-200/10 bg-espresso-900 text-cream-50">
      <div className="as-shell py-10 lg:py-16">
        <div className="grid gap-8 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-4 lg:col-span-5">
            {/* bez logo w stopce – znak marki jest w nagłówku, stopkę otwiera hasło */}
            <p className="font-display text-2xl italic text-cream-100">{BRAND.tagline}</p>
            <p className="as-caption-invert mt-3 hidden sm:block">{BRAND.claim}</p>

            {/* md (768–1023): wąska kolumna 4/12 – etykieta nad wartością, bez łamania w 3 wiersze */}
            <dl className="mt-5 max-w-sm lg:mt-8">
              <div className="flex items-baseline justify-between gap-6 border-t border-cream-200/10 py-3 md:flex-col md:items-start md:gap-1 lg:flex-row lg:items-baseline lg:justify-between lg:gap-6">
                <dt className="as-label text-cream-200/70">{CONTACT.venue}</dt>
                <dd className="text-right text-[0.8125rem] text-cream-100 md:text-left lg:text-right">
                  {[CONTACT.street, CONTACT.postal, CONTACT.city].filter(Boolean).join(', ')}
                </dd>
              </div>
              {CONTACT.hours.map((h) => (
                <div key={h.day} className="flex items-baseline justify-between gap-6 border-t border-cream-200/10 py-3 md:flex-col md:items-start md:gap-1 lg:flex-row lg:items-baseline lg:justify-between lg:gap-6">
                  <dt className="as-label text-cream-200/70">{h.day}</dt>
                  <dd className="text-right text-[0.8125rem] text-cream-100 md:text-left lg:text-right">{h.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-1 flex flex-wrap items-center gap-x-6 lg:mt-4">
              {CONTACT.phone && (
                <a
                  href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}
                  className="inline-flex min-h-[2.75rem] items-center text-[0.8125rem] text-cream-100 transition-colors hover:text-cream-50"
                >
                  {CONTACT.phone}
                </a>
              )}
              {CONTACT.email && (
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="inline-flex min-h-[2.75rem] items-center text-[0.8125rem] text-cream-100 transition-colors hover:text-cream-50"
                >
                  {CONTACT.email}
                </a>
              )}
              <a
                href={CONTACT.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-[2.75rem] items-center gap-2 text-[0.8125rem] text-cream-200/80 transition-colors hover:text-cream-50"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
                {CONTACT.instagramHandle}
              </a>
            </div>
          </div>

          {/* Mapa serwisu: telefon – trzy zwinięte grupy (przycisk 48 px), od md trzy
              kolumny w 8/12 szerokości (nazwy bez łamania na 3 wiersze), od lg jak dotąd. */}
          <div className="grid border-b border-cream-200/10 md:col-span-8 md:col-start-5 md:grid-cols-3 md:gap-x-6 md:border-b-0 lg:col-span-6 lg:col-start-7">
            {NAV_ALL.map((group) => (
              <FooterGroup key={group.title} group={group} />
            ))}
          </div>
        </div>

        {/* Znak wodny od lg (na tablecie dokładał ~150 px). Napis jako treść ::before –
            dekoracja poza drzewem dostępności i poza testem kontrastu (axe liczył go jako błąd). */}
        <div aria-hidden="true" className="mt-12 hidden border-t border-cream-200/10 pt-8 lg:block">
          <span
            className="as-display block select-none text-cream-200/[0.08] before:content-['AS_COMPANY']"
            style={{ fontSize: 'clamp(2.5rem, 10vw, 9rem)', lineHeight: 0.85 }}
          />
        </div>

        {/* Dokumenty zawsze (publiczne – LEGAL_PUBLIC); wiersz z danymi firmy – po uzupełnieniu
            LEGAL w site.js. Od lg dokumenty i prawa autorskie w jednym wierszu. */}
        <div className="mt-6 flex flex-col gap-y-2 lg:mt-8 lg:flex-row lg:items-center lg:justify-between lg:gap-x-10">
          <div className="flex flex-wrap items-center gap-x-6 text-[0.8125rem] text-cream-200/80">
            {LEGAL.company && (
              <span className="basis-full py-2 lg:basis-auto">
                {[LEGAL.company, LEGAL.address, LEGAL.nip && `${t.nip} ${LEGAL.nip}`, LEGAL.register].filter(Boolean).join(' · ')}
              </span>
            )}
            {LEGAL_LINKS.map(({ key, route }) => (
              <Link key={key} href={route} className="inline-flex min-h-[2.75rem] items-center underline underline-offset-2 hover:text-cream-50">
                {t[key]}
              </Link>
            ))}
            {/* Link, nie przycisk: bez JavaScriptu (baner się wtedy nie pokazuje i nic nie jest
                zapisywane) prowadzi do pkt 6 Polityki cookies; z JS otwiera baner z ustawieniami. */}
            <Link
              href={`${ROUTES.cookies}#zarzadzanie`}
              onClick={(e) => {
                e.preventDefault();
                openConsentSettings();
              }}
              className="inline-flex min-h-[2.75rem] items-center underline underline-offset-2 hover:text-cream-50"
            >
              {t.cookieSettings}
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <p className="as-label text-cream-200/70">
              © {year} {BRAND.full}. {t.rights}
            </p>
            <LanguageSwitcher tone="light" className="-ml-3.5 sm:-mr-3.5 sm:ml-0" />
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobilny pasek CTA – po przewinięciu hero; ukryty przy pasie        */
/*  zamykającym, formularzach, stopce, otwartym menu i dialogu        */
/*  (nie zasłania „Wyślij”) oraz w telefonie w poziomie od 640 px.     */
/* ------------------------------------------------------------------ */

function StickyBar({ menuOpen }) {
  const pathname = usePathname();
  const { canonical } = usePathInfo();
  const t = useContent(common);
  const bookingHref = useBookingHref();
  const [pastHero, setPastHero] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const dialogOpen = useDialogOpen();
  const shortWithPill = useMediaQuery(SHORT_WITH_PILL);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const targets = Array.from(document.querySelectorAll('footer, form, [data-sticky-hide]'));
    if (!targets.length) return undefined;
    const visible = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
        setBlocked(visible.size > 0);
      },
      { threshold: 0 }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [pathname]);

  /* trasy-formularze (w każdym języku): pasek dublowałby formularz */
  if (canonical === '/kontakt' || canonical === BOOKING_PAGE) return null;
  const show = pastHero && !blocked && !menuOpen && !dialogOpen && !shortWithPill;

  /* <nav> = landmark (axe: region). aria-hidden zawsze jako "true"/"false" – czytają
     go index.css (baner cookies, toast) i OrderFab. */
  return (
    <nav
      id="as-sticky"
      aria-label={t.shortcutsAria}
      aria-hidden={show ? 'false' : 'true'}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-cream-200/15 bg-espresso-900 pb-[env(safe-area-inset-bottom)] transition-[transform,opacity] duration-300 lg:hidden',
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
      )}
    >
      {/* obrys fokusu wewnątrz pola – przy krawędzi ekranu offset na zewnątrz się nie mieści */}
      <Link
        href={bookingHref}
        tabIndex={show ? 0 : -1}
        className="as-label as-focus-inset flex h-14 items-center justify-center text-cream-100"
      >
        {t.book}
      </Link>
      <Link
        href="/szkolenia"
        tabIndex={show ? 0 : -1}
        className="as-label as-focus-inset flex h-14 items-center justify-center border-l border-cream-200/15 text-cream-100"
      >
        {t.stickyTraining}
      </Link>
    </nav>
  );
}

/* ------------------------------------------------------------------ */

export default function Layout({ children, year }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col bg-cream-50">
      {/* baner zgody pierwszy w kolejności tabulacji; wizualnie przyklejony do dołu.
          Przy otwartym menu albo dialogu ukrywa go src/index.css (visibility). */}
      <CookieConsent />
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <Footer year={year} />
      <StickyBar menuOpen={menuOpen} />
    </div>
  );
}
