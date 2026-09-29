/**
 * Języki serwisu. Polski jest domyślny i bez prefiksu w adresie (/uslugi),
 * angielski i rosyjski to osobne podstrony z prefiksem (/en/treatments, /ru/treatments).
 * Źródłem prawdy dla treści jest wersja polska — tłumaczenia nakładają się na nią
 * (src/i18n/merge.js), więc brak tłumaczenia pokazuje tekst polski zamiast pustki.
 */

export const LOCALES = ['pl', 'en', 'ru'];
export const DEFAULT_LOCALE = 'pl';

export const LOCALE_META = {
  pl: { label: 'PL', name: 'Polski', intl: 'pl-PL', og: 'pl_PL' },
  en: { label: 'EN', name: 'English', intl: 'en-GB', og: 'en_GB' },
  ru: { label: 'RU', name: 'Русский', intl: 'ru-RU', og: 'ru_RU' },
};

export const isLocale = (value) => LOCALES.includes(value);

/**
 * Języki widoczne publicznie: przełącznik, hreflang, og:locale:alternate, sitemap
 * i indeksowanie. Pozostałe działają pod adresem (/en, /ru — podgląd), ale mają
 * noindex i nikt do nich nie linkuje — do czasu przetłumaczenia treści widoków.
 * Ustawiane przy buildzie: NEXT_PUBLIC_LOCALES="pl,en,ru" (domyślnie tylko pl).
 */
export const PUBLIC_LOCALES = (() => {
  const list = (process.env.NEXT_PUBLIC_LOCALES || DEFAULT_LOCALE)
    .split(',')
    .map((l) => l.trim())
    .filter(isLocale);
  return LOCALES.filter((l) => l === DEFAULT_LOCALE || list.includes(l));
})();

export const isPublicLocale = (value) => PUBLIC_LOCALES.includes(value);
