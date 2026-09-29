'use client';

/**
 * Cloudflare Turnstile (opcjonalny) — niewidoczna weryfikacja „czy to człowiek”.
 * Renderuje się tylko, gdy serwer poda klucz witryny (TURNSTILE_SITE_KEY + TURNSTILE_SECRET_KEY
 * w env). `appearance: 'interaction-only'` — pole pokazuje się wyłącznie, gdy Cloudflare
 * potrzebuje kliknięcia. Token jest jednorazowy: po każdym wysłaniu formularza `reset()`.
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let scriptPromise = null;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile')));
      script.onerror = () => {
        scriptPromise = null;
        script.remove();
        reject(new Error('turnstile'));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export const Turnstile = forwardRef(function Turnstile({ siteKey, onToken, onError }, ref) {
  const container = useRef(null);
  const widgetId = useRef(null);
  const callbacks = useRef({ onToken, onError });
  callbacks.current = { onToken, onError };

  useImperativeHandle(
    ref,
    () => ({
      reset() {
        callbacks.current.onToken(null);
        if (widgetId.current !== null && window.turnstile) window.turnstile.reset(widgetId.current);
      },
    }),
    []
  );

  useEffect(() => {
    let cancelled = false;
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !container.current) return;
        widgetId.current = turnstile.render(container.current, {
          sitekey: siteKey,
          action: 'booking',
          language: 'pl',
          theme: 'light',
          size: 'flexible',
          appearance: 'interaction-only',
          'refresh-expired': 'auto',
          callback: (token) => callbacks.current.onToken(token),
          'expired-callback': () => callbacks.current.onToken(null),
          'error-callback': () => {
            callbacks.current.onToken(null);
            callbacks.current.onError?.();
          },
        });
      })
      .catch(() => {
        if (!cancelled) callbacks.current.onError?.();
      });
    return () => {
      cancelled = true;
      if (widgetId.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* widżet już usunięty */
        }
      }
      widgetId.current = null;
    };
  }, [siteKey]);

  return <div ref={container} className="mt-6 empty:mt-0" />;
});
