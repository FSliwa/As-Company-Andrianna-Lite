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
  /** Najwcześniejszy termin: teraz + N godzin. ⚠️ DO POTWIERDZENIA przez klientkę (reguła robocza). */
  minLeadHours: 24,
  /** Najpóźniejszy dzień: dzisiaj (czas salonu) + N dni kalendarzowych. ⚠️ DO POTWIERDZENIA przez klientkę. */
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

/** Cena pozycji cennika po stałym `id` (nazwy widoczne mogą się zmieniać – D2). */
function findPrice(pricing, id) {
  const item = pricing.items.find((i) => i.id === id);
  return item ? item.price : null;
}

/**
 * Najniższa kwota z cennika → „od 850 zł”. D5: pomija stawki tylko dla naszych klientek
 * (`forOwnClients`) – np. „Usuwanie brwi dla moich klientek 100 zł” nie może udawać
 * ceny wyjściowej dla wszystkich; ta stawka idzie osobno do `priceNote`.
 */
function priceFrom(pricing) {
  const values = pricing.items
    .filter((i) => !i.forOwnClients)
    .map((i) => Number(String(i.price).replace(/[^\d]/g, '')))
    .filter((n) => Number.isFinite(n) && n > 0);
  return values.length ? `od ${Math.min(...values)} zł` : null;
}

/** „100 zł – usuwanie brwi dla naszych klientek” (D5) albo null, gdy cennik nie ma takiej pozycji. */
function ownClientsNote(pricing) {
  const item = pricing.items.find((i) => i.forOwnClients);
  if (!item) return null;
  return `${item.price} – ${item.name.replace(/^Usuwanie/, 'usuwanie').replace(/moich klientek/, 'naszych klientek')}`;
}

/** Podpis techniki z cennika (brief), np. „Pigmentacja linii rzęs” przy Perfect Eyes. */
function techniqueOf(id) {
  const item = PRICING_PMU.items.find((i) => i.id === id);
  return item && item.technique ? item.technique : null;
}

const KOREKTA = PRICING_PMU.items.find((i) => i.id === 'korekta');

/**
 * Zabiegi dostępne w rezerwacji online.
 *
 * `id` – STAŁE (parametr ?zabieg=, zapisy w kalendarzu); D2 zmienia tylko nazwy widoczne:
 * 'perfect-powder-brows' → „Perfect Brows”, 'perfect-eyeliners' → „Perfect Eyes”.
 *
 * `durationMin` – czas blokady w kalendarzu. ⚠️ DO POTWIERDZENIA przez klientkę: wartości
 * robocze z poprzedniej wersji strony, bez źródła – z wyjątkiem Super Natural Brows (brief:
 * Andriana wykonuje włos maszynowy w 1,5–2 godziny → 120 min). Tylko czasy ze źródłem mają
 * `durationConfirmed: true` i tylko te UI rezerwacji pokazuje klientce (D6); pozostałe służą
 * wyłącznie do liczenia slotów i blokady w kalendarzu salonu.
 *
 * `hint` – podpis techniki z briefu pod nazwą na liście wyboru.
 */
export const TREATMENTS = Object.freeze(
  [
    {
      id: 'super-natural-brows',
      name: 'Super Natural Brows',
      hint: techniqueOf('super-natural-brows'),
      durationMin: 120,
      durationConfirmed: true,
      price: findPrice(PRICING_PMU, 'super-natural-brows'),
    },
    { id: 'perfect-powder-brows', name: 'Perfect Brows', hint: techniqueOf('perfect-powder-brows'), durationMin: 120, price: findPrice(PRICING_PMU, 'perfect-powder-brows') },
    { id: 'perfect-lips', name: 'Perfect Lips', hint: techniqueOf('perfect-lips'), durationMin: 120, price: findPrice(PRICING_PMU, 'perfect-lips') },
    { id: 'perfect-eyeliners', name: 'Perfect Eyes', hint: techniqueOf('perfect-eyeliners'), durationMin: 90, price: findPrice(PRICING_PMU, 'perfect-eyeliners') },
    {
      id: 'korekta',
      name: KOREKTA.name,
      durationMin: 60,
      price: KOREKTA.price,
      /* D5: termin korekty z briefu. */
      priceNote: KOREKTA.timing,
    },
    {
      id: 'odswiezenie',
      name: 'Odświeżenie (Refresh)',
      durationMin: 90,
      price: priceFrom(PRICING_REFRESH),
      /* D5: warunek z grafiki przy każdej cenie odświeżenia. */
      priceNote: `${PRICING_REFRESH.condition}. Cena zależy od czasu od ostatniego zabiegu`,
    },
    {
      id: 'usuwanie',
      name: 'Usuwanie – laser / remover',
      durationMin: 45,
      /* D5: cena dla wszystkich („od 200 zł”), stawka 100 zł tylko z warunkiem. */
      price: priceFrom(PRICING_REMOVAL),
      priceNote: ['Cena zależy od strefy i wielkości', ownClientsNote(PRICING_REMOVAL)].filter(Boolean).join('. '),
    },
  ].map((t) => Object.freeze({ durationConfirmed: false, ...t }))
);

export const TREATMENT_IDS = Object.freeze(TREATMENTS.map((t) => t.id));

/** @param {string} id */
export function getTreatment(id) {
  return TREATMENTS.find((t) => t.id === id) || null;
}

/**
 * Czas zabiegu do pokazania klientce – tylko potwierdzony źródłem (D6), inaczej null.
 * @param {{ durationMin: number, durationConfirmed?: boolean } | null | undefined} treatment
 */
export function shownDurationMin(treatment) {
  return treatment && treatment.durationConfirmed ? treatment.durationMin : null;
}

/** Adres salonu do wydarzenia i pliku .ics (tylko pola, które są uzupełnione w site.js). */
export const SALON_LOCATION = [
  CONTACT.venue,
  CONTACT.street,
  [CONTACT.postal, CONTACT.city].filter(Boolean).join(' '),
]
  .filter(Boolean)
  .join(', ');
