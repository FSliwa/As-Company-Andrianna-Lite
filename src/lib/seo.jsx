/**
 * Metadane tras: canonical, og:url, własny tytuł i opis OG, obraz 1200×630.
 * Adres serwisu: SITE_URL (NEXT_PUBLIC_SITE_URL przy wdrożeniu).
 */

import { BRAND, CONTACT, COURSES, FOUNDER, SITE_URL } from './site';
import { OG_IMAGE } from './roles';

export function pageMeta({ title, description, path = '/', noindex = false }) {
  const ogTitle = title ? `${title} | ${BRAND.full}` : `${BRAND.full} — ${BRAND.tagline}`;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: BRAND.full,
      url: path,
      title: ogTitle,
      description,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${BRAND.full} — ${BRAND.tagline}` }],
    },
    twitter: { card: 'summary_large_image', title: ogTitle, description, images: [OG_IMAGE] },
    ...(noindex ? { robots: { index: false } } : {}),
  };
}

/* ------------------------------------------------------------------ */
/*  Dane strukturalne (JSON-LD) — wyłącznie fakty z site.js.           */
/*  BeautySalon z adresem i godzinami dopiero po danych od klienta.    */
/* ------------------------------------------------------------------ */

export function siteJsonLd() {
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
        inLanguage: 'pl-PL',
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
    ],
  };
}

/**
 * Kursy (D4): wszystkie pozycje COURSES — także nowe z briefu. Wyłącznie pola ze źródeł:
 *  - offers tylko przy kursie z ceną („Szyty na miarę” nie ma ceny → bez offers),
 *  - VAT: valueAddedTaxIncluded: false tylko tam, gdzie plakat podaje „netto”
 *    (dawne `category: 'netto'` nie było dla wyszukiwarek informacją o podatku),
 *  - courseMode z pola `mode` ('blended' | 'online'); brak trybu w źródle → bez courseMode.
 */
export function coursesJsonLd() {
  const price = (p) => String(p).replace(/[^0-9]/g, '');
  return {
    '@context': 'https://schema.org',
    '@graph': COURSES.map((c) => ({
      '@type': 'Course',
      name: c.fullTitle || c.title,
      description: c.lead,
      inLanguage: 'pl-PL',
      provider: { '@id': `${SITE_URL}/#organization` },
      ...(c.level ? { educationalLevel: c.level } : {}),
      ...(c.requirements ? { coursePrerequisites: c.requirements } : {}),
      ...(c.price
        ? {
            offers: {
              '@type': 'Offer',
              price: price(c.price),
              priceCurrency: 'PLN',
              ...(c.priceNote === 'netto'
                ? {
                    priceSpecification: {
                      '@type': 'PriceSpecification',
                      price: price(c.price),
                      priceCurrency: 'PLN',
                      valueAddedTaxIncluded: false,
                    },
                  }
                : {}),
              url: `${SITE_URL}/szkolenia#program-${c.id}`,
            },
          }
        : {}),
      hasCourseInstance: {
        '@type': 'CourseInstance',
        ...(c.mode ? { courseMode: c.mode } : {}),
        description: c.format,
      },
    })),
  };
}

export function JsonLd({ data }) {
  // eslint-disable-next-line react/no-danger
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
