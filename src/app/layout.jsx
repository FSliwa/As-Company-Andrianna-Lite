/* Fonty hostowane lokalnie (public/fonts) — bez żądań do Google Fonts: IP
   odwiedzających nie trafia do zewnętrznego serwera. Krytyczne pliki mają
   preload w <head>, reszta (latin-ext, italic) ładuje się na żądanie. */
import '@/styles-fonts.css';
import '@/index.css';
import Layout from '@/Layout';
import { SITE_URL } from '@/lib/site';
import { JsonLd, pageMeta, siteJsonLd } from '@/lib/seo';
import { Toaster } from '@/components/ui/toaster';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Makijaż permanentny Warszawa i szkolenia PMU | AS COMPANY',
    template: '%s | AS COMPANY LOVELINESS',
  },
  ...pageMeta({
    description:
      'Makijaż permanentny brwi, ust i kresek w Warszawie oraz szkolenia Super Natural Brows w Babushkina Academy. Pigmenty i maszynki AS PMU.',
    path: '/',
  }),
};

export const viewport = {
  themeColor: '#F6F1E8',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <head>
        <link rel="preload" href="/fonts/bodoni-moda-latin-opsz-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/jost-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <JsonLd data={siteJsonLd()} />
      </head>
      <body>
        {/* rok liczony przy renderze na serwerze — bez niezgodności hydratacji 1 stycznia */}
        <Layout year={new Date().getFullYear()}>{children}</Layout>
        <Toaster />
      </body>
    </html>
  );
}
