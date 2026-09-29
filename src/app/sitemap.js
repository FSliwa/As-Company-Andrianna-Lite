import { LEGAL, SITE_URL } from '@/lib/site';

/** sitemap.xml — publiczne trasy; data = data buildu. */
const ROUTES = ['', '/o-nas', '/uslugi', '/umow-wizyte', '/pakiety', '/kontakt', '/szkolenia', '/maszynki', '/pigmenty', '/certyfikaty'];

export default function sitemap() {
  const lastModified = new Date();
  const routes = LEGAL.privacyPolicy ? [...ROUTES, '/polityka-prywatnosci'] : ROUTES;
  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }));
}
