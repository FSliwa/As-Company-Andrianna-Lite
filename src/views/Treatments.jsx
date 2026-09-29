'use client';

/**
 * ZABIEGI — /uslugi  („Numer 01")
 *
 * Każda sekcja to rozkładówka: SectionLabel → H2 .as-display-section → treść →
 * jedno wezwanie. Portret wyłącznie przez ROLES, makra wyłącznie przez MACROS
 * (src/lib/roles.js) — na tej trasie dokładnie cztery makra, wszystkie w pasie
 * efektów. Ceny zawsze z cennika marki (PRICING_* w src/lib/site.js).
 *
 * Rytm tła: 01 hero (cream-50) → 02 techniki (cream-100, hairline) → 03 efekty
 * i wizyta (espresso — jedyny ciemny pas) → 04 odświeżenie i usuwanie (cream-50)
 * → 05 cennik #cennik (cream-100, hairline) → 06 pytania (cream-50, hairline)
 * → 07 ClosingCta + stopka (espresso-900, jeden blok).
 *
 * Korekta do 3 miesięcy występuje jako krok 03 wizyty (pas espresso), więc
 * sekcja 04 obejmuje tylko zabiegi, których nie ma w indeksie ani w krokach.
 *
 * Telefon: cytaty technik i wstępy sekcji 04/06 ukryte (< sm); tabele refresh
 * i usuwania zwinięte w <Faq> (< lg) — od lg stoją w pełni.
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowLink,
  ClosingCta,
  CtaButton,
  Faq,
  Field,
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
  CONTACT,
  FOUNDER,
  PRICING_PMU,
  PRICING_REFRESH,
  PRICING_REMOVAL,
} from '@/lib/site';
import { MACROS, ROLES } from '@/lib/roles';
import { cn } from '@/lib/utils';
import { enquiryMessage, sendEnquiry } from '@/lib/enquiry';

/* ------------------------------------------------------------------ */
/*  Ceny — zawsze z cennika marki                                      */
/* ------------------------------------------------------------------ */

const priceOf = (table, name) => {
  const row = table.items.find((item) => item.name === name);
  return row ? row.price : '';
};

/* Fakty w hero — z ACHIEVEMENTS (5× podium MŚ; salony „Katowice i Warszawa")
   i CONTACT.city. Krótkie: FactStrip stoi w jednej linii i przy 375 px musi
   zmieścić się w łamie (≤ 335 px, zmierzone 301 px).
   Autorstwo Super Natural Brows stoi w wierszu 01 indeksu. */
const HERO_FACTS = [`${ACHIEVEMENTS[0].value} podium MŚ`, `Salon — ${CONTACT.city}`];

/* ------------------------------------------------------------------ */
/*  02 — cztery techniki (indeks typograficzny, bez zdjęć)             */
/*  Nazwy jak w cenniku PMU; opisy, cytaty i czasy z poprzedniej        */
/*  wersji strony. Cytaty 03/04 powtarzały opis — usunięte.             */
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
      'Idealnie nadaje się dla klientek z życzeniem: „Nie chcę, aby ktoś wiedział, że mam zrobione brwi — mają wyglądać jak moje”.',
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
      'Efekt zagęszczania rzęs, pogrubienia górnej wodnej linii oka, uwydatnienie koloru tęczówki, bez kreski, bez ogonka i bez cienia na powiece.',
  },
];

/* ------------------------------------------------------------------ */
/*  03 — efekty (makra z białej listy) i przebieg wizyty               */
/* ------------------------------------------------------------------ */

const RESULTS = [
  { macro: MACROS.brows15, alt: 'Brwi po makijażu permanentnym — zbliżenie' },
  { macro: MACROS.brows08, alt: 'Brew i oko po makijażu permanentnym — zbliżenie' },
  { macro: MACROS.brows17, alt: 'Łuk brwi po makijażu permanentnym — zbliżenie' },
  { macro: MACROS.lips05, alt: 'Usta po makijażu permanentnym — zbliżenie' },
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
    title: `Korekta do 3 miesięcy — ${priceOf(PRICING_PMU, 'Korekta do 3 miesięcy')}`,
    desc: PRICING_PMU.footnote,
  },
];

/* ------------------------------------------------------------------ */
/*  04 — odświeżenie i usuwanie (bez materiału zdjęciowego)            */
/* ------------------------------------------------------------------ */

const AFTERCARE = [
  {
    id: 'odswiezenie',
    number: '01',
    tag: 'Po 1–3 latach',
    name: 'Odświeżenie makijażu permanentnego',
    duration: '1,5 godziny',
    price: 'od ' + PRICING_REFRESH.items[0].price,
    priceNote: 'Stawka zależy od czasu, jaki minął od ostatniego zabiegu — pełne widełki w cenniku.',
    description:
      'Zabieg, który wykonujemy raz na 1–3 lata, dla odnowienia efektu, uzupełnienia koloru, dodania gęstości, grubości i intensywności koloru.',
  },
  {
    id: 'usuwanie',
    number: '02',
    tag: 'Bezpieczne oczyszczanie',
    name: 'Usuwanie laserem lub removerem',
    duration: '30–45 minut',
    price: priceOf(PRICING_REMOVAL, 'Usuwanie PMU brwi'),
    priceNote: 'Brwi lub usta. Kreski, tatuaże i stawki dla stałych klientek — w cenniku.',
    description:
      'Usuwamy stary, nieudany makijaż permanentny przed nową pigmentacją. Metodę — laser albo remover — dobieramy indywidualnie, tak aby jak najszybciej i najbezpieczniej pozbyć się niechcianego pigmentu.',
  },
];

/* ------------------------------------------------------------------ */
/*  06 — FAQ (treść zachowana bez zmian)                               */
/* ------------------------------------------------------------------ */

const FAQ_ITEMS = [
  {
    q: 'Czy włos maszynowy się nie rozpływa?',
    a: 'Włos maszynowy to tak samo płytka, delikatna i nietraumatyczna technika jak i puder, nie jest to piórkowa metoda, nie nacinamy skóry, nie wbijamy głęboko pigmentu. Pigmentujemy włoski precyzyjnie nasycając je warstwami pudru, delikatnie, z umiarem i wyczuciem. Dlatego włos maszynowy nie rozpływa się z czasem.',
  },
  {
    q: 'Czy kolor z czasem nie zrobi się czerwony lub szary?',
    a: 'Pigmenty oraz techniki, które wykorzystujemy są najwyższej jakości, spotykanej na rynku PMU. Stąd pewność w ich przewidywalnym zachowaniu się z czasem, co potwierdzają zdjęcia i filmy na naszym IG. Oczywiście skóra i hormony każdego człowieka rządzą się swoimi prawami, na to nie mamy wpływu i rzadko ale zdarza się że kolor pigmentu może się wychłodzić, ale mamy rozwiązanie dla takich klientek - bezpłatna inwersja koloru w cieplejszy odcień.',
  },
  {
    q: 'Czy będzie rysunek wstępny przed pigmentacją?',
    a: 'Oczywiście że tak! Bez niego nie ruszymy. Rysunek wstępny zostanie dopasowany do Twojej architektury twarzy, a w momencie jak będziesz go sprawdzać możemy wprowadzić zmiany, uwzględniając Twoje uwagi i życzenia.',
  },
  {
    q: 'Czy zabieg jest bolesny?',
    a: 'W 90% przypadków zabieg jest bezbolesny, a większość klientek przysypia podczas pigmentacji. Wrażliwe klientki będą odczuwać podczas pierwszego przejścia maszynką drapanie skóry, a już od razu po nim nałożymy żel chłodzący, który zniweluje nieprzyjemne odczucia i większą część zabiegu też można się relaksować.',
  },
  {
    q: 'Czy korekta jest obowiązkowa?',
    a: 'Najczęściej nie, ale wiele zależy od Twojej skóry, procesu regeneracji, stanu hormonalnego oraz życzenia po wygojeniu. Gdy będziemy potrzebować uzupełnić ubytki, poprawić kształt, pogrubić lub zagęścić brwi, dodać intensywności czy delikatnie zmienić kolor - wykonanie korekty będzie najlepszym rozwiązaniem.',
  },
  {
    q: 'Czy można robić nowy zabieg na starym makijażu permanentnym?',
    a: 'Zależy od tego, jak wygląda Twój obecny makijaż permanentny, jak dawno był zrobiony, czy był usuwany oraz czy jest możliwy do poprawy. Poprosimy Cię o wysłanie zdjęcia brwi/ust, abyśmy mogły ocenić jego wygląd. Gdy resztki będą delikatne, żółte, pomarańczowe czy lekko widoczne - zrobimy cover. W przypadku jak PMU będzie miał szary, ciemny, wyraźny zarys - zaprosimy na usuwanie.',
  },
  {
    q: 'Czy usuwanie uszkodzi moje włoski na brwiach?',
    a: 'W żadnym przypadku. Często widzimy odwrotną reakcję: włoski po usuwaniu zaczynają aktywniej odrastać, ponieważ skóra pozbywa się nadmiaru pigmentu i włoski mają miejsce na porost. Czasami po zabiegu zauważysz zbielenie włosków, ale jest to tymczasowa reakcja, wkrótce włoski wracają do swojego koloru, a jak nie będziesz chciała czekać - można zrobić hennę lub farbkę już 2-3 dni po zabiegu usuwania.',
  },
  {
    q: 'Czy usuwanie jest bardzo bolesne?',
    a: 'Na pewno nie zaliczymy tego zabiegu do przyjemnych, ale samo usuwanie trwa około minuty, po zabiegu od razu wychłodzimy Twoją skórę i zadbamy abyś czuła się komfortowo. Każdy ma inny próg bólu, ktoś odczuwa mocniej, a ktoś wcale nie przeżywa bólu.',
  },
  {
    q: 'Czy po usuwaniu będą blizny?',
    a: 'Usuwamy bardzo bezpiecznie oraz skutecznie. Zależy nam na tym, aby Twoja skóra była dobrze przygotowana do nowej pigmentacji, jej stan jest dla nas najważniejszy. Dlatego po usuwaniu laserem oraz removerem u nas nie ma żadnych blizn czy poparzeń. Jedynie należy rozumieć, że jak Twój PMU był zrobiony bardzo głęboko i traumatycznie przed zabiegiem u nas, co powoduje że te blizny są jeszcze przed usuwaniem, to po pozbyciu się koloru z brwi te blizny nie znikną. Będziemy łączyć techniki usuwania, aby jednocześnie usuwać pigment i działać na dobro Twojej skóry.',
  },
];

/* ================================================================== */
/*  02 — TECHNIKI (cream-50)                                           */
/* ================================================================== */

/* Wiersz indeksu — geometria IndexRow (numerał 64 | tytuł 28 | opis | cena
   + link), rozpisana na 4 kolumny wyrównane do góry, żeby opis stał obok
   tytułu, a nie pod nim (budżet wysokości trasy).
   Lokalnie, bo IndexRow przyjmuje tylko `href`, a tu link otwiera dialog
   rezerwacji — ArrowLink z onClick (semantyka <button>).
   Telefon: numerał obok tytułu, opis i meta na pełną szerokość; blok meta
   zawsze w kolumnie (czas + cena → „Umów wizytę"), cytat dopiero od sm. */
function TechniqueRow({ t, onBook, last }) {
  return (
    <article
      id={t.id}
      className={cn(
        'grid scroll-mt-28 grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 gap-y-4 border-t border-ink/15 py-8 sm:grid-cols-[5rem_minmax(0,1fr)] lg:grid-cols-[6rem_20rem_minmax(0,1fr)_auto] lg:items-start lg:gap-8',
        last && 'border-b'
      )}
    >
      <span className="as-display-md leading-none text-gold-dark">{t.number}</span>
      <div>
        <h3 className="as-title text-ink">{t.name}</h3>
        <p className="as-kicker mt-2">{t.kind}</p>
      </div>
      <div className="col-span-2 sm:col-span-1 sm:col-start-2 lg:col-start-auto">
        <p className="max-w-[34rem] text-[0.9375rem] leading-[1.65] text-ink/75">{t.description}</p>
        {t.quote && <p className="as-quote mt-3 hidden max-w-[34rem] text-mocha sm:block">{t.quote}</p>}
      </div>
      <div className="col-span-2 flex flex-col items-start gap-3 sm:col-span-1 sm:col-start-2 lg:col-start-auto lg:items-end lg:gap-4">
        <p className="whitespace-nowrap">
          <span className="as-label mr-4 text-ink/55">{t.duration}</span>
          <span className="font-display text-[1.375rem] leading-none text-ink">{t.price}</span>
        </p>
        <ArrowLink onClick={() => onBook(t)} className="w-fit">
          Umów wizytę<span className="sr-only"> — {t.name}</span>
        </ArrowLink>
      </div>
    </article>
  );
}

function TechniquesBand({ onBook }) {
  return (
    <section id="zabiegi" className="as-section scroll-mt-28 border-t border-ink/10 bg-cream-100">
      <div className="as-shell">
        <Reveal>
          <SectionLabel number="02">Techniki</SectionLabel>
          <h2 className="as-display-section as-text-balance mt-6 text-ink">
            Cztery techniki, jeden standard.
          </h2>
        </Reveal>

        <div className="mt-10">
          {TECHNIQUES.map((t, i) => (
            <Reveal key={t.id} delay={i * 60}>
              <TechniqueRow t={t} onBook={onBook} last={i === TECHNIQUES.length - 1} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  03 — EFEKTY I WIZYTA (espresso — jedyny ciemny pas)                */
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
            caption="Brwi i usta — prace z naszego gabinetu."
          />
        </Reveal>

        {/* przebieg wizyty — trzy kroki pod stykówką */}
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {VISIT_STEPS.map((s, i) => (
            <Reveal key={s.number} delay={i * 80} className="as-cell-invert">
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
/*  04 — ODŚWIEŻENIE I USUWANIE (cream-50)                             */
/* ================================================================== */

function AftercareBand() {
  return (
    <section className="as-section bg-cream-50">
      <div className="as-shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-5">
            <SectionLabel number="04">Odświeżenie i usuwanie</SectionLabel>
            <h2 className="as-display-section as-text-balance mt-6 text-ink">
              Odnowić albo zacząć od&nbsp;nowa.
            </h2>
            <p className="as-body mt-6 hidden sm:block">
              Zabiegi uzupełniające prowadzimy tym samym standardem co pigmentację: ocena skóry, dobór
              metody, bezpieczne gojenie. Część z nich wykonujemy dopiero po obejrzeniu zdjęć obecnego
              makijażu permanentnego.
            </p>
            <ArrowLink href="#cennik" className="mt-8 w-fit">
              Zobacz cennik
            </ArrowLink>
          </Reveal>

          <div className="grid gap-10 md:grid-cols-2 md:gap-8 lg:col-span-6 lg:col-start-7 lg:self-end">
            {AFTERCARE.map((t, i) => (
              <Reveal key={t.id} delay={i * 80}>
                <article id={t.id} className="as-cell scroll-mt-28">
                  <p className="as-kicker">
                    {t.number} · {t.tag}
                  </p>
                  <h3 className="as-title mt-3 text-ink">{t.name}</h3>
                  <p className="mt-3 text-[0.9375rem] leading-[1.65] text-ink/75">{t.description}</p>
                  <p className="mt-6 font-display text-[1.375rem] leading-none text-ink">
                    {t.price}
                    <span className="as-label ml-4 align-middle text-ink/55">{t.duration}</span>
                  </p>
                  <p className="as-caption mt-3">{t.priceNote}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  05 — CENNIK (cream-100) — jedyny pełny cennik w serwisie           */
/* ================================================================== */

/* PriceRow rysuje górną linię przy pierwszym wierszu (first:border-t),
   więc wrapper nie dostaje własnego border-t — inaczej byłaby podwójna linia.
   Noty, które powtarzają podtytuł tabeli („Laser / remover") albo są wspólne
   dla wszystkich pozycji („Niezależnie od strefy pigmentacji"), pokazujemy raz. */
function PriceRows({ table }) {
  const first = table.items[0] && table.items[0].note;
  const shared = table.items.length > 1 && first && table.items.every((it) => it.note === first) ? first : null;
  const noteOf = (it) => (it.note === table.subtitle || it.note === shared ? undefined : it.note);
  return (
    <>
      {table.items.map((item) => (
        <PriceRow key={item.name} name={item.name} note={noteOf(item)} price={item.price} />
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
        <p className="as-kicker">{table.subtitle}</p>
      </div>
      <div className="mt-4">
        <PriceRows table={table} />
      </div>
    </div>
  );
}

/* Telefon: cennik PMU zostaje otwarty, a tabele uzupełniające (refresh,
   siedem stawek usuwania) są zwinięte w akordeon — ten sam <Faq> co w pytaniach.
   Od lg obie tabele stoją w pełni: refresh pod PMU, usuwanie w lewej kolumnie. */
const faqOf = (table) => ({
  q: `${table.title} — ${table.subtitle.toLowerCase()}`,
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

          <div className="space-y-10 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <Reveal>
              <PriceBlock table={PRICING_PMU} />
            </Reveal>
            <Reveal>
              <div className="mb-6 hidden lg:block">
                <PriceBlock table={PRICING_REFRESH} />
              </div>
              <p className="as-caption max-w-[30rem]">
                Charytatywna rekonstrukcja dla osób po chorobach onkologicznych — darmowa konsultacja.
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
/*  06 — PYTANIA (cream-50)                                            */
/* ================================================================== */

function FaqBand() {
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
              Odpowiedzi na wątpliwości, które najczęściej słyszymy przed zabiegiem — o technikę,
              kolor, ból i usuwanie.
            </p>
          </Reveal>
          <Reveal delay={80} className="lg:col-span-8 lg:col-start-5">
            <Faq items={FAQ_ITEMS} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */

export default function Treatments() {
  const { toast } = useToast();
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [bookingForm, setBookingForm] = useState({ name: '', phone: '', date: '', notes: '' });

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const { status } = sendEnquiry({
      subject: `Zapytanie o termin${selectedTreatment ? ` — ${selectedTreatment.name}` : ''}`,
      fields: [
        ['Imię i nazwisko', bookingForm.name],
        ['Telefon', bookingForm.phone],
        ['Preferowany termin', bookingForm.date],
        ['Zabieg', selectedTreatment ? selectedTreatment.name : ''],
        ['Uwagi', bookingForm.notes],
      ],
    });
    const msg = enquiryMessage(status);
    toast({ title: msg.title, description: msg.body });
    setSelectedTreatment(null);
    setBookingForm({ name: '', phone: '', date: '', notes: '' });
  };

  return (
    <>
      <PageHero
        label="Zabiegi"
        number="01"
        title="Zabiegi makijażu"
        titleAccent="permanentnego."
        lead="Specjalizujemy się w uzyskaniu najbardziej realistycznego, subtelnego efektu. Bez przerysowanych konturów, bez bólu i bez kompromisów."
        image={ROLES.heroTreatments.image}
        imagePosition={ROLES.heroTreatments.position}
        imageAlt={`${FOUNDER.name} — ${FOUNDER.signature}`}
        tone="cream"
        imageSide="left"
        facts={HERO_FACTS}
      >
        <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
          <CtaButton href="/kontakt" className="as-btn-solid">
            Umów wizytę
          </CtaButton>
          <ArrowLink href="#cennik" className="w-fit">
            Zobacz cennik
          </ArrowLink>
        </div>
      </PageHero>

      <TechniquesBand onBook={setSelectedTreatment} />
      <ResultsBand />
      <AftercareBand />
      <PricingBand />
      <FaqBand />

      <ClosingCta
        number="07"
        label="Wizyta"
        title="Zacznijmy od"
        titleAccent="konsultacji."
        lead={`${CONTACT.venue} — ${CONTACT.city}. Napisz, co chcesz zmienić, a dobierzemy technikę i termin.`}
        primary={{ href: '/kontakt', label: 'Umów wizytę' }}
        secondary={{ href: '#cennik', label: 'Zobacz cennik' }}
      />

      {/* ——— Rezerwacja — dialog na brandowych klasach z ui/dialog, pola <Field> ——— */}
      <Dialog open={!!selectedTreatment} onOpenChange={(open) => !open && setSelectedTreatment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rezerwacja zabiegu</DialogTitle>
            <DialogDescription>
              {selectedTreatment ? selectedTreatment.name : ''}
              {selectedTreatment && selectedTreatment.price ? ' · ' + selectedTreatment.price : ''}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBookingSubmit} className="mt-8 space-y-6">
            <Field
              id="bname"
              label="Imię i nazwisko"
              required
              placeholder="np. Anna Kowalska"
              value={bookingForm.name}
              onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
            />
            <Field
              id="bphone"
              label="Numer telefonu"
              type="tel"
              required
              placeholder="+48 500 000 000"
              value={bookingForm.phone}
              onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
            />
            <Field
              id="bdate"
              label="Preferowana data i godzina"
              type="text"
              required
              placeholder="np. Przyszły wtorek po 15:00"
              value={bookingForm.date}
              onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
            />
            <Field
              as="textarea"
              id="bnotes"
              label="Uwagi (np. czy posiadasz stary PMU / uczulenia)"
              placeholder="Napisz czy brwi/usta były wcześniej pigmentowane..."
              value={bookingForm.notes}
              onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
            />

            <DialogFooter>
              <button type="submit" className="as-btn-solid">
                Wyślij zapytanie
              </button>
              <button
                type="button"
                className="as-btn-ghost"
                onClick={() => setSelectedTreatment(null)}
              >
                Anuluj
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
