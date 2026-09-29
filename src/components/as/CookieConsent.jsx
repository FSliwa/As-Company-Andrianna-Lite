'use client';

/**
 * Baner zgody na cookies i pamięć przeglądarki.
 * - bez nakładki i bez blokowania strony (karta w lewym dolnym rogu, na telefonie na całą szerokość),
 * - tryb informacyjny („Rozumiem”), gdy serwis zapisuje tylko rzeczy niezbędne,
 * - tryb wyboru (równorzędne „Akceptuję wszystkie” / „Tylko niezbędne” + ustawienia kategorii),
 *   gdy w src/lib/consent.js są kategorie opcjonalne,
 * - ponowne otwarcie z linku „Ustawienia cookies” w stopce (openConsentSettings),
 * - decyzja w localStorage na 12 miesięcy; nic opcjonalnego nie ładuje się przed zgodą.
 */

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import LocaleLink from '@/components/as/LocaleLink';
import { useLocale } from '@/i18n/client';
import BANNER from '@/content/legal/banner';
import {
  CONSENT_OPEN_EVENT,
  OPTIONAL_CATEGORIES,
  readConsent,
  writeConsent,
} from '@/lib/consent';
import { cn } from '@/lib/utils';

const BTN = 'inline-flex min-h-[44px] items-center justify-center px-5 py-2.5 text-[0.6875rem] font-medium uppercase tracking-wider2 transition-colors';

export default function CookieConsent() {
  const locale = useLocale();
  const t = BANNER[locale] || BANNER.pl;
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(false);
  const [choices, setChoices] = useState({});
  const headingRef = useRef(null);
  const openedManually = useRef(false);
  const titleId = useId();
  const choiceMode = OPTIONAL_CATEGORIES.length > 0;

  useEffect(() => {
    const current = readConsent();
    if (!current) setOpen(true);
    else setChoices(current);
    const onOpen = () => {
      openedManually.current = true;
      setChoices(readConsent() || {});
      setSettings(choiceMode);
      setOpen(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
  }, [choiceMode]);

  // otwarte z linku w stopce → fokus na nagłówek banera; Escape zamyka (decyzja już jest)
  useEffect(() => {
    if (!open || !openedManually.current) return undefined;
    headingRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape' && readConsent()) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const decide = useCallback((value) => {
    writeConsent(value);
    setOpen(false);
    setSettings(false);
    openedManually.current = false;
  }, []);

  if (!open) return null;

  const all = Object.fromEntries(OPTIONAL_CATEGORIES.map((c) => [c, true]));

  return (
    <div
      role="region"
      aria-labelledby={titleId}
      data-consent-banner=""
      className="fixed inset-x-3 bottom-3 z-[60] border border-gold/40 bg-cream-50 p-5 text-ink shadow-[0_18px_48px_-18px_rgba(36,27,20,0.35)] sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-w-[26rem] sm:p-6"
    >
      <h2 id={titleId} ref={headingRef} tabIndex={-1} className="as-label text-gold-deep focus:outline-none">
        {t.title}
      </h2>
      <p className="mt-3 text-[0.875rem] leading-relaxed text-ink/80">
        {t.text}{' '}
        <LocaleLink href="/polityka-cookies" className="underline underline-offset-2 hover:text-ink">
          {t.policyLink}
        </LocaleLink>
      </p>

      {choiceMode && settings && (
        <ul className="mt-4 space-y-3 border-t border-ink/10 pt-4">
          <li className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.875rem] font-medium">{t.categories.necessary.name}</p>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-mocha">{t.categories.necessary.desc}</p>
            </div>
            <span className="as-label shrink-0 pt-0.5 text-ink/65">{t.alwaysOn}</span>
          </li>
          {OPTIONAL_CATEGORIES.map((c) => (
            <li key={c} className="flex items-start justify-between gap-4">
              <label htmlFor={`consent-${c}`} className="cursor-pointer">
                <span className="block text-[0.875rem] font-medium">{t.categories[c]?.name || c}</span>
                <span className="mt-1 block text-[0.8125rem] leading-relaxed text-mocha">{t.categories[c]?.desc}</span>
              </label>
              <input
                id={`consent-${c}`}
                type="checkbox"
                checked={Boolean(choices[c])}
                onChange={(e) => setChoices((prev) => ({ ...prev, [c]: e.target.checked }))}
                className="mt-1 h-5 w-5 shrink-0 accent-ink"
              />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {!choiceMode && (
          <button type="button" onClick={() => decide({})} className={cn(BTN, 'bg-ink text-cream-50 hover:bg-espresso-600 focus-visible:outline-ink')}>
            {t.buttonOk}
          </button>
        )}
        {choiceMode && !settings && (
          <>
            <button type="button" onClick={() => decide({})} className={cn(BTN, 'border border-ink text-ink hover:bg-ink hover:text-cream-50')}>
              {t.buttonReject}
            </button>
            <button type="button" onClick={() => decide(all)} className={cn(BTN, 'border border-ink text-ink hover:bg-ink hover:text-cream-50')}>
              {t.buttonAccept}
            </button>
            <button type="button" onClick={() => setSettings(true)} className="min-h-[44px] text-[0.8125rem] underline underline-offset-2 hover:text-gold-deep">
              {t.buttonSettings}
            </button>
          </>
        )}
        {choiceMode && settings && (
          <button type="button" onClick={() => decide(choices)} className={cn(BTN, 'bg-ink text-cream-50 hover:bg-espresso-600 focus-visible:outline-ink')}>
            {t.buttonSave}
          </button>
        )}
      </div>
    </div>
  );
}
