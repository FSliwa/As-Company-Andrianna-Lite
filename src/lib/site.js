/**
 * Jedno źródło prawdy dla treści serwisu.
 *
 * Wszystkie liczby, ceny i fakty pochodzą z materiałów marki
 * (folder /Graphics — cenniki, grafiki kursowe), z briefu klientki
 * (najnowszy tekst, wrzesień 2026) albo z wcześniejszej treści serwisu.
 * Nie dopisujemy tu danych „z głowy”.
 *
 * D1: gdy brief i starsze grafiki się różnią — obowiązuje BRIEF (najnowszy
 * tekst klientki). Ceny zabiegów — z cenników (brief ich nie podaje).
 * D3: obietnic zdrowotnych nie wzmacniamy — brzmienia ostrożne („z minimalnym
 * dyskomfortem”, „dbamy o to, by…”, „ok. 80%”).
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
  /* D7: rola po polsku wg briefu („Linergista, Trener, Prelegent oraz Sędzia w dziedzinie
     makijażu permanentnego międzynarodowego poziomu”), po korekcie językowej. */
  rolePl: 'Linergistka, trenerka, prelegentka oraz sędzia w dziedzinie makijażu permanentnego na poziomie międzynarodowym',
  signature: 'Autorka techniki Super Natural Brows',
  /* D7: podia Mistrzostw Świata — kategorie i miejsca dokładnie wg briefu: włos maszynowy
     2 razy (1. i 2. miejsce), brwi pudrowe 2 razy (1. miejsce), usta (1. miejsce) = 5 podiów
     (ACHIEVEMENTS[0] „5×”). */
  podiums: [
    { category: 'Włos maszynowy', result: '1. i 2. miejsce' },
    { category: 'Brwi pudrowe', result: '2 × 1. miejsce' },
    { category: 'Usta', result: '1. miejsce' },
  ],
  /* D7: fakty z briefu (sekcja „Opis”), zdania gotowe do /o-nas i skrótów na stronie głównej.
     D3: „bez bólu, bez blizn i migracji pigmentu” → „z minimalnym dyskomfortem i dbałością…”;
     „80% wygojenia” → „ok. 80%”; superlatyw „najbardziej wybierany salon na Śląsku” złagodzony. */
  facts: {
    pigmentations: 'Wykonała tysiące pigmentacji dla klientek.',
    students: 'Przeszkoliła setki kursantek z różnych technik — w ostatnim roku ponad 100 z samej techniki włosa maszynowego.',
    techniques: 'Twórczyni szybkich, naturalnych technik makijażu permanentnego brwi i ust — z wygojeniem na poziomie ok. 80%.',
    snb: 'Autorka techniki Super Natural Brows — włosa maszynowego bez kompromisu między jakością a szybkością.',
    treatmentTime:
      'Jej kursantki wykonują pigmentację na wysokim poziomie w 2–2,5 godziny, a ona sama wykonuje włos maszynowy w 1,5–2 godziny — z minimalnym dyskomfortem i z dbałością o to, by nie powstawały blizny, a pigment nie migrował z czasem.',
    katowice: 'Przez 7 lat prowadziła w Katowicach salon makijażu permanentnego, któremu zaufały klientki z całego Śląska — z listą oczekiwania na zabieg ponad pół roku.',
    warsaw: 'Od 3 lat prowadzi salon i akademię makijażu permanentnego w Warszawie, wykonując pigmentacje i szkoląc osoby z różnych zakątków Polski i świata.',
    abroad: 'Jest zapraszana za granicę na pokazy, master classy i kursy — ma już ponad 50 kursantek za granicą.',
    learning: 'Sama przeszła bardzo wiele szkoleń, konferencji i pokazów światowych liderek branży, a dziś sama jest na tym poziomie.',
    speaker: 'Często występuje na czołowych wydarzeniach branżowych jako Prime Speaker i prelegentka na scenie.',
  },
};

/**
 * SALON I AKADEMIA — tekst „Salon” z briefu (D7) po korekcie językowej, do /o-nas.
 * D3: „życzenie, które spełniamy w 100%” → „dążymy do tego, by spełnić je w pełni”;
 * superlatyw „najbardziej realistyczny efekt w świecie PMU” → „jak najbardziej realistyczny”.
 * Zdjęć salonu i parkingu brak w /Graphics — materiał do dostarczenia przez klientkę.
 * `charity` służy też na /uslugi zamiast „darmowej konsultacji” (D6 — deklaracja bez źródła).
 */
export const SALON = {
  name: 'Babushkina Academy',
  intro:
    'Akademia i salon makijażu permanentnego „Babushkina Academy” w Warszawie to prestiżowe, starannie wykończone studio w wolnostojącym budynku z prywatnym parkingiem dla klientów. Każdy poczuje się tu profesjonalnie zaopiekowany, upiększony i wysłuchany przez specjalistę.',
  approach: 'Stawiamy na sztukę piękna opartą na naturalności, subtelności i podkreśleniu indywidualnej urody każdej klientki.',
  confidence:
    'Technikami makijażu permanentnego dodajemy kobietom i mężczyznom pewności siebie i radości z odbicia w lustrze, uzupełniamy niedoskonałości wynikające z natury lub przebytych chorób.',
  charity:
    'Charytatywnie opiekujemy się osobami, które straciły włoski w wyniku chorób onkologicznych — tworzymy brwi od nowa na najbardziej wymagającym płótnie: twarzach klientów, którzy nam zaufali.',
  brows:
    '„Proszę zrobić brwi tak, żeby nikt nie zauważył, że były robione” — dążymy do tego, by spełnić to życzenie w pełni. Specjalizujemy się w uzyskaniu jak najbardziej realistycznego efektu dzięki technice włosa maszynowego Super Natural Brows.',
  powder: 'Wykonujemy również technikę pudrową lub combo — dla osób, które chcą mocniej podkreślić kształt brwi, ale nadal w naturalnej wersji.',
  lips:
    'Dbamy o to, by makijaż permanentny ust był na tyle subtelny, żeby klientki zawsze czuły się z nim komfortowo. Dobieramy kolor do natury, wyrównujemy koloryt, dodajemy świeżości i podkreślamy kształt — bez konturów, bez przesady, bez wyraźnych odcieni.',
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
  /* D4: brief — „(Tutaj link na online w sklepie)”, ale produktu-kursu w sklepie brak
     (sprawdzone 29.09.2026). Do czasu podania adresu przez klientkę: null → przycisk
     „Zapytaj o dostęp” (formularz), bez zmyślonego linku. */
  perfectLipsCourse: null,
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
      /* D4: nazwy kursów wg briefu; kotwice program-<id> z COURSES (id bez zmian). */
      { label: 'Kurs dla linergistek', href: '/szkolenia#program-super-natural-brows' },
      { label: 'Kurs od podstaw', href: '/szkolenia#program-kurs-podstawowy' },
      /* D4: nowe kursy z briefu — na końcu listy (tłumaczenia EN/RU nakładają się po indeksie). */
      { label: 'Master Class SNB Expert', href: '/szkolenia#program-snb-expert' },
      { label: 'Kurs online Perfect Lips', href: '/szkolenia#program-perfect-lips-online' },
      { label: 'Kurs szyty na miarę', href: '/szkolenia#program-szyty-na-miare' },
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

/**
 * Osiągnięcia — liczby z briefu (sekcja „Opis”, D7). Kolejność i liczba pozycji bez zmian:
 * widoki sięgają po indeksie (ACHIEVEMENTS[0], [1], [3]), tłumaczenia też.
 * „10 lat” = 7 lat salonu w Katowicach + 3 lata w Warszawie (brief podaje oba okresy osobno —
 * suma do potwierdzenia przez klientkę; podpis pokazuje składniki).
 */
export const ACHIEVEMENTS = [
  { value: '5×', label: 'I i II miejsce na Mistrzostwach Świata' },
  { value: '100+', label: 'Kursantek z włosa maszynowego w ostatnim roku' },
  { value: '50+', label: 'Kursantek za granicą' },
  { value: '10 lat', label: 'Salonów: 7 lat w Katowicach, 3 w Warszawie' },
];

/**
 * CENNIK PMU — ceny 1:1 z grafiki „CENNIK PMU 1/3”; nazwy technik wg briefu (D2).
 * `id` = identyfikator zabiegu w rezerwacji (src/lib/booking/config.js) — stały, żeby nie
 * psuć linków ?zabieg=; zmieniają się tylko nazwy widoczne. `technique` — opis techniki
 * z briefu (do podpisów w widokach; PriceRow go nie pokazuje).
 */
export const PRICING_PMU = {
  title: 'Cennik PMU',
  subtitle: 'Brwi · Usta · Linia zagęszczająca',
  items: [
    { id: 'super-natural-brows', name: 'Super Natural Brows', technique: 'Włos maszynowy', price: '1700 zł' },
    /* D2: brief — „Pudrowa technika „Perfect brows””; grafika cennika: „Perfect Powder Brows”. */
    { id: 'perfect-powder-brows', name: 'Perfect Brows', technique: 'Technika pudrowa', price: '1700 zł' },
    { id: 'perfect-lips', name: 'Perfect Lips', technique: 'Usta permanentne', price: '1700 zł' },
    /* D2: brief — „Pigmentacja linii „Perfect eyes”” (bez kreski, bez ogonka); grafika: „Perfect Eyeliners”. */
    { id: 'perfect-eyeliners', name: 'Perfect Eyes', technique: 'Pigmentacja linii rzęs', price: '1500 zł' },
    {
      id: 'korekta',
      name: 'Korekta do 3 miesięcy',
      /* D5: termin z briefu („Robi się po miesiącu do 3 od pierwotnego zabiegu”). */
      note: 'Od miesiąca do 3 miesięcy po zabiegu, niezależnie od strefy',
      timing: 'Od miesiąca do 3 miesięcy od zabiegu',
      price: '500 zł',
    },
  ],
  /* Dopisek z grafiki po korekcie językowej („Korekta wykonuje się…” → „Korektę wykonuje się…”). */
  footnote:
    'Korektę wykonuje się na życzenie klientki; jest obowiązkowa przy pracy na skórze tłustej, porowatej, z resztkami starego makijażu permanentnego lub po usuwaniu.',
};

/** CENNIK REFRESH — grafika „CENNIK REFRESH 2/3” (pasek „ODŚWIEŻENIE DLA MOICH KLIENTEK”). */
export const PRICING_REFRESH = {
  title: 'Refresh',
  /* D5: warunek z grafiki zapisany jednoznacznie — wszędzie, gdzie stoi cena odświeżenia
     (zamiast „stałych”/„moich” klientek). `condition` do podpisów przy cenie (karty, rezerwacja). */
  subtitle: 'Odświeżenie dla klientek, którym wykonałyśmy makijaż permanentny',
  condition: 'Dla klientek, którym wykonałyśmy makijaż permanentny',
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
    /* D5: stawka tylko dla naszych klientek — `forOwnClients` wyklucza ją z ceny „od …”
       pokazywanej wszystkim (rezerwacja, karty); podawana osobno z warunkiem. */
    { name: 'Usuwanie brwi dla moich klientek', price: '100 zł', forOwnClients: true },
    { name: 'Usuwanie małego tatuażu', price: '250 zł' },
    { name: 'Usuwanie średniego tatuażu', price: '400 zł' },
    { name: 'Usuwanie dużego tatuażu', note: 'Wycena indywidualna', price: '> 500 zł' },
  ],
};

/**
 * SZKOLENIA — kursy wg briefu (D4), program i ceny netto z grafik kursowych Babushkina Academy.
 * Kolejność: istniejące pozycje bez zmian, nowe z briefu na końcu (tłumaczenia nakładają się
 * po indeksie). `id` stałe — kotwice #program-<id> i linki w menu.
 *
 * Pola (wszystkie kursy):
 *  title       — krótka nazwa (wiersze cennika, formularz),
 *  type        — rodzaj kursu wg briefu („Kurs dla linergistek”, „Master Class”…),
 *  fullTitle   — pełna nazwa z briefu (nagłówki, JSON-LD, temat zapytania),
 *  level       — poziom zaawansowania (brief), audience — dla kogo (brief) albo null,
 *  requirements — warunek udziału (tylko Master Class), group — wielkość grupy (brief) albo null,
 *  mode        — 'blended' (online + stacjonarnie) | 'online' | null (nieokreślony),
 *  price       — kwota albo null (brak ceny w źródłach), priceNote — 'netto' tylko tam, gdzie
 *                podaje je plakat; '' gdy źródło nie mówi netto/brutto,
 *  format, lead, program (pusta lista, gdy źródła nie podają programu — nie wymyślamy),
 *  posters     — plakaty z /Graphics: { index: pozycja w COURSE z src/lib/media.js
 *                (course-0N.jpg → N−1), caption } — do „Oferty do pobrania” (D8),
 *  cta         — etykieta przycisku („Zapytaj o termin” / „Zapytaj o dostęp”),
 *  requiresContact — true: rezerwacja tylko po wstępnym kontakcie (brief),
 *  home        — true: pozycja w cenniku szkoleń na stronie głównej (maks. 3, D4).
 */
export const COURSES = [
  {
    id: 'super-natural-brows',
    title: 'Super Natural Brows',
    /* D4: nazwa, poziom, grupa wg briefu (Kurs dla Linergistek „SUPERNATURAL BROWS”). */
    type: 'Kurs dla linergistek',
    fullTitle: 'Kurs dla linergistek „Super Natural Brows”',
    kicker: 'Maszynowy włos',
    level: 'Poziom podstawowy lub średniozaawansowany',
    audience:
      'Dla osób, które wykonują już makijaż permanentny techniką pudrową, oraz dla tych, które pracują już włosem, ale wciąż nie czują się pewnie.',
    requirements: null,
    group: '2–4 osoby',
    mode: 'blended',
    price: '7 000 zł',
    priceNote: 'netto', // plakat course-03: „CENA 7 000 zł netto”
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
    posters: [
      { index: 1, caption: 'Plakat' },
      { index: 0, caption: 'Program' },
      { index: 2, caption: 'Zakres i cena' },
    ],
    cta: 'Zapytaj o termin',
    requiresContact: false,
    home: true,
  },
  {
    id: 'kurs-podstawowy',
    /* D4/D1: nazwa wg briefu (Kurs od podstaw „BASIC SUPERNATURAL BROWS”);
       grafiki course-04…07: „Super Natural Brows — kurs podstawowy”. */
    title: 'Basic Super Natural Brows',
    type: 'Kurs od podstaw',
    fullTitle: 'Kurs od podstaw „Basic Super Natural Brows”',
    kicker: 'Od zera do pierwszych klientek',
    level: 'Od zera lub poziom podstawowy',
    audience: 'Dla osób początkujących w świecie PMU oraz dla linergistek, które potrzebują więcej praktyki.',
    requirements: null,
    group: '2–3 osoby',
    mode: 'blended',
    price: '15 000 zł',
    priceNote: 'netto', // plakat course-05: „CENA 15 000 zł netto”
    /* D1: brief podaje 30 dni online (grafiki course-04 i course-06: 16 dni) — obowiązuje brief. */
    format: '30 dni online + 4 dni stacjonarnie',
    lead: 'Kurs od zera dla początkujących w świecie PMU oraz dla linergistek, które potrzebują więcej praktyki. Już po nim zaczniesz pracę z klientkami.',
    program: [
      /* D1: 30 dni wg briefu; „40–60 minut dziennie” z harmonogramu 16-dniowego (course-06) — do potwierdzenia. */
      { label: '30 dni online przygotowania', detail: '40–60 minut dziennie. Ćwiczysz w dowolnym czasie, wypełniając skrypt i oglądając filmy instruktażowe. Wyślemy do Ciebie paczkę ze skryptem teoretycznym, zeszytem ćwiczeniowym, akcesoriami do ćwiczeń i maszynką.' },
      { label: '4 dni stacjonarnej praktyki', detail: 'Przed rozpoczęciem praktycznej części sprawdzamy zadania domowe i zaliczamy egzamin teoretyczny, potem intensywne ćwiczenia na skórkach i modelkach.' },
      { label: '2 modelki pokazowe', detail: '1 online + 1 na żywo.' },
      { label: '4 modelki dla praktyki', detail: 'O różnych skórach i układach włosków.' },
      { label: 'Perfekcyjny rysunek wstępny', detail: 'Nauczysz się robić go szybko i sprawnie.' },
      { label: 'Prawidłowy ruch i ładne wygojenia', detail: 'Już po podstawowym szkoleniu zaczniesz pracę z klientkami.' },
    ],
    /* Uwaga: plakaty course-04 i course-06 mówią o 16 dniach online (brief: 30) — nowe grafiki od klientki. */
    posters: [
      { index: 6, caption: 'Plakat' },
      { index: 3, caption: 'Program' },
      { index: 4, caption: 'Zakres i cena' },
      { index: 5, caption: 'Harmonogram' },
    ],
    cta: 'Zapytaj o termin',
    requiresContact: false,
    home: true,
  },
  /* ---- D4: kursy z briefu, których wcześniej nie było (bez grafik i bez programu w źródłach) ---- */
  {
    id: 'snb-expert',
    title: 'SNB Expert',
    type: 'Master Class',
    fullTitle: 'Master Class „SNB Expert”',
    kicker: 'Poziom zaawansowany',
    level: 'Poziom zaawansowany',
    audience:
      'Dla osób, które od co najmniej roku stale wykonują włos maszynowy na klientkach, oraz dla absolwentek naszego kursu dla linergistek — jako podwyższenie kwalifikacji.',
    requirements:
      'Minimum rok ciągłej pracy włosem maszynowym na klientkach albo ukończony kurs dla linergistek „Super Natural Brows” w Babushkina Academy.',
    group: '3–4 osoby',
    mode: 'blended',
    price: '5 000 zł',
    priceNote: '', // D4: brief nie podaje netto/brutto
    format: '7 dni online + 1 dzień stacjonarnie',
    lead: 'Master Class na poziomie zaawansowanym — podwyższenie kwalifikacji w technice włosa maszynowego Super Natural Brows.',
    program: [],
    posters: [],
    cta: 'Zapytaj o termin',
    /* Brief: „Na niektóre szkolenia wymagamy potwierdzenia waszych umiejętności i rezerwacja
       odbywa się tylko po wstępnym kontakcie” — tu warunek doświadczenia jest wprost. */
    requiresContact: true,
    /* Master Class «Efekt lami» z plakatów (korzyść „tylko dla naszych kursantek”) to NIE ten kurs. */
    home: true,
  },
  {
    id: 'perfect-lips-online',
    title: 'Perfect Lips',
    type: 'Kurs online',
    /* Pełna nazwa odróżnia kurs (1500 zł) od zabiegu Perfect Lips (1700 zł). */
    fullTitle: 'Kurs online „Perfect Lips”',
    kicker: 'Kurs online',
    level: 'Każdy poziom',
    audience: null,
    requirements: null,
    group: null,
    mode: 'online',
    price: '1 500 zł',
    priceNote: '', // D4: brief nie podaje netto/brutto
    format: 'Ponad 20 filmów do obejrzenia w dowolnym czasie i miejscu',
    lead: 'Cała esencja wiedzy Andriany Babushkiny o makijażu permanentnym ust w ponad 20 filmach, które obejrzysz w dowolnym czasie i miejscu.',
    program: [],
    posters: [],
    /* D4: produktu w sklepie brak (SHOP.perfectLipsCourse = null) → zapytanie, bez linku. */
    cta: 'Zapytaj o dostęp',
    requiresContact: false,
    home: false,
  },
  {
    id: 'szyty-na-miare',
    title: 'Szyty na miarę',
    type: 'Kurs',
    fullTitle: 'Kurs „Szyty na miarę”',
    kicker: 'Każda technika, każda strefa',
    level: 'Każdy poziom',
    audience: null,
    requirements: null,
    group: null,
    mode: null,
    price: null, // brief nie podaje ceny — budżet ustalany indywidualnie
    priceNote: '',
    format: 'Harmonogram, program i budżet dopasowane indywidualnie',
    lead: 'Każdy poziom, każda technika i każda strefa pigmentacji — w harmonogramie, programie i budżecie dopasowanych do Ciebie.',
    program: [],
    posters: [],
    cta: 'Zapytaj o termin',
    requiresContact: false,
    home: false,
  },
];

/**
 * Wstęp do szkoleń — sekcja „Szkolenia” briefu po korekcie językowej (D4).
 * D3: „szybko, komfortowo, bezboleśnie i bezpiecznie” → „…z minimalnym dyskomfortem”.
 * `booking` — informacja z briefu o rezerwacji po wstępnym kontakcie (przy kursach z requiresContact).
 */
export const TRAINING_INTRO = {
  system:
    'System szkoleniowy stworzony z dbałością o kursantki — ich karierę, aktywny rozwój w branży PMU, rzetelną naukę i praktyczne stosowanie nawyków w pracy z klientkami.',
  practice:
    'Nasze programy zawsze opierają się na dużej ilości praktyki: pomagają przełamać lęk przed pracą z klientkami, poszerzyć wiedzę i skutecznie wykorzystać ją w pracy.',
  how: 'Uczymy nie tylko, jak wykonać jakościowy zabieg, ale też jak zrobić go szybko, komfortowo, bezpiecznie i z minimalnym dyskomfortem dla klientki.',
  levels: 'Kursy są podzielone na poziomy zaawansowania, żeby każda osoba mogła dobrać ofertę idealną dla siebie.',
  booking: 'Na niektóre szkolenia wymagamy potwierdzenia umiejętności — rezerwacja odbywa się wtedy tylko po wstępnym kontakcie.',
  snbLine:
    'Super Natural Brows — maszynowy włos: jakościowo, szybko, profesjonalnie. Dla tych, którzy chcą ciągłego rozwoju, wielu klientek, wyższych dochodów i wyróżnienia się na rynku PMU.',
};

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
    /* D9: deklaracja REACH w brzmieniu sklepu klientki („pigmenty zgodne z rozporządzeniem REACH”),
       bez rozszerzania na inne linie; „dokumentacja, której wymaga gabinet” — bez źródła, usunięte. */
    desc: 'Pigmenty zgodne z rozporządzeniem REACH, karty charakterystyki i dokumentacja produktów.',
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
