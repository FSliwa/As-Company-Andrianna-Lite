'use client';

/**
 * Baner zgody na cookies i pamięć przeglądarki.
 * - bez nakładki i bez blokowania strony (karta w lewym dolnym rogu, na telefonie na całą szerokość),
 * - tryb informacyjny („Rozumiem”), gdy serwis zapisuje tylko rzeczy niezbędne – pokazuje się
 *   dopiero po przewinięciu za pierwszy ekran (zapisy niezbędne nie wymagają zgody ani
 *   informacji na wejściu – art. 399 ust. 3 PKE), żeby nie zasłaniać hero i przycisku
 *   „Umów wizytę” w pierwszym ekranie telefonu,
 * - tryb wyboru (równorzędne „Akceptuję wszystkie” / „Tylko niezbędne” + ustawienia kategorii),
 *   gdy w src/lib/consent.js są kategorie opcjonalne,
 * - ponowne otwarcie z linku „Ustawienia cookies” w stopce (openConsentSettings): nagłówek
 *   „Ustawienia cookies” i kategoria „Niezbędne – zawsze włączone”; po zamknięciu fokus
 *   wraca na link, który baner otworzył,
 * - decyzja w localStorage na 12 miesięcy; nic opcjonalnego nie ładuje się przed zgodą;
 *   decyzja z innej karty zamyka baner (zdarzenie storage).
 *
 * Warstwy (z-index): nad pływającym „Twoje zamówienie” (z-30), pod mobilnym paskiem CTA
 * i menu (z-40) oraz pod dialogami (z-50). Przy otwartym dialogu albo menu baner jest
 * ukryty (visibility, src/index.css) – nie zasłania ich i nie przechwytuje dotknięć.
 * Położenie od dołu (nad paskiem CTA / przyciskiem zamówienia) i maksymalną wysokość
 * ustawia src/index.css ([data-consent-banner]).
 */

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import LocaleLink from '@/components/as/LocaleLink';
import { useLocale } from '@/i18n/client';
import { ROUTES } from '@/i18n/routes';
import BANNER from '@/content/legal/banner';
import {
  CONSENT_KEY,
  CONSENT_OPEN_EVENT,
  OPTIONAL_CATEGORIES,
  readConsent,
  writeConsent,
} from '@/lib/consent';

/* przyciski wyboru mają równą wagę (EDPB 03/2022 – bez „ciemnych wzorców”) */
const BTN_SOLID = 'as-btn-solid min-h-[44px] px-6 py-3 focus-visible:outline-ink';
const BTN_GHOST = 'as-btn-ghost min-h-[44px] px-6 py-3 focus-visible:outline-ink';

export default function CookieConsent() {
  const locale = useLocale();
  const t = BANNER[locale] || BANNER.pl;
  const [open, setOpen] = useState(false);
  const [manual, setManual] = useState(false); // otwarty ze stopki (decyzja już jest)
  const [settings, setSettings] = useState(false);
  const [choices, setChoices] = useState({});
  const headingRef = useRef(null);
  const openerRef = useRef(null);
  const manualRef = useRef(false);
  const titleId = useId();
  const choiceMode = OPTIONAL_CATEGORIES.length > 0;

  /* zamknięcie: przy otwarciu ze stopki fokus wraca tam, skąd baner otwarto (WCAG 2.4.3) */
  const close = useCallback(() => {
    setOpen(false);
    setSettings(false);
    const wasManual = manualRef.current;
    manualRef.current = false;
    setManual(false);
    const opener = openerRef.current;
    openerRef.current = null;
    if (wasManual && opener && opener.isConnected) requestAnimationFrame(() => opener.focus?.());
  }, []);

  useEffect(() => {
    const current = readConsent();
    let stopWaiting = () => {};
    if (!current) {
      if (choiceMode) {
        // kategorie opcjonalne wymagają decyzji przed ich uruchomieniem – baner od razu
        setOpen(true);
      } else {
        // tryb informacyjny: po przewinięciu za ~40% pierwszego ekranu (albo od razu, gdy
        // strona otworzyła się niżej, np. z kotwicy)
        const passed = () => window.scrollY > window.innerHeight * 0.4;
        const onScroll = () => {
          if (!passed()) return;
          setOpen(true);
          stopWaiting();
        };
        stopWaiting = () => window.removeEventListener('scroll', onScroll);
        if (passed()) setOpen(true);
        else window.addEventListener('scroll', onScroll, { passive: true });
      }
    } else setChoices(current);
    const onOpen = () => {
      const active = document.activeElement;
      openerRef.current = active && active !== document.body ? active : null;
      manualRef.current = true;
      setManual(true);
      setChoices(readConsent() || {});
      setSettings(choiceMode);
      setOpen(true);
    };
    /* decyzja podjęta (albo usunięta) w innej karcie */
    const onStorage = (e) => {
      if (e.key !== null && e.key !== CONSENT_KEY) return;
      const next = readConsent();
      if (next) {
        setChoices(next);
        if (!manualRef.current) setOpen(false);
      } else if (!manualRef.current) {
        setOpen(true);
      }
    };
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    window.addEventListener('storage', onStorage);
    return () => {
      stopWaiting();
      window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
      window.removeEventListener('storage', onStorage);
    };
  }, [choiceMode]);

  // otwarte z linku w stopce → fokus na tytuł banera; Escape zamyka (decyzja już jest)
  useEffect(() => {
    if (!open || !manual) return undefined;
    headingRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape' && readConsent()) close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, manual, close]);

  const decide = useCallback(
    (value) => {
      writeConsent(value);
      close();
    },
    [close]
  );

  // pierwsza wizyta (baner informacyjny): Escape działa jak „Rozumiem” – tylko niezbędne
  useEffect(() => {
    if (!open || manual) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      // Escape zamykający menu mobilne albo dialog nie może po cichu zamknąć banera
      if (document.querySelector('[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"], #as-menu:not([hidden])')) return;
      decide({});
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, manual, decide]);

  if (!open) return null;

  const all = Object.fromEntries(OPTIONAL_CATEGORIES.map((c) => [c, true]));
  // panel ustawień: w trybie wyboru po „Ustawienia”, w trybie informacyjnym po otwarciu ze stopki
  const showSettings = choiceMode ? settings : manual;

  return (
    <div
      role="region"
      aria-labelledby={titleId}
      data-consent-banner=""
      className="fixed inset-x-3 z-[35] overflow-y-auto overscroll-contain border border-gold/40 bg-cream-50 p-4 text-ink sm:inset-x-auto sm:left-5 sm:max-w-[26rem] sm:p-6"
    >
      {/* <p>, nie nagłówek: baner stoi w DOM przed <h1> strony; region ma nazwę z aria-labelledby */}
      <p id={titleId} ref={headingRef} tabIndex={-1} className="as-label text-gold-deep focus:outline-none">
        {showSettings ? t.settingsTitle : t.title}
      </p>
      <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink/80 sm:mt-3 sm:text-[0.875rem]">
        {t.text}{' '}
        <LocaleLink href={ROUTES.cookies} className="underline underline-offset-2 hover:text-ink">
          {t.policyLink}
        </LocaleLink>
      </p>

      {showSettings && (
        <ul className="mt-4 space-y-3 border-t border-ink/10 pt-4">
          <li className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.875rem] font-medium">{t.categories.necessary.name}</p>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-mocha">{t.categories.necessary.desc}</p>
            </div>
            <span className="as-label shrink-0 pt-0.5 text-ink/65">{t.alwaysOn}</span>
          </li>
          {choiceMode &&
            OPTIONAL_CATEGORIES.map((c) => (
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

      <div className="mt-3 flex flex-wrap items-center gap-3 sm:mt-5">
        {!choiceMode && (
          <button type="button" onClick={() => decide({})} className={BTN_SOLID}>
            {t.buttonOk}
          </button>
        )}
        {choiceMode && !settings && (
          <>
            <button type="button" onClick={() => decide({})} className={BTN_GHOST}>
              {t.buttonReject}
            </button>
            <button type="button" onClick={() => decide(all)} className={BTN_GHOST}>
              {t.buttonAccept}
            </button>
            <button type="button" onClick={() => setSettings(true)} className="min-h-[44px] text-[0.8125rem] underline underline-offset-2 hover:text-gold-deep">
              {t.buttonSettings}
            </button>
          </>
        )}
        {choiceMode && settings && (
          <>
            {/* wycofanie zgody równie łatwe jak jej udzielenie (art. 7 ust. 3 RODO) */}
            <button type="button" onClick={() => decide({})} className={BTN_GHOST}>
              {t.buttonReject}
            </button>
            <button type="button" onClick={() => decide(choices)} className={BTN_GHOST}>
              {t.buttonSave}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
