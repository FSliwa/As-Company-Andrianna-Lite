'use client';

/**
 * Pływający przycisk „Twoje zamówienie” z liczbą sztuk.
 *
 * Na telefonie i tablecie Layout pokazuje po hero własny pasek CTA (56 px,
 * #as-sticky, aria-hidden="false" gdy widoczny). Przycisk obserwuje ten
 * atrybut i wtedy stoi NAD paskiem – nic nie zasłania. Od lg paska nie ma.
 *
 * z-30: nad treścią, ale POD pełnoekranowym menu (#as-menu, z-40) i pod
 * dialogami (z-50). Chowa się, gdy w kadrze jest pas zamykający
 * ([data-sticky-hide] – ma własny przycisk „Twoje zamówienie (n)”) albo
 * stopka – nie zasłania jej i nie dubluje przycisku.
 */

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { NBSP } from './parts';

const LIFTED = 'calc(3.5rem + env(safe-area-inset-bottom, 0px) + 0.75rem)';
const RESTING = 'calc(env(safe-area-inset-bottom, 0px) + 1rem)';

function useStickyBarVisible() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023.98px)');
    let bar = document.getElementById('as-sticky');
    const update = () => {
      bar = bar && bar.isConnected ? bar : document.getElementById('as-sticky');
      setVisible(Boolean(bar && mq.matches && bar.getAttribute('aria-hidden') === 'false'));
    };
    update();
    const mo = typeof MutationObserver !== 'undefined' && bar ? new MutationObserver(update) : null;
    if (mo && bar) mo.observe(bar, { attributes: true, attributeFilter: ['aria-hidden'] });
    mq.addEventListener?.('change', update);
    return () => {
      mo?.disconnect();
      mq.removeEventListener?.('change', update);
    };
  }, []);
  return visible;
}

/* Pas zamykający strony albo stopka w kadrze (ten sam wzorzec co pasek CTA w Layout). */
function useEndOfPageInView() {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    /* tylko elementy strony – dialogi (też data-sticky-hide) są w portalu poza <main> */
    const targets = Array.from(document.querySelectorAll('main [data-sticky-hide], footer'));
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

export default function OrderFab({ count, onOpen }) {
  const lifted = useStickyBarVisible();
  const atEnd = useEndOfPageInView();
  if (!count) return null;
  const hidden = atEnd;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-label={`Twoje zamówienie, ${count}${NBSP}szt.`}
      tabIndex={hidden ? -1 : undefined}
      style={{ bottom: lifted ? LIFTED : RESTING }}
      className={cn(
        'fixed right-4 z-30 inline-flex h-12 items-center gap-3 border border-gold/45 bg-espresso-900 pl-5 pr-2 text-cream-50 transition-[bottom,background-color,opacity,visibility,transform] duration-300 ease-as hover:bg-espresso-600 focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_#FBF8F3,0_0_0_4px_#241B14] motion-reduce:transition-none sm:right-8 lg:right-10',
        /* visibility: hidden – poza kolejnością Tab i drzewem dostępności */
        hidden && 'invisible pointer-events-none translate-y-3 opacity-0'
      )}
    >
      {/* na wąskim telefonie krótsza etykieta (pełna nazwa w aria-label) */}
      <span className="as-label sm:hidden">Zamówienie</span>
      <span className="as-label hidden sm:inline">Twoje zamówienie</span>
      <span className="grid h-8 min-w-[2rem] place-items-center bg-cream-100 px-2 text-[0.8125rem] font-medium tabular-nums text-ink">
        {count}
      </span>
    </button>
  );
}
