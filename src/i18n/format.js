/**
 * Formatowanie zależne od języka (liczby mnogie, kwoty, daty).
 * Czyste funkcje – działają na serwerze i w przeglądarce.
 */

import { LOCALE_META } from './config.js';

const intl = (locale) => (LOCALE_META[locale] || LOCALE_META.pl).intl;

/**
 * Forma liczby mnogiej z Intl.PluralRules.
 * forms: { one, few, many, other } – pl i ru używają one/few/many, en one/other.
 * plural('ru', 21, { one: 'оттенок', few: 'оттенка', many: 'оттенков' }) → 'оттенок'
 */
export function plural(locale, n, forms) {
  const key = new Intl.PluralRules(intl(locale)).select(n);
  return forms[key] ?? forms.other ?? forms.many ?? forms.one;
}

/**
 * Kwota w złotych: PL „1700 zł” (jak w cennikach klienta), EN „1,700 PLN”, RU „1 700 PLN”.
 * value – liczba złotych (nie groszy).
 */
export function formatPLN(value, locale = 'pl') {
  if (locale === 'pl') return `${value} zł`;
  return `${new Intl.NumberFormat(intl(locale), { maximumFractionDigits: 2 }).format(value)} PLN`;
}

/* ------------------------------------------------------------------ */
/*  Ceny z polskich danych → zapis w danym języku                      */
/* ------------------------------------------------------------------ */

/* Słowa wokół kwoty. Klucz = zapis polski (po normalizacji spacji). */
const PRICE_WORDS = {
  en: { od: 'from', do: 'up to', netto: 'net', brutto: 'gross', month: 'month', ml: 'ml' },
  ru: { od: 'от', do: 'до', netto: 'нетто', brutto: 'брутто', month: 'мес.', ml: 'мл' },
};

const SP = '[ \\u00a0\\u202f]'; // spacja, twarda spacja, wąska twarda spacja (źródło RegExp)
/* „1700”, „7 000”, „15 000”, „36,90” – tysiące rozdzielone spacją, grosze po przecinku */
const AMOUNT = String.raw`(\d{1,3}(?:${SP}\d{3})+|\d+)(?:,(\d{1,2}))?`;
/* Jedna pozycja: [6 ml] [od|do|>|<] KWOTA zł [netto|brutto] [/ mc] */
const SEGMENT_RE = new RegExp(
  String.raw`^(?:(\d+(?:,\d+)?)(${SP}+)ml(${SP}+))?` + // pojemność (pigmenty)
    String.raw`(?:(od|do|>|<)(${SP}+))?` + // przedrostek
    String.raw`${AMOUNT}(${SP}*)zł` +
    String.raw`(?:(${SP}+)(netto|brutto))?` +
    String.raw`(?:(${SP}*)\/(${SP}*)(?:mc|mies\.?|miesięcznie))?$`
);
const LIST_SEP_RE = new RegExp(String.raw`${SP}+·${SP}+`);

let warned;
function warnUnknown(value) {
  if (process.env.NODE_ENV === 'production') return;
  warned = warned || new Set();
  if (warned.has(value)) return;
  warned.add(value);
  // eslint-disable-next-line no-console
  console.warn(`[i18n] localizePriceString: nieznany zapis ceny „${value}” – zostaje po polsku`);
}

function localizeAmount(intPart, fraction, locale) {
  const n = Number(intPart.replace(/\D/g, '')) + (fraction ? Number(`0.${fraction}`) : 0);
  const digits = fraction ? fraction.length : 0;
  return new Intl.NumberFormat(intl(locale), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
}

/**
 * Polski zapis ceny z danych (site.js, widoki) → zapis w danym języku.
 * Liczba jest zawsze brana z tekstu polskiego – nigdy przepisywana ręcznie.
 *   '1700 zł'            → en '1,700 PLN'          ru '1 700 PLN'
 *   'od 850 zł'          → en 'from 850 PLN'       ru 'от 850 PLN'
 *   '7 000 zł netto'     → en '7,000 PLN net'      ru '7 000 PLN нетто'
 *   '369 zł / mc'        → en '369 PLN / month'    ru '369 PLN / мес.'
 *   '> 500 zł'           → '> 500 PLN'
 *   '36,90 zł'           → en '36.90 PLN'          ru '36,90 PLN'
 *   '6 ml 149 zł · 15 ml 219 zł' → en '6 ml 149 PLN · 15 ml 219 PLN'  ru '6 мл 149 PLN · 15 мл 219 PLN'
 * Twarde spacje z oryginału zostają twarde. Polski (i wartość niebędąca tekstem)
 * → bez zmian. Nieznany zapis → oryginał + ostrzeżenie w konsoli (poza produkcją).
 */
export function localizePriceString(value, locale) {
  if (typeof value !== 'string' || !locale || locale === 'pl' || !PRICE_WORDS[locale]) return value;
  const words = PRICE_WORDS[locale];
  const trimmed = value.trim();
  if (!trimmed || /^\d+$/.test(trimmed)) return value; // sama liczba (np. „10”) – bez waluty, bez zmian
  const segments = trimmed.split(LIST_SEP_RE);
  const out = [];
  for (const segment of segments) {
    const m = segment.match(SEGMENT_RE);
    if (!m) {
      warnUnknown(value);
      return value;
    }
    const [, vol, volSp1, volSp2, prefix, prefixSp, intPart, fraction, curSp, vatSp, vat, perSp1, perSp2] = m;
    let s = '';
    if (vol) s += `${localizeAmount(vol.split(',')[0], vol.split(',')[1], locale)}${volSp1}${words.ml}${volSp2}`;
    if (prefix) s += `${prefix === 'od' || prefix === 'do' ? words[prefix] : prefix}${prefixSp}`;
    s += `${localizeAmount(intPart, fraction, locale)}${curSp || ' '}PLN`;
    if (vat) s += `${vatSp}${words[vat]}`;
    if (perSp1 !== undefined || perSp2 !== undefined) s += `${perSp1 ?? ''}/${perSp2 ?? ''}${words.month}`;
    out.push(s);
  }
  return out.join(' · ');
}

/** Intl.DateTimeFormat w języku strony. */
export function dateFormat(locale, options) {
  return new Intl.DateTimeFormat(intl(locale), options);
}

export { intl as intlLocale };
