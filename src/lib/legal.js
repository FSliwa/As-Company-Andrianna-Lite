/**
 * Dokumenty prawne: dane firmy podstawiane w treść polityk i regulaminu.
 *
 * Treść dokumentów leży w src/content/legal/<dokument>.<język>.json i używa
 * znaczników {company}, {nip}, {email}… Wartości biorą się WYŁĄCZNIE z site.js
 * (LEGAL, CONTACT, SITE_URL) – niczego tu nie wpisujemy na sztywno.
 *
 * Dwa progi publikacji:
 *  - LEGAL_COMPLETE – wpisane są wszystkie dane, których używają dokumenty (REQUIRED),
 *  - LEGAL_PUBLISHED – dane są wpisane ORAZ klientka (albo prawnik) zatwierdziła treść
 *    dokumentów: LEGAL.documentsApproved w site.js (data zatwierdzenia).
 * Dopóki LEGAL_PUBLISHED = false, dokumenty są projektem (pas „Projekt dokumentu”,
 * braki jako „[do uzupełnienia: …]”, noindex, brak w sitemap), klauzule pod formularzami
 * się nie renderują, a formularze i rezerwacja online nie zbierają danych osobowych
 * (src/lib/enquiry.js, BookingRoute, /api/booking, next.config.mjs).
 *
 * Import względny (./site.js), żeby moduł działał też w testach `node --test`
 * i w next.config.mjs.
 */

import { CONTACT, LEGAL, SITE_URL } from './site.js';

export const LEGAL_VALUES = {
  company: LEGAL.company,
  address: LEGAL.address,
  nip: LEGAL.nip,
  register: LEGAL.register,
  // e-mail w sprawach danych: osobny, a jeśli go nie ma – ogólny adres kontaktowy
  privacyEmail: LEGAL.privacyEmail || CONTACT.email,
  email: CONTACT.email,
  phone: CONTACT.phone,
  instagram: CONTACT.instagram,
  siteUrl: SITE_URL,
};

/**
 * Pola, bez których dokument nie może być opublikowany jako obowiązujący – wszystkie
 * znaczniki używane w treści dokumentów, poza tymi, które mają wartość zawsze
 * (privacyEmail → zastępczo email, instagram, siteUrl). Pilnuje tego src/lib/legal.test.js.
 */
export const REQUIRED = ['company', 'address', 'nip', 'register', 'email', 'phone'];

/** Brakujące pola dla podanych wartości (domyślnie: dane z site.js). */
export function missingFields(values = LEGAL_VALUES) {
  return REQUIRED.filter((key) => !values[key]);
}

export const LEGAL_MISSING = missingFields();
export const LEGAL_COMPLETE = LEGAL_MISSING.length === 0;
/** Treść zatwierdzona przez klientkę/prawnika (data w LEGAL.documentsApproved). */
export const LEGAL_APPROVED = Boolean(LEGAL.documentsApproved);
/** Dokumenty obowiązują: dane kompletne i treść zatwierdzona. */
export const LEGAL_PUBLISHED = LEGAL_COMPLETE && LEGAL_APPROVED;

/** Nazwy pól w oznaczeniu braku. */
export const FIELD_LABELS = {
  pl: {
    company: 'nazwa firmy',
    address: 'adres siedziby',
    nip: 'NIP',
    register: 'wpis do rejestru (KRS/CEIDG)',
    privacyEmail: 'e-mail w sprawach danych osobowych',
    email: 'adres e-mail',
    phone: 'numer telefonu',
    instagram: 'profil Instagram',
    siteUrl: 'adres serwisu',
    missing: 'do uzupełnienia',
  },
  en: {
    company: 'company name',
    address: 'registered address',
    nip: 'tax ID (NIP)',
    register: 'register entry (KRS/CEIDG)',
    privacyEmail: 'data protection email',
    email: 'email address',
    phone: 'phone number',
    instagram: 'Instagram profile',
    siteUrl: 'website address',
    missing: 'to be completed',
  },
  ru: {
    company: 'название компании',
    address: 'юридический адрес',
    nip: 'ИНН (NIP)',
    register: 'запись в реестре (KRS/CEIDG)',
    privacyEmail: 'e-mail по вопросам персональных данных',
    email: 'адрес e-mail',
    phone: 'номер телефона',
    instagram: 'профиль Instagram',
    siteUrl: 'адрес сайта',
    missing: 'будет дополнено',
  },
};

/**
 * Tekst ze znacznikami → lista kawałków do renderu:
 * { text } | { field, value } | { field, missing: true } | { link: '/regulamin#x' } (dla „{siteUrl}/ścieżka”).
 */
const TOKEN = /\{([a-zA-Z]+)\}(\/[A-Za-z0-9\-_/#?=.]*[A-Za-z0-9\-_/#=])?/g;

export function tokenize(text, values = LEGAL_VALUES) {
  const parts = [];
  let last = 0;
  for (const match of String(text).matchAll(TOKEN)) {
    const [whole, field, path] = match;
    if (match.index > last) parts.push({ text: text.slice(last, match.index) });
    if (field === 'siteUrl' && path) parts.push({ link: path });
    else if (!(field in values)) parts.push({ text: whole });
    else if (values[field]) parts.push({ field, value: values[field] });
    else parts.push({ field, missing: true });
    if (field !== 'siteUrl' && path) parts.push({ text: path });
    last = match.index + whole.length;
  }
  if (last < String(text).length) parts.push({ text: String(text).slice(last) });
  return parts;
}
