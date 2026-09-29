import { BOOKING_ENABLED, BOOKING_PAGE, LEGAL, SITE_URL } from '@/lib/site';

/** sitemap.xml — publiczne trasy; data = data buildu. */
// /umow-wizyte tylko przy włączonej rezerwacji online — inaczej to strona z komunikatem.
const ROUTES = ['', '/o-nas', '/uslugi', ...(BOOKING_ENABLED ? [BOOKING_PAGE] : []), '/pakiety', '/kontakt', '/szkolenia', '/maszynki', '/pigmenty', '/certyfikaty'];

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
