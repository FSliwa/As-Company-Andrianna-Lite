import BookAppointment from '@/views/BookAppointment';
import { pageMeta } from '@/lib/seo';
import { bookingSecret, issueFormToken, turnstileKeys } from '@/lib/booking/abuse';
import { isBookingEnabled } from '@/lib/booking/provider';

/* Wrapper serwerowy: metadata trasy + informacja, czy rezerwacja online jest
   skonfigurowana (zmienne środowiskowe czytane w chwili żądania — dlatego trasa
   jest dynamiczna). Sam widok jest komponentem klienckim; gdy API mimo to zwróci
   503, widok sam przełączy się na komunikat „chwilowo niedostępna”.
   Z serwera idą też: podpisany znacznik formularza (anty-bot „za szybko” liczone
   zegarem serwera), czas serwera (pasek dni nie zależy od złego zegara przeglądarki)
   i klucz witryny Cloudflare Turnstile, jeśli jest skonfigurowany. */
export const dynamic = 'force-dynamic';

/* Bez skonfigurowanego kalendarza strona pokazuje tylko komunikat — noindex. */
export function generateMetadata() {
  return pageMeta({
    title: 'Umów wizytę',
    description:
      // D2: „linia rzęs” zamiast „kresek” (Perfect Eyes)
      'Rezerwacja online w Babushkina Academy, Warszawa — wybierz zabieg makijażu permanentnego brwi, ust lub linii rzęs, dzień i godzinę wizyty.',
    path: '/umow-wizyte',
    noindex: !isBookingEnabled(),
  });
}

export default function Page() {
  const enabled = isBookingEnabled();
  const now = Date.now();
  const turnstile = enabled ? turnstileKeys() : null;
  return (
    <BookAppointment
      initialEnabled={enabled}
      formToken={enabled ? issueFormToken({ now, secret: bookingSecret() }) : null}
      serverNow={now}
      turnstileSiteKey={turnstile ? turnstile.siteKey : null}
    />
  );
}
