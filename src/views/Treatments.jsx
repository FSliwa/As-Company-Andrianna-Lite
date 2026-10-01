'use client';

/**
 * ZABIEGI – /uslugi  („Numer 01")
 *
 * Każda sekcja to rozkładówka: SectionLabel → H2 .as-display-section → treść →
 * jedno wezwanie. Portret wyłącznie przez ROLES, makra wyłącznie przez MACROS
 * (src/lib/roles.js) – na tej trasie dokładnie sześć makr: cztery w pasie efektów
 * (03) i dwa przy technikach (02 – tylko przy technikach, które na zdjęciu znamy
 * na pewno: Super Natural Brows i Perfect Lips). Ceny zawsze z cennika marki
 * (PRICING_* w src/lib/site.js).
 *
 * Rytm tła: 01 hero (cream-50) → 02 techniki (cream-100, hairline) → 03 efekty
 * i wizyta (cream-75) → 04 odświeżenie i usuwanie (cream-50)
 * → 05 cennik #cennik (cream-100, hairline) → 06 pytania (cream-50, hairline)
 * → 07 cennik do pobrania (cream-100, hairline; D8 – miniatury grafik cennika)
 * → 08 ClosingCta (cream-90) + stopka (cream-200).
 * Złącza tekst–tekst 04 | 05 | 06 od lg ciaśniejsze (.as-section-tight*); przed
 * miniaturami 07 i przed pasem zamykającym pełny odstęp.
 * Kotwice (#zabiegi, #cennik, wiersze technik, karty 04): odstęp pod nagłówkiem
 * daje wyłącznie html { scroll-padding-top } (index.css) – bez scroll-mt na celach.
 *
 * Korekta (od miesiąca do 3 miesięcy od zabiegu – brief, D5) występuje jako
 * krok 03 wizyty (pas 03), więc sekcja 04 obejmuje tylko zabiegi, których
 * nie ma w indeksie ani w krokach.
 *
 * Treści wg decyzji D2/D3/D5/D6/D8 (komentarze przy miejscach): nazwy technik
 * wg briefu, obietnice zdrowotne nie mocniejsze niż dotąd, ceny z warunkami
 * z grafik cennika, czasy zabiegów tylko ze źródła (SNB 1,5–2 h – czas Andriany),
 * bez „konsultacji” jako osobnej usługi (źródła znają tylko rysunek wstępny).
 *
 * Telefon (< sm): opisy technik i zabiegów 04 przycięte do dwóch linii
 * z przyciskiem „Więcej” (aria-expanded), który rozwija pełny opis, cytat
 * techniki i notę ceny; zdjęcie techniki (02) stoi zawsze – pod tytułem, nad
 * opisem; wstępy sekcji 04/06 ukryte; tabele refresh i usuwania
 * zwinięte w <Faq> (< lg) – od lg stoją w pełni; link do Instagramu w 03 pod
 * stykówką (po treści, nie przed nią); pytania 06: cztery + MobileMore.
 * Tablet (md): wiersz techniki w dwóch kolumnach (numerał + tytuł ze zdjęciem
 * pod nim | opis + meta),
 * nagłówek 04 w dwóch kolumnach, kroki wizyty 2 + 1 (trzeci na całą szerokość),
 * cennik 05 w dwóch kolumnach (nagłówek + akordeony | cennik PMU).
 * Desktop (≥ lg) bez zmian.
 *
 * „Umów wizytę” prowadzi do rezerwacji online (/umow-wizyte, Kalendarz Google);
 * w wierszu techniki z już wybranym zabiegiem. Rezerwacja nie pyta o zdrowie
 * (art. 9 RODO) – o zdrowiu rozmawiamy w salonie. Obietnice zdrowotne
 * w brzmieniu zgodnym z FAQ tej strony, bez gwarancji.
 * ClosingCta ma tło cream-90 – stopka (cream-100) go domyka.
 */

import React from 'react';
import Link from '@/components/as/LocaleLink';
import { ChevronDown } from 'lucide-react';
import {
  ArrowLink,
  ClosingCta,
  CtaButton,
  Faq,
  Figure,
  GoldArc,
  MobileMore,
  NumberedItem,
  PageHero,
  PriceRow,
  ResultStrip,
  Reveal,
  SectionLabel,
} from '@/components/as/Primitives';
import {
  ACHIEVEMENTS,
  BOOKING_URL,
  CONTACT,
  FOUNDER,
  PRICING_PMU,
  PRICING_REFRESH,
  PRICING_REMOVAL,
  SALON,
} from '@/lib/site';
import { CENNIK } from '@/lib/media';
import { MACROS, ROLES } from '@/lib/roles';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Ceny – zawsze z cennika marki                                      */
/* ------------------------------------------------------------------ */

/* Zapis tekstów z cennika (site.js) na tej trasie: twarda spacja w tysiącach
   i przed „zł”, „> 500 zł” → „powyżej 500 zł” (Z24: grafika ma „>500 zł”, a „od”
   obejmowałoby też 500), głos „my” zamiast „moich klientek”.
   Źródło w site.js zostaje nietknięte; gdy tam się zmieni, reguły są no-op.
   Docelowo jedna wspólna funkcja dla serwisu (TRESC-13/15). */
const NBSP = '\u00a0';
const fmt = (text) =>
  typeof text !== 'string'
    ? text
    : text
        .replace(/^>\s*/, `powyżej${NBSP}`)
        .replace(/(\d)(\d{3})(?!\d)/g, `$1${NBSP}$2`)
        .replace(/ zł/g, `${NBSP}zł`)
        .replace(/moich klientek/g, 'naszych klientek');

const priceOf = (table, name) => {
  const row = table.items.find((item) => item.name === name);
  return row ? fmt(row.price) : '';
};

/* Pozycja cennika PMU po stałym `id` (site.js) – nazwy widoczne mogą się zmieniać (D2). */
const pmuItem = (id) => PRICING_PMU.items.find((item) => item.id === id) || {};
const pmuPrice = (id) => fmt(pmuItem(id).price || '');

/* ------------------------------------------------------------------ */
/*  02 – cztery techniki (indeks; zdjęcia tam, gdzie technika pewna)   */
/*  D2: nazwy widoczne wg briefu („Perfect Brows”, „Perfect Eyes”);     */
/*  id wierszy i rezerwacji bez zmian (linki ?zabieg=). Opisy z briefu. */
/*  D6: czas tylko przy SNB – jedyny czas w źródłach (brief: Andriana   */
/*  wykonuje włos maszynowy w 1,5–2 godziny); pozostałe czasy (z dawnej */
/*  wersji strony, bez źródła) usunięte do potwierdzenia przez klientkę. */
/*  D8 (decyzja 30.09.2026, klientka: „Brakuje mi też zdjęć przy opisie */
/*  zabiegów”): zdjęcie przy technice tylko wtedy, gdy wiemy, że kadr   */
/*  ją przedstawia – napis na sklejce źródłowej: brows-13 „Supernatural */
/*  brows”, lips-03 „Perfect lips” (MACROS, src/lib/roles.js). Perfect  */
/*  Brows i Perfect Eyes: w /Graphics brak takich zdjęć – cudzych       */
/*  kadrów nie podpisujemy ich nazwą; wiersz stoi bez zdjęcia (zdjęcie  */
/*  należy do bloku tytułu, więc jego brak nie zostawia pustego pola).  */
/*  Gdy klientka dośle zdjęcia – `photo` w wierszu, makro w MACROS.     */
/* ------------------------------------------------------------------ */

const TECHNIQUES = [
  {
    id: 'supernatural-brows',
    number: '01',
    name: 'Super Natural Brows',
    kind: 'Włos maszynowy · autorska technika Andriany',
    /* D6: czas ze źródła – zabieg wykonywany przez Andrianę (brief „Opis”) */
    duration: '1,5–2 godziny',
    price: pmuPrice('super-natural-brows'),
    description:
      'Efekt zadbanych, gęstych, dopasowanych brwi z delikatnym pogrubieniem oraz wyrównaniem kształtu.',
    quote:
      'Idealnie nadaje się dla klientek z życzeniem: „Nie chcę, aby ktoś wiedział, że mam zrobione brwi – mają wyglądać jak moje”.',
    photo: {
      macro: MACROS.brows13p2,
      alt: 'Brew i oko po makijażu permanentnym techniką Super Natural Brows – widoczne pojedyncze włoski',
    },
  },
  {
    id: 'perfect-brows',
    number: '02',
    name: 'Perfect Brows', // D2: nazwa wg briefu („Pudrowa technika „Perfect brows””)
    kind: 'Technika pudrowa · efekt cienia',
    price: pmuPrice('perfect-powder-brows'), // D2: id stałe, nazwa w cenniku site.js wg briefu
    description:
      'Efekt delikatnie podmalowanych brwi cieniem, z podkreślonym kształtem, ale nadal w delikatnej, transparentnej wersji bez przesady.',
    /* Z16: cytat „Ombre/Powder” (dawna strona, bez źródła) usunięty – zdanie z briefu („Salon”)
       o technice pudrowej. „Combo” z tego zdania zostaje w tekście o salonie (/o-nas): ceny
       combo źródła nie podają, więc nie stawiamy go przy wierszu z ceną (D10, pytanie do klientki). */
    quote: 'Dla osób, które chcą mocniej podkreślić kształt brwi, ale nadal w naturalnej wersji.',
    /* bez `photo` – D8: brak zdjęcia, o którym wiemy, że przedstawia technikę pudrową */
  },
  {
    id: 'perfect-lips',
    number: '03',
    name: 'Perfect Lips',
    kind: 'Usta permanentne · subtelność i świeżość',
    price: pmuPrice('perfect-lips'),
    description:
      'Efekt zdrowych, równomiernych, naturalnych ust, bez wyraźnych odcieni, bez przerysowanych konturów oraz bez „sztucznego efektu”.',
    photo: {
      macro: MACROS.lips03p3,
      alt: 'Usta po makijażu permanentnym Perfect Lips – efekt po zabiegu',
    },
  },
  {
    id: 'perfect-eyes',
    number: '04',
    name: 'Perfect Eyes', // D2: nazwa wg briefu („Pigmentacja linii „Perfect eyes””)
    kind: 'Pigmentacja linii rzęs · efekt zagęszczenia', // D2: „linia rzęs”, nie „kreska”
    price: pmuPrice('perfect-eyeliners'), // D2: id stałe (dawniej „Perfect Eyeliners”)
    description:
      'Efekt zagęszczenia rzęs, pogrubienia górnej linii wodnej oka i uwydatnienia koloru tęczówki – bez kreski, bez ogonka i bez cienia na powiece.',
    /* bez `photo` – D8: brak zdjęcia, o którym wiemy, że przedstawia pigmentację linii rzęs */
  },
];

/* Fakty w hero (3) – wyłącznie z danych: ACHIEVEMENTS (5× podium MŚ), liczba technik
   z indeksu 02 (TECHNIQUES; odmiana 2–4 „techniki”, 5+ „technik”) i CONTACT.city.
   Krótkie, bo od lg pasek stoi w jednej linii z ukośnikami w kolumnie okładki:
   przy 1024 px kolumna ma 440 px, pasek 419 px (zmierzone; „4 techniki PMU”
   dawało 455 px i zawijało wiersz od „/”). Do lg zawija się bez ukośników.
   Autorstwo Super Natural Brows stoi w wierszu 01 indeksu. */
const TECHNIQUE_COUNT = TECHNIQUES.length;
const HERO_FACTS = [
  `${ACHIEVEMENTS[0].value} podium MŚ`,
  `${TECHNIQUE_COUNT} ${TECHNIQUE_COUNT >= 2 && TECHNIQUE_COUNT <= 4 ? 'techniki' : 'technik'}`,
  `Salon – ${CONTACT.city}`,
];

/* ------------------------------------------------------------------ */
/*  03 – efekty (makra z białej listy) i przebieg wizyty               */
/* ------------------------------------------------------------------ */

const RESULTS = [
  { macro: MACROS.brows15, alt: 'Brwi po makijażu permanentnym – zbliżenie' },
  { macro: MACROS.brows08, alt: 'Brew i oko po makijażu permanentnym – zbliżenie' },
  { macro: MACROS.brows17, alt: 'Łuk brwi po makijażu permanentnym – zbliżenie' },
  { macro: MACROS.lips05, alt: 'Usta po makijażu permanentnym – zbliżenie' },
].map(({ macro, alt }) => ({ image: macro.image, position: macro.position, alt }));

/* D6 (Z15): źródła nie znają „konsultacji” jako osobnej usługi – krok 01 to rysunek
   wstępny (brief, FAQ). Zdanie „Zabieg trwa od 1 do 2 godzin” bez źródła – usunięte;
   w jego miejscu zdanie z FAQ briefu (żel chłodzący; brzmienie złagodzone jak w FAQ – D3).
   D5 (Z10): korekta od miesiąca do 3 miesięcy od zabiegu i jej opis z briefu – widoczne
   także na telefonie (warunki z grafiki stoją pod cennikiem PMU). */
const KOREKTA = pmuItem('korekta');

const VISIT_STEPS = [
  {
    number: '01',
    title: 'Rysunek wstępny',
    desc: 'Dopasowujemy go do architektury twarzy – bez niego nie zaczynamy. Kiedy go sprawdzasz, wprowadzamy zmiany zgodnie z Twoimi uwagami i życzeniami.',
  },
  {
    number: '02',
    title: 'Zabieg',
    desc: 'Zaczynamy dopiero, gdy zaakceptujesz rysunek wstępny. Po pierwszym przejściu maszynką nakładamy żel chłodzący, który łagodzi nieprzyjemne odczucia.',
  },
  {
    number: '03',
    title: `Korekta – ${fmt(KOREKTA.price || '')}`,
    desc: `${KOREKTA.timing}. Uzupełniamy ubytki – najczęściej zależne od skóry, jej regeneracji lub stanu hormonalnego – albo wzmacniamy efekt, pogrubiamy brwi i zagęszczamy włoski.`,
  },
];

/* ------------------------------------------------------------------ */
/*  04 – odświeżenie i usuwanie (bez materiału zdjęciowego)            */
/* ------------------------------------------------------------------ */

/* D5: przy cenie odświeżenia warunek z grafiki („dla klientek, którym wykonałyśmy
   makijaż permanentny”) – `condition` stoi zawsze, także na telefonie. Usuwanie: cena dla
   wszystkich = najniższa stawka bez `forOwnClients` („od 200 zł”), a 100 zł osobno,
   z warunkiem. D6: czasy wizyt („1,5 godziny”, „30–45 minut”) bez źródła – usunięte
   (brief zna tylko „samo usuwanie trwa około minuty” – FAQ). */
const amount = (price) => Number(String(price).replace(/[^\d]/g, ''));
const REMOVAL_FROM = Math.min(
  ...PRICING_REMOVAL.items
    .filter((item) => !item.forOwnClients)
    .map((item) => amount(item.price))
    .filter((n) => n > 0)
);
const REMOVAL_OWN = PRICING_REMOVAL.items.find((item) => item.forOwnClients);

const AFTERCARE = [
  {
    id: 'odswiezenie',
    number: '01',
    tag: 'Po 1–3 latach',
    name: 'Odświeżenie makijażu permanentnego',
    price: `od${NBSP}${fmt(PRICING_REFRESH.items[0].price)}`,
    condition: `${PRICING_REFRESH.condition}.`,
    priceNote: 'Stawka zależy od czasu, jaki minął od ostatniego zabiegu – pełne widełki w cenniku.',
    description:
      'Zabieg, który wykonujemy raz na 1–3 lata, aby odnowić efekt, uzupełnić kolor oraz dodać gęstości, grubości i intensywności.',
  },
  {
    id: 'usuwanie',
    number: '02',
    tag: 'Przed nową pigmentacją',
    /* twarda spacja: „lub” nie zostaje na końcu linii („Usuwanie laserem / lub removerem”) */
    name: 'Usuwanie laserem lub\u00a0removerem',
    price: `od${NBSP}${fmt(`${REMOVAL_FROM} zł`)}`,
    condition: REMOVAL_OWN
      ? `${fmt(REMOVAL_OWN.price)} – ${fmt(REMOVAL_OWN.name).replace(/^Usuwanie/, 'usuwanie')}.`
      : null,
    priceNote: `Brwi lub usta – ${priceOf(PRICING_REMOVAL, 'Usuwanie PMU brwi')}. Końcówki kresek i tatuaże – w cenniku.`,
    description:
      'Usuwamy stary, nieudany makijaż permanentny przed nową pigmentacją. Metodę – laser albo remover – dobieramy indywidualnie, tak aby jak najszybciej i najbezpieczniej pozbyć się niechcianego pigmentu.',
  },
];

/* ------------------------------------------------------------------ */
/*  06 – FAQ: treść klienta po korekcie językowej. Absoluty złagodzone  */
/*  (bez „w żadnym przypadku”, „nie ma żadnych blizn”) – D3: wersja     */
/*  złagodzona zostaje; brzmienie do akceptacji klientki. Lead w hero   */
/*  jest z tym FAQ zgodny. Korekta: dopisane przypadki obowiązkowe      */
/*  z grafiki cennika i termin z briefu (Z10/Z11) – oba źródła naraz.   */
/* ------------------------------------------------------------------ */

const FAQ_ITEMS = [
  {
    q: 'Czy włos maszynowy się nie rozpływa?',
    a: 'Włos maszynowy to technika tak samo płytka, delikatna i nietraumatyczna jak puder. To nie metoda piórkowa: nie nacinamy skóry i nie wbijamy pigmentu głęboko. Włoski pigmentujemy precyzyjnie, nasycając je warstwami pudru – delikatnie, z umiarem i wyczuciem. Dzięki temu włos maszynowy nie rozpływa się z czasem.',
  },
  {
    q: 'Czy kolor z czasem nie zrobi się czerwony lub szary?',
    a: 'Pracujemy na sprawdzonych pigmentach i technikach, których zachowanie z czasem jest przewidywalne – pokazujemy to na zdjęciach i filmach na naszym Instagramie. Skóra i hormony każdego człowieka rządzą się jednak swoimi prawami i na to nie mamy wpływu. Rzadko, ale zdarza się, że kolor pigmentu się wychłodzi – wtedy proponujemy bezpłatną inwersję koloru w cieplejszy odcień.',
  },
  {
    q: 'Czy będzie rysunek wstępny przed pigmentacją?',
    a: 'Oczywiście, że tak – bez niego nie zaczynamy. Rysunek wstępny dopasujemy do Twojej architektury twarzy, a kiedy będziesz go sprawdzać, możemy wprowadzić zmiany zgodnie z Twoimi uwagami i życzeniami.',
  },
  {
    q: 'Czy zabieg jest bolesny?',
    a: 'W 90% przypadków zabieg jest bezbolesny, a większość klientek przysypia podczas pigmentacji. Wrażliwe klientki mogą odczuwać drapanie skóry przy pierwszym przejściu maszynką – zaraz po nim nakładamy żel chłodzący, który łagodzi nieprzyjemne odczucia, więc przez większą część zabiegu można się zrelaksować.',
  },
  {
    q: 'Czy korekta jest obowiązkowa?',
    a: 'Najczęściej nie, ale wiele zależy od Twojej skóry, procesu regeneracji, stanu hormonalnego oraz Twoich oczekiwań po wygojeniu. Gdy trzeba uzupełnić ubytki, poprawić kształt, pogrubić lub zagęścić brwi, dodać intensywności czy delikatnie zmienić kolor, korekta będzie najlepszym rozwiązaniem. Obowiązkowa jest przy pracy na skórze tłustej, porowatej, z resztkami starego makijażu permanentnego oraz po usuwaniu. Wykonujemy ją od miesiąca do 3 miesięcy od zabiegu.',
  },
  {
    q: 'Czy można robić nowy zabieg na starym makijażu permanentnym?',
    a: 'To zależy od tego, jak wygląda Twój obecny makijaż permanentny, jak dawno był zrobiony, czy był usuwany i czy da się go poprawić. Poprosimy Cię o zdjęcie brwi lub ust, abyśmy mogły ocenić jego wygląd. Gdy resztki są delikatne, żółte, pomarańczowe czy ledwo widoczne, zrobimy cover. Jeśli PMU ma szary, ciemny, wyraźny zarys, zaprosimy Cię najpierw na usuwanie.',
  },
  {
    q: 'Czy usuwanie uszkodzi moje włoski na brwiach?',
    a: 'Zwykle nie – często widzimy wręcz odwrotną reakcję: po usuwaniu włoski zaczynają aktywniej odrastać, bo skóra pozbywa się nadmiaru pigmentu i włoski mają miejsce na porost. Czasem po zabiegu włoski bieleją, ale to reakcja tymczasowa i wkrótce wracają do swojego koloru. Jeśli nie chcesz czekać, już 2–3 dni po usuwaniu można zrobić hennę lub farbkę.',
  },
  {
    q: 'Czy usuwanie jest bardzo bolesne?',
    a: 'Nie zaliczymy tego zabiegu do przyjemnych, ale samo usuwanie trwa około minuty. Zaraz po nim schładzamy skórę i dbamy o to, abyś czuła się komfortowo. Każdy ma inny próg bólu: jedni odczuwają zabieg mocniej, inni prawie wcale.',
  },
  {
    q: 'Czy po usuwaniu będą blizny?',
    a: 'Stan Twojej skóry jest dla nas najważniejszy – zależy nam, aby była dobrze przygotowana do nowej pigmentacji. Przy prawidłowej technice usuwanie laserem i removerem jest bezpieczne dla skóry, a my dbamy o to, by nie powstawały blizny ani poparzenia. Jeśli jednak poprzedni makijaż permanentny wykonano bardzo głęboko i traumatycznie, blizny mogą istnieć już przed usuwaniem i pozbycie się koloru ich nie usunie. Wtedy łączymy techniki usuwania, aby jednocześnie usuwać pigment i dbać o skórę.',
  },
];

/* ================================================================== */
/*  02 – TECHNIKI (cream-50)                                           */
/* ================================================================== */

/* Telefon (< sm): opis przycięty do dwóch linii i przycisk „Więcej”
   (aria-expanded), który rozwija pełny opis oraz to, co od sm stoi zawsze
   (cytat techniki, nota ceny). Od sm przycisk jest ukryty, a treść stoi
   w pełni – jak dotąd. Przycisk znika, gdy nie ma czego rozwinąć: opis mieści
   się w dwóch liniach i nic poza nim nie jest schowane (pomiar po montażu
   i przy każdej zmianie szerokości). */
function useMobileMore(hasHidden) {
  const [open, setOpen] = React.useState(false);
  const [clamped, setClamped] = React.useState(true);
  const textRef = React.useRef(null);

  React.useEffect(() => {
    const el = textRef.current;
    if (hasHidden || open || !el || typeof ResizeObserver === 'undefined') return undefined;
    const measure = () => setClamped(el.scrollHeight - el.clientHeight > 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [hasHidden, open]);

  return {
    open,
    toggle: () => setOpen((v) => !v),
    textRef,
    clampClass: open ? null : 'line-clamp-2 sm:line-clamp-none',
    hiddenClass: open ? 'block' : 'hidden sm:block',
    showButton: hasHidden || open || clamped,
  };
}

/* Tekstowy przełącznik w stylu .as-label; pole dotyku powiększone
   pseudo-elementem (≥ 44 px wysokości) bez zmiany rytmu wiersza.
   To rozwinięcie JEDNEGO wiersza (opis przycięty line-clamp), więc zostaje
   w linii tekstu – pełnoszeroki MobileMore (dla całych list) dokładałby pas
   48 px w każdym z sześciu wierszy. Hover jak w MobileMore: tekst ink,
   złote jest tylko podkreślenie (złoto tylko w linii). */
function MoreButton({ more, controls, name, className }) {
  if (!more.showButton) return null;
  return (
    <button
      type="button"
      onClick={more.toggle}
      aria-expanded={more.open}
      aria-controls={controls}
      className={cn(
        "as-label relative inline-flex items-center gap-1.5 leading-none text-ink/70 decoration-gold underline-offset-4 transition-colors after:absolute after:-inset-x-2 after:-inset-y-4 after:content-[''] hover:text-ink hover:underline sm:hidden",
        className
      )}
    >
      {more.open ? 'Zwiń' : 'Więcej'}
      <span className="sr-only"> – {name}</span>
      <ChevronDown
        aria-hidden="true"
        className={cn('h-3.5 w-3.5 text-gold-deep transition-transform duration-300 motion-reduce:transition-none', more.open && 'rotate-180')}
      />
    </button>
  );
}

/* Zdjęcie techniki (D8): panel ze sklejki w poziomej proporcji 12:5,
   na szerokość kolumny tytułu, maks. 20rem (320 px); na telefonie (375 px) stoi pod
   tytułem, nad opisem. Niski kadr poziomy nie wydłuża wiersza ponad miarę obok dwóch
   linii opisu, a makra z telefonu nie są powiększane ponad ~360 px. Ton „light” i zoom={false} jak makra
   na kremie (ResultStrip na kremie, dawne /pigmenty 03); złota ramka .as-photo-frame
   jak pozostałe małe kadry tej trasy (pas efektów 03, miniatury cennika 05).
   Podpis faktyczny: nazwa techniki z napisu na sklejce źródłowej (MACROS.caption).
   `sizes` = szerokość RENDEROWANEGO obrazu, nie kadru: gdy panel jest szerszy niż
   kadr (np. 2,44:1 w 12:5), wypełnia wysokość i wystaje poza kadr – coverWidth
   liczy tę szerokość, żeby przeglądarka nie wzięła za małego pliku.
   Szerokości kadru muszą odpowiadać klasom max-w figure (literały dla Tailwinda);
   ramka zabiera z nich TECHNIQUE_FRAME_PX (border 1 px + p-1 z obu stron). */
const TECHNIQUE_PHOTO_PX = 320; // max-w-[20rem] (na telefonie kolumna tytułu jest węższa – kadr ją wypełnia)
const TECHNIQUE_PHOTO_PX_LG = 320; // lg: kolumna tytułu 20rem
const TECHNIQUE_FRAME_PX = 10; // .as-photo-frame: 2 × (1 px + 4 px)
const coverWidth = (image, ratio, boxPx) => {
  const [rw, rh] = String(ratio).split('/').map(Number);
  const scale = Math.max(1, image.w / image.h / (rw / rh));
  return `${Math.ceil((boxPx - TECHNIQUE_FRAME_PX) * scale)}px`;
};
const techniquePhotoSizes = (image, ratio) =>
  `(min-width: 1024px) ${coverWidth(image, ratio, TECHNIQUE_PHOTO_PX_LG)}, ${coverWidth(image, ratio, TECHNIQUE_PHOTO_PX)}`;

function TechniquePhoto({ photo }) {
  const { macro, alt } = photo;
  if (!macro || !macro.image) return null;
  return (
    <figure className="mt-4 w-full max-w-[20rem] sm:mt-5">
      <Figure
        image={macro.image}
        alt={alt}
        ratio={macro.ratio}
        position={macro.position}
        tone="light"
        zoom={false}
        sizes={techniquePhotoSizes(macro.image, macro.ratio)}
        className="as-photo-frame"
      />
      <figcaption className="as-caption mt-2">{macro.caption}</figcaption>
    </figure>
  );
}

/* Wiersz indeksu – geometria IndexRow (numerał 64 | tytuł 28 | opis | cena
   + link), rozpisana na 4 kolumny wyrównane do góry, żeby opis stał obok
   tytułu, a nie pod nim (budżet wysokości trasy).
   Lokalnie, bo IndexRow nie ma przycinania opisu na telefonie; „Umów wizytę”
   prowadzi do rezerwacji z już wybranym zabiegiem.
   Zdjęcie (tylko wiersze z `photo`) należy do bloku tytułu: stoi pod kickerem
   w kolumnie tytułu na każdej szerokości, więc wiersz bez zdjęcia jest po prostu
   krótszy – bez pustego pola w siatce.
   Telefon: numerał obok tytułu, pod tytułem zdjęcie (zawsze widoczne, nad
   opisem), opis (2 linie + „Więcej”) na pełną szerokość, meta w jednym rzędzie
   (czas + cena | „Umów wizytę”), cytat po rozwinięciu.
   Tablet (md): numerał + tytuł (ze zdjęciem) w lewej kolumnie, opis i meta w prawej.
   Lewa kolumna obejmuje trzy rzędy (auto | auto | 1fr): nadmiar wysokości bloku
   ze zdjęciem trafia do trzeciego, pustego rzędu, więc meta stoi tuż pod opisem,
   a nie w połowie wysokości zdjęcia.
   Desktop (lg): cztery kolumny jak dotąd w jednym rzędzie, meta w kolumnie do
   prawej (grid-rows-none – bez pustych rzędów i ich odstępów). */
function TechniqueRow({ t, last }) {
  const more = useMobileMore(Boolean(t.quote));
  const bodyId = `${t.id}-opis`;
  return (
    <article
      id={t.id}
      className={cn(
        'grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 border-t border-ink/15 py-5',
        'sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-y-4 sm:py-8',
        'md:grid-cols-[4.5rem_minmax(0,5fr)_minmax(0,7fr)] md:items-start md:gap-x-6',
        t.photo && 'md:grid-rows-[auto_auto_1fr] lg:grid-rows-none',
        'lg:grid-cols-[6rem_20rem_minmax(0,1fr)_auto] lg:gap-8',
        last && 'border-b'
      )}
    >
      <span
        className={cn(
          'as-display-md leading-none text-gold-dark lg:row-span-1',
          t.photo ? 'md:row-span-3' : 'md:row-span-2'
        )}
      >
        {t.number}
      </span>
      <div className={cn('lg:row-span-1', t.photo ? 'md:row-span-3' : 'md:row-span-2')}>
        <h3 className="as-title text-ink">{t.name}</h3>
        <p className="as-kicker mt-2">{t.kind}</p>
        {t.photo && <TechniquePhoto photo={t.photo} />}
      </div>
      <div id={bodyId} className="col-span-2 sm:col-span-1 sm:col-start-2 md:col-start-3 md:row-start-1">
        <p
          ref={more.textRef}
          className={cn('max-w-[34rem] text-[0.9375rem] leading-[1.65] text-ink/75', more.clampClass)}
        >
          {t.description}
        </p>
        {t.quote && <p className={cn('as-quote mt-3 max-w-[34rem] text-mocha', more.hiddenClass)}>{t.quote}</p>}
        <MoreButton more={more} controls={bodyId} name={t.name} className="mt-1.5" />
      </div>
      <div className="col-span-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 sm:col-span-1 sm:col-start-2 md:col-start-3 md:row-start-2 lg:col-start-4 lg:row-start-1 lg:flex-col lg:flex-nowrap lg:items-end lg:justify-start lg:gap-4">
        <p className="whitespace-nowrap">
          {/* D6: czas tylko przy technice ze źródłem czasu (SNB) */}
          {t.duration && <span className="as-label mr-3 text-ink/70 sm:mr-4">{t.duration}</span>}
          <span className="font-display text-[1.375rem] leading-none text-ink">{t.price}</span>
        </p>
        <ArrowLink href={bookingHref(t.id)} className="w-fit">
          Umów wizytę<span className="sr-only"> – {t.name}</span>
        </ArrowLink>
      </div>
    </article>
  );
}

function TechniquesBand() {
  return (
    <section id="zabiegi" className="as-section border-t border-ink/10 bg-cream-100">
      <div className="as-shell">
        <Reveal>
          <SectionLabel number="02">Techniki</SectionLabel>
          <h2 className="as-display-section as-text-balance mt-6 text-ink">
            Cztery techniki, jeden standard.
          </h2>
        </Reveal>

        <div className="mt-8 sm:mt-10">
          {TECHNIQUES.map((t, i) => (
            <Reveal key={t.id} delay={i * 60}>
              <TechniqueRow t={t} last={i === TECHNIQUES.length - 1} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  03 – EFEKTY I WIZYTA (cream-75)                                    */
/* ================================================================== */

function ResultsBand() {
  return (
    <section className="as-section relative overflow-hidden bg-cream-75 text-ink">
      {/* Łuk narożny tylko w górnym marginesie sekcji (h-20 = lg:pt-20), w prawym
          rogu – nad linkiem do Instagramu, na prawo od etykiety. Dawny łuk (-top-32,
          900 px) przecinał etykietę i H2 (AD4). Poniżej lg nagłówek stoi w kolumnie
          i łuk nie ma wolnego pola – ukryty. */}
      <GoldArc variant="corner" className="right-0 top-0 hidden h-20 w-[45%] lg:block" opacity={0.35} />

      <div className="as-shell relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <Reveal>
            <SectionLabel number="03">
              Efekty i wizyta
            </SectionLabel>
            <h2 className="as-display-section as-text-balance mt-6 text-ink">
              Realne efekty, nie renderowane.
            </h2>
          </Reveal>
          {/* od lg: link obok nagłówka; do lg – pod stykówką (po treści, nie przed nią) */}
          <Reveal delay={60} className="hidden shrink-0 lg:block">
            <ArrowLink href={CONTACT.instagram} className="w-fit" target="_blank" rel="noreferrer">
              Więcej prac na Instagramie
              <span className="sr-only"> (otwiera się w nowej karcie)</span>
            </ArrowLink>
          </Reveal>
        </div>

        {/* stykówka: cztery makra 1:1 na pełną szerokość łamu, jeden podpis paska */}
        <Reveal delay={60} className="mt-10">
          <ResultStrip
            items={RESULTS}
            cols={4}
            ratio="1 / 1"
            /* D10: źródła nie mówią, czyje to prace ani gdzie je wykonano (część ma znak
               akademii) – podpis bez „naszego gabinetu”. */
            caption="Brwi i usta po makijażu permanentnym."
          />
          <ArrowLink
            href={CONTACT.instagram}
            className="mt-6 w-fit lg:hidden"
            target="_blank"
            rel="noreferrer"
          >
            Więcej prac na Instagramie
            <span className="sr-only"> (otwiera się w nowej karcie)</span>
          </ArrowLink>
        </Reveal>

        {/* przebieg wizyty – trzy kroki pod stykówką; tablet: 2 + 1 (ostatni
            na całą szerokość łamu), desktop: trzy kolumny */}
        <div className="mt-8 grid gap-6 sm:mt-12 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {VISIT_STEPS.map((s, i) => (
            <Reveal
              key={s.number}
              delay={i * 80}
              className={cn(
                'as-cell',
                i === VISIT_STEPS.length - 1 && VISIT_STEPS.length % 2 === 1 && 'md:col-span-2 lg:col-span-1',
                s.descFromSm && 'max-sm:[&_.as-numbered-desc]:hidden'
              )}
            >
              <NumberedItem number={s.number} title={s.title}>
                {s.desc}
              </NumberedItem>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  04 – ODŚWIEŻENIE I USUWANIE (cream-50)                             */
/* ================================================================== */

/* Karta zabiegu 04 – numer jak 01/02/03 w serwisie (.as-num, Bodoni 24 px) w jednym
   wierszu z kickerem „kiedy”, tytuł pod nimi na pełną szerokość karty (karty mają
   204 px przy 1024 px – tytuł obok numeru nie mieścił „permanentnego”). Meta jak
   w wierszu techniki: cena + „Umów wizytę” (rezerwacja z już wybranym zabiegiem).
   Telefon: opis 2 linie + „Więcej”; nota ceny dopiero po rozwinięciu. Od sm pełna treść. */
function AftercareCard({ t }) {
  const more = useMobileMore(true);
  const descId = `${t.id}-opis`;
  const noteId = `${t.id}-nota`;
  return (
    <article id={t.id} className="as-cell">
      <div className="flex items-baseline gap-3">
        <span className="as-num">{t.number}</span>
        <p className="as-kicker">{t.tag}</p>
      </div>
      <h3 className="as-title mt-3 text-ink">{t.name}</h3>
      <p
        id={descId}
        ref={more.textRef}
        className={cn('mt-3 text-[0.9375rem] leading-[1.65] text-ink/75', more.clampClass)}
      >
        {t.description}
      </p>
      <MoreButton more={more} controls={`${descId} ${noteId}`} name={t.name} className="mt-1.5" />
      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 sm:mt-6">
        <p className="whitespace-nowrap">
          {t.duration && <span className="as-label mr-3 text-ink/70 sm:mr-4">{t.duration}</span>}
          <span className="font-display text-[1.375rem] leading-none text-ink">{t.price}</span>
        </p>
        <ArrowLink href={bookingHref(t.id)} className="w-fit">
          Umów wizytę<span className="sr-only"> – {t.name}</span>
        </ArrowLink>
      </div>
      {/* D5: warunek ceny stoi zawsze – także na telefonie, bez „Więcej” */}
      {t.condition && <p className="as-caption mt-3">{t.condition}</p>}
      <p id={noteId} className={cn('as-caption', t.condition ? 'mt-1' : 'mt-3', more.hiddenClass)}>
        {t.priceNote}
      </p>
    </article>
  );
}

function AftercareBand() {
  return (
    <section className="as-section as-section-tight-bottom bg-cream-50">
      <div className="as-shell">
        <div className="grid gap-10 sm:gap-12 lg:grid-cols-12 lg:gap-8">
          {/* tablet: etykieta nad całością, pod nią tytuł | wstęp + link obok
              siebie (wyrównane do góry); desktop: jedna kolumna jak dotąd */}
          <Reveal className="lg:col-span-5">
            <SectionLabel number="04">Odświeżenie i usuwanie</SectionLabel>
            <div className="md:mt-6 md:grid md:grid-cols-2 md:items-start md:gap-8 lg:mt-0 lg:block">
              <h2 className="as-display-section as-text-balance mt-6 text-ink md:mt-0 lg:mt-6">
                Odnowić albo zacząć od&nbsp;nowa.
              </h2>
              <div>
                <p className="as-body mt-6 hidden sm:block md:mt-0 lg:mt-6">
                  Zabiegi uzupełniające prowadzimy w tym samym standardzie co pigmentację: zaczynamy od oceny
                  skóry i doboru metody. Część z nich wykonujemy dopiero po obejrzeniu zdjęć obecnego
                  makijażu permanentnego.
                </p>
                {/* telefon: cennik to następna sekcja – link od sm */}
                <ArrowLink href="#cennik" className="mt-8 hidden w-fit sm:inline-flex md:mt-6 lg:mt-8">
                  Zobacz cennik
                </ArrowLink>
              </div>
            </div>
          </Reveal>

          <div className="grid gap-10 md:grid-cols-2 md:gap-8 lg:col-span-6 lg:col-start-7 lg:self-end">
            {AFTERCARE.map((t, i) => (
              <Reveal key={t.id} delay={i * 80}>
                <AftercareCard t={t} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  05 – CENNIK (cream-100) – jedyny pełny cennik w serwisie           */
/* ================================================================== */

/* PriceRow rysuje górną linię przy pierwszym wierszu (first:border-t),
   więc wrapper nie dostaje własnego border-t – inaczej byłaby podwójna linia.
   Noty, które powtarzają podtytuł tabeli („Laser / remover") albo są wspólne
   dla wszystkich pozycji („Niezależnie od strefy pigmentacji"), pokazujemy raz. */
function PriceRows({ table }) {
  const first = table.items[0] && table.items[0].note;
  const shared = table.items.length > 1 && first && table.items.every((it) => it.note === first) ? first : null;
  const noteOf = (it) => (it.note === table.subtitle || it.note === shared ? undefined : it.note);
  return (
    <>
      {table.items.map((item) => (
        <PriceRow key={item.name} name={fmt(item.name)} note={noteOf(item)} price={fmt(item.price)} />
      ))}
      {(shared || table.footnote) && (
        <p className="as-caption mt-4 max-w-[36rem]">{shared ? `${shared}.` : table.footnote}</p>
      )}
    </>
  );
}

function PriceBlock({ table }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="as-title text-ink">{table.title}</h3>
        <p className="as-kicker">{fmt(table.subtitle)}</p>
      </div>
      <div className="mt-4">
        <PriceRows table={table} />
      </div>
    </div>
  );
}

/* Telefon: cennik PMU zostaje otwarty, a tabele uzupełniające (refresh,
   siedem stawek usuwania) są zwinięte w akordeon – ten sam <Faq> co w pytaniach,
   ale treść rozwinięcia bez łamu i prawego odstępu odpowiedzi (contentClassName),
   żeby ceny stały w jednej osi z cennikiem PMU.
   Od lg obie tabele stoją w pełni: refresh pod PMU, usuwanie w lewej kolumnie. */
const faqOf = (table) => ({
  q: `${table.title} – ${fmt(table.subtitle).toLowerCase()}`,
  a: <PriceRows table={table} />,
});
const MOBILE_PRICE_FAQ = [faqOf(PRICING_REFRESH), faqOf(PRICING_REMOVAL)];

function PricingBand() {
  return (
    <section id="cennik" className="as-section-tight border-t border-ink/10 bg-cream-100">
      <div className="as-shell">
        {/* od md: nagłówek i usuwanie w lewej kolumnie, PMU (+ refresh od lg) w prawej
            od góry; md–lg refresh i usuwanie w akordeonach pod nagłówkiem.
            telefon: nagłówek → PMU → nota → akordeon (refresh, usuwanie) */}
        <div className="grid gap-12 md:grid-cols-2 md:gap-x-10 md:gap-y-10 lg:gap-x-16 lg:gap-y-12">
          <Reveal className="md:col-start-1 md:row-start-1">
            <SectionLabel number="05">Cennik</SectionLabel>
            {/* „bez gwiazdek” obiecywało brak zastrzeżeń, a cennik ma warunki (dla naszych
                klientek, wycena indywidualna) – stoją jawnie przy pozycjach */}
            <h2 className="as-display-section as-text-balance mt-6 text-ink">
              Jasne stawki,
              <br />
              jasne warunki.
            </h2>
            {/* D6 (Z15): „konsultacja w cenie” bez źródła – zostaje to, co podaje brief (FAQ) */}
            <p className="as-body mt-6">
              Przed każdą pigmentacją robimy rysunek wstępny dopasowany do architektury twarzy – bez niego nie
              zaczynamy.
            </p>
          </Reveal>

          <div className="space-y-6 md:col-start-2 md:row-span-2 md:row-start-1 lg:space-y-10">
            <Reveal>
              <PriceBlock table={PRICING_PMU} />
            </Reveal>
            <Reveal>
              <div className="mb-6 hidden lg:block">
                <PriceBlock table={PRICING_REFRESH} />
              </div>
              {/* D6 (Z14): „darmowa konsultacja” bez źródła → zdanie z briefu („Salon”) + „Napisz do nas” */}
              <p className="as-caption max-w-[30rem]">
                {SALON.charity}{' '}
                <Link href="/kontakt" className="underline underline-offset-2 transition-colors hover:text-ink">
                  Napisz do nas
                </Link>
                .
              </p>
            </Reveal>
          </div>

          <Reveal delay={60} className="md:col-start-1 md:row-start-2">
            <div className="hidden lg:block">
              <PriceBlock table={PRICING_REMOVAL} />
            </div>
            <Faq items={MOBILE_PRICE_FAQ} contentClassName="max-w-none pr-0" className="lg:hidden" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  06 – PYTANIA (cream-50)                                            */
/* ================================================================== */

/* Telefon (< sm): pierwsze cztery pytania, reszta za MobileMore („Pokaż
   wszystkie pytania”, wspólny wzorzec rozwinięcia) – po rozwinięciu fokus
   przechodzi na pierwsze odsłonięte pytanie. Od sm lista stoi w pełni, jak dotąd.
   Klasa ukrywająca musi odpowiadać FAQ_MOBILE (literał dla Tailwinda). */
const FAQ_MOBILE = 4;
const FAQ_MOBILE_CLASS = 'max-sm:[&>*:nth-child(n+5)]:hidden';

function FaqBand() {
  const [all, setAll] = React.useState(false);
  const listRef = React.useRef(null);
  const focusNext = React.useRef(false);

  React.useEffect(() => {
    if (!all || !focusNext.current || !listRef.current) return;
    focusNext.current = false;
    const triggers = listRef.current.querySelectorAll('h3 > button');
    if (triggers[FAQ_MOBILE]) triggers[FAQ_MOBILE].focus();
  }, [all]);

  return (
    <section className="as-section as-section-tight-top border-t border-ink/10 bg-cream-50">
      <div className="as-shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:sticky lg:top-32 lg:col-span-4 lg:self-start">
            <SectionLabel number="06">Pytania</SectionLabel>
            <h2 className="as-display-section as-text-balance mt-6 text-ink">
              Zanim usiądziesz w&nbsp;fotelu.
            </h2>
            <p className="as-body mt-6 hidden sm:block">
              Odpowiedzi na wątpliwości, które najczęściej słyszymy przed zabiegiem – o technikę,
              kolor, ból i usuwanie.
            </p>
          </Reveal>
          <Reveal delay={80} className="lg:col-span-8 lg:col-start-5">
            <div ref={listRef} id="pytania-lista">
              <Faq items={FAQ_ITEMS} className={cn(!all && FAQ_MOBILE_CLASS)} />
            </div>
            {FAQ_ITEMS.length > FAQ_MOBILE && (
              <MobileMore
                open={all}
                onToggle={() => {
                  focusNext.current = !all;
                  setAll((v) => !v);
                }}
                controls="pytania-lista"
                label={`Pokaż wszystkie pytania (${FAQ_ITEMS.length})`}
                openLabel="Zwiń pytania"
                until="sm"
                className="mt-6"
              />
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  07 – CENNIK DO POBRANIA (cream-100, hairline)                      */
/* ================================================================== */

/* D8: brief – „Na dole podstrony usług dodajemy obrazek z cennikiem”. Kompromis z zasadą 7
   designu: grafiki cennika nie jako duże obrazy w treści, tylko rząd miniatur (≤ 160 px)
   z linkiem do pełnej grafiki w nowej karcie. Tabele w #cennik zostają wersją dostępną
   (czytniki, wyszukiwarki). Grafiki bez tonu – tekst na nich ma być czytelny.
   Alt opisuje treść grafiki dosłownie (nazwy z grafiki: Perfect Powder Brows, Perfect
   Eyeliners) – pod miniaturami nota o nazwach z briefu (D2). */
const PRICE_SHEETS = [
  {
    key: 'pmu',
    table: PRICING_PMU,
    part: '1/3',
    alt: 'Grafika „Cennik PMU” (1/3): Super Natural Brows, Perfect Powder Brows i Perfect Lips – po 1700 zł, Perfect Eyeliners – 1500 zł, korekta do 3 miesięcy – 500 zł',
  },
  {
    key: 'refresh',
    table: PRICING_REFRESH,
    part: '2/3',
    alt: 'Grafika „Cennik Refresh” (2/3), odświeżenie dla moich klientek: do 1,5 roku – 850 zł, do 3 lat – 1000 zł, po 3 latach – 1200 zł',
  },
  {
    key: 'usuwanie',
    table: PRICING_REMOVAL,
    part: '3/3',
    alt: 'Grafika „Cennik Usuwanie” (3/3), laser lub remover: PMU brwi – 400 zł, PMU ust – 400 zł, końcówki kresek – 200 zł, brwi dla moich klientek – 100 zł, mały tatuaż – 250 zł, średni – 400 zł, duży – powyżej 500 zł (wycena indywidualna)',
  },
];

function PriceSheetsBand() {
  return (
    <section id="cennik-do-pobrania" className="as-section border-t border-ink/10 bg-cream-100">
      <div className="as-shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-4">
            <SectionLabel number="07">Do pobrania</SectionLabel>
            <h2 className="as-display-section as-text-balance mt-6 text-ink">Cennik do&nbsp;pobrania.</h2>
            <p className="as-body mt-6">Grafiki cennika salonu w pełnym rozmiarze otwierają się w nowej karcie.</p>
          </Reveal>
          <Reveal delay={80} className="lg:col-span-8 lg:col-start-5 lg:self-end">
            <ul className="grid max-w-[33rem] grid-cols-3 gap-3 sm:gap-6">
              {PRICE_SHEETS.map((sheet) => (
                <li key={sheet.key} className="min-w-0 max-w-[160px]">
                  <a
                    href={CENNIK[sheet.key].src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <Figure
                      image={CENNIK[sheet.key]}
                      alt={sheet.alt}
                      ratio="9 / 16"
                      zoom={false}
                      sizes="160px"
                      className="as-photo-frame"
                    />
                    <span className="as-caption mt-2 block transition-colors group-hover:text-ink">
                      {sheet.table.title} · {sheet.part}
                      <span className="sr-only"> (otwiera się w nowej karcie)</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            {/* D2: nazwy na stronie wg briefu, na grafice – dawne; nota, żeby nie wyglądało na dwa zabiegi */}
            <p className="as-caption mt-6 max-w-[33rem]">
              Na grafice cennika Perfect Brows i Perfect Eyes występują pod nazwami Perfect Powder Brows
              i Perfect Eyeliners.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */

/* Id zabiegów na /uslugi → id w konfiguracji rezerwacji (src/lib/booking/config.js).
   „Umów wizytę” w wierszu otwiera /umow-wizyte z już wybranym zabiegiem. */
const BOOKING_IDS = {
  'supernatural-brows': 'super-natural-brows',
  'perfect-brows': 'perfect-powder-brows',
  'perfect-lips': 'perfect-lips',
  'perfect-eyes': 'perfect-eyeliners',
  odswiezenie: 'odswiezenie',
  usuwanie: 'usuwanie',
};

function bookingHref(id) {
  const b = BOOKING_IDS[id];
  return b ? `${BOOKING_URL}?zabieg=${b}` : BOOKING_URL;
}

export default function Treatments() {
  return (
    <>
      <PageHero
        label="Zabiegi"
        number="01"
        title="Zabiegi makijażu"
        titleAccent="permanentnego."
        lead="Specjalizujemy się w uzyskaniu jak najbardziej realistycznego, subtelnego efektu – bez przerysowanych konturów i z minimalnym dyskomfortem."
        image={ROLES.heroTreatments.image}
        imagePosition={ROLES.heroTreatments.position}
        imageAlt={`${FOUNDER.name} – ${FOUNDER.signature}`}
        tone="cream"
        imageSide="left"
        facts={HERO_FACTS}
      >
        <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
          <CtaButton href={BOOKING_URL} className="as-btn-solid">
            Umów wizytę
          </CtaButton>
          <ArrowLink href="#cennik" className="w-fit">
            Zobacz cennik
          </ArrowLink>
        </div>
      </PageHero>

      <TechniquesBand />
      <ResultsBand />
      <AftercareBand />
      <PricingBand />
      <FaqBand />
      <PriceSheetsBand />

      {/* D6 (Z15): bez „konsultacji” jako osobnej usługi – zaproszenie do rozmowy */}
      <ClosingCta
        number="08"
        label="Wizyta"
        title="Zacznijmy od"
        titleAccent="rozmowy."
        lead={`${CONTACT.venue} – ${CONTACT.city}. Napisz, co chcesz zmienić, a dobierzemy technikę i termin.`}
        primary={{ href: BOOKING_URL, label: 'Umów wizytę' }}
        secondary={{ href: '#cennik', label: 'Zobacz cennik' }}
      />

    </>
  );
}
