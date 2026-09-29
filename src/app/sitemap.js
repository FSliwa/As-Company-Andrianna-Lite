import { BOOKING_ENABLED, LEGAL, SITE_URL } from '@/lib/site';
import { LOCALES } from '@/i18n/config';
import { ROUTES, languageAlternates, localePath } from '@/i18n/routes';

/** sitemap.xml — publiczne trasy w trzech językach (pl, /en, /ru) z hreflang; data = data buildu. */
// Rezerwacja (/umow-wizyte, /en/book, /ru/book) tylko przy włączonej rezerwacji online —
// inaczej to strona z komunikatem. Polityka prywatności dopiero, gdy klient dostarczy treść.
const KEYS = [
  'home',
  'about',
  'treatments',
  ...(BOOKING_ENABLED ? ['book'] : []),
  'packages',
  'contact',
  'training',
  'machines',
  'pigments',
  'certificates',
];

/* adres bezwzględny; strona główna PL bez końcowego „/” (jak dotychczas) */
const absolute = (path) => `${SITE_URL}${path === '/' ? '' : path}`;

export default function sitemap() {
  const lastModified = new Date();
  const keys = LEGAL.privacyPolicy ? [...KEYS, 'privacy'] : KEYS;
  return keys.flatMap((key) => {
    const canonical = ROUTES[key];
    const languages = Object.fromEntries(
      Object.entries(languageAlternates(canonical)).map(([lang, path]) => [lang, absolute(path)])
    );
    return LOCALES.map((locale) => ({
      url: absolute(localePath(canonical, locale)),
      lastModified,
      changeFrequency: key === 'home' ? 'weekly' : 'monthly',
      priority: key === 'home' ? 1 : 0.7,
      alternates: { languages },
    }));
  });
}
