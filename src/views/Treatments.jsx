'use client';

/**
 * ZABIEGI – /uslugi  („Numer 01")
 *
 * Każda sekcja to rozkładówka: SectionLabel → H2 .as-display-section → treść →
 * jedno wezwanie. Portret wyłącznie przez ROLES, makra wyłącznie przez MACROS
 * (src/lib/roles.js) – na tej trasie dokładnie cztery makra, wszystkie w pasie
 * efektów. Ceny zawsze z cennika marki (PRICING_* w src/lib/site.js).
 *
 * Rytm tła: 01 hero (cream-50) → 02 techniki (cream-100, hairline) → 03 efekty
 * i wizyta (espresso – jedyny ciemny pas) → 04 odświeżenie i usuwanie (cream-50)
 * → 05 cennik #cennik (cream-100, hairline) → 06 pytania (cream-50, hairline)
 * → 07 ClosingCta (espresso) + stopka (espresso-900).
 *
 * Korekta do 3 miesięcy występuje jako krok 03 wizyty (pas espresso), więc
 * sekcja 04 obejmuje tylko zabiegi, których nie ma w indeksie ani w krokach.
 *
 * Telefon (< sm): opisy technik i zabiegów 04 przycięte do dwóch linii
 * z przyciskiem „Więcej” (aria-expanded), który rozwija pełny opis, cytat
 * techniki i notę ceny; wstępy sekcji 04/06 ukryte; tabele refresh i usuwania
 * zwinięte w <Faq> (< lg) – od lg stoją w pełni.
 * Tablet (md): wiersz techniki w dwóch kolumnach (numerał + tytuł | opis + meta),
 * nagłówek 04 w dwóch kolumnach, kroki wizyty 2 + 1 (trzeci na całą szerokość).
 * Desktop (≥ lg) bez zmian.
 *
 * „Umów wizytę” prowadzi do rezerwacji online (/umow-wizyte, Kalendarz Google);
 * w wierszu techniki z już wybranym zabiegiem. Rezerwacja nie pyta o zdrowie
 * (art. 9 RODO) – wywiad zdrowotny należy do konsultacji. Obietnice zdrowotne
 * w brzmieniu zgodnym z FAQ tej strony, bez gwarancji.
 * ClosingCta ma tło espresso – ciemniejsza stopka (espresso-900) go domyka.
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';
import {
  ArrowLink,
  ClosingCta,
  CtaButton,
  Faq,
  GoldArc,
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
} from '@/lib/site';
import { MACROS, ROLES } from '@/lib/roles';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Ceny – zawsze z cennika marki                                      */
/* ------------------------------------------------------------------ */

/* Zapis tekstów z cennika (site.js) na tej trasie: twarda spacja w tysiącach
   i przed „zł”, „> 500 zł” → „od 500 zł”, głos „my” zamiast „moich klientek”.
   Źródło w site.js zostaje nietknięte; gdy tam się zmieni, reguły są no-op.
   Docelowo jedna wspólna funkcja dla serwisu (TRESC-13/15). */
const NBSP = '\u00a0';
const fmt = (text) =>
  typeof text !== 'string'
    ? text
    : text
        .replace(/^>\s*/, `od${NBSP}`)
        .replace(/(\d)(\d{3})(?!\d)/g, `$1${NBSP}$2`)
        .replace(/ zł/g, `${NBSP}zł`)
        .replace(/moich klientek/g, 'naszych klientek');

const priceOf = (table, name) => {
  const row = table.items.find((item) => item.name === name);
  return row ? fmt(row.price) : '';
};

/* Fakty w hero – z ACHIEVEMENTS (5× podium MŚ; salony „Katowice i Warszawa")
   i CONTACT.city. Krótkie: FactStrip stoi w jednej linii i przy 375 px musi
   zmieścić się w łamie (≤ 335 px, zmierzone 301 px).
   Autorstwo Super Natural Brows stoi w wierszu 01 indeksu. */
const HERO_FACTS = [`${ACHIEVEMENTS[0].value} podium MŚ`, `Salon – ${CONTACT.city}`];

/* ------------------------------------------------------------------ */
/*  02 – cztery techniki (indeks typograficzny, bez zdjęć)             */
/*  Nazwy jak w cenniku PMU; opisy, cytaty i czasy z poprzedniej        */
/*  wersji strony. Cytaty 03/04 powtarzały opis – usunięte.             */
/* ------------------------------------------------------------------ */

const TECHNIQUES = [
  {
    id: 'supernatural-brows',
    number: '01',
    name: 'Super Natural Brows',
    kind: 'Włos maszynowy · autorska technika Andriany',
    duration: '1,5–2 godziny',
    price: priceOf(PRICING_PMU, 'Super Natural Brows'),
    description:
      'Efekt zadbanych, gęstych, dopasowanych brwi z delikatnym pogrubieniem oraz wyrównaniem kształtu.',
    quote:
      'Idealnie nadaje się dla klientek z życzeniem: „Nie chcę, aby ktoś wiedział, że mam zrobione brwi – mają wyglądać jak moje”.',
  },
  {
    id: 'perfect-brows',
    number: '02',
    name: 'Perfect Powder Brows',
    kind: 'Technika pudrowa · efekt cienia',
    duration: '1,5–2 godziny',
    price: priceOf(PRICING_PMU, 'Perfect Powder Brows'),
    description:
      'Efekt delikatnie podmalowanych brwi cieniem, z podkreślonym kształtem, ale nadal w delikatnej, transparentnej wersji bez przesady.',
    quote: 'Idealne przejścia tonalne (Ombre/Powder) dopasowane do karnacji.',
  },
  {
    id: 'perfect-lips',
    number: '03',
    name: 'Perfect Lips',
    kind: 'Usta permanentne · subtelność i świeżość',
    duration: '2 godziny',
    price: priceOf(PRICING_PMU, 'Perfect Lips'),
    description:
      'Efekt zdrowych, równomiernych, naturalnych ust, bez wyraźnych odcieni, bez przerysowanych konturów oraz bez „sztucznego efektu”.',
  },
  {
    id: 'perfect-eyes',
    number: '04',
    name: 'Perfect Eyeliners',
    kind: 'Pigmentacja linii · zagęszczenie rzęs',
    duration: '1–1,5 godziny',
    price: priceOf(PRICING_PMU, 'Perfect Eyeliners'),
    description:
      'Efekt zagęszczenia rzęs, pogrubienia górnej linii wodnej oka i uwydatnienia koloru tęczówki – bez kreski, bez ogonka i bez cienia na powiece.',
  },
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

const VISIT_STEPS = [
  {
    number: '01',
    title: 'Konsultacja i dobór techniki',
    desc: 'Architektura twarzy i rysunek wstępny. Kolor dobieramy do karnacji, a kształt do Twoich rysów.',
  },
  {
    number: '02',
    title: 'Zabieg',
    desc: 'Zaczynamy dopiero, gdy zaakceptujesz rysunek wstępny. Zabieg trwa od 1 do 2 godzin, zależnie od techniki.',
  },
  {
    number: '03',
    title: `Korekta do 3 miesięcy – ${priceOf(PRICING_PMU, 'Korekta do 3 miesięcy')}`,
    desc: PRICING_PMU.footnote,
    /* ta sama nota stoi pod cennikiem PMU (#cennik) – na telefonie tylko tam */
    descFromSm: true,
  },
];

/* ------------------------------------------------------------------ */
/*  04 – odświeżenie i usuwanie (bez materiału zdjęciowego)            */
/* ------------------------------------------------------------------ */

const AFTERCARE = [
  {
    id: 'odswiezenie',
    number: '01',
    tag: 'Po 1–3 latach',
    name: 'Odświeżenie makijażu permanentnego',
    duration: '1,5 godziny',
    price: `od${NBSP}${fmt(PRICING_REFRESH.items[0].price)}`,
    priceNote: 'Stawka zależy od czasu, jaki minął od ostatniego zabiegu – pełne widełki w cenniku.',
    description:
      'Zabieg, który wykonujemy raz na 1–3 lata, aby odnowić efekt, uzupełnić kolor oraz dodać gęstości, grubości i intensywności.',
  },
  {
    id: 'usuwanie',
    number: '02',
    tag: 'Przed nową pigmentacją',
    name: 'Usuwanie laserem lub removerem',
    duration: '30–45 minut',
    price: priceOf(PRICING_REMOVAL, 'Usuwanie PMU brwi'),
    priceNote: 'Brwi lub usta. Kreski, tatuaże i stawka dla naszych klientek – w cenniku.',
    description:
      'Usuwamy stary, nieudany makijaż permanentny przed nową pigmentacją. Metodę – laser albo remover – dobieramy indywidualnie, tak aby jak najszybciej i najbezpieczniej pozbyć się niechcianego pigmentu.',
  },
];

/* ------------------------------------------------------------------ */
/*  06 – FAQ: treść klienta po korekcie językowej. Absoluty złagodzone  */
/*  (bez „w żadnym przypadku”, „nie ma żadnych blizn”) – brzmienie do   */
/*  akceptacji klienta. Lead w hero jest z tym FAQ zgodny.             */
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
    a: 'Najczęściej nie, ale wiele zależy od Twojej skóry, procesu regeneracji, stanu hormonalnego oraz Twoich oczekiwań po wygojeniu. Gdy trzeba uzupełnić ubytki, poprawić kształt, pogrubić lub zagęścić brwi, dodać intensywności czy delikatnie zmienić kolor, korekta będzie najlepszym rozwiązaniem.',
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
   pseudo-elementem (≥ 44 px wysokości) bez zmiany rytmu wiersza. */
function MoreButton({ more, controls, name, className }) {
  if (!more.showButton) return null;
  return (
    <button
      type="button"
      onClick={more.toggle}
      aria-expanded={more.open}
      aria-controls={controls}
      className={cn(
        "as-label relative inline-flex items-center gap-1.5 leading-none text-ink/70 transition-colors after:absolute after:-inset-x-2 after:-inset-y-4 after:content-[''] hover:text-gold-dark sm:hidden",
        className
      )}
    >
      {more.open ? 'Zwiń' : 'Więcej'}
      <span className="sr-only"> – {name}</span>
      <ChevronDown
        aria-hidden="true"
        className={cn('h-3.5 w-3.5 text-gold-dark transition-transform duration-300', more.open && 'rotate-180')}
      />
    </button>
  );
}

/* Wiersz indeksu – geometria IndexRow (numerał 64 | tytuł 28 | opis | cena
   + link), rozpisana na 4 kolumny wyrównane do góry, żeby opis stał obok
   tytułu, a nie pod nim (budżet wysokości trasy).
   Lokalnie, bo IndexRow nie ma przycinania opisu na telefonie; „Umów wizytę”
   prowadzi do rezerwacji z już wybranym zabiegiem.
   Telefon: numerał obok tytułu, opis (2 linie + „Więcej”) na pełną szerokość,
   meta w jednym rzędzie (czas + cena | „Umów wizytę”), cytat po rozwinięciu.
   Tablet (md): numerał + tytuł w lewej kolumnie, opis i meta w prawej.
   Desktop (lg): cztery kolumny jak dotąd, meta w kolumnie do prawej. */
function TechniqueRow({ t, last }) {
  const more = useMobileMore(Boolean(t.quote));
  const bodyId = `${t.id}-opis`;
  return (
    <article
      id={t.id}
      className={cn(
        'grid scroll-mt-28 grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 border-t border-ink/15 py-5',
        'sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-y-4 sm:py-8',
        'md:grid-cols-[4.5rem_minmax(0,5fr)_minmax(0,7fr)] md:items-start md:gap-x-6',
        'lg:grid-cols-[6rem_20rem_minmax(0,1fr)_auto] lg:gap-8',
        last && 'border-b'
      )}
    >
      <span className="as-display-md leading-none text-gold-dark md:row-span-2 lg:row-span-1">{t.number}</span>
      <div className="md:row-span-2 lg:row-span-1">
        <h3 className="as-title text-ink">{t.name}</h3>
        <p className="as-kicker mt-2">{t.kind}</p>
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
          <span className="as-label mr-3 text-ink/70 sm:mr-4">{t.duration}</span>
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
    <section id="zabiegi" className="as-section scroll-mt-28 border-t border-ink/10 bg-cream-100">
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
/*  03 – EFEKTY I WIZYTA (espresso – jedyny ciemny pas)                */
/* ================================================================== */

function ResultsBand() {
  return (
    <section className="as-section relative overflow-hidden bg-espresso text-cream-50">
      <GoldArc className="-top-32 left-[-6%] h-[720px] w-[900px]" opacity={0.28} />

      <div className="as-shell relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <Reveal>
            <SectionLabel number="03" tone="light">
              Efekty i wizyta
            </SectionLabel>
            <h2 className="as-display-section as-text-balance mt-6 text-cream-100">
              Realne efekty, nie renderowane.
            </h2>
          </Reveal>
          <Reveal delay={80} className="shrink-0">
            <ArrowLink href={CONTACT.instagram} tone="light" className="w-fit" target="_blank" rel="noreferrer">
              Więcej prac na Instagramie
            </ArrowLink>
          </Reveal>
        </div>

        {/* stykówka: cztery makra 1:1 na pełną szerokość łamu, jeden podpis paska */}
        <Reveal delay={80} className="mt-10">
          <ResultStrip
            items={RESULTS}
            tone="dark"
            cols={4}
            ratio="1 / 1"
            caption="Brwi i usta – prace z naszego gabinetu."
          />
        </Reveal>

        {/* przebieg wizyty – trzy kroki pod stykówką; tablet: 2 + 1 (ostatni
            na całą szerokość łamu), desktop: trzy kolumny */}
        <div className="mt-8 grid gap-6 sm:mt-12 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {VISIT_STEPS.map((s, i) => (
            <Reveal
              key={s.number}
              delay={i * 80}
              className={cn(
                'as-cell-invert',
                i === VISIT_STEPS.length - 1 && VISIT_STEPS.length % 2 === 1 && 'md:col-span-2 lg:col-span-1',
                s.descFromSm && 'max-sm:[&_.as-numbered-desc]:hidden'
              )}
            >
              <NumberedItem number={s.number} title={s.title} tone="light">
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

/* Karta zabiegu 04. Telefon: opis 2 linie + „Więcej”; nota ceny dopiero
   po rozwinięciu. Od sm pełna treść. */
function AftercareCard({ t }) {
  const more = useMobileMore(true);
  const descId = `${t.id}-opis`;
  const noteId = `${t.id}-nota`;
  return (
    <article id={t.id} className="as-cell scroll-mt-28">
      <p className="as-kicker">
        {t.number} · {t.tag}
      </p>
      <h3 className="as-title mt-3 text-ink">{t.name}</h3>
      <p
        id={descId}
        ref={more.textRef}
        className={cn('mt-3 text-[0.9375rem] leading-[1.65] text-ink/75', more.clampClass)}
      >
        {t.description}
      </p>
      <MoreButton more={more} controls={`${descId} ${noteId}`} name={t.name} className="mt-1.5" />
      <p className="mt-5 font-display text-[1.375rem] leading-none text-ink sm:mt-6">
        {t.price}
        <span className="as-label ml-4 align-middle text-ink/70">{t.duration}</span>
      </p>
      <p id={noteId} className={cn('as-caption mt-3', more.hiddenClass)}>
        {t.priceNote}
      </p>
    </article>
  );
}

function AftercareBand() {
  return (
    <section className="as-section bg-cream-50">
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
   siedem stawek usuwania) są zwinięte w akordeon – ten sam <Faq> co w pytaniach.
   Od lg obie tabele stoją w pełni: refresh pod PMU, usuwanie w lewej kolumnie. */
const faqOf = (table) => ({
  q: `${table.title} – ${fmt(table.subtitle).toLowerCase()}`,
  a: <PriceRows table={table} />,
});
const MOBILE_PRICE_FAQ = [faqOf(PRICING_REFRESH), faqOf(PRICING_REMOVAL)];

function PricingBand() {
  return (
    <section id="cennik" className="as-section scroll-mt-28 border-t border-ink/10 bg-cream-100">
      <div className="as-shell">
        {/* lg: nagłówek i usuwanie w lewej kolumnie, PMU + refresh w prawej od góry;
            telefon: nagłówek → PMU → nota → akordeon (refresh, usuwanie) */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-12">
          <Reveal className="lg:col-start-1 lg:row-start-1">
            <SectionLabel number="05">Cennik</SectionLabel>
            <h2 className="as-display-section as-text-balance mt-6 text-ink">
              Jasne stawki,
              <br />
              bez gwiazdek.
            </h2>
            <p className="as-body mt-6">
              Wszystkie zabiegi zawierają konsultację, architekturę twarzy oraz rysunek wstępny.
            </p>
          </Reveal>

          <div className="space-y-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:space-y-10">
            <Reveal>
              <PriceBlock table={PRICING_PMU} />
            </Reveal>
            <Reveal>
              <div className="mb-6 hidden lg:block">
                <PriceBlock table={PRICING_REFRESH} />
              </div>
              <p className="as-caption max-w-[30rem]">
                Charytatywna rekonstrukcja dla osób po chorobach onkologicznych – darmowa konsultacja.
              </p>
            </Reveal>
          </div>

          <Reveal delay={80} className="lg:col-start-1 lg:row-start-2">
            <div className="hidden lg:block">
              <PriceBlock table={PRICING_REMOVAL} />
            </div>
            <Faq items={MOBILE_PRICE_FAQ} className="lg:hidden" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  06 – PYTANIA (cream-50)                                            */
/* ================================================================== */

/* Telefon (< sm): pierwsze cztery pytania, reszta za przyciskiem „Pokaż
   wszystkie pytania” – po rozwinięciu fokus przechodzi na pierwsze odsłonięte
   pytanie, a przycisk znika. Od sm lista stoi w pełni, jak dotąd.
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
    <section className="as-section border-t border-ink/10 bg-cream-50">
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
            {!all && FAQ_ITEMS.length > FAQ_MOBILE && (
              <button
                type="button"
                onClick={() => {
                  focusNext.current = true;
                  setAll(true);
                }}
                aria-controls="pytania-lista"
                className="as-label relative mt-6 inline-flex items-center gap-1.5 text-ink/70 transition-colors after:absolute after:-inset-x-2 after:-inset-y-4 after:content-[''] hover:text-gold-dark sm:hidden"
              >
                Pokaż wszystkie pytania ({FAQ_ITEMS.length})
                <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 text-gold-dark" />
              </button>
            )}
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

      <ClosingCta
        number="07"
        label="Wizyta"
        title="Zacznijmy od"
        titleAccent="konsultacji."
        lead={`${CONTACT.venue} – ${CONTACT.city}. Napisz, co chcesz zmienić, a dobierzemy technikę i termin.`}
        primary={{ href: BOOKING_URL, label: 'Umów wizytę' }}
        secondary={{ href: '#cennik', label: 'Zobacz cennik' }}
      />

    </>
  );
}
