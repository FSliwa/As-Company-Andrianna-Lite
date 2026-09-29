/* Wspólny szkielet trzech root layoutów (src/app/(pl)/layout.jsx, en/layout.jsx,
   ru/layout.jsx): <html lang>, preload fontów, JSON-LD, Layout, Toaster.
   Osobne root layouty = osobne <html lang> na serwerze (bez skryptu podmieniającego
   lang); przejście między językami to pełne przeładowanie strony.

   Fonty hostowane lokalnie (public/fonts) — bez żądań do Google Fonts: IP
   odwiedzających nie trafia do zewnętrznego serwera. Krytyczne pliki mają
   preload w <head>, reszta (latin-ext, italic) ładuje się na żądanie; wersja
   rosyjska dodatkowo preloaduje cyrylicę (Playfair Display w rodzinie Bodoni —
   src/styles-fonts.css). */
import '@/styles-fonts.css';
import '@/index.css';
import Layout from '@/Layout';
import { SITE_URL } from '@/lib/site';
import { JsonLd, pageMeta, siteJsonLd } from '@/lib/seo';
import { Toaster } from '@/components/ui/toaster';

/* Tytuł domyślny (strona główna) i opis strony głównej w każdym języku.
   Szablon tytułu podstron — nazwa marki, ta sama we wszystkich językach. */
const ROOT_META = {
  pl: {
    title: 'Makijaż permanentny Warszawa i szkolenia PMU | AS COMPANY',
    description:
      'Makijaż permanentny brwi, ust i kresek w Warszawie oraz szkolenia Super Natural Brows w Babushkina Academy. Pigmenty i maszynki AS PMU.',
  },
  en: {
    title: 'Permanent makeup in Warsaw and PMU training | AS COMPANY',
    description:
      'Permanent makeup for brows, lips and eyeliner in Warsaw, and Super Natural Brows training at Babushkina Academy. AS PMU pigments and machines.',
  },
  ru: {
    title: 'Перманентный макияж в Варшаве и обучение ПМ | AS COMPANY',
    description:
      'Перманентный макияж бровей, губ и стрелок в Варшаве и обучение Super Natural Brows в Babushkina Academy. Пигменты и машинки AS PMU.',
  },
};

/** Opis strony głównej w danym języku (używają go też trasy /, /en, /ru). */
export const homeDescription = (locale) => ROOT_META[locale].description;

export function rootMetadata(locale) {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: ROOT_META[locale].title,
      template: '%s | AS COMPANY LOVELINESS',
    },
    ...pageMeta({ locale, route: 'home', description: ROOT_META[locale].description }),
  };
}

export const rootViewport = {
  themeColor: '#F6F1E8',
  width: 'device-width',
  initialScale: 1,
};

const FONT_PRELOADS = {
  pl: ['/fonts/bodoni-moda-latin-opsz-normal.woff2', '/fonts/jost-latin-wght-normal.woff2'],
  en: ['/fonts/bodoni-moda-latin-opsz-normal.woff2', '/fonts/jost-latin-wght-normal.woff2'],
  ru: [
    '/fonts/bodoni-moda-latin-opsz-normal.woff2',
    '/fonts/jost-latin-wght-normal.woff2',
    '/fonts/playfair-display-cyrillic-wght-normal.woff2',
    '/fonts/jost-cyrillic-wght-normal.woff2',
  ],
};

export default function RootShell({ locale, children }) {
  return (
    <html lang={locale}>
      <head>
        {FONT_PRELOADS[locale].map((href) => (
          <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
        <JsonLd data={siteJsonLd(locale)} />
      </head>
      <body>
        {/* rok liczony przy renderze na serwerze — bez niezgodności hydratacji 1 stycznia */}
        <Layout year={new Date().getFullYear()}>{children}</Layout>
        <Toaster />
      </body>
    </html>
  );
}
