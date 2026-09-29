'use client';

/**
 * Szkolenia (/szkolenia) – „Numer 01".
 *
 * Każda sekcja to rozkładówka: SectionLabel → H2 .as-display-section → treść
 * → jedno wezwanie. Rytm tła: cream-50 (hero) → cream-100 → cream-50 →
 * espresso (jedyny ciemny pas) → cream-50 → cream-100 → espresso-900
 * (ClosingCta + stopka). Sąsiednie jasne sekcje dzieli hairline.
 *
 * Zdjęcia: portret wyłącznie przez ROLES, grupy wyłącznie przez GROUPS
 * (src/lib/roles.js). Makra na tej trasie: 0.
 * D8: plakaty COURSE nie są dużymi obrazami w treści – przy kursie, który ma plakaty,
 * stoi rząd miniatur (≤ 160 px) „Oferta do pobrania” z linkiem do pełnego JPG.
 *
 * Dane: COURSES / COURSE_SCHEDULE / TRAINING_INTRO z '@/lib/site'.
 * D4: pięć kursów z briefu – karty w „Kursach” (02), program krok po kroku (03) tylko
 * tam, gdzie podają go źródła (kurs od podstaw, kurs dla linergistek). Kursy bez
 * programu mają kotwicę #program-<id> na karcie (menu, JSON-LD).
 * Korzyści (BENEFITS) – 1:1 z kart „zakres i cena” course-03 (kurs dla linergistek)
 * i course-05 (kurs od podstaw), po korekcie.
 *
 * Formularz zgłoszenia NIE realizuje płatności – zbiera dane i informuje, że
 * termin i rozliczenie potwierdzamy w rozmowie. Brief: „Link na płatność i rezerwacja”
 * – linku brak (do dostarczenia przez klientkę).
 *
 * Telefon (< md): program każdego kursu i korzyści pokazują początek listy, resztę
 * chowa rozwinięcie (MobileMore) – nic nie jest usuwane. Od md wszystko otwarte.
 */

import React, { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLink,
  ClosingCta,
  CtaButton,
  Faq,
  Field,
  Figure,
  FormNotice,
  PageHero,
  Reveal,
  RequiredLegend,
  SectionLabel,
} from '@/components/as/Primitives';
import {
  ACHIEVEMENTS,
  BRAND,
  CONTACT,
  COURSES,
  COURSE_SCHEDULE,
  FOUNDER,
  NAV_ALL,
  SHOP,
  TRAINING_INTRO,
} from '@/lib/site';
import { GROUPS, ROLES } from '@/lib/roles';
import { COURSE } from '@/lib/media';
import { COURSE_ENQUIRY_OPTIONS, enquiryMessage, sendEnquiry } from '@/lib/enquiry';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Dane pomocnicze                                                    */
/* ------------------------------------------------------------------ */

const byId = (id) => COURSES.find((c) => c.id === id);
const pad = (n) => String(n).padStart(2, '0');
const lowerFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);

/* Twarda spacja w kwotach („7 000 zł", „15 000 zł netto") – kwota nie łamie się w pół. */
const NBSP = ' ';
const nb = (s) => String(s).replace(/ /g, NBSP);

/* D4: „netto” tylko tam, gdzie podaje je plakat (priceNote), nowe kursy bez oznaczenia.
   „Szyty na miarę” nie ma ceny w źródłach (brief: budżet dopasowany do Ciebie) – bez kwoty. */
const NO_PRICE = 'Wycena indywidualna';
const priceLabel = (c) => (c.price ? nb([c.price, c.priceNote].filter(Boolean).join(' ')) : NO_PRICE);

/* Kolejność kart wg poziomu: od zera → dla linergistek → zaawansowany → każdy poziom.
   Dwa kursy z grafik jak dotąd; nowe kursy z briefu (D4) na końcu, w kolejności COURSES. */
const FIRST = ['kurs-podstawowy', 'super-natural-brows'];
const COURSE_LIST = [...FIRST.map(byId), ...COURSES.filter((c) => !FIRST.includes(c.id))]
  .filter(Boolean)
  .map((course, i) => ({ number: pad(i + 1), course }));

/* Krótka nazwa kursu – ta sama co w menu (NAV_ALL › Edukacja, link #program-<id>);
   pole wyboru w formularzu nie ucina jej na telefonie. */
const NAV_LINKS = NAV_ALL.flatMap((group) => group.links);
const shortName = (c) =>
  NAV_LINKS.find((l) => l.href.endsWith(`#program-${c.id}`))?.label || c.fullTitle || c.title;

/* D4: kurs online Perfect Lips – link do sklepu dopiero, gdy klientka poda adres produktu
   (SHOP.perfectLipsCourse); do tego czasu przycisk otwiera zapytanie „Zapytaj o dostęp”. */
const COURSE_URL = { 'perfect-lips-online': SHOP.perfectLipsCourse };

/* „Poziom zaawansowany” pod etykietą „Poziom” → „Zaawansowany” (bez powtórzenia słowa). */
const levelText = (level) => {
  const s = level.replace(/^Poziom\s+/i, '');
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/* Korzyści – 1:1 z kart „zakres i cena" (course-03 i course-05), po korekcie językowej.
   Punkt „Poprawa postawy ręki…" jest tylko na karcie kursu dla linergistek (course-03).
   D4: Master Class «Efekt lami» z plakatów zostaje wyłącznie jako korzyść – to nie jest
   Master Class „SNB Expert” z briefu (osobna karta kursu). */
const BENEFITS = [
  { text: 'System nauki zrozumiały dla każdego. Nie musisz umieć malować, aby nauczyć się tej techniki' },
  { text: 'Nauka atrakcyjnych zdjęć i marketing' },
  { text: 'Cena zabiegu i jej wpływ na klientki' },
  { text: 'Poprawa postawy ręki i wykonania pięknego ruchu pudrowego', only: 'kurs dla linergistek' },
  {
    text: `Możliwość dalszego rozwoju w technice na Master Classie „Efekt lami” i Warsztatach (dostępnych tylko dla naszych kursantek)`,
  },
  { text: 'Dożywotnia opieka i grupa wsparcia' },
  { text: 'Możliwość zakupu niezbędnych produktów do PMU na miejscu i przetestowania maszyny AS PRINCESS' },
  { text: 'Lunch, napoje i przekąski zapewnione' },
];

/* Fakty w hero – dwa krótkie. Do lg FactStrip układa je w dwie kolumny (≈ 170 px każda
   na telefonie), więc muszą być krótkie.
   D7 / SZK-18: samo „100+ kursantek” gubiło kontekst (brief: setki kursantek łącznie,
   ponad 100 z włosa maszynowego w ostatnim roku) – w hero „setki kursantek” z briefu. */
const HERO_FACTS = [`${ACHIEVEMENTS[0].value} podium MŚ`, 'Setki kursantek'];

/* D8: opisowe alt-y oryginalnych grafik (treść wg transkrypcji), klucz = indeks w COURSE
   (course-0N.jpg → N−1). Przypisanie plakatów do kursów: COURSES[].posters. */
const POSTER_ALT = {
  0: 'Program kursu dla linergistek Super Natural Brows: 14 dni przygotowania online, 2 dni praktyki stacjonarnej, 2 modelki pokazowe, 2 modelki dla praktyki, 2 sposoby na szybki rysunek wstępny i 3 schematy ułożenia włosków',
  1: 'Plakat kursu Super Natural Brows: maszynowy włos – najbardziej wymagająca, nowoczesna i ekskluzywna technika',
  2: 'Zakres i cena kursu dla linergistek Super Natural Brows: lista korzyści i cena 7 000 zł netto',
  3: 'Program kursu od podstaw Super Natural Brows: przygotowanie online, 4 dni praktyki stacjonarnej, 2 modelki pokazowe i 4 modelki dla praktyki',
  4: 'Zakres i cena kursu od podstaw Super Natural Brows: lista korzyści i cena 15 000 zł netto',
  5: 'Harmonogram kursu od podstaw Super Natural Brows: przygotowanie online i 4 dni stacjonarne godzina po godzinie',
  6: 'Plakat kursu od podstaw Super Natural Brows: maszynowy włos – najbardziej wymagająca, nowoczesna i ekskluzywna technika',
};

/* D1: plakaty course-04 (Program) i course-06 (Harmonogram) podają „16 dni online”, a brief
   (obowiązujący) – 30 dni. Do czasu nowych grafik od klientki nie pokazujemy ich w „Ofercie
   do pobrania” (sprzeczna liczba tuż obok tekstu strony). Ich treść jest na stronie tekstem:
   program kursu i harmonogram dni stacjonarnych. Po dostarczeniu grafik: usunąć indeksy. */
const POSTERS_HIDDEN = new Set([3, 5]);

const FAQ_ITEMS = [
  {
    q: 'Czy po szkoleniu zacznę pracę z klientkami?',
    a: 'Tak, właśnie po to stworzyliśmy unikatowy system szkolenia online + offline: na kursie skupiamy się głównie na praktyce i pomagamy pokonać lęk przed pracą z klientkami. Przy pierwszej modelce wykonasz pracę z delikatną pomocą prowadzącej, a przy ostatniej – zupełnie samodzielnie!',
  },
  {
    q: 'Czy podczas szkolenia można kupić produkty potrzebne do wykonywania zabiegu?',
    a: 'Tak, oczywiście! Otrzymasz kod rabatowy na zakupy online, a niezbędne akcesoria kupisz też od razu na miejscu. Jako nasza kursantka masz atrakcyjniejsze ceny i nasze rekomendacje, dzięki którym nie przepłacisz.',
  },
  {
    /* SZK-15: KFS to fundusz, nie rejestr (korekta zostaje); bez „m.in.” – brief nie wymienia
       innych źródeł finansowania (D10). Brzmienie deklaracji do akceptacji klientki. */
    q: 'Czy mogę skorzystać z dofinansowania na te szkolenia?',
    a: 'Tak. Jesteśmy wpisani do RIS (Rejestr Instytucji Szkoleniowych) i BUR (Baza Usług Rozwojowych), a szkolenia mogą być finansowane ze środków KFS (Krajowy Fundusz Szkoleniowy). Wybierz dogodną dla siebie placówkę, sprawdź w urzędzie miasta lub urzędzie pracy, jakie wymagania musi spełnić Twój wniosek, i poproś swojego operatora o kontakt z nami – przekażemy mu wszystkie niezbędne informacje i dokumenty.',
  },
  {
    /* SZK-17: bez dopisanych „konsultacji prac i wsparcia w rozwoju” – brzmienie briefu. */
    q: 'Czy jest opieka po szkoleniu?',
    a: 'Tak, jesteśmy w stałym kontakcie, bez ograniczeń i ram czasowych – nawet po kilku latach możesz nadal liczyć na naszą pomoc i wsparcie!',
  },
  {
    /* SZK-07: bez „(kameralne, 2–4 osoby)” – brief nie podaje tu liczb, a wielkość grupy
       różni się między kursami (jest na każdej karcie kursu). */
    q: 'Czy na szkoleniu będą inne osoby?',
    a: 'Zdecydowanie tak. Zawsze polecamy kursy grupowe: jest na nich zdrowa konkurencja, wesoły klimat, nowe znajomości, pomoc innych kursantek i okazja, by podzielić się swoimi postępami i pochwalić się nimi – a czasem nawet znaleźć wierną koleżankę z branży PMU na długie lata!',
  },
];

/* Odmiana liczebnika: 1 pozycja · 2–4 pozycje (poza 12–14) · 5+ pozycji. */
const plural = (n, one, few, many) => {
  if (n === 1) return one;
  const d = n % 10;
  const dd = n % 100;
  return d >= 2 && d <= 4 && (dd < 12 || dd > 14) ? few : many;
};

/* Ile pozycji widać na telefonie (< sm) przed rozwinięciem. */
const PROGRAM_PREVIEW = 3;
const BENEFITS_PREVIEW = 3;

/* Pozycja zwiniętej listy: < sm widać `n` pierwszych; w dwóch kolumnach (sm–md)
   liczba zaokrąglona w górę do parzystej, żeby ostatni rząd nie urywał się w pół. */
const collapsedClass = (i, n) => {
  if (i >= n + (n % 2)) return 'max-md:hidden';
  if (i >= n) return 'max-sm:hidden';
  return undefined;
};

/* Rozwinięcie tylko na telefonie (< md). Od md lista jest zawsze otwarta,
   a przycisk znika – decydują same klasy responsywne (max-md:hidden), więc
   SSR i desktop renderują dokładnie to samo co dotąd, bez skoku po hydratacji.
   (<details> nie da się otworzyć samym CSS od md – wymagałby JS po starcie.) */
function MobileMore({ open, onToggle, controls, label, openLabel, className }) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      onClick={onToggle}
      className={cn(
        'group flex min-h-[48px] w-full items-center justify-between gap-6 border-y border-ink/15 py-3 text-left md:hidden',
        className
      )}
    >
      <span className="as-label text-ink transition-colors group-hover:text-gold-deep">
        {open ? openLabel : label}
      </span>
      <ChevronDown
        aria-hidden="true"
        className={cn(
          'h-4 w-4 shrink-0 text-gold-deep transition-transform duration-300 motion-reduce:transition-none',
          open && 'rotate-180'
        )}
      />
    </button>
  );
}

/* ================================================================== */
/*  01 – HERO                                                          */
/* ================================================================== */

function Hero({ onBook }) {
  return (
    <PageHero
      variant="cover"
      number="01"
      label="Szkolenia"
      title="Szkolenia oparte na"
      titleAccent="realnej praktyce."
      /* SZK-16: zdanie z briefu („Uczymy nie tylko…”) zamiast parafrazy z „zero lęku”;
         D3: bez „bezboleśnie” – w danych „z minimalnym dyskomfortem”. */
      lead={TRAINING_INTRO.how}
      image={ROLES.heroTraining.image}
      imagePosition={ROLES.heroTraining.position}
      /* BIO-12: bez angielskiego tytułu „International PMU Trainer & Judge” (nie od klientki). */
      imageAlt={`${FOUNDER.name}, prowadząca szkolenia ${BRAND.academy}`}
      facts={HERO_FACTS}
    >
      <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
        <CtaButton onClick={(e) => onBook(null, e)} className="as-btn-solid">
          Zapytaj o termin
        </CtaButton>
        <ArrowLink href="#kursy" className="w-fit">
          Zobacz kursy
        </ArrowLink>
      </div>
    </PageHero>
  );
}

/* ================================================================== */
/*  02 – KURSY + DOFINANSOWANIE (cream-100)                            */
/* ================================================================== */

/* Karta kursu – wszystko z COURSES (brief i plakaty): rodzaj, nazwa, cena, opis, format,
   poziom, grupa, warunki. Kursy bez programu (D4: źródła go nie podają) mają kotwicę
   #program-<id> na karcie – prowadzą do niej menu i JSON-LD. */
function CourseCard({ number, course, delay, onBook }) {
  const url = COURSE_URL[course.id];
  const hasProgram = course.program.length > 0;
  /* Format tylko dla kursów online + stacjonarnie: przy kursie online i „szytym na miarę”
     opis formatu powtarza lead. */
  const specs = [
    course.mode === 'blended' && ['Format', course.format],
    course.level && ['Poziom', levelText(course.level)],
    course.group && ['Grupa', course.group],
    course.requirements && ['Wymagania', course.requirements],
  ].filter(Boolean);
  /* SZK-11: dla kogo jest kurs (brief). Lead kursu od podstaw mówi to już sam;
     Master Class ma warunek udziału w „Wymaganiach”. */
  const audience = !course.requirements && course.id !== 'kurs-podstawowy' ? course.audience : null;

  return (
    <div id={hasProgram ? undefined : `program-${course.id}`} className="scroll-mt-28">
      <Reveal delay={delay} className="as-cell flex h-full flex-col">
        <p className="as-kicker">
          {number} · {course.type}
        </p>
        <h3 className="as-title mt-3 text-ink">{course.title}</h3>
        <p className="mt-4 font-display text-[1.375rem] leading-none text-ink">
          {course.price ? nb(course.price) : NO_PRICE}
          {course.price && course.priceNote && (
            <span className="as-label ml-2 align-middle text-mocha">{course.priceNote}</span>
          )}
        </p>
        <p className="mt-4 max-w-[30rem] text-[0.9375rem] leading-[1.65] text-ink/75">{course.lead}</p>
        {audience && (
          <p className="mt-3 max-w-[30rem] text-[0.9375rem] leading-[1.65] text-ink/75">{audience}</p>
        )}

        <dl className="mt-5 max-w-[30rem] border-t border-ink/10">
          {specs.map(([term, value]) => (
            <div key={term} className="flex gap-4 border-b border-ink/10 py-2.5">
              <dt className="as-label w-[5.75rem] shrink-0 pt-[0.2rem] text-ink/60">{term}</dt>
              <dd className="min-w-0 text-[0.875rem] leading-[1.55] text-ink/85">{value}</dd>
            </div>
          ))}
        </dl>

        {/* Brief: „na niektóre szkolenia … rezerwacja odbywa się tylko po wstępnym kontakcie” */}
        {course.requiresContact && <p className="as-badge mt-4">Rezerwacja po wstępnym kontakcie</p>}

        <div className="mt-auto flex flex-wrap items-center gap-x-8 gap-y-3 pt-6">
          {url ? (
            <ArrowLink href={url} target="_blank" rel="noopener noreferrer" className="w-fit">
              Przejdź do sklepu<span className="sr-only"> – {shortName(course)}</span>
            </ArrowLink>
          ) : (
            <ArrowLink onClick={(e) => onBook(course, e)} className="w-fit">
              {course.cta}
              <span className="sr-only"> – {shortName(course)}</span>
            </ArrowLink>
          )}
          {hasProgram && (
            <ArrowLink href={`#program-${course.id}`} className="w-fit">
              Program<span className="sr-only"> – {shortName(course)}</span>
            </ArrowLink>
          )}
        </div>
      </Reveal>
    </div>
  );
}

function CoursesBand({ onBook }) {
  return (
    <section id="kursy" className="as-section scroll-mt-28 border-t border-ink/10 bg-cream-100">
      <div className="as-shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <Reveal className="lg:col-span-6">
            <SectionLabel number="02">Kursy</SectionLabel>
            {/* D4: pięć kursów z briefu (dawniej „Trzy ścieżki”); brief: kursy podzielone na poziomy */}
            <h2 className="as-display-section as-text-balance mt-6 text-ink">Kurs na każdy poziom.</h2>
          </Reveal>
          {/* SZK-16: opis systemu szkoleń z briefu (sekcja „Szkolenia”), po korekcie językowej */}
          <Reveal delay={80} className="lg:col-span-5 lg:col-start-8">
            <p className="as-body">{TRAINING_INTRO.system}</p>
            <p className="as-body mt-4">{TRAINING_INTRO.practice}</p>
          </Reveal>
        </div>

        {/* < md: jedna kolumna; md: dwie; lg: trzy. Pięć kursów + komórka dofinansowania
            domykają siatkę (md 3 × 2, lg 2 × 3). */}
        <div className="mt-10 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {COURSE_LIST.map(({ number, course }, i) => (
            <CourseCard key={course.id} number={number} course={course} delay={(i % 3) * 80} onBook={onBook} />
          ))}

          {/* Dofinansowanie – jedno zdanie; szczegóły w pytaniach (#pytania).
              RIS i BUR to rejestry, KFS to fundusz (audyt TRESC-6); bez „m.in.” (SZK-15). */}
          <Reveal delay={160} className="as-cell flex flex-col">
            <p className="as-kicker">RIS · BUR · KFS</p>
            <h3 className="as-title mt-3 text-ink">Dofinansowanie</h3>
            <p className="mt-4 max-w-[30rem] text-[0.9375rem] leading-[1.65] text-ink/75">
              Jesteśmy wpisani do RIS i BUR, a szkolenia mogą być finansowane ze środków KFS.
            </p>
            <div className="mt-auto pt-6">
              <ArrowLink href="#pytania" className="w-fit">
                Jak skorzystać z dofinansowania
              </ArrowLink>
            </div>
          </Reveal>
        </div>

        {/* Brief: poziomy zaawansowania i rezerwacja części szkoleń tylko po wstępnym kontakcie */}
        <Reveal className="mt-12 flex flex-col gap-4 border-t border-ink/15 pt-6 md:flex-row md:items-baseline md:justify-between md:gap-8">
          <p className="as-body">
            {TRAINING_INTRO.levels} {TRAINING_INTRO.booking}
          </p>
          <ArrowLink onClick={(e) => onBook(null, e)} className="w-fit shrink-0">
            Zapytaj o termin
          </ArrowLink>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  03 – PROGRAM (cream-50)                                            */
/*  Kotwice #program-kurs-podstawowy i #program-super-natural-brows    */
/*  (menu, stopka, JSON-LD) – id na <article> każdego programu.        */
/* ================================================================== */

/* D8: „Oferta do pobrania” – rząd miniatur (≤ 160 px szerokości) oryginalnych grafik
   kursu; kliknięcie otwiera pełny JPG w nowej karcie. Plakaty COURSE bez tonu (system),
   hairline zamiast złotej ramki stykówki. */
function OfferDownloads({ course }) {
  const posters = (course.posters || []).filter((p) => COURSE[p.index] && !POSTERS_HIDDEN.has(p.index));
  if (!posters.length) return null;
  return (
    <div className="mt-8 border-t border-ink/10 pt-5 md:mt-10">
      <p className="as-kicker">Oferta do pobrania</p>
      <p className="as-caption mt-2 max-w-none">
        Oryginalne grafiki {BRAND.academy} (JPG) – pełny obraz otwiera się w nowej karcie.
      </p>
      <ul className="mt-5 flex flex-wrap gap-4 sm:gap-6">
        {posters.map((p) => {
          const image = COURSE[p.index];
          return (
            <li key={image.src} className="w-[6.5rem] sm:w-[8.5rem] lg:w-[10rem]">
              <a href={image.src} target="_blank" rel="noopener noreferrer" className="group block">
                <Figure
                  image={image}
                  alt={POSTER_ALT[p.index] || `${p.caption} – ${course.fullTitle}`}
                  ratio="9 / 16"
                  sizes="160px"
                  className="border border-ink/10"
                />
                <span className="mt-2 flex items-baseline justify-between gap-2 text-[0.8125rem] leading-snug text-ink transition-colors group-hover:text-gold-deep">
                  <span>
                    {p.caption}
                    <span className="sr-only"> (JPG, otwiera się w nowej karcie)</span>
                  </span>
                  <span aria-hidden="true" className="text-mocha transition-colors group-hover:text-gold-deep">
                    ↗
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* < md: tytuł, linia ceny/formatu i PROGRAM_PREVIEW pierwszych pozycji (sm–md: 4,
   pełne dwa rzędy); reszta za „Pełny program (N pozycji)". Od md cały program
   otwarty. Pod programem „Oferta do pobrania” (D8). */
function ProgramArticle({ number, course, onBook }) {
  const [open, setOpen] = useState(false);
  const listId = `program-lista-${course.id}`;
  const total = course.program.length;
  const name = shortName(course);

  return (
    <article
      id={`program-${course.id}`}
      className="mt-10 scroll-mt-28 border-t border-ink/15 pt-6 md:mt-12 lg:mt-14"
    >
      <Reveal className="flex flex-col gap-5 md:flex-row md:items-baseline md:justify-between md:gap-8">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <span className="as-kicker">{number}</span>
          <h3 className="as-title text-ink">{course.title}</h3>
          <p className="as-kicker">
            {course.type} · {priceLabel(course)} · {course.format}
          </p>
        </div>
        <ArrowLink onClick={(e) => onBook(course, e)} className="w-fit shrink-0">
          {course.cta}
          <span className="sr-only"> – {name}</span>
        </ArrowLink>
      </Reveal>

      <Reveal delay={80}>
        <dl id={listId} className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 md:mt-8 md:gap-y-8 lg:grid-cols-3">
          {course.program.map((item, i) => (
            <div
              key={item.label}
              className={cn('border-t border-ink/10 pt-4', !open && collapsedClass(i, PROGRAM_PREVIEW))}
            >
              <dt className="as-numbered-title text-ink">{item.label}</dt>
              {item.detail && <dd className="as-numbered-desc text-mocha">{item.detail}</dd>}
            </div>
          ))}
        </dl>
        {total > PROGRAM_PREVIEW && (
          <MobileMore
            open={open}
            onToggle={() => setOpen((v) => !v)}
            controls={listId}
            label={`Pełny program (${total} ${plural(total, 'pozycja', 'pozycje', 'pozycji')})`}
            openLabel="Zwiń program"
            className="mt-6"
          />
        )}
        <OfferDownloads course={course} />
      </Reveal>
    </article>
  );
}

function ProgramBand({ onBook }) {
  /* Tylko kursy z programem w źródłach (plakaty): od podstaw i dla linergistek. */
  const withProgram = COURSE_LIST.filter(({ course }) => course.program.length > 0);
  return (
    <section id="program" className="as-section scroll-mt-28 border-t border-ink/10 bg-cream-50">
      <div className="as-shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <Reveal className="lg:col-span-7">
            <SectionLabel number="03">Program</SectionLabel>
            <h2 className="as-display-section as-text-balance mt-6 text-ink">Program krok po kroku.</h2>
          </Reveal>
          <Reveal delay={80} className="lg:col-span-5 lg:col-start-8">
            {/* Brief: opis linii Super Natural Brows. SZK-14: bez „Terminy części stacjonarnej
                ustalamy indywidualnie” – źródła tego nie mówią. */}
            <p className="as-body">{TRAINING_INTRO.snbLine}</p>
            <p className="as-body mt-4">
              Teorię przerabiasz online, we własnym tempie. Dni stacjonarne to skórki i żywe modelki.
            </p>
          </Reveal>
        </div>

        {withProgram.map(({ number, course }) => (
          <ProgramArticle key={course.id} number={number} course={course} onBook={onBook} />
        ))}
      </div>
    </section>
  );
}

/* ================================================================== */
/*  04 – ABSOLWENTKI (espresso, jedyny ciemny pas)                     */
/* ================================================================== */

/* Stykówka: trzy kadry 4:5 w jednej złotej ramce (bez mieszania proporcji).
   < sm: academy-01 (bliższy plan) na całą szerokość, pod nim dwa kadry obok siebie –
   twarze nie spadają do rozmiaru ikon; wszystkie nadal 4:5.
   Od sm: trzy równe kadry w rzędzie, bliższy plan w środku (06 · 01 · 08).
   Opisy tylko tego, co widać w kadrze (liczba osób i certyfikatów). */
const GRADUATE_TILES = [
  {
    group: GROUPS.graduatesMain,
    alt: `Trzy kobiety pod szyldem ${BRAND.academy}, dwie z certyfikatami Super Natural Brows`,
  },
  {
    group: GROUPS.graduatesA,
    alt: `Cztery kobiety pod szyldem ${BRAND.academy}, trzy z certyfikatami Super Natural Brows`,
  },
  {
    group: GROUPS.graduatesB,
    alt: `Trzy kobiety w czerni pod szyldem ${BRAND.academy}, dwie z certyfikatami Super Natural Brows`,
  },
];

function GraduatesBand() {
  return (
    <section className="as-section relative overflow-hidden bg-espresso text-cream-50">
      <div className="as-shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-5">
            <Reveal>
              <SectionLabel number="04" tone="light">
                Absolwentki
              </SectionLabel>
              {/* SZK-13: certyfikat ma źródło tylko dla kursów Super Natural Brows z grafik
                  (harmonogram kursu od podstaw, certyfikaty na zdjęciach) – nie „każdy kurs”;
                  zakres podaje akapit pod nagłówkiem. */}
              <h2 className="as-display-section as-text-balance mt-6 text-cream-100">
                Kończysz z&nbsp;certyfikatem.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              {/* SZK-07: wielkość grupy zależy od kursu (brief: 2–3, 2–4, 3–4 osoby). */}
              <p className="as-body-invert mt-6">
                Kurs od podstaw i kurs dla linergistek kończą się certyfikatem. Grupy są kameralne – od 2
                do 4 osób, zależnie od kursu – a po kursie zostaje grupa wsparcia i stały kontakt
                z prowadzącą.
              </p>
              <ArrowLink
                href={CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
                tone="light"
                className="mt-8 w-fit"
              >
                Relacje kursantek na Instagramie
              </ArrowLink>
            </Reveal>
          </div>

          <Reveal delay={80} className="lg:col-span-7">
            <figure>
              <div className="as-photo-frame grid grid-cols-2 gap-1 sm:grid-cols-3">
                {GRADUATE_TILES.map(({ group, alt }, i) => (
                  <Figure
                    key={group.image.src}
                    image={group.image}
                    alt={alt}
                    ratio="4 / 5"
                    position={group.position}
                    tone="dark"
                    zoom={false}
                    className={['col-span-2 sm:col-span-1 sm:order-2', 'sm:order-1', 'sm:order-3'][i]}
                    sizes={
                      i === 0
                        ? '(min-width: 1024px) 18vw, (min-width: 640px) 31vw, 92vw'
                        : '(min-width: 1024px) 18vw, (min-width: 640px) 31vw, 46vw'
                    }
                  />
                ))}
              </div>
              <figcaption className="as-caption-invert mt-3 max-w-none">
                Absolwentki Super Natural Brows, {BRAND.academy}, {CONTACT.city}
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  05 – CO DOSTAJESZ + HARMONOGRAM (cream-50)                         */
/* ================================================================== */

const SCHEDULE_ITEMS = COURSE_SCHEDULE.map((day) => ({
  q: day.day,
  a: (
    <ul>
      {day.rows.map(([time, text]) => (
        <li key={`${day.day}-${time}-${text}`} className="flex gap-4 border-t border-ink/10 py-2.5 first:border-t-0">
          <span className="w-12 shrink-0 text-[0.9375rem] font-medium tabular-nums leading-[1.6] text-gold-deep">{time}</span>
          <span className="text-[0.9375rem] leading-[1.6] text-ink/80">{text}</span>
        </li>
      ))}
    </ul>
  ),
}));

function IncludedBand() {
  const [allBenefits, setAllBenefits] = useState(false);
  return (
    <section className="as-section bg-cream-50">
      <div className="as-shell">
        <div className="grid gap-10 md:gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal>
              <SectionLabel number="05">Korzyści</SectionLabel>
              <h2 className="as-display-section as-text-balance mt-6 text-ink">Co dostajesz na kursie.</h2>
              {/* Lista z kart „zakres i cena” dwóch kursów – nie dotyczy wszystkich pięciu (D4). */}
              <p className="as-kicker mt-4">Kurs od podstaw · Kurs dla linergistek</p>
            </Reveal>
            <Reveal delay={80}>
              {/* jedna kolumna < sm, dwie od sm; punkt tylko z karty kursu dla linergistek
                  oznaczony etykietą. < md: BENEFITS_PREVIEW pierwszych (sm–md: 4), reszta
                  za rozwinięciem. */}
              <ol id="korzysci-lista" className="mt-8 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                {BENEFITS.map((benefit, i) => (
                  <li
                    key={benefit.text}
                    className={cn(
                      'flex items-baseline gap-4 border-t border-ink/10 py-3.5',
                      !allBenefits && collapsedClass(i, BENEFITS_PREVIEW)
                    )}
                  >
                    <span className="as-num w-8 shrink-0 text-lg text-gold-deep sm:text-xl">{pad(i + 1)}</span>
                    <span className="text-[0.9375rem] leading-[1.65] text-ink/80">
                      {benefit.text}
                      {benefit.only && (
                        <span className="as-label mt-1.5 block text-gold-deep">Tylko {benefit.only}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
              <MobileMore
                open={allBenefits}
                onToggle={() => setAllBenefits((v) => !v)}
                controls="korzysci-lista"
                label={`Wszystkie korzyści (${BENEFITS.length})`}
                openLabel="Zwiń korzyści"
              />
            </Reveal>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            {/* md: opis obok akordeonu; lg: wąska kolumna, jedno pod drugim */}
            <Reveal delay={120} className="md:grid md:grid-cols-2 md:gap-x-8 lg:block">
              <div>
                <p className="as-kicker">Harmonogram · kurs od podstaw</p>
                <p className="mt-3 text-[0.9375rem] leading-[1.65] text-ink/75">
                  Cztery dni stacjonarne, godzina po godzinie. W kursie dla linergistek część
                  stacjonarna trwa dwa dni: egzamin teoretyczny, praktyka na skórkach, pokaz
                  i praktyka na modelkach.
                </p>
              </div>
              <Faq items={SCHEDULE_ITEMS} className="mt-6 md:mt-0 lg:mt-6" />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  06 – PYTANIA (cream-100)                                           */
/*  Układ jak pytania na /uslugi: nagłówek w wąskiej kolumnie, lista   */
/*  w szerokiej. Dawna lista „Program do pobrania” → miniatury przy    */
/*  kursach (D8).                                                      */
/* ================================================================== */

function QuestionsBand() {
  return (
    <section id="pytania" className="as-section scroll-mt-28 border-t border-ink/10 bg-cream-100">
      <div className="as-shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:sticky lg:top-32 lg:col-span-4 lg:self-start">
            <SectionLabel number="06">Pytania</SectionLabel>
            <h2 className="as-display-section as-text-balance mt-6 text-ink">Zanim się zapiszesz.</h2>
            <p className="as-body mt-6 hidden sm:block">
              Najczęściej zadawane pytania – o pracę z klientkami, produkty, dofinansowanie i opiekę
              po szkoleniu.
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
/*  07 – KONTAKT (pas zamykający)                                      */
/* ================================================================== */

function ClosingBand({ onBook }) {
  return (
    <ClosingCta
      number="07"
      label="Zapisy"
      title="Zapytaj o miejsce"
      titleAccent="w grupie."
      /* SZK-14: bez „ustalimy najbliższy możliwy termin części stacjonarnej” (bez źródła).
         D7 / BIO-12: rola prowadzącej po polsku wg briefu (FOUNDER.rolePl). */
      lead={`Napisz, na jakim jesteś etapie – pomożemy dobrać kurs do Twojego poziomu. Szkolenia prowadzi ${FOUNDER.name} – ${lowerFirst(FOUNDER.rolePl)}.`}
      primary={{ label: 'Zapytaj o termin', onClick: (e) => onBook(null, e) }}
      secondary={{ href: '/kontakt', label: 'Napisz do nas' }}
    />
  );
}

/* ================================================================== */
/*  ZAPYTANIE O TERMIN / DOSTĘP                                        */
/*  (bez płatności – formularz zbiera dane i informuje o kontakcie)    */
/* ================================================================== */

/* D4: wszystkie pięć kursów (COURSE_ENQUIRY_OPTIONS z enquiry.js), w kolejności kart.
   Wartość pola = id kursu; do wiadomości trafia pełna nazwa (option.value), w polu
   wyboru krótka nazwa z menu – nie ucina się na telefonie. */
const COURSE_OPTIONS = COURSE_LIST.map(({ course }) => ({
  ...(COURSE_ENQUIRY_OPTIONS.find((o) => o.id === course.id) || { value: course.title, cta: course.cta }),
  id: course.id,
  course,
  label: shortName(course),
}));

function BookingDialog({ course, onClose, returnFocusRef }) {
  const [form, setForm] = useState({
    course: course?.id || COURSE_OPTIONS[0].id,
    name: '',
    phone: '',
    email: '',
    city: '',
    term: '',
    experience: '',
  });
  const [sent, setSent] = useState(null); // null | ENQUIRY_STATUS

  const selected = COURSE_OPTIONS.find((o) => o.id === form.course) || COURSE_OPTIONS[0];
  const c = selected.course;
  /* Kurs online (Perfect Lips): pytanie o dostęp, bez terminu. */
  const online = c.mode === 'online';
  const title = online ? 'Zapytanie o dostęp' : 'Zapytanie o termin';
  /* Pod polem wyboru: poziom i dla kogo / warunek udziału (brief) – np. kurs dla linergistek
     nie jest kursem od zera (SZK-11). */
  const courseHint = [c.level && `${c.level}.`, c.requirements || c.audience].filter(Boolean).join(' ');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const { status } = sendEnquiry({
      subject: online
        ? `Zapytanie o dostęp do kursu – ${selected.value}`
        : `Zapytanie o termin szkolenia – ${selected.value}`,
      fields: [
        ['Szkolenie', selected.value],
        ['Imię i nazwisko', form.name],
        ['Telefon', form.phone],
        ['E-mail', form.email],
        ['Miasto', form.city],
        ['Preferowany termin', online ? '' : form.term],
        ['Doświadczenie', form.experience],
      ],
    });
    setSent(status);
  };

  /* Dialog jest kontrolowany bez <DialogTrigger>, więc Radix nie wie, dokąd oddać
     fokus – oddajemy go ręcznie na przycisk, który dialog otworzył (A11Y-6). */
  const restoreFocus = (e) => {
    e.preventDefault();
    returnFocusRef?.current?.focus?.();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      {/* formularz ma dwie kolumny pól – stąd szerszy panel */}
      <DialogContent className="sm:max-w-[620px]" onCloseAutoFocus={restoreFocus}>
        <DialogHeader>
          <span className="as-kicker">Szkolenia · {BRAND.academy}</span>
          <DialogTitle>{sent ? enquiryMessage(sent).title : title}</DialogTitle>
          <DialogDescription>
            {sent
              ? enquiryMessage(sent).body
              : 'Zostaw kontakt i kilka słów o swoim doświadczeniu. Ten formularz nie realizuje płatności – szczegóły i rozliczenie ustalamy w rozmowie.'}
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="mt-8">
            <div className="border border-ink/15 bg-cream-100/70 p-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="as-kicker">Szkolenie</dt>
                  <dd className="mt-2 text-[0.9375rem] text-ink">{selected.value}</dd>
                </div>
                {form.term && !online && (
                  <div>
                    <dt className="as-kicker">Preferowany termin</dt>
                    <dd className="mt-2 text-[0.9375rem] text-ink">{form.term}</dd>
                  </div>
                )}
                <div>
                  <dt className="as-kicker">Kontakt</dt>
                  <dd className="mt-2 text-[0.9375rem] text-ink">
                    {form.name}
                    {form.phone ? ` · ${form.phone}` : ''}
                  </dd>
                </div>
              </dl>
            </div>

            <p className="as-caption mt-6 max-w-none">
              Szczegóły potwierdzamy dopiero po rozmowie – zapytanie nie jest opłacone ani wiążące.
              Najszybciej odpowiadamy na Instagramie.
            </p>

            <DialogFooter>
              <a href={CONTACT.instagram} target="_blank" rel="noreferrer noopener" className="as-btn-solid">
                {CONTACT.instagramHandle}
              </a>
              <button type="button" onClick={onClose} className="as-btn-ghost">
                Zamknij
              </button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <Field
              as="select"
              id="e-course"
              name="course"
              label="Szkolenie"
              value={form.course}
              onChange={handleChange}
              autoComplete="off"
              hint={courseHint || undefined}
            >
              {COURSE_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </Field>

            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <Field
                id="e-name"
                name="name"
                type="text"
                label="Imię i nazwisko"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <Field
                id="e-phone"
                name="phone"
                type="tel"
                label="Telefon"
                autoComplete="tel"
                inputMode="tel"
                value={form.phone}
                onChange={handleChange}
                required
              />
              <Field
                id="e-email"
                name="email"
                type="email"
                label="E-mail"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <Field
                id="e-city"
                name="city"
                type="text"
                label="Miasto"
                autoComplete="address-level2"
                value={form.city}
                onChange={handleChange}
              />
            </div>

            {!online && (
              <Field
                id="e-term"
                name="term"
                type="text"
                label={c.mode === 'blended' ? 'Preferowany termin części stacjonarnej' : 'Preferowany termin'}
                autoComplete="off"
                value={form.term}
                onChange={handleChange}
                placeholder="np. listopad"
              />
            )}

            {/* Brief: na niektóre szkolenia rezerwacja tylko po potwierdzeniu umiejętności –
                przy takim kursie (requiresContact) opis doświadczenia jest wymagany. */}
            <Field
              as="textarea"
              id="e-experience"
              name="experience"
              rows={4}
              label="Twoje doświadczenie w PMU"
              value={form.experience}
              onChange={handleChange}
              required={selected.requiresContact || undefined}
              hint={selected.requiresContact ? TRAINING_INTRO.booking : undefined}
              placeholder="Od kiedy pracujesz, jakie techniki wykonujesz, czego chcesz się nauczyć."
            />

            <p className="as-caption max-w-none border-l border-gold/35 pl-5">
              Wysłanie formularza nie jest płatnością ani rezerwacją miejsca. Termin, dostępność i
              sposób rozliczenia potwierdzamy w rozmowie.
            </p>

            <DialogFooter>
              <button type="submit" className="as-btn-solid">
                Wyślij zapytanie
              </button>
              <button type="button" onClick={onClose} className="as-btn-ghost">
                Anuluj
              </button>
            </DialogFooter>

            <div className="space-y-2">
              <RequiredLegend />
              <FormNotice />
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ================================================================== */

export default function Education() {
  const [booking, setBooking] = useState(null); // { course } | null
  /* przycisk, który otworzył dialog – po zamknięciu wraca na niego fokus */
  const triggerRef = useRef(null);

  const openBooking = (course, event) => {
    triggerRef.current =
      event?.currentTarget ?? (typeof document !== 'undefined' ? document.activeElement : null);
    setBooking({ course });
  };
  const closeBooking = () => setBooking(null);

  return (
    <>
      <Hero onBook={openBooking} />
      <CoursesBand onBook={openBooking} />
      <ProgramBand onBook={openBooking} />
      <GraduatesBand />
      <IncludedBand />
      <QuestionsBand />
      <ClosingBand onBook={openBooking} />

      {booking && (
        <BookingDialog
          key={booking.course?.id || 'ogolne'}
          course={booking.course}
          onClose={closeBooking}
          returnFocusRef={triggerRef}
        />
      )}
    </>
  );
}
