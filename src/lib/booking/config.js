/**
 * Rezerwacja online – konfiguracja.
 *
 * Importy w src/lib/booking/* są wyłącznie względne (bez aliasu `@/`), żeby
 * `node --test` działał bez bundlera. Ceny NIE są tu przepisywane – pochodzą
 * z cenników w src/lib/site.js.
 */

import { CONTACT, PRICING_PMU, PRICING_REFRESH, PRICING_REMOVAL } from '../site.js';

/**
 * Godziny pracy salonu – klucz = dzień tygodnia (0 = niedziela … 6 = sobota),
 * wartość = ['HH:MM', 'HH:MM'] albo null (zamknięte).
 *
 * ⚠️ DO POTWIERDZENIA PRZEZ KLIENTA: godziny w serwisie nie mają źródła;
 *    obecny sklep podaje 10–18. Zmiana tutaj wystarczy – API i UI liczą sloty
 *    wyłącznie z tej tabeli.
 */
const WORKING_HOURS = Object.freeze({
  0: null,
  1: Object.freeze(['10:00', '18:00']),
  2: Object.freeze(['10:00', '18:00']),
  3: Object.freeze(['10:00', '18:00']),
  4: Object.freeze(['10:00', '18:00']),
  5: Object.freeze(['10:00', '18:00']),
  6: null,
});

export const BOOKING_CONFIG = Object.freeze({
  timeZone: 'Europe/Warsaw',
  /** Siatka slotów (min). */
  slotStepMin: 30,
  /**
   * Bufor po każdym zajętym przedziale (sprzątanie, przygotowanie stanowiska).
   * Liczony po NASZYM zabiegu i po każdym wydarzeniu z kalendarza – między
   * dwiema pozycjami w kalendarzu zawsze jest co najmniej `bufferMin` wolnego.
   */
  bufferMin: 15,
  /** Najwcześniejszy termin: teraz + N godzin. */
  minLeadHours: 24,
  /** Najpóźniejszy dzień: dzisiaj (czas salonu) + N dni kalendarzowych. */
  maxDaysAhead: 60,
  workingHours: WORKING_HOURS,
  /**
   * Dodatkowe dni zamknięte ('YYYY-MM-DD'), niezależnie od kalendarza.
   * Zwykle niepotrzebne: urlop wpisany w Kalendarz Google (także jako wydarzenie
   * całodniowe) i tak blokuje sloty.
   */
  closedDates: Object.freeze([]),
  /** Kolor wydarzenia w Kalendarzu Google (colorId '1'–'11') albo null = domyślny. */
  eventColorId: null,
  /** Best-effort limit w pamięci per IP (instancje serverless mają osobne liczniki). */
  rateLimit: Object.freeze({
    post: Object.freeze({ limit: 5, windowMs: 10 * 60 * 1000 }),
    get: Object.freeze({ limit: 60, windowMs: 60 * 1000 }),
  }),
  /**
   * Minimalny czas od wyświetlenia formularza do wysłania (anty-bot). Liczony z podpisanego
   * znacznika serwera (abuse.js › issueFormToken), nie z zegara przeglądarki.
   */
  minFormFillMs: 3000,
  /** Znacznik formularza starszy niż to → „odśwież formularz” (widok pobiera nowy sam). */
  formTokenMaxAgeMs: 24 * 60 * 60 * 1000,
  /** Maksymalny rozmiar body POST. */
  maxBodyBytes: 8 * 1024,
  /**
   * Ochrona przed zablokowaniem kalendarza przez skrypt:
   *  - maxActivePerContact – ile przyszłych wizyt z www może mieć ten sam telefon ALBO e-mail
   *    (kolejna → 409 „limit”; np. zabieg + korekta = 2),
   *  - maxPerHour / maxPerDay – bezpiecznik dla całej strony: po przekroczeniu rezerwacja
   *    online jest wstrzymana (503 „paused”), aż starsze wpisy wyjdą z okna. Szkoda po
   *    ataku ogranicza się do tylu wpisów w kalendarzu.
   */
  abuse: Object.freeze({
    maxActivePerContact: 2,
    maxPerHour: 6,
    maxPerDay: 15,
  }),
  /** Budżety czasu (ms) – łącznie dla całego żądania, niezależnie od timeoutu pojedynczego wywołania Google. */
  timeouts: Object.freeze({
    /** POST: sprawdzenia + zapis (z jedną ponowną próbą). */
    bookingMs: 18_000,
    /** POST: każdy krok po zapisie (kontrola wyścigu, sprawdzenie po błędzie, usunięcie). */
    afterInsertMs: 5_000,
    /** GET dostępności. */
    slotsMs: 15_000,
  }),
  /** Mikro-cache zajętości dla GET (identyczne zapytania w tym czasie → jedno wywołanie Google). POST zawsze pyta na świeżo. */
  busyCacheMs: 30_000,
});

/* ---------------- ceny z cenników site.js ---------------- */

function findPrice(pricing, name) {
  const item = pricing.items.find((i) => i.name === name);
  return item ? item.price : null;
}

/** Najniższa kwota z cennika → „od 850 zł”. */
function priceFrom(pricing) {
  const values = pricing.items
    .map((i) => Number(String(i.price).replace(/[^\d]/g, '')))
    .filter((n) => Number.isFinite(n) && n > 0);
  return values.length ? `od ${Math.min(...values)} zł` : null;
}

/**
 * Zabiegi dostępne w rezerwacji online. `durationMin` = czas blokady w kalendarzu
 * (górna granica z karty /uslugi). Każdy zabieg zawiera konsultację, architekturę
 * twarzy i rysunek wstępny – osobnej „konsultacji” nie oferujemy.
 */
export const TREATMENTS = Object.freeze(
  [
    { id: 'super-natural-brows', name: 'Super Natural Brows', durationMin: 120, price: findPrice(PRICING_PMU, 'Super Natural Brows') },
    { id: 'perfect-powder-brows', name: 'Perfect Powder Brows', durationMin: 120, price: findPrice(PRICING_PMU, 'Perfect Powder Brows') },
    { id: 'perfect-lips', name: 'Perfect Lips', durationMin: 120, price: findPrice(PRICING_PMU, 'Perfect Lips') },
    { id: 'perfect-eyeliners', name: 'Perfect Eyeliners', durationMin: 90, price: findPrice(PRICING_PMU, 'Perfect Eyeliners') },
    { id: 'korekta', name: 'Korekta do 3 miesięcy', durationMin: 60, price: findPrice(PRICING_PMU, 'Korekta do 3 miesięcy') },
    {
      id: 'odswiezenie',
      name: 'Odświeżenie (Refresh)',
      durationMin: 90,
      price: priceFrom(PRICING_REFRESH),
      priceNote: 'Cena zależy od czasu od ostatniego zabiegu',
    },
    {
      id: 'usuwanie',
      name: 'Usuwanie – laser / remover',
      durationMin: 45,
      price: priceFrom(PRICING_REMOVAL),
      priceNote: 'Cena zależy od strefy i wielkości',
    },
  ].map((t) => Object.freeze(t))
);

export const TREATMENT_IDS = Object.freeze(TREATMENTS.map((t) => t.id));

/** @param {string} id */
export function getTreatment(id) {
  return TREATMENTS.find((t) => t.id === id) || null;
}

/** Adres salonu do wydarzenia i pliku .ics (tylko pola, które są uzupełnione w site.js). */
export const SALON_LOCATION = [
  CONTACT.venue,
  CONTACT.street,
  [CONTACT.postal, CONTACT.city].filter(Boolean).join(' '),
]
  .filter(Boolean)
  .join(', ');
