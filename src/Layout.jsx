'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Instagram, Menu, X } from 'lucide-react';
import Logo from '@/components/as/Logo';
import { ArrowLink } from '@/components/as/Primitives';
import { BRAND, CONTACT, NAV_ALL, NAV_MAIN } from '@/lib/site';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Nagłówek                                                            */
/* ------------------------------------------------------------------ */

function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Zamknij menu przy zmianie trasy i zablokuj przewijanie, gdy otwarte
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-500',
          scrolled
            ? 'border-b border-ink/10 bg-cream-50 shadow-[0_1px_24px_rgba(36,27,20,0.06)]'
            : 'border-b border-transparent bg-cream-50/70 backdrop-blur-sm'
        )}
      >
        <div className="as-shell flex h-20 items-center justify-between gap-6 lg:h-24">
          <Link href="/" aria-label="AS Company — strona główna" className="shrink-0">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-9 lg:flex" aria-label="Nawigacja główna">
            {NAV_MAIN.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative py-1 text-[0.8125rem] transition-colors',
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
              href="/kontakt"
              className="hidden items-center gap-2 rounded-full border border-ink/25 px-6 py-2.5 text-[0.75rem] transition-colors hover:border-ink hover:bg-ink hover:text-cream-50 sm:inline-flex"
            >
              Umów wizytę
              <span aria-hidden="true" className="text-[0.7rem]">
                &#8599;
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="as-menu"
              aria-label={menuOpen ? 'Zamknij menu' : 'Otwórz menu'}
              className="grid h-10 w-10 place-items-center text-ink transition-colors hover:text-gold-dark"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Pełnoekranowe menu */}
      <div
        id="as-menu"
        hidden={!menuOpen}
        className={cn(
          'fixed inset-0 z-40 overflow-y-auto bg-espresso text-cream-50 transition-opacity duration-300',
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
                      className="group flex items-baseline gap-6 py-2 transition-colors hover:text-gold-light"
                    >
                      <span className="as-label w-6 text-gold/70">{String(i + 1).padStart(2, '0')}</span>
                      <span className="as-display-md">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="grid gap-10 sm:grid-cols-3 lg:col-span-6">
              {NAV_ALL.map((group) => (
                <div key={group.title}>
                  <h2 className="as-label text-gold-light">{group.title}</h2>
                  <ul className="mt-5 space-y-3">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm text-cream-200/70 transition-colors hover:text-cream-50"
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
            <p className="as-label text-cream-200/50">
              {CONTACT.venue} · {CONTACT.city}
            </p>
            <a
              href={CONTACT.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-cream-200/70 transition-colors hover:text-cream-50"
            >
              <Instagram className="h-4 w-4" />
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

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-cream-200/12 bg-espresso-900 text-cream-50">
      <div className="as-shell py-20 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Logo tone="light" />
            <p className="as-body-invert mt-8 max-w-sm">{BRAND.claim}</p>

            <div className="mt-10 space-y-1.5">
              <p className="text-sm text-cream-100">{CONTACT.venue}</p>
              <p className="text-sm text-cream-200/60">
                {[CONTACT.street, CONTACT.postal, CONTACT.city].filter(Boolean).join(', ')}
              </p>
              <p className="text-xs text-cream-200/45">{CONTACT.venueNote}</p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              {CONTACT.phone && (
                <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className="text-sm text-cream-100 hover:text-gold-light">
                  {CONTACT.phone}
                </a>
              )}
              {CONTACT.email && (
                <a href={`mailto:${CONTACT.email}`} className="text-sm text-cream-100 hover:text-gold-light">
                  {CONTACT.email}
                </a>
              )}
              <a
                href={CONTACT.instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-cream-200/70 transition-colors hover:text-gold-light"
              >
                <Instagram className="h-4 w-4" />
                {CONTACT.instagramHandle}
              </a>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7">
            {NAV_ALL.map((group) => (
              <div key={group.title}>
                <h2 className="as-label text-gold-light">{group.title}</h2>
                <ul className="mt-5 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-cream-200/65 transition-colors hover:text-cream-50"
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

        <div className="mt-16 border-t border-cream-200/12 pt-10">
          <p
            className="as-display select-none text-cream-200/10"
            style={{ fontSize: 'clamp(2.5rem, 12vw, 11rem)', lineHeight: 0.85 }}
            aria-hidden="true"
          >
            AS COMPANY
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="as-label text-cream-200/40">
            © {year} {BRAND.full}. Wszystkie prawa zastrzeżone.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <ArrowLink href="/kontakt" tone="light" className="border-b-0 pb-0">
              Napisz do nas
            </ArrowLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream-50">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
