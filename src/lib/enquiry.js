/**
 * Wysyłka zgłoszeń z formularzy.
 *
 * W projekcie NIE MA backendu przyjmującego formularze – nie ma endpointu,
 * nie ma skonfigurowanego dostawcy poczty. Wcześniej formularze pokazywały
 * komunikat „wysłano" i po cichu gubiły dane kontaktowe klientek.
 *
 * Rozwiązanie bez backendu: składamy wiadomość i otwieramy program pocztowy
 * użytkownika (mailto). Działa, gdy w src/lib/site.js jest CONTACT.email ORAZ
 * dokumenty prawne obowiązują (LEGAL_PUBLISHED – pod formularzem stoi wtedy
 * klauzula informacyjna z art. 13 RODO). Do tego czasu formularz uczciwie mówi,
 * że nie jest podpięty, i kieruje na kanał, który realnie działa (Instagram).
 *
 * Gdy pojawi się prawdziwy endpoint, wystarczy podmienić treść
 * `sendEnquiry` na fetch('/api/...') – reszta kodu się nie zmienia.
 */

import { CONTACT, COURSES } from '@/lib/site';
import { LEGAL_PUBLISHED } from '@/lib/legal';

/** Formularze przekazują dane (mailto) – jest adres i klauzula informacyjna. */
export const ENQUIRY_LIVE = Boolean(CONTACT.email) && LEGAL_PUBLISHED;

/**
 * Opcje pola „Szkolenie” w zapytaniu o kurs (D4) – wszystkie kursy z briefu, w kolejności
 * COURSES (nowe na końcu). `value` = pełna nazwa kursu (trafia do tematu wiadomości),
 * `id` = COURSES[].id (preselekcja z karty kursu), `cta` = etykieta przycisku z danych kursu
 * („Zapytaj o termin” / „Zapytaj o dostęp”), `requiresContact` = rezerwacja po wstępnym kontakcie.
 */
export const COURSE_ENQUIRY_OPTIONS = COURSES.map((c) => ({
  id: c.id,
  value: c.fullTitle || c.title,
  label: c.fullTitle || c.title,
  cta: c.cta,
  requiresContact: Boolean(c.requiresContact),
}));

export const ENQUIRY_STATUS = {
  MAIL_OPENED: 'mail-opened',
  NO_CHANNEL: 'no-channel',
};

/**
 * @param {{ subject: string, fields: Array<[string, string|number|null|undefined]> }} payload
 * @returns {{ status: string, mailto?: string }}
 */
export function sendEnquiry({ subject, fields }) {
  const body = fields
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n');

  if (!ENQUIRY_LIVE) {
    return { status: ENQUIRY_STATUS.NO_CHANNEL };
  }

  const mailto = `mailto:${CONTACT.email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  if (typeof window !== 'undefined') {
    window.location.href = mailto;
  }

  return { status: ENQUIRY_STATUS.MAIL_OPENED, mailto };
}

/** Komunikat po wysłaniu – zawsze zgodny z tym, co faktycznie się stało. */
export function enquiryMessage(status) {
  if (status === ENQUIRY_STATUS.MAIL_OPENED) {
    return {
      title: 'Otworzyliśmy Twój program pocztowy',
      body: 'Wiadomość jest gotowa – wystarczy ją wysłać. Odpowiemy najszybciej, jak się da.',
    };
  }
  return {
    title: 'Formularz nie jest jeszcze podpięty',
    body: `Twoje dane nie zostały nigdzie wysłane. Napisz do nas na Instagramie (${CONTACT.instagramHandle}) – odpowiadamy tam na bieżąco.`,
  };
}
