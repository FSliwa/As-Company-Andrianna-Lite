'use client';

/**
 * Pływający przycisk „Twoje zamówienie” z liczbą sztuk.
 *
 * Na telefonie i tablecie Layout pokazuje po hero własny pasek CTA (56 px,
 * #as-sticky, aria-hidden="false" gdy widoczny). Przycisk obserwuje ten
 * atrybut i wtedy stoi NAD paskiem — nic nie zasłania. Od lg paska nie ma.
 */

import React, { useEffect, useState } from 'react';
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

export default function OrderFab({ count, onOpen }) {
  const lifted = useStickyBarVisible();
  if (!count) return null;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-label={`Twoje zamówienie, ${count}${NBSP}szt.`}
      style={{ bottom: lifted ? LIFTED : RESTING }}
      className="fixed right-4 z-40 inline-flex h-12 items-center gap-3 border border-gold/45 bg-espresso-900 pl-5 pr-2 text-cream-50 transition-[bottom,background-color] duration-300 ease-as hover:bg-espresso-600 focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_#FBF8F3,0_0_0_4px_#241B14] motion-reduce:transition-none sm:right-8 lg:right-10"
    >
      <span className="as-label">Twoje zamówienie</span>
      <span className="grid h-8 min-w-[2rem] place-items-center bg-cream-100 px-2 text-[0.8125rem] font-medium tabular-nums text-ink">
        {count}
      </span>
    </button>
  );
}
