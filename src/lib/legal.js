/**
 * Dokumenty prawne: dane firmy podstawiane w treść polityk i regulaminu.
 *
 * Treść dokumentów leży w src/content/legal/<dokument>.<język>.json i używa
 * znaczników {company}, {nip}, {email}… Wartości biorą się WYŁĄCZNIE z site.js
 * (LEGAL, CONTACT, SITE_URL) – niczego tu nie wpisujemy na sztywno. Dopóki
 * brakuje danych rejestrowych, dokumenty są projektem: strony pokazują pas
 * „Projekt dokumentu”, braki jako „[do uzupełnienia: …]” i mają noindex.
 */

import { CONTACT, LEGAL, SITE_URL } from '@/lib/site';

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

/** Pola, bez których dokument nie może być opublikowany jako obowiązujący. */
const REQUIRED = ['company', 'address', 'nip', 'register', 'email'];

export const LEGAL_MISSING = REQUIRED.filter((key) => !LEGAL_VALUES[key]);
export const LEGAL_COMPLETE = LEGAL_MISSING.length === 0;

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
    privacyEmail: 'data protection e-mail',
    email: 'e-mail address',
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

export function tokenize(text) {
  const parts = [];
  let last = 0;
  for (const match of String(text).matchAll(TOKEN)) {
    const [whole, field, path] = match;
    if (match.index > last) parts.push({ text: text.slice(last, match.index) });
    if (field === 'siteUrl' && path) parts.push({ link: path });
    else if (!(field in LEGAL_VALUES)) parts.push({ text: whole });
    else if (LEGAL_VALUES[field]) parts.push({ field, value: LEGAL_VALUES[field] });
    else parts.push({ field, missing: true });
    if (field !== 'siteUrl' && path) parts.push({ text: path });
    last = match.index + whole.length;
  }
  if (last < String(text).length) parts.push({ text: String(text).slice(last) });
  return parts;
}
