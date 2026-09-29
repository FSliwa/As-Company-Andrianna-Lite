'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Instagram, Menu, X } from 'lucide-react';
import Logo from '@/components/as/Logo';
import { BOOKING_PAGE, BOOKING_URL, BRAND, CONTACT, LEGAL, NAV_ALL, NAV_MAIN } from '@/lib/site';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Nagłówek                                                            */
/* ------------------------------------------------------------------ */

function Header({ menuOpen, setMenuOpen }) {
  const pathname = usePathname();
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

  return (
    <>
      <a
        href="#main"
        className="as-label sr-only z-[60] bg-ink px-5 py-3 text-cream-50 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Przejdź do treści
      </a>
      <header
        className={cn(
          'sticky top-0 z-50 transition-colors duration-300',
          menuOpen
            ? 'border-b border-ink/10 bg-cream-50'
            : scrolled
              ? 'border-b border-ink/10 bg-cream-50'
              : 'border-b border-transparent bg-cream-50/70 backdrop-blur-sm'
        )}
      >
        <div className="as-shell flex h-20 items-center justify-between gap-6 lg:h-24">
          <Link href="/" className="shrink-0" aria-label="AS COMPANY POLAND — strona główna">
            <Logo priority />
          </Link>

          <nav className="hidden items-center gap-9 lg:flex" aria-label="Nawigacja główna">
            {NAV_MAIN.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative py-1 text-[0.75rem] font-medium uppercase tracking-[0.12em] transition-colors',
                    active ? 'text-ink' : 'text-ink/65 hover:text-ink'
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
            <Link
              href={BOOKING_URL}
              className="hidden items-center gap-2 rounded-full border border-ink/25 px-6 py-2.5 text-[0.75rem] transition-colors hover:border-ink hover:bg-ink hover:text-cream-50 sm:inline-flex"
            >
              Umów wizytę
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
              aria-label={menuOpen ? 'Zamknij menu' : 'Otwórz menu'}
              className="grid h-11 w-11 place-items-center text-ink transition-colors hover:text-gold-dark lg:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Pełnoekranowe menu (telefon, tablet) — dialog */}
      <div
        id="as-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!menuOpen}
        className={cn(
          'fixed inset-0 z-40 overflow-y-auto bg-cream-50 text-ink transition-opacity duration-300',
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className="as-shell flex min-h-full flex-col justify-between pb-16 pt-28 lg:pt-36">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            <nav className="lg:col-span-6" aria-label="Skróty">
              <ul className="space-y-1">
                {NAV_MAIN.map((item, i) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-baseline gap-6 py-2 transition-colors hover:text-gold-dark"
                    >
                      <span className="as-label w-6 text-gold-deep">{String(i + 1).padStart(2, '0')}</span>
                      <span className="as-display-md">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:col-span-6">
              {NAV_ALL.map((group) => (
                <div key={group.title}>
                  <p className="as-label text-gold-deep">{group.title}</p>
                  <ul className="mt-4">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="block py-1.5 text-[0.875rem] text-ink/75 transition-colors hover:text-ink"
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

          <div className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-gold/30 pt-8">
            <p className="as-label text-ink/65">
              {CONTACT.venue} · {CONTACT.city}
            </p>
            <a
              href={CONTACT.instagram}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex min-h-[44px] items-center gap-2 text-[0.875rem] text-ink/75 transition-colors hover:text-ink"
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

  return (
    <footer className="relative overflow-hidden border-t border-gold/30 bg-cream-100 text-ink">
      <div className="as-shell py-12 lg:py-24">
        <div className="grid gap-10 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <Logo size="lg" className="h-16 w-16 sm:h-24 sm:w-24 lg:h-28 lg:w-28" />
            <p className="mt-6 font-display text-2xl italic text-ink lg:mt-8">{BRAND.tagline}</p>
            <p className="as-caption mt-3 hidden sm:block">{BRAND.claim}</p>

            <dl className="mt-6 max-w-sm lg:mt-10">
              <div className="flex items-baseline justify-between gap-6 border-t border-ink/10 py-3">
                <dt className="as-label text-ink/65">{CONTACT.venue}</dt>
                <dd className="text-[0.875rem] text-ink">
                  {[CONTACT.street, CONTACT.postal, CONTACT.city].filter(Boolean).join(', ')}
                </dd>
              </div>
              {CONTACT.hours.map((h) => (
                <div key={h.day} className="flex items-baseline justify-between gap-6 border-t border-ink/10 py-3">
                  <dt className="as-label text-ink/65">{h.day}</dt>
                  <dd className="text-[0.875rem] text-ink">{h.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 flex flex-wrap items-center gap-6 lg:mt-8">
              {CONTACT.phone && (
                <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className="text-[0.875rem] text-ink hover:text-gold-deep">
                  {CONTACT.phone}
                </a>
              )}
              {CONTACT.email && (
                <a href={`mailto:${CONTACT.email}`} className="text-[0.875rem] text-ink hover:text-gold-deep">
                  {CONTACT.email}
                </a>
              )}
              <a
                href={CONTACT.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-[44px] items-center gap-2 text-[0.875rem] text-ink/75 transition-colors hover:text-gold-deep"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
                {CONTACT.instagramHandle}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:col-span-7 md:col-start-6 lg:col-span-6 lg:col-start-7">
            {NAV_ALL.map((group) => (
              <div key={group.title}>
                <p className="as-label text-gold-deep">{group.title}</p>
                <ul className="mt-4">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="block py-1.5 text-[0.875rem] text-ink/75 transition-colors hover:text-ink"
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

        <div className="mt-10 hidden border-t border-gold/30 pt-8 sm:block lg:mt-16 lg:pt-10">
          <p
            className="as-display select-none text-gold/[0.22]"
            style={{ fontSize: 'clamp(2.5rem, 12vw, 11rem)', lineHeight: 0.85 }}
            aria-hidden="true"
          >
            AS COMPANY
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:mt-10">
          <p className="as-label text-ink/65">
            © {year} {BRAND.full}. Wszystkie prawa zastrzeżone.
          </p>
          {/* Dane firmy i polityka prywatności — pojawią się, gdy klient uzupełni LEGAL w site.js */}
          {(LEGAL.company || LEGAL.privacyPolicy) && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.8125rem] text-ink/75">
              {LEGAL.company && (
                <span>
                  {[LEGAL.company, LEGAL.address, LEGAL.nip && `NIP ${LEGAL.nip}`, LEGAL.register].filter(Boolean).join(' · ')}
                </span>
              )}
              {LEGAL.privacyPolicy && (
                <Link href="/polityka-prywatnosci" className="underline underline-offset-2 hover:text-ink">
                  Polityka prywatności
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobilny pasek CTA — po przewinięciu hero, ukryty przy pasie        */
/*  zamykającym, formularzach i stopce (nie zasłania „Wyślij").        */
/* ------------------------------------------------------------------ */

function StickyBar({ menuOpen }) {
  const pathname = usePathname();
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

  /* trasy-formularze: pasek dublowałby formularz */
  if (pathname === '/kontakt' || pathname === BOOKING_PAGE) return null;
  const show = pastHero && !blocked && !menuOpen;

  return (
    <div
      id="as-sticky"
      aria-hidden={!show}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-gold/30 bg-cream-50/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm transition-[transform,opacity] duration-300 lg:hidden',
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
      )}
    >
      <Link
        href={BOOKING_URL}
        tabIndex={show ? 0 : -1}
        className="as-label flex h-14 items-center justify-center bg-ink text-cream-50"
      >
        Umów wizytę
      </Link>
      <Link
        href="/szkolenia"
        tabIndex={show ? 0 : -1}
        className="as-label flex h-14 items-center justify-center text-ink"
      >
        Szkolenia
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function Layout({ children, year }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col bg-cream-50">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <Footer year={year} />
      <StickyBar menuOpen={menuOpen} />
    </div>
  );
}
