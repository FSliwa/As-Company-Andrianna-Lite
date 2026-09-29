/** sitemap.xml — dziewięć publicznych tras. */
const ROUTES = ['', '/o-nas', '/uslugi', '/pakiety', '/kontakt', '/szkolenia', '/maszynki', '/pigmenty', '/certyfikaty'];

export default function sitemap() {
  const lastModified = new Date('2026-09-29');
  return ROUTES.map((path) => ({
    url: `https://as-loveliness.eu${path}`,
    lastModified,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }));
}
