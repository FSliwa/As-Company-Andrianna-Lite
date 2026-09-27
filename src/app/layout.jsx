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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400;1,6..96,500&family=Jost:wght@300;400;500;600&display=swap"
        />
      </head>
      <body>
        <Layout>{children}</Layout>
        <Toaster />
      </body>
    </html>
  );
}
