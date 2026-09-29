/**
 * Adresy w wersjach językowych.
 *
 * W kodzie, w site.js i w treściach wszystkie linki wewnętrzne zapisujemy
 * POLSKĄ ścieżką kanoniczną ('/uslugi#cennik', '/kontakt?temat=produkty').
 * LocaleLink (src/components/as/LocaleLink.jsx) tłumaczy ją na adres bieżącego
 * języka: '/en/treatments#cennik'. Kotwice (#id) i parametry (?temat=) są
 * wspólne dla wszystkich języków — identyfikatorów sekcji nie tłumaczymy.
 */

import { DEFAULT_LOCALE, LOCALES } from './config.js';

/** ścieżka polska → slug EN/RU (angielski w obu wersjach) */
export const SLUGS = {
  '/': '',
  '/o-nas': '/about',
  '/uslugi': '/treatments',
  '/szkolenia': '/training',
  '/maszynki': '/machines',
  '/pigmenty': '/pigments',
  '/pakiety': '/packages',
  '/certyfikaty': '/certificates',
  '/kontakt': '/contact',
  '/umow-wizyte': '/book',
  '/polityka-prywatnosci': '/privacy-policy',
};

/**
 * Klucze tras (tabela z I18N_SPEC §1) → polska ścieżka kanoniczna. Używane tam,
 * gdzie wygodniej nazwać stronę niż wpisać ścieżkę: pageMeta({ route: 'treatments' }),
 * sitemap, trasy /en i /ru.
 */
export const ROUTES = {
  home: '/',
  about: '/o-nas',
  treatments: '/uslugi',
  packages: '/pakiety',
  contact: '/kontakt',
  training: '/szkolenia',
  machines: '/maszynki',
  pigments: '/pigmenty',
  certificates: '/certyfikaty',
  book: '/umow-wizyte',
  privacy: '/polityka-prywatnosci',
};

/** Kody hreflang: polski z regionem (serwis dla Polski), EN/RU bez regionu. */
export const HREFLANG = { pl: 'pl-PL', en: 'en', ru: 'ru' };

const CANONICAL_BY_SLUG = Object.fromEntries(Object.entries(SLUGS).map(([pl, slug]) => [slug, pl]));
const PREFIXED = LOCALES.filter((l) => l !== DEFAULT_LOCALE);
const PREFIX_RE = new RegExp(`^/(${PREFIXED.join('|')})(?=/|$)`);

/** '/uslugi' + 'en' → '/en/treatments'; '/' + 'ru' → '/ru'. */
export function localePath(canonical, locale) {
  const path = canonical || '/';
  if (!locale || locale === DEFAULT_LOCALE) return path;
  const slug = Object.prototype.hasOwnProperty.call(SLUGS, path) ? SLUGS[path] : path === '/' ? '' : path;
  return `/${locale}${slug}`;
}

/** Link wewnętrzny (ścieżka polska z opcjonalnym #/?) → adres w danym języku. */
export function localizeHref(href, locale) {
  if (typeof href !== 'string' || !locale || locale === DEFAULT_LOCALE) return href;
  if (!href.startsWith('/') || href.startsWith('//')) return href; // #kotwica, http:, mailto:, tel:
  const [, path = '/', rest = ''] = href.match(/^([^?#]*)(.*)$/) || [];
  if (PREFIX_RE.test(path)) return href; // już zlokalizowany
  if (/^\/(api|graphics|fonts|brand|_next)(\/|$)/.test(path) || /\.[a-z0-9]{2,5}$/i.test(path)) return href; // pliki
  return localePath(path || '/', locale) + rest;
}

/** '/en/treatments' → { locale: 'en', canonical: '/uslugi' }; nieznany slug → canonical: null. */
export function parsePath(pathname) {
  const path = pathname || '/';
  const match = path.match(PREFIX_RE);
  if (!match) return { locale: DEFAULT_LOCALE, canonical: path };
  const slug = path.slice(match[0].length).replace(/\/$/, '');
  const canonical = Object.prototype.hasOwnProperty.call(CANONICAL_BY_SLUG, slug) ? CANONICAL_BY_SLUG[slug] : null;
  return { locale: match[1], canonical };
}

/** Wszystkie wersje językowe jednej strony: { pl: '/uslugi', en: '/en/treatments', ru: '/ru/treatments' }. */
export function localeAlternates(canonical) {
  return Object.fromEntries(LOCALES.map((l) => [l, localePath(canonical, l)]));
}

/** Adres trasy po kluczu: routePath('treatments', 'en') → '/en/treatments'. */
export function routePath(key, locale = DEFAULT_LOCALE) {
  if (!Object.prototype.hasOwnProperty.call(ROUTES, key)) throw new Error(`[i18n] nieznana trasa: ${key}`);
  return localePath(ROUTES[key], locale);
}

/** Czy polska ścieżka to znana trasa (ma odpowiedniki EN/RU). */
export const isKnownPath = (canonical) =>
  typeof canonical === 'string' && Object.prototype.hasOwnProperty.call(SLUGS, canonical);

/**
 * hreflang dla metadanych i sitemap: { 'pl-PL': '/uslugi', en: '/en/treatments',
 * ru: '/ru/treatments', 'x-default': '/uslugi' } (x-default = wersja polska).
 */
export function languageAlternates(canonical) {
  const out = Object.fromEntries(LOCALES.map((l) => [HREFLANG[l], localePath(canonical, l)]));
  out['x-default'] = localePath(canonical, DEFAULT_LOCALE);
  return out;
}

/**
 * Przełącznik języka: ta sama strona w innym języku. Kotwicę i parametry
 * (identyfikatory wspólne dla języków) dokleja wywołujący — znane są dopiero
 * w przeglądarce. Nieznany adres (404) → strona główna w wybranym języku.
 */
export function switchLocalePath(pathname, toLocale) {
  const { canonical } = parsePath(pathname);
  return localePath(isKnownPath(canonical) ? canonical : '/', toLocale);
}
