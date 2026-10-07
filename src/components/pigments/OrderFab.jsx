'use client';

/**
 * Pływający przycisk „Twoje zamówienie” z liczbą sztuk.
 *
 * Jedno stałe wezwanie na dole ekranu: gdy lista nie jest pusta, mobilny pasek
 * CTA z Layout (#as-sticky, „Umów wizytę | Szkolenia”) ustępuje temu przyciskowi.
 * Robi to znacznik [data-sticky-hide] (niewidoczny, na cały ekran), który pasek
 * i tak obserwuje – bez zmian w Layout. Dół ekranu zajmuje wtedy 64 px zamiast
 * 116 px (pasek 57 + przycisk 48 + odstęp), także w telefonie trzymanym poziomo.
 * Gdyby pasek był jednak widoczny (np. Layout zmieni zasady), przycisk stoi NAD
 * nim – obserwuje atrybut aria-hidden paska i jego rzeczywistą widoczność.
 *
 * Baner zgody na cookies (pierwsza wizyta) stoi przy dolnej krawędzi – przycisk
 * nie wchodzi pod niego: gdy baner zasłania kolumnę przycisku, przycisk stoi
 * 12 px nad banerem (baner jest nad nim w warstwach, z-[60]).
 *
 * z-30: nad treścią, ale POD banerem cookies (z-35), pełnoekranowym menu
 * (#as-menu, z-40) i dialogami. Baner cookies stoi nad przyciskiem (reguła
 * z [data-order-fab] w src/index.css), więc się nie zasłaniają. Chowa się, gdy
 * w kadrze jest pas zamykający ([data-sticky-hide] w <main> – ma własny przycisk
 * „Twoje zamówienie (n)”) albo stopka – nie zasłania jej i nie dubluje przycisku.
 */

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { NBSP } from './parts';

const GAP = 12;
const LIFTED = 'calc(3.5rem + env(safe-area-inset-bottom, 0px) + 0.75rem)';
const RESTING = 'calc(env(safe-area-inset-bottom, 0px) + 1rem)';

/* Atrybut znacznika – pasek go obserwuje ([data-sticky-hide]), a przycisk go pomija. */
const SENTINEL_ATTR = 'data-order-fab-sentinel';

/* Pasek CTA na ekranie: aria-hidden="false" i nie ukryty w CSS (np. display: none
   przy niskim ekranie). Pasek ma position: fixed – offsetParent zawsze null,
   więc sprawdzamy styl obliczony. */
function barShown(bar) {
  if (!bar || bar.getAttribute('aria-hidden') !== 'false') return false;
  const cs = getComputedStyle(bar);
  return cs.display !== 'none' && cs.visibility !== 'hidden';
}

function useStickyBarVisible() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023.98px)');
    let bar = document.getElementById('as-sticky');
    const update = () => {
      bar = bar && bar.isConnected ? bar : document.getElementById('as-sticky');
      setVisible(Boolean(mq.matches && barShown(bar)));
    };
    update();
    const mo = typeof MutationObserver !== 'undefined' && bar ? new MutationObserver(update) : null;
    if (mo && bar) mo.observe(bar, { attributes: true, attributeFilter: ['aria-hidden', 'class', 'style'] });
    mq.addEventListener?.('change', update);
    window.addEventListener('resize', update);
    return () => {
      mo?.disconnect();
      mq.removeEventListener?.('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return visible;
}

/* Pas zamykający strony albo stopka w kadrze (ten sam wzorzec co pasek CTA w Layout). */
function useEndOfPageInView() {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    /* tylko elementy strony – dialogi (też data-sticky-hide) są w portalu poza <main>;
       bez własnego znacznika (jest „w kadrze” zawsze, gdy przycisk jest aktywny) */
    const targets = Array.from(
      document.querySelectorAll(`main [data-sticky-hide]:not([${SENTINEL_ATTR}]), footer`)
    );
    if (!targets.length) return undefined;
    const visible = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
        setInView(visible.size > 0);
      },
      { threshold: 0 }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);
  return inView;
}

/**
 * Odległość od dołu ekranu (px), na której przycisk nie wchodzi pod baner cookies,
 * albo null, gdy baneru nie ma lub nie zasłania kolumny przycisku (od sm baner
 * stoi po lewej, przycisk po prawej). Baner jest dzieckiem korzenia Layout (obok
 * <main>) – obserwujemy tylko listę dzieci tego korzenia (bez subtree) i rozmiar
 * samego baneru.
 */
function useConsentBannerClearance(fabRef, enabled) {
  const [clearance, setClearance] = useState(null);
  useEffect(() => {
    if (!enabled) {
      setClearance(null);
      return undefined;
    }
    const root = document.getElementById('main')?.parentElement || document.body;
    let banner = null;
    let frame = 0;

    const measure = () => {
      const fab = fabRef.current;
      const b = banner && banner.isConnected ? banner.getBoundingClientRect() : null;
      let next = null;
      if (fab && b && b.height > 0) {
        const f = fab.getBoundingClientRect();
        if (b.left < f.right && b.right > f.left) next = Math.round(window.innerHeight - b.top + GAP);
      }
      setClearance((prev) => (prev === next ? prev : next));
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    const findBanner = () => {
      const next = root.querySelector(':scope > [data-consent-banner]') || document.querySelector('[data-consent-banner]');
      if (next !== banner) {
        if (banner) ro?.unobserve(banner);
        banner = next;
        if (banner) ro?.observe(banner);
      }
      schedule();
    };

    findBanner();
    const mo = typeof MutationObserver !== 'undefined' ? new MutationObserver(findBanner) : null;
    mo?.observe(root, { childList: true });
    window.addEventListener('resize', schedule);
    /* baner przesuwa się w górę, gdy pojawia się pasek CTA (reguła :has w index.css) */
    const bar = document.getElementById('as-sticky');
    const barMo = bar && typeof MutationObserver !== 'undefined' ? new MutationObserver(schedule) : null;
    barMo?.observe(bar, { attributes: true, attributeFilter: ['aria-hidden'] });
    return () => {
      cancelAnimationFrame(frame);
      mo?.disconnect();
      barMo?.disconnect();
      ro?.disconnect();
      window.removeEventListener('resize', schedule);
    };
  }, [fabRef, enabled]);
  return clearance;
}

export default function OrderFab({ count, onOpen }) {
  const fabRef = useRef(null);
  const lifted = useStickyBarVisible();
  const atEnd = useEndOfPageInView();
  const active = Boolean(count) && !atEnd;
  const bannerClearance = useConsentBannerClearance(fabRef, Boolean(count));

  const base = lifted ? LIFTED : RESTING;
  const bottom = bannerClearance ? `max(${base}, ${bannerClearance}px)` : base;

  return (
    <>
      {/* Znacznik dla paska CTA (Layout obserwuje [data-sticky-hide] od wejścia na
          trasę): „w kadrze” = przycisk zamówienia jest aktywny, więc pasek się chowa.
          display: none, gdy lista jest pusta albo przycisk schowany przy końcu strony. */}
      <span
        aria-hidden="true"
        data-sticky-hide=""
        {...{ [SENTINEL_ATTR]: '' }}
        className={cn('pointer-events-none invisible fixed inset-0 -z-10', !active && 'hidden')}
      />
      {count ? (
        <button
          ref={fabRef}
          type="button"
          onClick={onOpen}
          aria-haspopup="dialog"
          data-order-fab=""
          aria-label={`Twoje zamówienie, ${count}${NBSP}szt.`}
          tabIndex={atEnd ? -1 : undefined}
          style={{ bottom }}
          className={cn(
            'fixed right-4 z-30 inline-flex h-12 items-center gap-3 border border-gold/45 bg-espresso-900 pl-5 pr-2 short:pl-2 text-cream-50 transition-[bottom,background-color,opacity,visibility,transform] duration-300 ease-as hover:bg-espresso-600 focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_#FBF8F3,0_0_0_4px_#241B14] motion-reduce:transition-none sm:right-8 lg:right-10',
            /* visibility: hidden – poza kolejnością Tab i drzewem dostępności */
            atEnd && 'invisible pointer-events-none translate-y-3 opacity-0'
          )}
        >
          {/* na wąskim telefonie krótsza etykieta (pełna nazwa w aria-label); telefon
              w poziomie (short:) – sam kwadrat z liczbą, żeby nie zasłaniał „Dodaj” w prawej
              kolumnie. short:sm:hidden – stos, bo short: stoi w CSS przed sm:inline */}
          <span className="as-label sm:hidden short:hidden">Zamówienie</span>
          <span className="as-label hidden sm:inline short:sm:hidden">Twoje zamówienie</span>
          <span className="grid h-8 min-w-[2rem] place-items-center bg-cream-100 px-2 text-[0.8125rem] font-medium tabular-nums text-ink">
            {count}
          </span>
        </button>
      ) : null}
    </>
  );
}
