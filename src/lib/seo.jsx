/**
 * Metadane tras: canonical, hreflang, og:url, własny tytuł i opis OG, obraz 1200×630.
 * Adres serwisu: SITE_URL (NEXT_PUBLIC_SITE_URL przy wdrożeniu).
 * Wersje językowe: canonical w danym języku, `alternates.languages` = wszystkie trzy
 * wersje + x-default (polska) — zob. src/i18n/routes.js.
 */

import { SITE_URL } from './site';
import { OG_IMAGE } from './roles';
import { DEFAULT_LOCALE, LOCALE_META, PUBLIC_LOCALES, isPublicLocale } from '@/i18n/config';
import { ROUTES, isKnownPath, languageAlternates, localePath } from '@/i18n/routes';
import { getSite } from '@/i18n/site';

/**
 * pageMeta({ locale = 'pl', route | path, title, description, noindex })
 *  - route  klucz trasy z ROUTES ('treatments', 'book' …) — zalecane dla EN/RU,
 *  - path   polska ścieżka kanoniczna ('/uslugi') — dotychczasowe wywołania PL.
 * canonical i og:url = adres w danym języku; hreflang dla znanych tras.
 */
export function pageMeta({ locale = DEFAULT_LOCALE, route, path = '/', title, description, noindex = false }) {
  const { BRAND } = getSite(locale);
  const canonicalPl = route ? ROUTES[route] : path;
  if (route && !canonicalPl) throw new Error(`[seo] nieznana trasa: ${route}`);
  const url = localePath(canonicalPl, locale);
  const languages = isKnownPath(canonicalPl) ? languageAlternates(canonicalPl) : null;
  const ogTitle = title ? `${title} | ${BRAND.full}` : `${BRAND.full} — ${BRAND.tagline}`;
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
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${BRAND.full} — ${BRAND.tagline}` }],
    },
    twitter: { card: 'summary_large_image', title: ogTitle, description, images: [OG_IMAGE] },
    // język jeszcze niepubliczny (treść nieprzetłumaczona) → noindex, jak projekty dokumentów
    ...(noindex || !isPublicLocale(locale) ? { robots: { index: false } } : {}),
  };
}

/* ------------------------------------------------------------------ */
/*  Dane strukturalne (JSON-LD) — wyłącznie fakty z site.js.           */
/*  BeautySalon z adresem i godzinami dopiero po danych od klienta.    */
/*  Teksty (opisy, miasto) w języku strony — getSite(locale).          */
/* ------------------------------------------------------------------ */

export function siteJsonLd(locale = DEFAULT_LOCALE) {
  const { BRAND, CONTACT, FOUNDER } = getSite(locale);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: BRAND.full,
        alternateName: [BRAND.name, BRAND.academy],
        url: SITE_URL,
        slogan: BRAND.tagline,
        logo: `${SITE_URL}/brand/as-company-logo.png`,
        description: BRAND.claim,
        sameAs: [CONTACT.instagram],
        founder: { '@id': `${SITE_URL}/#founder` },
        areaServed: CONTACT.city,
      },
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#founder`,
        name: FOUNDER.name,
        jobTitle: FOUNDER.role,
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

export function coursesJsonLd(locale = DEFAULT_LOCALE) {
  /* kwota zawsze z danych polskich (liczba), opisy w języku strony */
  const price = (p) => String(p).replace(/[^0-9]/g, '');
  const plCourses = getSite(DEFAULT_LOCALE).COURSES;
  const { COURSES } = getSite(locale);
  return {
    '@context': 'https://schema.org',
    '@graph': COURSES.map((c, i) => ({
      '@type': 'Course',
      name: c.title,
      description: c.lead,
      inLanguage: LOCALE_META[locale].intl,
      provider: { '@id': `${SITE_URL}/#organization` },
      offers: {
        '@type': 'Offer',
        price: price(plCourses[i].price),
        priceCurrency: 'PLN',
        category: c.priceNote,
        url: `${SITE_URL}${localePath(ROUTES.training, locale)}`,
      },
      hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'blended', description: c.format },
    })),
  };
}

export function JsonLd({ data }) {
  // eslint-disable-next-line react/no-danger
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
