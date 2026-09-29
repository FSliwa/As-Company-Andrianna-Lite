import { SITE_URL } from '@/lib/site';

/** robots.txt – cały serwis publiczny; adres z NEXT_PUBLIC_SITE_URL. */
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/api/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
