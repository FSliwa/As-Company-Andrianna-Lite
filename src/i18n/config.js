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
