/**
 * Dokumenty prawne: dane firmy podstawiane w treść polityk i regulaminu.
 *
 * Treść dokumentów leży w src/content/legal/<dokument>.<język>.json i używa
 * znaczników {company}, {nip}, {email}… Wartości biorą się WYŁĄCZNIE z site.js
 * (LEGAL, CONTACT, BRAND, SITE_URL) – niczego tu nie wpisujemy na sztywno.
 *
 * Progi:
 *  - LEGAL_COMPLETE – wpisane są wszystkie dane firmy, których używają dokumenty (REQUIRED),
 *  - LEGAL_PUBLISHED – dane są wpisane ORAZ klientka (albo prawnik) zatwierdziła treść
 *    dokumentów: LEGAL.documentsApproved w site.js (data zatwierdzenia). Dopiero wtedy
 *    dokumenty w pełni obowiązują – z nazwą firmy, adresem, NIP-em i wpisem do rejestru,
 *  - LEGAL_PUBLIC – dokumenty są publiczne: bez pasa „Projekt dokumentu”, bez noindex,
 *    w sitemap; klauzule pod formularzami i przy rezerwacji się renderują, a formularze
 *    (src/lib/enquiry.js) i rezerwacja online (BookingRoute, /api/booking, next.config.mjs)
 *    mogą zbierać dane. Formularze i tak nie wyślą wiadomości bez CONTACT.email,
 *    a rezerwacja nie ruszy bez kluczy Kalendarza Google.
 *
 * DECYZJA FILIPA (30.09.2026): „Dane firmy do dokumentów: nazwa, NIP, adres i e-mail …
 * dodaj na razie bez tego” – dokumenty są publiczne już teraz, zanim klientka poda dane
 * firmy (PUBLIC_BEFORE_COMPANY_DATA). Do czasu uzupełnienia danych:
 *  - zamiast nazwy firmy stoi marka, a zamiast adresu siedziby – miasto
 *    (legalFallbacks: BRAND.full – dziś „Babushkina Academy” – i CONTACT.city w języku strony),
 *  - fragmenty z NIP-em, rejestrem, telefonem, ulicą i e-mailem znikają (segmenty [[…]]),
 *  - zdania o kontakcie kierują na Instagram (CONTACT.instagram).
 * Nigdy nie pokazujemy publicznie „[do uzupełnienia: …]”. Po wpisaniu danych w site.js
 * pełne brzmienie pokazuje się samo, bez zmian w treści dokumentów.
 *
 * Import względny (./site.js, ../i18n/site.js), żeby moduł działał też w testach
 * `node --test` i w next.config.mjs.
 */

import { CONTACT, LEGAL, SITE_URL } from './site.js';
import { getSite } from '../i18n/site.js';

export const LEGAL_VALUES = {
  company: LEGAL.company,
  // siedziba: pełny adres z rejestru; zastępczo (legalFallbacks) miasto
  seat: LEGAL.address,
  // nazwa firmy BEZ wartości zastępczej – tylko jako warunek {?entity}: zdanie „pod marką
  // Babushkina Academy” pokazuje się dopiero przy prawdziwej nazwie firmy (dziś {company}
  // to sama marka i zdanie powtarzałoby ją dwa razy z rzędu)
  entity: LEGAL.company,
  // adres do korespondencji (listy, reklamacje): ten sam adres, ale BEZ wartości zastępczej
  address: LEGAL.address,
  nip: LEGAL.nip,
  register: LEGAL.register,
  // e-mail w sprawach danych: osobny, a jeśli go nie ma – ogólny adres kontaktowy
  privacyEmail: LEGAL.privacyEmail || CONTACT.email,
  email: CONTACT.email,
  phone: CONTACT.phone,
  // ulica salonu – tylko jako warunek zdania „adres salonu podajemy na stronie Kontakt”
  street: CONTACT.street,
  instagram: CONTACT.instagram,
  siteUrl: SITE_URL,
};

/**
 * Dane firmy, bez których dokumenty nie obowiązują w pełni (LEGAL_COMPLETE → LEGAL_PUBLISHED).
 * Przy LEGAL_PUBLIC ich brak nie psuje treści: pola z wartością zastępczą (company, seat)
 * pokazują markę i miasto, a pozostałe stoją wyłącznie w segmentach [[…]] i listach {{…}},
 * które bez nich znikają. Pilnuje tego src/lib/legal.test.js.
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
/** Dokumenty w pełni obowiązują: dane firmy kompletne i treść zatwierdzona. */
export const LEGAL_PUBLISHED = LEGAL_COMPLETE && LEGAL_APPROVED;

/**
 * Decyzja Filipa z 30.09.2026 (opis wyżej): dokumenty publiczne przed podaniem danych firmy.
 * Ustawienie `false` przywraca tryb projektu (pas „Projekt dokumentu”, oznaczone braki,
 * noindex, bez klauzul i bez zbierania danych) aż do LEGAL_PUBLISHED.
 */
export const PUBLIC_BEFORE_COMPANY_DATA = true;

/** Dokumenty publiczne (strony, sitemap, klauzule, bramki formularzy i rezerwacji). */
export const LEGAL_PUBLIC = PUBLIC_BEFORE_COMPANY_DATA || LEGAL_PUBLISHED;

/**
 * Marka w miejscu nazwy firmy: BRAND.full, a nazwa akademii w nawiasie tylko wtedy,
 * gdy jest inna (dziś obie to „Babushkina Academy” – bez „X (X)”).
 */
export function fallbackCompanyName({ full, academy } = {}) {
  return academy && academy !== full ? `${full} (${academy})` : full;
}

/**
 * Wartości zastępcze w danym języku – wyłącznie fakty z site.js (przez getSite):
 * administrator/usługodawca = marka, siedziba = miasto. Używane tylko przy LEGAL_PUBLIC
 * i tylko wtedy, gdy prawdziwej wartości brak. Telefonu, e-maila, NIP-u ani adresu
 * nie zastępujemy niczym – zdania z nimi są w segmentach i znikają.
 */
export function legalFallbacks(locale = 'pl') {
  const { BRAND, CONTACT: C } = getSite(locale);
  return {
    company: fallbackCompanyName(BRAND),
    seat: C.city,
  };
}

/** Wartości zastępcze we wszystkich językach (do podglądu i testów). */
export const LEGAL_FALLBACKS = {
  pl: legalFallbacks('pl'),
  en: legalFallbacks('en'),
  ru: legalFallbacks('ru'),
};

/** Nazwy pól w oznaczeniu braku (tylko tryb projektu, gdy LEGAL_PUBLIC = false). */
export const FIELD_LABELS = {
  pl: {
    company: 'nazwa firmy',
    entity: 'nazwa firmy',
    seat: 'adres siedziby',
    address: 'adres siedziby',
    nip: 'NIP',
    register: 'wpis do rejestru (KRS/CEIDG)',
    privacyEmail: 'e-mail w sprawach danych osobowych',
    email: 'adres e-mail',
    phone: 'numer telefonu',
    street: 'adres salonu (ulica)',
    instagram: 'profil Instagram',
    siteUrl: 'adres serwisu',
    missing: 'do uzupełnienia',
  },
  en: {
    company: 'company name',
    entity: 'company name',
    seat: 'registered address',
    address: 'registered address',
    nip: 'tax ID (NIP)',
    register: 'register entry (KRS/CEIDG)',
    privacyEmail: 'data protection email',
    email: 'email address',
    phone: 'phone number',
    street: 'salon street address',
    instagram: 'Instagram profile',
    siteUrl: 'website address',
    missing: 'to be completed',
  },
  ru: {
    company: 'название компании',
    entity: 'название компании',
    seat: 'юридический адрес',
    address: 'юридический адрес',
    nip: 'ИНН (NIP)',
    register: 'запись в реестре (KRS/CEIDG)',
    privacyEmail: 'e-mail по вопросам персональных данных',
    email: 'адрес e-mail',
    phone: 'номер телефона',
    street: 'адрес салона (улица)',
    instagram: 'профиль Instagram',
    siteUrl: 'адрес сайта',
    missing: 'будет дополнено',
  },
};

/* ------------------------------------------------------------------ */
/*  Składnia treści dokumentów                                         */
/* ------------------------------------------------------------------ */
/*
 *  {pole}            wartość z LEGAL_VALUES (przy LEGAL_PUBLIC – albo wartość zastępcza),
 *  {siteUrl}/ścieżka link do podstrony serwisu (np. {siteUrl}/regulamin#rezerwacja-online),
 *  {?pole}           sam warunek: nic nie wypisuje, ale segment/pozycja listy, w której stoi,
 *                    znika, gdy pola brak (np. „[[{?street}; adres salonu podajemy…]]”),
 *  [[ … ]]           segment opcjonalny: znika w całości, jeśli którekolwiek pole w nim
 *                    (poza zagnieżdżonymi segmentami i listami) jest puste i nie ma wartości
 *                    zastępczej, np. „{company}, {seat}[[, NIP {nip}]][[, {register}]]”,
 *  {{spójnik|A|B|C}} lista wariantów: pozycje z brakującym polem znikają, reszta łączy się
 *                    przecinkami i spójnikiem przed ostatnią, np.
 *                    „{{lub|{?phone}telefonicznie|{?email}e-mailem|przez Instagram}}”
 *                    (pusty spójnik „{{|A|B}}” = same przecinki). Lista bez żadnej pozycji
 *                    liczy się jak brakujące pole (znika razem z segmentem, w którym stoi).
 *
 *  Pole bez wartości i bez wartości zastępczej POZA segmentem/listą to błąd treści – przy
 *  LEGAL_PUBLIC nic by się w tym miejscu nie wypisało. Wyłapuje to src/lib/legal.test.js.
 *  W trybie projektu (LEGAL_PUBLIC = false) segmenty i wszystkie pozycje list zostają,
 *  a braki są oznaczone { missing: true } („[do uzupełnienia: …]” w LegalDocument).
 */

const TOKEN_AT = /^\{(\?)?([a-zA-Z]+)\}(\/[A-Za-z0-9\-_/#?=.]*[A-Za-z0-9\-_/#=])?/;
const parsed = new Map();

function syntaxError(src, message) {
  return new Error(`Dokument prawny: ${message} w „${String(src).slice(0, 80)}…”`);
}

/** Tekst → drzewo węzłów (z pamięcią podręczną – te same teksty renderują się wielokrotnie). */
export function parseLegalText(src) {
  const text = String(src);
  if (parsed.has(text)) return parsed.get(text);
  let i = 0;

  function sequence(stops) {
    const nodes = [];
    let buf = '';
    const flush = () => {
      if (buf) nodes.push({ type: 'text', value: buf });
      buf = '';
    };
    while (i < text.length) {
      if (text.startsWith(']]', i)) {
        if (stops.includes(']]')) break;
        throw syntaxError(text, 'nadmiarowe „]]”');
      }
      if (text.startsWith('}}', i)) {
        if (stops.includes('}}')) break;
        throw syntaxError(text, 'nadmiarowe „}}”');
      }
      if (stops.includes('|') && text[i] === '|') break;
      if (text.startsWith('[[', i)) {
        flush();
        i += 2;
        const inner = sequence([']]']);
        if (!text.startsWith(']]', i)) throw syntaxError(text, 'niezamknięty segment [[');
        i += 2;
        nodes.push({ type: 'segment', nodes: inner });
        continue;
      }
      if (text.startsWith('{{', i)) {
        flush();
        i += 2;
        const bar = text.indexOf('|', i);
        if (bar === -1) throw syntaxError(text, 'lista {{…}} bez „|” po spójniku');
        const conj = text.slice(i, bar);
        i = bar + 1;
        const items = [];
        for (;;) {
          items.push(sequence(['|', '}}']));
          if (text[i] === '|') {
            i += 1;
            continue;
          }
          if (!text.startsWith('}}', i)) throw syntaxError(text, 'niezamknięta lista {{');
          i += 2;
          break;
        }
        nodes.push({ type: 'list', conj, items });
        continue;
      }
      const token = text[i] === '{' ? TOKEN_AT.exec(text.slice(i)) : null;
      if (token) {
        flush();
        const [whole, silent, field, path] = token;
        nodes.push({ type: 'field', field, silent: Boolean(silent), path: path || null, raw: whole });
        i += whole.length;
        continue;
      }
      buf += text[i];
      i += 1;
    }
    flush();
    return nodes;
  }

  const tree = sequence([]);
  parsed.set(text, tree);
  return tree;
}

function evaluate(nodes, ctx) {
  const parts = [];
  let ok = true;
  for (const node of nodes) {
    if (node.type === 'text') {
      parts.push({ text: node.value });
    } else if (node.type === 'field') {
      const { field, silent, path } = node;
      if (field === 'siteUrl' && path) {
        parts.push({ link: path });
        continue;
      }
      if (!(field in ctx.values)) {
        // nieznany znacznik zostaje dosłownie – test wyłapie „{”
        parts.push({ text: node.raw });
        continue;
      }
      let value = ctx.values[field];
      let fallback = false;
      if (!value && ctx.publicMode && ctx.fallbacks[field]) {
        value = ctx.fallbacks[field];
        fallback = true;
      }
      if (value) {
        if (!silent) parts.push(fallback ? { field, value, fallback: true } : { field, value });
      } else {
        ok = false;
        if (!silent) parts.push({ field, missing: true });
      }
      if (path) parts.push({ text: path });
    } else if (node.type === 'segment') {
      const inner = evaluate(node.nodes, ctx);
      if (inner.ok || !ctx.publicMode) parts.push(...inner.parts);
    } else if (node.type === 'list') {
      const items = node.items.map((item) => evaluate(item, ctx));
      const kept = ctx.publicMode ? items.filter((item) => item.ok) : items;
      if (kept.length === 0) {
        // żadnej pozycji: jak brakujące pole – w segmencie znika z nim, poza segmentem to błąd treści
        ok = false;
        parts.push({ field: 'list', missing: true });
        continue;
      }
      kept.forEach((item, index) => {
        if (index > 0) {
          const last = index === kept.length - 1;
          parts.push({ text: last && node.conj ? ` ${node.conj} ` : ', ' });
        }
        parts.push(...item.parts);
      });
    }
  }
  return { parts, ok };
}

/** Sąsiednie kawałki tekstu w jeden (czytelniejszy wynik, mniej węzłów w React). */
function mergeText(parts) {
  const out = [];
  for (const part of parts) {
    const prev = out[out.length - 1];
    if (part.text !== undefined && prev && prev.text !== undefined) prev.text += part.text;
    else out.push(part.text !== undefined ? { text: part.text } : part);
  }
  return out.filter((part) => part.text !== '');
}

/**
 * Tekst ze znacznikami → lista kawałków do renderu:
 * { text } | { field, value[, fallback: true] } | { field, missing: true } | { link: '/regulamin#x' }.
 *
 * Opcje: values (domyślnie dane z site.js), locale (wartości zastępcze w tym języku),
 * publicMode (domyślnie LEGAL_PUBLIC: segmenty i pozycje list bez danych znikają,
 * brakujące pola dostają wartości zastępcze).
 */
export function tokenize(text, { values = LEGAL_VALUES, locale = 'pl', publicMode = LEGAL_PUBLIC, fallbacks } = {}) {
  const ctx = {
    values,
    publicMode,
    fallbacks: fallbacks || (publicMode ? LEGAL_FALLBACKS[locale] || legalFallbacks(locale) : {}),
  };
  return mergeText(evaluate(parseLegalText(text), ctx).parts);
}

/** Tekst, jaki zobaczy czytelnik w miejscu pola (Instagram jako @nazwa, adres serwisu bez https://). */
export function displayValue(part) {
  if (part.field === 'instagram' && part.value === CONTACT.instagram && CONTACT.instagramHandle) return CONTACT.instagramHandle;
  if (part.field === 'siteUrl') return String(part.value).replace(/^https?:\/\//, '');
  return String(part.value);
}

/**
 * Kawałki → zwykły tekst (testy, podgląd). `labels` – nazwy pól do oznaczenia braku
 * (tryb projektu); `linkText` – jak wypisać link {siteUrl}/ścieżka.
 */
export function partsToText(parts, { labels = FIELD_LABELS.pl, linkText } = {}) {
  const host = SITE_URL.replace(/^https?:\/\//, '');
  return parts
    .map((part) => {
      if (part.text !== undefined) return part.text;
      if (part.link) return linkText ? linkText(part.link) : `${host}${part.link}`;
      if (part.missing) return `[${labels.missing}: ${labels[part.field] || part.field}]`;
      return displayValue(part);
    })
    .join('');
}

/** Czy po usunięciu segmentów nic nie zostało (np. pozycja listy „[[NIP: {nip}]]”). */
export function isBlank(parts) {
  return parts.every((part) => part.text !== undefined && !part.text.trim());
}
