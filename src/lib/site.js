/**
 * Jedno źródło prawdy dla treści serwisu.
 *
 * Wszystkie liczby, ceny i fakty pochodzą z materiałów marki
 * (folder /Graphics — cenniki, grafiki kursowe) albo z wcześniejszej
 * treści serwisu. Nie dopisujemy tu danych „z głowy”.
 *
 * ⚠️ POLA OZNACZONE `TODO` TRZEBA UZUPEŁNIĆ PRAWDZIWYMI DANYMI —
 *    do czasu uzupełnienia nie są wyświetlane na stronie.
 */

export const BRAND = {
  name: 'AS COMPANY',
  full: 'AS COMPANY LOVELINESS',
  academy: 'Babushkina Academy',
  tagline: 'Beauty with precision.',
  claim: 'Profesjonalne produkty PMU, edukacja i doświadczenie tworzone przez praktyków.',
  city: 'Warszawa',
};

export const FOUNDER = {
  name: 'Andriana Babushkina',
  role: 'International PMU Trainer & Judge',
  signature: 'Autorka techniki Super Natural Brows',
};

/** Dane kontaktowe — uzupełnij TODO przed publikacją. */
export const CONTACT = {
  city: 'Warszawa',
  venue: 'Babushkina Academy',
  venueNote: 'Wolnostojący budynek z prywatnym parkingiem dla klientów',
  street: null, // TODO: dokładny adres (ulica i numer)
  postal: null, // TODO: kod pocztowy
  phone: null, // TODO: numer telefonu w formacie +48 XXX XXX XXX
  email: null, // TODO: adres e-mail
  instagram: 'https://www.instagram.com/andriana_babushkina/',
  instagramHandle: '@andriana_babushkina',
  /* Godziny 10–19 nie mają źródła (obecny serwis klienta podaje 10–18).
     Do czasu potwierdzenia przez klienta pokazujemy tylko tryb umawiania. */
  hours: [{ day: 'Wizyty i szkolenia', value: 'Po wcześniejszym umówieniu' }],
  // hoursToConfirm: Pon–Pt 10:00–19:00 · Sobota: terminy szkoleniowe · Niedziela: nieczynne
};

/**
 * Adres serwisu (canonical, sitemap, OG). Ustawiany przy wdrożeniu przez
 * NEXT_PUBLIC_SITE_URL — domena docelowa czeka na decyzję klienta
 * (dziś pod as-loveliness.eu działa sklep WooCommerce).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://as-loveliness.eu').replace(/\/$/, '');

/**
 * Rezerwacja online (Kalendarz Google) — cel wszystkich przycisków „Umów wizytę”.
 * BOOKING_ENABLED wylicza next.config.mjs w chwili buildu z tych samych zmiennych
 * co src/lib/booking/provider.js. Bez skonfigurowanego kalendarza przyciski prowadzą
 * do formularza kontaktowego — strona rezerwacji pokazałaby tylko „chwilowo
 * niedostępna”. Po ustawieniu zmiennych na hostingu i Redeploy przełączają się same.
 */
export const BOOKING_ENABLED = process.env.NEXT_PUBLIC_BOOKING_ENABLED === '1';
export const BOOKING_PAGE = '/umow-wizyte';
export const BOOKING_URL = BOOKING_ENABLED ? BOOKING_PAGE : '/kontakt';

/**
 * Sklep internetowy klienta (WooCommerce) — produkty kupuje się tam.
 * Adresy sprawdzone 29.09.2026; zmienią się, jeśli sklep przeniesie się
 * na subdomenę (decyzja klienta).
 */
export const SHOP = {
  url: 'https://as-loveliness.eu/shop/',
  browPigments: 'https://as-loveliness.eu/pigmenty-do-brwi/',
  lipPigments: 'https://as-loveliness.eu/pigmenty-do-ust/',
  linerPigments: 'https://as-loveliness.eu/pigmenty-do-kresek/',
  machine: 'https://as-loveliness.eu/maszynka/',
  rental: 'https://as-loveliness.eu/wspolpraca-wynajem/',
};

/**
 * Dane prawne — do uzupełnienia przez klienta (art. 5 u.ś.u.d.e., art. 13 RODO).
 * Dopóki pola są null, stopka nie pokazuje wiersza „Dane firmy", klauzula
 * pod formularzami się nie renderuje, a /polityka-prywatnosci zwraca 404.
 */
export const LEGAL = {
  company: null, // pełna nazwa z rejestru, np. „… sp. z o.o." albo imię i nazwisko + nazwa firmy z CEIDG
  address: null, // adres siedziby
  nip: null,
  register: null, // np. „KRS 0000…, Sąd Rejonowy …" albo „CEIDG"
  privacyEmail: null, // e-mail do spraw danych osobowych
  privacyPolicy: null, // treść polityki prywatności: [{ heading, body }] — zatwierdzona przez klienta
};

/** Nawigacja główna (układ jak w makiecie: 5 pozycji + CTA). */
export const NAV_MAIN = [
  { label: 'Produkty', href: '/pigmenty' },
  { label: 'Szkolenia', href: '/szkolenia' },
  { label: 'Zabiegi', href: '/uslugi' },
  { label: 'O nas', href: '/o-nas' },
  { label: 'Kontakt', href: '/kontakt' },
];

/** Pełna mapa serwisu — menu rozwijane i stopka. */
export const NAV_ALL = [
  {
    title: 'Produkty',
    links: [
      { label: 'Pigmenty AS OPIUM', href: '/pigmenty' },
      { label: 'Maszynki AS PRINCESS & AS HERO', href: '/maszynki' },
      { label: 'Certyfikaty i zgodność REACH', href: '/certyfikaty' },
    ],
  },
  {
    title: 'Edukacja',
    links: [
      { label: 'Szkolenia', href: '/szkolenia' },
      { label: 'Super Natural Brows', href: '/szkolenia#program-super-natural-brows' },
      { label: 'Kurs podstawowy', href: '/szkolenia#program-kurs-podstawowy' },
    ],
  },
  {
    title: 'Studio',
    links: [
      { label: 'Zabiegi i cennik', href: '/uslugi' },
      { label: 'Ścieżka zabiegowa', href: '/pakiety' },
      { label: 'O nas i salon', href: '/o-nas' },
      { label: 'Kontakt', href: '/kontakt' },
    ],
  },
];

/** Osiągnięcia — przeniesione z dotychczasowej treści serwisu. */
export const ACHIEVEMENTS = [
  { value: '5×', label: 'I i II miejsce na Mistrzostwach Świata' },
  { value: '100+', label: 'Kursantek szkolonych z włosa w ostatnim roku' },
  { value: '50+', label: 'Kursantek w bazie zagranicznej' },
  { value: '10 lat', label: 'Prowadzenia salonów — Katowice i Warszawa' },
];

/**
 * CENNIK PMU — dane 1:1 z grafiki „CENNIK PMU 1/3”.
 */
export const PRICING_PMU = {
  title: 'Cennik PMU',
  subtitle: 'Brwi · Usta · Linia zagęszczająca',
  items: [
    { name: 'Super Natural Brows', price: '1700 zł' },
    { name: 'Perfect Powder Brows', price: '1700 zł' },
    { name: 'Perfect Lips', price: '1700 zł' },
    { name: 'Perfect Eyeliners', price: '1500 zł' },
    {
      name: 'Korekta do 3 miesięcy',
      note: 'Niezależnie od strefy pigmentacji',
      price: '500 zł',
    },
  ],
  footnote:
    'Korekta wykonuje się na życzenie klientki lub jest obowiązkowa w przypadku pracy na skórze: tłustej, porowatej, z resztkami starego makijażu permanentnego, po usuwaniu.',
};

/** CENNIK REFRESH — grafika „CENNIK REFRESH 2/3”. */
export const PRICING_REFRESH = {
  title: 'Refresh',
  subtitle: 'Odświeżenie dla moich klientek',
  items: [
    { name: 'Odświeżenie do 1,5 roku', note: 'Niezależnie od strefy pigmentacji', price: '850 zł' },
    { name: 'Odświeżenie do 3 lat', note: 'Niezależnie od strefy pigmentacji', price: '1000 zł' },
    { name: 'Odświeżenie po 3 latach', note: 'Niezależnie od strefy pigmentacji', price: '1200 zł' },
  ],
};

/** CENNIK USUWANIE — grafika „CENNIK USUWANIE 3/3”. */
export const PRICING_REMOVAL = {
  title: 'Usuwanie',
  subtitle: 'Laser / remover',
  items: [
    { name: 'Usuwanie PMU brwi', note: 'Laser / remover', price: '400 zł' },
    { name: 'Usuwanie PMU ust', note: 'Laser / remover', price: '400 zł' },
    { name: 'Usuwanie końcówek kresek', note: 'Laser / remover', price: '200 zł' },
    { name: 'Usuwanie brwi dla moich klientek', price: '100 zł' },
    { name: 'Usuwanie małego tatuażu', price: '250 zł' },
    { name: 'Usuwanie średniego tatuażu', price: '400 zł' },
    { name: 'Usuwanie dużego tatuażu', note: 'Wycena indywidualna', price: '> 500 zł' },
  ],
};

/**
 * SZKOLENIA — dane 1:1 z grafik kursowych Babushkina Academy.
 */
export const COURSES = [
  {
    id: 'super-natural-brows',
    title: 'Super Natural Brows',
    kicker: 'Maszynowy włos',
    price: '7 000 zł',
    priceNote: 'netto',
    format: '14 dni online + 2 dni stacjonarnie',
    lead: 'Najbardziej wymagająca, nowoczesna i ekskluzywna technika, dzięki której w Twoim salonie zagości wiele klientek chcących korzystać z usługi standardu premium.',
    program: [
      { label: '14 dni online przygotowania', detail: 'Filmy instruktażowe w dostępie na zawsze. Skrypt z teorią oraz ćwiczeniami, notes i niezbędne akcesoria do efektywnej nauki otrzymasz 2 tygodnie przed kursem.' },
      { label: '2 dni stacjonarnej praktyki', detail: 'Egzamin teoretyczny, praktyka na skórkach, pokaz, praktyka na modelkach.' },
      { label: '2 modelki pokazowe', detail: 'Film całego zabiegu online i demonstracja na żywo.' },
      { label: '2 modelki dla praktyki', detail: 'O różnych skórach i schematach.' },
      { label: '2 sposoby na szybki rysunek wstępny', detail: null },
      { label: '3 schematy', detail: 'Ułożenia włosków i nauka tworzenia schematów.' },
    ],
  },
  {
    id: 'kurs-podstawowy',
    title: 'Super Natural Brows — Kurs podstawowy',
    kicker: 'Od zera do pierwszych klientek',
    price: '15 000 zł',
    priceNote: 'netto',
    format: '16 dni online + 4 dni stacjonarnie',
    lead: 'Pełny program dla osób startujących w PMU. Po podstawowym szkoleniu zaczniesz pracę z klientkami.',
    program: [
      { label: '16 dni online przygotowania', detail: '40–60 minut dziennie. Ćwiczysz w dowolnym czasie, wypełniając skrypt i oglądając filmy instruktażowe. Wyślemy do Ciebie paczkę ze skryptem teoretycznym, zeszytem ćwiczeniowym, akcesoriami do ćwiczeń i maszynką.' },
      { label: '4 dni stacjonarnej praktyki', detail: 'Przed rozpoczęciem praktycznej części sprawdzamy zadania domowe i zaliczamy egzamin teoretyczny, potem intensywne ćwiczenia na skórkach i modelkach.' },
      { label: '2 modelki pokazowe', detail: '1 online + 1 na żywo.' },
      { label: '4 modelki dla praktyki', detail: 'O różnych skórach i układach włosków.' },
      { label: 'Perfekcyjny rysunek wstępny', detail: 'Nauczysz się robić go szybko i sprawnie.' },
      { label: 'Prawidłowy ruch i ładne wygojenia', detail: 'Już po podstawowym szkoleniu zaczniesz pracę z klientkami.' },
    ],
  },
];

/** Korzyści wspólne dla obu programów — z grafik kursowych. */
export const COURSE_BENEFITS = [
  'System nauki zrozumiały dla każdego — nie musisz umieć malować, aby nauczyć się mojej techniki',
  'Nauka atrakcyjnych zdjęć i marketing',
  'Cena zabiegu i jej wpływ na klientki',
  'Poprawa postawy ręki i wykonania pięknego ruchu pudrowego',
  'Możliwość dalszego rozwoju na Master Classie «Efekt lami» i Warsztatach — dostępnych tylko dla moich kursantek',
  'Dożywotnia opieka i grupa wsparcia',
  'Możliwość zakupu niezbędnych produktów do PMU na miejscu i przetestowania maszyny AS Princess',
  'Lunch, napoje i przekąski zapewnione',
];

/** Harmonogram kursu podstawowego — grafika „HARMONOGRAM”. */
export const COURSE_SCHEDULE = [
  {
    day: '1 dzień stacjonarny',
    rows: [
      ['10:00', 'Spotkanie kursantek, kawa, znajomość, rozliczenie'],
      ['11:00', 'Egzamin teoretyczny, sprawdzenie i poprawa zadań domowych, odpowiedzi na pytania, wstęp szkoleniowy'],
      ['12:00', 'Praktyka na skórkach'],
      ['13:30', 'Lunch'],
      ['14:00', 'Praktyka na skórkach'],
      ['16:00', 'Pokazowa modelka na żywo'],
      ['18:00', 'Odpowiedzi na zapytania i zakończenie pierwszego dnia'],
    ],
  },
  {
    day: '2 dzień stacjonarny',
    rows: [
      ['10:00', 'Praktyka na skórkach'],
      ['13:00', 'Lunch'],
      ['13:30', 'Egzamin praktyczny na skórkach'],
      ['15:00', 'Modelka dla praktyki kursantki'],
      ['19:00', 'Odpowiedzi na zapytania i zakończenie drugiego dnia'],
    ],
  },
  {
    day: '3 dzień stacjonarny',
    rows: [
      ['10:00', 'Praktyka na skórkach'],
      ['11:00', 'Modelka dla praktyki kursantki'],
      ['14:30', 'Lunch'],
      ['15:00', 'Modelka dla praktyki kursantki'],
      ['18:00', 'Odpowiedzi na zapytania i zakończenie trzeciego dnia'],
    ],
  },
  {
    day: '4 dzień stacjonarny',
    rows: [
      ['10:00', 'Praktyka na skórkach'],
      ['11:00', 'Modelka dla praktyki kursantki'],
      ['14:00', 'Odpowiedzi na zapytania'],
      ['14:30', 'Lunch z szampanem i certyfikatami'],
      ['15:30', 'Obróbka zdjęć i marketing'],
      ['16:00', 'Zakupy, listy zakupowe'],
      ['16:30', 'Zakończenie szkolenia, zdjęcia i dodanie do grup wsparcia'],
    ],
  },
];

/** Linia produktowa dystrybuowana przez AS COMPANY. */
export const PRODUCT_LINES = [
  {
    id: 'pigmenty',
    number: '01',
    title: 'Pigmenty',
    href: '/pigmenty',
    desc: 'Starannie opracowane formuły, intensywne kolory i przewidywalne gojenie.',
    cta: 'Zobacz pigmenty',
  },
  {
    id: 'urzadzenia',
    number: '02',
    title: 'Urządzenia',
    href: '/maszynki',
    desc: 'Niezawodne maszyny PMU zaprojektowane z myślą o precyzji, komforcie i maksymalnej kontroli pracy.',
    cta: 'Zobacz urządzenia',
  },
  {
    id: 'certyfikaty',
    number: '03',
    title: 'Certyfikaty i jakość',
    href: '/certyfikaty',
    desc: 'Zgodność z REACH EU, karty produktów i dokumentacja, której wymaga profesjonalny gabinet.',
    cta: 'Zobacz certyfikaty',
  },
];

/** Filary marki — sekcja „More than permanent makeup”. */
export const PILLARS = [
  {
    number: '01',
    title: 'Produkty',
    desc: 'Profesjonalne narzędzia i pigmenty tworzone przez praktyków dla praktyków.',
    href: '/pigmenty',
  },
  {
    number: '02',
    title: 'Szkolenia',
    desc: 'Zaawansowane techniki i wsparcie od ekspertów z wieloletnim doświadczeniem.',
    href: '/szkolenia',
  },
  {
    number: '03',
    title: 'Praktyka',
    desc: 'Wszystko, co robimy, jest oparte na realnej pracy i realnych rezultatach.',
    href: '/uslugi',
  },
];

/** Filary szkoleń — sekcja „Szkolenia oparte na realnej praktyce”. */
export const TRAINING_PILLARS = [
  { number: '01', title: 'Technika', desc: 'Nowoczesne metody i zaawansowane procedury krok po kroku.' },
  { number: '02', title: 'Doświadczenie', desc: 'Wiedza oparta na latach praktyki i pracy z tysiącami klientek.' },
  { number: '03', title: 'Wsparcie', desc: 'Indywidualne podejście i pomoc również po zakończeniu szkolenia.' },
];
