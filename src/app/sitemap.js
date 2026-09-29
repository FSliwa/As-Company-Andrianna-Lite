import { BOOKING_ENABLED, SITE_URL } from '@/lib/site';
import { LEGAL_PUBLISHED } from '@/lib/legal';
import { PUBLIC_LOCALES } from '@/i18n/config';
import { ROUTES, languageAlternates, localePath } from '@/i18n/routes';

/** sitemap.xml – publiczne trasy w trzech językach (pl, /en, /ru) z hreflang; data = data buildu. */
// Rezerwacja (/umow-wizyte, /en/book, /ru/book) tylko przy włączonej rezerwacji online –
// inaczej to strona z komunikatem. Dokumenty prawne dopiero, gdy obowiązują (LEGAL_PUBLISHED: dane + zatwierdzenie).
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
  const keys = LEGAL_PUBLISHED ? [...KEYS, 'privacy', 'cookies', 'terms'] : KEYS;
  return keys.flatMap((key) => {
    const canonical = ROUTES[key];
    const alt = languageAlternates(canonical);
    const languages = alt ? Object.fromEntries(Object.entries(alt).map(([lang, path]) => [lang, absolute(path)])) : null;
    // tylko języki publiczne (PUBLIC_LOCALES) – /en i /ru dołączą po przetłumaczeniu treści
    return PUBLIC_LOCALES.map((locale) => ({
      url: absolute(localePath(canonical, locale)),
      lastModified,
      changeFrequency: key === 'home' ? 'weekly' : 'monthly',
      priority: key === 'home' ? 1 : 0.7,
      ...(languages ? { alternates: { languages } } : {}),
    }));
  });
}
