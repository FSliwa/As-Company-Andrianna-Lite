/**
 * Metadane tras: canonical, hreflang, og:url, własny tytuł i opis OG, obraz 1200×630.
 * Adres serwisu: SITE_URL (NEXT_PUBLIC_SITE_URL przy wdrożeniu).
 * Wersje językowe: canonical w danym języku, `alternates.languages` = wszystkie trzy
 * wersje + x-default (polska) – zob. src/i18n/routes.js.
 */

import { SITE_URL } from './site';
import { OG_IMAGE } from './roles';
import { DEFAULT_LOCALE, LOCALE_META, PUBLIC_LOCALES, isPublicLocale } from '@/i18n/config';
import { ROUTES, isKnownPath, languageAlternates, localePath } from '@/i18n/routes';
import { getSite } from '@/i18n/site';

/**
 * pageMeta({ locale = 'pl', route | path, title, description, noindex })
 *  - route  klucz trasy z ROUTES ('treatments', 'book' …) – zalecane dla EN/RU,
 *  - path   polska ścieżka kanoniczna ('/uslugi') – dotychczasowe wywołania PL.
 * canonical i og:url = adres w danym języku; hreflang dla znanych tras.
 */
export function pageMeta({ locale = DEFAULT_LOCALE, route, path = '/', title, description, noindex = false }) {
  const { BRAND } = getSite(locale);
  const canonicalPl = route ? ROUTES[route] : path;
  if (route && !canonicalPl) throw new Error(`[seo] nieznana trasa: ${route}`);
  const url = localePath(canonicalPl, locale);
  const languages = isKnownPath(canonicalPl) ? languageAlternates(canonicalPl) : null;
  const ogTitle = title ? `${title} | ${BRAND.full}` : `${BRAND.full} – ${BRAND.tagline}`;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: {
      canonical: url,
      ...(languages ? { languages } : {}),
    },
    openGraph: {
      type: 'website',
      locale: LOCALE_META[locale].og,
      alternateLocale: PUBLIC_LOCALES.filter((l) => l !== locale).map((l) => LOCALE_META[l].og),
      siteName: BRAND.full,
      url,
      title: ogTitle,
      description,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${BRAND.full} – ${BRAND.tagline}` }],
    },
    twitter: { card: 'summary_large_image', title: ogTitle, description, images: [OG_IMAGE] },
    // język jeszcze niepubliczny (treść nieprzetłumaczona) → noindex, jak projekty dokumentów
    ...(noindex || !isPublicLocale(locale) ? { robots: { index: false } } : {}),
  };
}

/* ------------------------------------------------------------------ */
/*  Dane strukturalne (JSON-LD) – wyłącznie fakty z site.js.           */
/*  BeautySalon z adresem i godzinami dopiero po danych od klienta.    */
/*  Teksty (opisy, miasto) w języku strony – getSite(locale).          */
/* ------------------------------------------------------------------ */

export function siteJsonLd(locale = DEFAULT_LOCALE) {
  const { BRAND, CONTACT, FOUNDER } = getSite(locale);
  // inne nazwy marki – tylko różne od głównej (dziś name = full = academy, więc brak pola)
  const alternateName = [...new Set([BRAND.name, BRAND.academy])].filter((n) => n && n !== BRAND.full);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        // akademia prowadzi kursy (Course.provider wskazuje na ten węzeł) – stąd EducationalOrganization;
        // BeautySalon/LocalBusiness dopiero z adresem od klienta
        '@type': ['Organization', 'EducationalOrganization'],
        '@id': `${SITE_URL}/#organization`,
        name: BRAND.full,
        ...(alternateName.length ? { alternateName } : {}),
        url: SITE_URL,
        slogan: BRAND.tagline,
        logo: `${SITE_URL}/brand/babushkina-academy-logo.png`,
        description: BRAND.claim,
        sameAs: [CONTACT.instagram],
        founder: { '@id': `${SITE_URL}/#founder` },
        areaServed: CONTACT.city,
      },
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#founder`,
        name: FOUNDER.name,
        // D7: rola po polsku wg briefu (serwis pl-PL)
        jobTitle: FOUNDER.rolePl,
        description: FOUNDER.signature,
        sameAs: [CONTACT.instagram],
        worksFor: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: BRAND.full,
        inLanguage: LOCALE_META[locale].intl,
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
    ],
  };
}

/**
 * Kursy (D4): wszystkie pozycje COURSES – także nowe z briefu. Wyłącznie pola ze źródeł:
 *  - offers tylko przy kursie z ceną („Szyty na miarę” nie ma ceny → bez offers),
 *  - VAT: valueAddedTaxIncluded: false tylko tam, gdzie plakat podaje „netto”
 *    (dawne `category: 'netto'` nie było dla wyszukiwarek informacją o podatku),
 *  - courseMode z pola `mode` ('blended' | 'online'); brak trybu w źródle → bez courseMode.
 */
export function coursesJsonLd(locale = DEFAULT_LOCALE) {
  const price = (p) => String(p).replace(/[^0-9]/g, '');
  const plCourses = getSite(DEFAULT_LOCALE).COURSES;
  const { COURSES } = getSite(locale);
  return {
    '@context': 'https://schema.org',
    '@graph': COURSES.map((c, i) => ({
      '@type': 'Course',
      name: c.fullTitle || c.title,
      description: c.lead,
      inLanguage: LOCALE_META[locale].intl,
      provider: { '@id': `${SITE_URL}/#organization` },
      ...(c.level ? { educationalLevel: c.level } : {}),
      ...(c.requirements ? { coursePrerequisites: c.requirements } : {}),
      ...(plCourses[i].price
        ? {
            offers: {
              '@type': 'Offer',
              // cena, „netto” i id zawsze z danych PL (w EN/RU priceNote jest przetłumaczone)
              price: price(plCourses[i].price),
              priceCurrency: 'PLN',
              ...(plCourses[i].priceNote === 'netto'
                ? {
                    priceSpecification: {
                      '@type': 'PriceSpecification',
                      price: price(plCourses[i].price),
                      priceCurrency: 'PLN',
                      valueAddedTaxIncluded: false,
                    },
                  }
                : {}),
              url: `${SITE_URL}${localePath('/szkolenia', locale)}#program-${plCourses[i].id}`,
            },
          }
        : {}),
      hasCourseInstance: {
        '@type': 'CourseInstance',
        ...(plCourses[i].mode ? { courseMode: plCourses[i].mode } : {}),
        description: c.format,
      },
    })),
  };
}

/**
 * Okruszki (BreadcrumbList) podstron: strona główna → podstrona. `name` = krótka nazwa
 * z menu/stopki, nie tytuł SEO.
 */
export function breadcrumbJsonLd({ locale = DEFAULT_LOCALE, path, name }) {
  const { BRAND } = getSite(locale);
  const home = localePath('/', locale);
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: BRAND.full, item: `${SITE_URL}${home === '/' ? '' : home}` },
      { '@type': 'ListItem', position: 2, name, item: `${SITE_URL}${localePath(path, locale)}` },
    ],
  };
}

/**
 * Zabiegi z cennika (/uslugi): Service + Offer dla każdej pozycji PRICING_PMU, PRICING_REFRESH
 * i PRICING_REMOVAL ze stałą ceną – wyłącznie nazwy i ceny z site.js (te same, które stoją na
 * stronie). Usuwanie: bez pozycji „dla naszych klientek” (warunek) i bez ceny „powyżej …”
 * (wycena indywidualna). Katalog jest częścią węzła Organization (hasOfferCatalog). Bez adresu
 * i godzin (BeautySalon dopiero po danych od klienta – patrz wyżej).
 */
export function treatmentsJsonLd(locale = DEFAULT_LOCALE) {
  const { CONTACT, PRICING_PMU, PRICING_REFRESH, PRICING_REMOVAL, NAV_ALL } = getSite(locale);
  const pl = getSite(DEFAULT_LOCALE);
  const price = (p) => String(p).replace(/[^0-9]/g, '');
  const url = `${SITE_URL}${localePath('/uslugi', locale)}`;
  // rodzaj usługi = fraza ze strony (nie tytuł cennika ani warunek)
  const serviceType = locale === DEFAULT_LOCALE ? 'Makijaż permanentny' : BRAND_SERVICE[locale];
  const offer = (item, plItem, condition) => ({
    '@type': 'Offer',
    // cena zawsze z danych PL (w EN/RU cena jest sformatowana w języku strony)
    price: price(plItem.price),
    priceCurrency: 'PLN',
    url: `${url}#cennik`,
    ...(condition ? { description: condition } : {}),
    itemOffered: {
      '@type': 'Service',
      name: item.name,
      ...(item.technique || item.note ? { description: item.technique || item.note } : {}),
      serviceType,
      provider: { '@id': `${SITE_URL}/#organization` },
      areaServed: CONTACT.city,
    },
  });
  const fixedRemoval = PRICING_REMOVAL.items
    .map((item, i) => [item, pl.PRICING_REMOVAL.items[i]])
    .filter(([, p]) => !p.forOwnClients && /^\d[\d\s\u00a0]*zł$/.test(String(p.price).trim()));
  // nazwa katalogu = etykieta z mapy serwisu („Zabiegi i cennik”), bo obejmuje też Refresh i usuwanie
  const catalogName = NAV_ALL.flatMap((g) => g.links).find((l) => l.href === '/uslugi')?.label || PRICING_PMU.title;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@id': `${SITE_URL}/#organization`, hasOfferCatalog: { '@id': `${url}#cennik` } },
      {
        '@type': 'OfferCatalog',
        '@id': `${url}#cennik`,
        name: catalogName,
        url,
        itemListElement: [
          ...PRICING_PMU.items.map((item, i) => offer(item, pl.PRICING_PMU.items[i])),
          ...PRICING_REFRESH.items.map((item, i) => offer(item, pl.PRICING_REFRESH.items[i], PRICING_REFRESH.condition)),
          ...fixedRemoval.map(([item, p]) => offer(item, p)),
        ],
      },
    ],
  };
}

/* Rodzaj usługi w EN/RU (fraza z tłumaczeń strony). */
const BRAND_SERVICE = { en: 'Permanent makeup', ru: 'Перманентный макияж' };

export function JsonLd({ data }) {
  // eslint-disable-next-line react/no-danger
  // „<” jako \u003c – tekst w danych nie zamknie skryptu (np. „</script>” w przyszłych treściach)
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
