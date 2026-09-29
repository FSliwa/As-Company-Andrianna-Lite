/**
 * Walidacja wejścia (zod) – wspólna dla API i (opcjonalnie) formularza w przeglądarce.
 * Bez importów serwerowych: config → site.js, slots/time są czyste.
 */

import { z } from 'zod';
import { BOOKING_CONFIG, TREATMENT_IDS } from './config.js';
import { isOnSlotGrid } from './slots.js';
import { isValidDate, parseMonth, parseTime } from './time.js';

export const FIELD_LIMITS = Object.freeze({
  nameMin: 2,
  nameMax: 80,
  phoneMinDigits: 9,
  phoneMaxDigits: 15,
  emailMax: 254,
  noteMax: 500,
});

/** Litery (także z diakrytykami), spacje, apostrof, łącznik, kropka. */
export const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}' .’-]*$/u;
/** Cyfry, spacje, łączniki, opcjonalny „+” na początku. */
export const PHONE_RE = /^\+?\d[\d -]*$/;

// Znaki sterujące (poza \n i \t w uwagach) nie mają prawa trafić do kalendarza.
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u2028\u2029]/g;
// Znaki niewidoczne i sterujące kierunkiem tekstu (bidi, zero-width, BOM) – pozwalają
// ukryć albo odwrócić fragment tekstu w kalendarzu (np. „‮exe.gpj”).
const INVISIBLE_RE = /[\u00AD\u061C\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/g;
/** Adres URL w uwagach – Kalendarz Google zamienia go w klikalny link (phishing). */
export const URL_RE = /(?:[a-z][a-z0-9+.-]*:\/\/|www\.)\S/i;

function singleLine(value) {
  return value.replace(CONTROL_RE, '').replace(INVISIBLE_RE, '').replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

function multiLine(value) {
  return value
    .replace(/\r\n?/g, '\n')
    .replace(CONTROL_RE, '')
    .replace(INVISIBLE_RE, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function phoneDigits(phone) {
  return String(phone).replace(/\D/g, '');
}

const treatmentSchema = z.enum(/** @type {[string, ...string[]]} */ ([...TREATMENT_IDS]), {
  errorMap: () => ({ message: 'Wybierz zabieg' }),
});
const dateSchema = z.string({ required_error: 'Wybierz dzień' }).refine(isValidDate, 'Nieprawidłowa data');
const monthSchema = z.string().refine((m) => parseMonth(m) !== null, 'Nieprawidłowy miesiąc');
const timeSchema = z.string({ required_error: 'Wybierz godzinę' }).refine((t) => parseTime(t) !== null, 'Nieprawidłowa godzina');

/** GET /api/booking/slots – dokładnie jedno z: date | month. */
export const slotsQuerySchema = z
  .object({ treatment: treatmentSchema, date: dateSchema.optional(), month: monthSchema.optional() })
  .refine((q) => Boolean(q.date) !== Boolean(q.month), { message: 'Podaj date albo month', path: ['date'] });

/** POST /api/booking */
export const bookingSchema = z
  .object({
    treatment: treatmentSchema,
    date: dateSchema,
    time: timeSchema,
    name: z
      .string({ required_error: 'Podaj imię' })
      .max(200)
      .transform(singleLine)
      .pipe(
        z
          .string()
          .min(FIELD_LIMITS.nameMin, 'Podaj imię (min. 2 znaki)')
          .max(FIELD_LIMITS.nameMax, 'Imię jest za długie')
          .regex(NAME_RE, 'Imię może zawierać tylko litery, spacje i łączniki')
      ),
    phone: z
      .string({ required_error: 'Podaj numer telefonu' })
      .max(40)
      .transform(singleLine)
      .pipe(
        z
          .string()
          .regex(PHONE_RE, 'Numer może zawierać cyfry, spacje i „+” na początku')
          .refine((p) => {
            const n = phoneDigits(p).length;
            return n >= FIELD_LIMITS.phoneMinDigits && n <= FIELD_LIMITS.phoneMaxDigits;
          }, 'Numer telefonu powinien mieć 9–15 cyfr')
      ),
    email: z
      .string({ required_error: 'Podaj adres e-mail' })
      .max(400)
      .transform((s) => s.trim())
      .pipe(z.string().max(FIELD_LIMITS.emailMax, 'Adres e-mail jest za długi').email('Nieprawidłowy adres e-mail')),
    note: z.preprocess(
      (v) => (v === undefined || v === null ? '' : v),
      z
        .string()
        .max(2000, 'Uwagi mogą mieć maks. 500 znaków')
        .transform(multiLine)
        .pipe(
          z
            .string()
            .max(FIELD_LIMITS.noteMax, 'Uwagi mogą mieć maks. 500 znaków')
            .refine((n) => !URL_RE.test(n), 'Usuń link z uwag – zdjęcia i inspiracje pokażesz nam na Instagramie')
        )
    ),
    website: z.string().max(500).nullable().optional(),
    /** Podpisany znacznik formularza z renderu /umow-wizyte (abuse.js › issueFormToken). */
    formToken: z.string({ required_error: 'Odśwież formularz' }).max(100),
    /** UUID jednej próby rezerwacji terminu – ponowienie po błędzie nie tworzy drugiego wpisu. */
    requestId: z.string().regex(UUID_RE).optional(),
    /** Token Cloudflare Turnstile (gdy włączony). */
    turnstileToken: z.string().max(2048).optional(),
  })
  .superRefine((v, ctx) => {
    if (isValidDate(v.date) && parseTime(v.time) !== null && !isOnSlotGrid(v.date, v.time, BOOKING_CONFIG)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['time'], message: 'Godzina spoza siatki terminów' });
    }
  });

/** Nazwy pól z błędami (bez wartości) – do odpowiedzi 400. */
export function issueFields(error) {
  const fields = new Set();
  for (const issue of error.issues) fields.add(issue.path.length ? String(issue.path[0]) : '_');
  return [...fields];
}

/** URLSearchParams → wynik walidacji GET. */
export function parseSlotsQuery(searchParams) {
  const raw = {};
  for (const key of ['treatment', 'date', 'month']) {
    const v = searchParams.get(key);
    if (v !== null && v !== '') raw[key] = v;
  }
  return slotsQuerySchema.safeParse(raw);
}
