/**
 * Zgoda na przechowywanie informacji w urządzeniu (art. 399 Prawa komunikacji
 * elektronicznej). Dziś serwis zapisuje wyłącznie rzeczy konieczne do dostarczenia
 * usługi, o którą prosi użytkownik (lista pigmentów, sama decyzja z banera, ewentualnie
 * Cloudflare Turnstile przy rezerwacji) – art. 399 ust. 3 pkt 2 PKE zwalnia je z wymogów
 * z ust. 1 (informacja i zgoda); mimo to opisuje je polityka cookies, a baner jest
 * informacyjny. Gdy dojdzie narzędzie wymagające zgody (analityka, piksel reklamowy),
 * dopisz jego kategorię do OPTIONAL_CATEGORIES – baner sam przełączy się na wybór
 * „Akceptuję wszystkie / Tylko niezbędne / Ustawienia”. Przed pierwszym takim narzędziem
 * dopisz tu też hook useConsent(category) (useSyncExternalStore na CONSENT_EVENT
 * i zdarzeniu 'storage'), który załaduje skrypt po zgodzie bez przeładowania strony
 * i posprząta po jej wycofaniu; do tego czasu na CONSENT_EVENT nic nie nasłuchuje.
 */

export const CONSENT_KEY = 'as-consent-v1';
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // 12 miesięcy – jak w polityce cookies
const CLOCK_SKEW_MS = 24 * 60 * 60 * 1000; // znacznik z przyszłości (> 1 doba) = wpis nieważny

/** Kategorie opcjonalne z realnymi narzędziami. Pusta lista = baner informacyjny. */
export const OPTIONAL_CATEGORIES = [];

export const CONSENT_EVENT = 'as:consent-change';
export const CONSENT_OPEN_EVENT = 'as:consent-open';

export function readConsent() {
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.v !== CONSENT_VERSION) return null;
    const now = Date.now();
    if (typeof data.ts !== 'number' || now - data.ts > CONSENT_MAX_AGE_MS || data.ts > now + CLOCK_SKEW_MS) return null;
    // nowa kategoria opcjonalna, o którą jeszcze nie pytaliśmy → pytamy ponownie
    if (OPTIONAL_CATEGORIES.some((c) => typeof data[c] !== 'boolean')) return null;
    return data;
  } catch {
    return null;
  }
}

export function writeConsent(choices = {}) {
  const data = { v: CONSENT_VERSION, ts: Date.now(), necessary: true };
  for (const c of OPTIONAL_CATEGORIES) data[c] = Boolean(choices[c]);
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
  } catch {
    /* tryb prywatny / zablokowana pamięć – baner pojawi się ponownie przy następnej wizycie */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: data }));
  return data;
}

export function hasConsent(category) {
  if (category === 'necessary') return true;
  if (typeof window === 'undefined') return false;
  const data = readConsent();
  return Boolean(data && data[category]);
}

/** Otwiera baner z ustawieniami (link „Ustawienia cookies” w stopce). */
export function openConsentSettings() {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
