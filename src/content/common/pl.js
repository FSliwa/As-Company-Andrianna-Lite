/**
 * Wspólne teksty interfejsu (nagłówek, menu, stopka, pasek CTA, przełącznik języka,
 * prymitywy z src/components/as/Primitives.jsx, dialogi, 404) – PL = źródło.
 * en.js / ru.js to nakładki z tymi samymi kluczami. Użycie: useContent(common).
 */
const common = {
  skipLink: 'Przejdź do treści',
  homeAria: 'Babushkina Academy – strona główna',
  mainNavAria: 'Nawigacja główna',
  book: 'Umów wizytę',
  menuOpen: 'Otwórz menu',
  menuClose: 'Zamknij menu',
  /* etykieta przycisku i listy podkategorii w nawigacji (np. „Podkategorie: Produkty”) */
  subnav: 'Podkategorie',
  menuAria: 'Menu',
  shortcutsAria: 'Skróty',
  languageAria: 'Język',
  more: 'Więcej',
  less: 'Zwiń',
  close: 'Zamknij',
  rights: 'Wszystkie prawa zastrzeżone.',
  privacy: 'Polityka prywatności',
  nip: 'NIP',
  stickyTraining: 'Szkolenia',
  goTo: 'Przejdź:',
  closingLabel: 'Kontakt',
  requiredLegend: 'Pola oznaczone * są wymagane.',
  /* klauzula pod formularzami i przy rezerwacji (FormNotice, BookingNotice): zdanie o administratorze
     ze znacznikami danych firmy – składnia jak w dokumentach prawnych (src/lib/legal.js): bez danych
     firmy marka + miasto + Instagram, po uzupełnieniu site.js pełna nazwa, adres i e-mail */
  noticeController: 'Administratorem danych jest {company}, {seat} (kontakt:[[ {privacyEmail} lub]] Instagram {instagram}).',
  noticePurpose: 'Dane z formularza przetwarzamy, by odpowiedzieć na zapytanie i – jeśli o to poprosisz – przygotować ofertę.',
  /* zdania z linkiem: pre + <link> + post */
  noticePrivacy: { pre: 'Więcej w ', link: 'Polityce prywatności', post: '.' },
  noticeTerms: { pre: 'Zasady korzystania z formularzy opisuje ', link: 'Regulamin', post: '.' },
  /* klauzula pod przyciskiem rezerwacji (BookingNotice); {button} = etykieta przycisku */
  bookingPurpose:
    'Dane z formularza przetwarzamy, by zarezerwować i obsłużyć Twoją wizytę; termin z danymi kontaktowymi zapisujemy w Kalendarzu Google salonu.',
  bookingTerms: {
    pre: 'Klikając „{button}”, akceptujesz ',
    link: 'Regulamin',
    post: ' – zasady rezerwacji, zmiany i odwołania wizyty opisują jego pkt 9–10.',
  },
  bookingTurnstile: { pre: 'Formularz chroni Cloudflare Turnstile – szczegóły w ', link: 'Polityce cookies', post: '.' },
  documents: 'Dokumenty',
  cookiesPolicy: 'Polityka cookies',
  terms: 'Regulamin',
  cookieSettings: 'Ustawienia cookies',
  notFound: {
    metaTitle: 'Nie znaleziono strony',
    label: 'Nie znaleziono',
    title: 'Tej strony',
    accent: 'nie ma.',
    body: 'Adres mógł się zmienić albo strona została przeniesiona. Zacznij od strony głównej albo napisz do nas – pomożemy znaleźć to, czego szukasz.',
    home: 'Strona główna',
    contact: 'Kontakt',
  },
};

export default common;
