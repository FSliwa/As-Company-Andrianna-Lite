/* Fonty hostowane lokalnie (npm @fontsource) — bez żądań do Google Fonts:
   IP odwiedzających nie trafia do zewnętrznego serwera, a pierwszy ekran
   nie czeka na obcą domenę. Bodoni Moda z osią optical size, jak wcześniej. */
import '@fontsource-variable/bodoni-moda/opsz.css';
import '@fontsource-variable/bodoni-moda/opsz-italic.css';
import '@fontsource-variable/jost/index.css';
import '@fontsource-variable/jost/wght-italic.css';
import '@/index.css';
import Layout from '@/Layout';
import { Toaster } from '@/components/ui/toaster';

export const metadata = {
  metadataBase: new URL('https://as-loveliness.eu'),
  title: {
    default: 'AS COMPANY LOVELINESS | Pigmenty, maszynki PMU i Babushkina Academy',
    template: '%s | AS COMPANY LOVELINESS',
  },
  description:
    'Profesjonalne produkty PMU, edukacja i doświadczenie tworzone przez praktyków. Pigmenty AS OPIUM, maszynki AS PRINCESS i AS HERO oraz szkolenia Babushkina Academy w Warszawie.',
  keywords: [
    'makijaż permanentny Warszawa',
    'szkolenia PMU',
    'pigmenty PMU',
    'maszynka PMU',
    'AS Princess',
    'AS Hero',
    'Super Natural Brows',
    'Babushkina Academy',
  ],
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    siteName: 'AS COMPANY LOVELINESS',
    title: 'AS COMPANY LOVELINESS — Beauty with precision',
    description:
      'Profesjonalne produkty PMU, edukacja i doświadczenie tworzone przez praktyków.',
    images: ['/graphics/studio-02.jpg'],
  },
};

export const viewport = {
  themeColor: '#F6F1E8',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>
        <Layout>{children}</Layout>
        <Toaster />
      </body>
    </html>
  );
}
