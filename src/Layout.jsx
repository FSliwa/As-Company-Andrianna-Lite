'use client';

/**
 * Wspólny interfejs wszystkich wersji językowych: nagłówek, menu, stopka, pasek CTA.
 * Teksty – src/content/common (useContent), dane nawigacji – useSite(), linki
 * wewnętrzne – LocaleLink (polska ścieżka → adres bieżącego języka), język z adresu.
 */

import React, { useEffect, useRef, useState } from 'react';
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

/* ------------------------------------------------------------------ */
/*  Nagłówek                                                            */
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Zamknij menu przy zmianie trasy
  useEffect(() => setMenuOpen(false), [pathname, setMenuOpen]);

  // Menu jako dialog: blokada przewijania, treść pod spodem „inert", Escape zamyka
  // i oddaje fokus przyciskowi menu.
  useEffect(() => {
    const outside = [document.querySelector('main'), document.querySelector('footer'), document.getElementById('as-sticky')];
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    outside.forEach((el) => el && (el.inert = menuOpen));
    if (!menuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      outside.forEach((el) => el && (el.inert = false));
    };
  }, [menuOpen, setMenuOpen]);

  const dark = menuOpen;

  return (
    <>
      <a
        href="#main"
        className="as-label sr-only z-[60] bg-ink px-5 py-3 text-cream-50 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {t.skipLink}
      </a>
      <header
        className={cn(
          'sticky top-0 z-50 transition-colors duration-300',
          dark
            ? 'border-b border-cream-200/10 bg-espresso'
            : scrolled
              ? 'border-b border-ink/10 bg-cream-50'
              : 'border-b border-transparent bg-cream-50/70 backdrop-blur-sm'
        )}
      >
        <div className="as-shell flex h-20 items-center justify-between gap-6 lg:h-24">
          {/* D9: „AS COMPANY POLAND” to napis w logo (plik marki z makiety i sklepu) – nazwa
              dostępna opisuje logo, więc zostaje; w tekstach strony: AS COMPANY / AS COMPANY LOVELINESS. */}
          <Link href="/" className="shrink-0" aria-label="AS COMPANY POLAND – strona główna">
            <Logo priority />
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
                  className={cn(
                    'relative py-1 text-[0.75rem] font-medium uppercase tracking-[0.12em] transition-colors',
                    active ? 'text-ink' : 'text-ink/65 hover:text-ink',
                    longLabels && 'whitespace-nowrap'
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      'absolute -bottom-0.5 left-0 h-px bg-gold transition-all duration-300',
                      active ? 'w-full' : 'w-0'
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4 sm:gap-5">
            {/* przełącznik języka od lg – po nawigacji, przed pigułką; niżej w menu i stopce */}
            <LanguageSwitcher tone={dark ? 'light' : 'dark'} className="hidden lg:flex" />
            <Link
              href={bookingHref}
              className={cn(
                'hidden items-center gap-2 rounded-full border px-6 py-2.5 text-[0.75rem] transition-colors sm:inline-flex',
                dark
                  ? 'border-cream-200/30 text-cream-100 hover:bg-cream-100 hover:text-ink'
                  : 'border-ink/25 hover:border-ink hover:bg-ink hover:text-cream-50'
              )}
            >
              {t.book}
              <span aria-hidden="true" className="text-[0.7rem]">
                &#8599;
              </span>
            </Link>

            <button
              ref={menuButton}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="as-menu"
              aria-label={menuOpen ? t.menuClose : t.menuOpen}
              className={cn(
                'grid h-11 w-11 place-items-center transition-colors lg:hidden',
                dark ? 'text-cream-100 hover:text-gold-light' : 'text-ink hover:text-gold-dark'
              )}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Pełnoekranowe menu (telefon, tablet) – dialog */}
      <div
        id="as-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t.menuAria}
        hidden={!menuOpen}
        className={cn(
          'fixed inset-0 z-40 overflow-y-auto bg-espresso text-cream-50 transition-opacity duration-300',
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className="as-shell flex min-h-full flex-col justify-between pb-16 pt-28 lg:pt-36">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            <nav className="lg:col-span-6" aria-label={t.shortcutsAria}>
              <ul className="space-y-1">
                {NAV_MAIN.map((item, i) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-baseline gap-6 py-2 transition-colors hover:text-gold-light"
                    >
                      <span className="as-label w-6 text-gold-light">{String(i + 1).padStart(2, '0')}</span>
                      <span className="as-display-md">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:col-span-6">
              {NAV_ALL.map((group) => (
                <div key={group.title}>
                  <p className="as-label text-gold-light">{group.title}</p>
                  <ul className="mt-4">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="block py-1.5 text-[0.875rem] text-cream-200/80 transition-colors hover:text-cream-50"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-cream-200/15 pt-8">
            <LanguageSwitcher tone="light" className="-ml-3.5 w-full" />
            <p className="as-label text-cream-200/75">
              {CONTACT.venue} · {CONTACT.city}
            </p>
            <a
              href={CONTACT.instagram}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex min-h-[44px] items-center gap-2 text-[0.875rem] text-cream-200/80 transition-colors hover:text-cream-50"
            >
              <Instagram className="h-4 w-4" aria-hidden="true" />
              {CONTACT.instagramHandle}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Stopka                                                              */
/* ------------------------------------------------------------------ */

function Footer({ year }) {
  const t = useContent(common);
  const { BRAND, CONTACT, LEGAL, NAV_ALL } = useSite();

  return (
    <footer className="relative overflow-hidden border-t border-cream-200/12 bg-espresso-900 text-cream-50">
      <div className="as-shell py-12 lg:py-24">
        <div className="grid gap-10 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            {/* bez logo w stopce – znak marki jest w nagłówku, stopkę otwiera hasło */}
            <p className="font-display text-2xl italic text-cream-100">{BRAND.tagline}</p>
            <p className="as-caption-invert mt-3 hidden sm:block">{BRAND.claim}</p>

            <dl className="mt-6 max-w-sm lg:mt-10">
              <div className="flex items-baseline justify-between gap-6 border-t border-cream-200/12 py-3">
                <dt className="as-label text-cream-200/70">{CONTACT.venue}</dt>
                <dd className="text-[0.875rem] text-cream-100">
                  {[CONTACT.street, CONTACT.postal, CONTACT.city].filter(Boolean).join(', ')}
                </dd>
              </div>
              {CONTACT.hours.map((h) => (
                <div key={h.day} className="flex items-baseline justify-between gap-6 border-t border-cream-200/12 py-3">
                  <dt className="as-label text-cream-200/70">{h.day}</dt>
                  <dd className="text-[0.875rem] text-cream-100">{h.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 flex flex-wrap items-center gap-6 lg:mt-8">
              {CONTACT.phone && (
                <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className="text-[0.875rem] text-cream-100 hover:text-gold-light">
                  {CONTACT.phone}
                </a>
              )}
              {CONTACT.email && (
                <a href={`mailto:${CONTACT.email}`} className="text-[0.875rem] text-cream-100 hover:text-gold-light">
                  {CONTACT.email}
                </a>
              )}
              <a
                href={CONTACT.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-[44px] items-center gap-2 text-[0.875rem] text-cream-200/80 transition-colors hover:text-gold-light"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
                {CONTACT.instagramHandle}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:col-span-7 md:col-start-6 lg:col-span-6 lg:col-start-7">
            {NAV_ALL.map((group) => (
              <div key={group.title}>
                <p className="as-label text-gold-light">{group.title}</p>
                <ul className="mt-4">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="block py-1.5 text-[0.875rem] text-cream-200/80 transition-colors hover:text-cream-50"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 hidden border-t border-cream-200/12 pt-8 sm:block lg:mt-16 lg:pt-10">
          <p
            className="as-display select-none text-cream-200/[0.08]"
            style={{ fontSize: 'clamp(2.5rem, 12vw, 11rem)', lineHeight: 0.85 }}
            aria-hidden="true"
          >
            AS COMPANY
          </p>
        </div>

        {/* Dokumenty zawsze (do czasu danych firmy jako projekt); dane firmy – po uzupełnieniu LEGAL w site.js */}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-1 text-[0.8125rem] text-cream-200/80 lg:mt-10">
          {LEGAL.company && (
            <span className="basis-full sm:basis-auto">
              {[LEGAL.company, LEGAL.address, LEGAL.nip && `${t.nip} ${LEGAL.nip}`, LEGAL.register].filter(Boolean).join(' · ')}
            </span>
          )}
          {LEGAL_LINKS.map(({ key, route }) => (
            <Link key={key} href={route} className="inline-flex min-h-[44px] items-center underline underline-offset-2 hover:text-cream-50">
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
            className="inline-flex min-h-[44px] items-center underline underline-offset-2 hover:text-cream-50"
          >
            {t.cookieSettings}
          </Link>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="as-label text-cream-200/70">
            © {year} {BRAND.full}. {t.rights}
          </p>
          <LanguageSwitcher tone="light" className="-ml-3.5 sm:-mr-3.5 sm:ml-0" />
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobilny pasek CTA – po przewinięciu hero, ukryty przy pasie        */
/*  zamykającym, formularzach i stopce (nie zasłania „Wyślij").        */
/* ------------------------------------------------------------------ */

function StickyBar({ menuOpen }) {
  const pathname = usePathname();
  const { canonical } = usePathInfo();
  const t = useContent(common);
  const bookingHref = useBookingHref();
  const [pastHero, setPastHero] = useState(false);
  const [blocked, setBlocked] = useState(false);

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
  const show = pastHero && !blocked && !menuOpen;

  return (
    <div
      id="as-sticky"
      aria-hidden={!show}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-cream-200/15 bg-espresso-900 pb-[env(safe-area-inset-bottom)] transition-[transform,opacity] duration-300 lg:hidden',
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
      )}
    >
      <Link
        href={bookingHref}
        tabIndex={show ? 0 : -1}
        className="as-label flex h-14 items-center justify-center text-cream-100"
      >
        {t.book}
      </Link>
      <Link
        href="/szkolenia"
        tabIndex={show ? 0 : -1}
        className="as-label flex h-14 items-center justify-center border-l border-cream-200/15 text-cream-100"
      >
        {t.stickyTraining}
      </Link>
    </div>
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
