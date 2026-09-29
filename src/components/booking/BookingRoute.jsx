/* Komponent SERWEROWY strony rezerwacji – wspólny dla /umow-wizyte, /en/book i /ru/book
   (bez 'use client': czyta zmienne środowiskowe i podpisuje znacznik formularza).
   Informacja, czy rezerwacja online jest skonfigurowana, liczona w chwili żądania –
   dlatego każda z tych tras ma `export const dynamic = 'force-dynamic'`. Sam widok
   jest komponentem klienckim; gdy API mimo to zwróci 503, widok sam przełączy się
   na komunikat „chwilowo niedostępna”.
   Z serwera idą też: podpisany znacznik formularza (anty-bot „za szybko” liczone
   zegarem serwera), czas serwera (pasek dni nie zależy od złego zegara przeglądarki)
   i klucz witryny Cloudflare Turnstile, jeśli jest skonfigurowany. */
import BookAppointment from '@/views/BookAppointment';
import { bookingSecret, issueFormToken, turnstileKeys } from '@/lib/booking/abuse';
import { isBookingEnabled } from '@/lib/booking/provider';

export { isBookingEnabled };

export default function BookingRoute() {
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
