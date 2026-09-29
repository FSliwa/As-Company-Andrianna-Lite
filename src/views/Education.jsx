'use client';

/**
 * Szkolenia (/szkolenia) — „Numer 01".
 *
 * Każda sekcja to rozkładówka: SectionLabel → H2 .as-display-section → treść
 * → jedno wezwanie. Rytm tła: cream-50 (hero) → cream-100 → cream-50 →
 * cream-90 → cream-50 → cream-100 → cream-90
 * (ClosingCta) → stopka cream-100. Sąsiednie jasne sekcje dzieli hairline.
 *
 * Zdjęcia: portret wyłącznie przez ROLES, grupy wyłącznie przez GROUPS
 * (src/lib/roles.js). Makra na tej trasie: 0. Plakaty COURSE nie są pokazywane
 * jako obraz — tylko tekstowa lista linków „… (JPG)" w „Programie do pobrania".
 *
 * Dane programów i harmonogramu: COURSES / COURSE_SCHEDULE z '@/lib/site'
 * (1:1 z grafik marki). Korzyści (BENEFITS) — 1:1 z kart „zakres i cena"
 * course-03 (Super Natural Brows) i course-05 (kurs podstawowy), po korekcie.
 * Oferty spoza plakatów (dawny blok „Dla absolwentek" z cenami) usunięte —
 * nie miały źródła (audyt K2 / TRESC-3). Wrócą tylko po potwierdzeniu klienta.
 *
 * Formularz zgłoszenia NIE realizuje płatności — zbiera dane i informuje, że
 * termin i rozliczenie potwierdzamy w rozmowie.
 *
 * Telefon (< md): program każdego kursu, korzyści i pliki do pobrania pokazują
 * początek listy, resztę chowa rozwinięcie (MobileMore) — nic nie jest usuwane.
 * Od md wszystko otwarte; desktop (≥ lg) bez zmian.
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
import { ACHIEVEMENTS, BRAND, CONTACT, COURSES, COURSE_SCHEDULE, FOUNDER } from '@/lib/site';
import { GROUPS, ROLES } from '@/lib/roles';
import { COURSE } from '@/lib/media';
import { enquiryMessage, sendEnquiry } from '@/lib/enquiry';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Dane pomocnicze                                                    */
/* ------------------------------------------------------------------ */

const byId = (id) => COURSES.find((c) => c.id === id);

/* Twarda spacja w kwotach („7 000 zł", „15 000 zł netto") — kwota nie łamie się w pół. */
const NBSP = ' ';
const nb = (s) => String(s).replace(/ /g, NBSP);
const priceLabel = (course) => nb(`${course.price} ${course.priceNote}`);

/* Kolejność ścieżek: od zera → technika → dalszy rozwój */
const MAIN_PATHS = [
  { number: '01', name: 'Kurs podstawowy', course: byId('kurs-podstawowy') },
  { number: '02', name: 'Super Natural Brows', course: byId('super-natural-brows') },
];

/* Nazwa jak na plakatach course-03 i course-05 (tam w «», w serwisie cudzysłów „”). */
const MASTER_CLASS = 'Master Class „Efekt lami”';

/* Korzyści — 1:1 z kart „zakres i cena" (course-03 i course-05), po korekcie językowej.
   Punkt „Poprawa postawy ręki…" jest tylko na karcie Super Natural Brows (course-03). */
const BENEFITS = [
  { text: 'System nauki zrozumiały dla każdego. Nie musisz umieć malować, aby nauczyć się tej techniki' },
  { text: 'Nauka atrakcyjnych zdjęć i marketing' },
  { text: 'Cena zabiegu i jej wpływ na klientki' },
  { text: 'Poprawa postawy ręki i wykonania pięknego ruchu pudrowego', only: 'Super Natural Brows' },
  {
    text: `Możliwość dalszego rozwoju w technice na Master Classie „Efekt lami” i Warsztatach (dostępnych tylko dla naszych kursantek)`,
  },
  { text: 'Dożywotnia opieka i grupa wsparcia' },
  { text: 'Możliwość zakupu niezbędnych produktów do PMU na miejscu i przetestowania maszyny AS PRINCESS' },
  { text: 'Lunch, napoje i przekąski zapewnione' },
];

/* Fakty w hero — dwa krótkie, wyłącznie z ACHIEVEMENTS. Pasek jest zawsze w jednej
   linii i musi zmieścić się w łamie telefonu (≈ 270 px): dłuższy rozpycha kolumnę hero. */
const HERO_FACTS = [`${ACHIEVEMENTS[0].value} podium MŚ`, `${ACHIEVEMENTS[1].value} kursantek`];

/* Oryginalne karty programów — tekstowa lista linków do plików JPG (bez miniatur). */
const DOWNLOADS = [
  {
    group: 'Super Natural Brows',
    items: [
      { image: COURSE[1], caption: 'Plakat' },
      { image: COURSE[0], caption: 'Program' },
      { image: COURSE[2], caption: 'Zakres i cena' },
    ],
  },
  {
    group: 'Kurs podstawowy',
    items: [
      { image: COURSE[6], caption: 'Plakat' },
      { image: COURSE[3], caption: 'Program' },
      { image: COURSE[4], caption: 'Zakres i cena' },
      { image: COURSE[5], caption: 'Harmonogram' },
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: 'Czy po szkoleniu zacznę pracę z klientkami?',
    a: 'Tak, właśnie po to stworzyliśmy unikatowy system szkolenia online + offline: na kursie skupiamy się głównie na praktyce i pomagamy pokonać lęk przed pracą z klientkami. Przy pierwszej modelce wykonasz pracę z delikatną pomocą prowadzącej, a przy ostatniej — zupełnie samodzielnie!',
  },
  {
    q: 'Czy podczas szkolenia można kupić produkty potrzebne do wykonywania zabiegu?',
    a: 'Tak, oczywiście! Otrzymasz kod rabatowy na zakupy online, a niezbędne akcesoria kupisz też od razu na miejscu. Jako nasza kursantka masz atrakcyjniejsze ceny i nasze rekomendacje, dzięki którym nie przepłacisz.',
  },
  {
    q: 'Czy mogę skorzystać z dofinansowania na te szkolenia?',
    a: 'Tak. Jesteśmy wpisani do RIS (Rejestr Instytucji Szkoleniowych) i BUR (Baza Usług Rozwojowych), a szkolenia mogą być finansowane m.in. ze środków KFS (Krajowy Fundusz Szkoleniowy). Wybierz dogodną dla siebie placówkę, sprawdź w urzędzie miasta lub urzędzie pracy, jakie wymagania musi spełnić Twój wniosek, i poproś swojego operatora o kontakt z nami — przekażemy mu wszystkie niezbędne informacje i dokumenty.',
  },
  {
    q: 'Czy jest opieka po szkoleniu?',
    a: 'Tak, jesteśmy w stałym kontakcie, bez ograniczeń czasowych! Nawet po kilku latach możesz liczyć na naszą pomoc, konsultacje prac i wsparcie w rozwoju.',
  },
  {
    q: 'Czy na szkoleniu będą inne osoby?',
    a: 'Zdecydowanie tak. Zawsze polecamy kursy grupowe (kameralne, 2–4 osoby): jest na nich zdrowa konkurencja, wesoły klimat, nowe znajomości, pomoc innych kursantek i okazja, by pochwalić się swoimi postępami — a czasem nawet znaleźć koleżankę z branży PMU na długie lata!',
  },
];

const pad = (n) => String(n).padStart(2, '0');

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
const DOWNLOADS_COUNT = DOWNLOADS.reduce((n, d) => n + d.items.length, 0);

/* Pozycja zwiniętej listy: < sm widać `n` pierwszych; w dwóch kolumnach (sm–md)
   liczba zaokrąglona w górę do parzystej, żeby ostatni rząd nie urywał się w pół. */
const collapsedClass = (i, n) => {
  if (i >= n + (n % 2)) return 'max-md:hidden';
  if (i >= n) return 'max-sm:hidden';
  return undefined;
};

/* Rozwinięcie tylko na telefonie (< md). Od md lista jest zawsze otwarta,
   a przycisk znika — decydują same klasy responsywne (max-md:hidden), więc
   SSR i desktop renderują dokładnie to samo co dotąd, bez skoku po hydratacji.
   (<details> nie da się otworzyć samym CSS od md — wymagałby JS po starcie.) */
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
/*  01 — HERO                                                          */
/* ================================================================== */

function Hero({ onBook }) {
  return (
    <PageHero
      variant="cover"
      number="01"
      label="Szkolenia"
      title="Szkolenia oparte na"
      titleAccent="realnej praktyce."
      lead="Dużo praktyki, zero lęku przed pierwszą klientką. Uczymy, jak wykonać zabieg starannie, a przy tym szybko, komfortowo i bezpiecznie."
      image={ROLES.heroTraining.image}
      imagePosition={ROLES.heroTraining.position}
      imageAlt={`${FOUNDER.name} — ${FOUNDER.role}, prowadząca szkolenia ${BRAND.academy}`}
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
/*  02 — TRZY ŚCIEŻKI + DOFINANSOWANIE (cream-100)                     */
/* ================================================================== */

function PathsBand() {
  return (
    <section id="kursy" className="as-section scroll-mt-28 border-t border-ink/10 bg-cream-100">
      <div className="as-shell">
        <Reveal>
          <SectionLabel number="02">Ścieżki</SectionLabel>
          <h2 className="as-display-section as-text-balance mt-6 text-ink">Trzy ścieżki, jedna metoda.</h2>
        </Reveal>

        {/* < md: jedna kolumna; md: 2 + 1 (trzecia komórka na całą szerokość, w środku
            dwie kolumny wyrównane do tych nad nią); lg: trzy kolumny */}
        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {MAIN_PATHS.map(({ number, name, course }, i) => (
            <Reveal key={course.id} delay={i * 80} className="as-cell">
              <p className="as-kicker">
                {number} · {course.kicker}
              </p>
              <h3 className="as-title mt-3 text-ink">{name}</h3>
              <p className="mt-4 font-display text-[1.375rem] leading-none text-ink">
                {nb(course.price)}
                <span className="as-label ml-2 align-middle text-mocha">{course.priceNote}</span>
              </p>
              <p className="as-kicker mt-3">{course.format}</p>
              <p className="mt-4 max-w-[30rem] text-[0.9375rem] leading-[1.65] text-ink/75">{course.lead}</p>
            </Reveal>
          ))}

          {/* Trzecia ścieżka wyłącznie z kart kursów (course-03 / course-05) — bez ceny. */}
          <Reveal
            delay={160}
            className="as-cell md:col-span-2 md:grid md:grid-cols-2 md:gap-x-8 lg:col-span-1 lg:block"
          >
            <div>
              <p className="as-kicker">03 · Dalszy rozwój</p>
              <h3 className="as-title mt-3 text-ink">{MASTER_CLASS}</h3>
              <p className="mt-4 font-display text-[1.375rem] leading-none text-ink">Tylko dla kursantek</p>
              <p className="as-kicker mt-3">Master Class · Warsztaty</p>
            </div>
            <p className="mt-4 max-w-[30rem] text-[0.9375rem] leading-[1.65] text-ink/75 md:mt-0 lg:mt-4">
              Kolejny krok po kursie podstawowym lub Super Natural Brows: rozwój w technice na Master
              Classie i Warsztatach, dostępnych tylko dla kursantek {BRAND.academy}.
            </p>
          </Reveal>
        </div>

        {/* Dofinansowanie — jedno zdanie; szczegóły w pytaniach (#pytania).
            RIS i BUR to rejestry, KFS to fundusz (audyt TRESC-6). */}
        <Reveal className="mt-12 flex flex-col gap-4 border-t border-ink/15 pt-6 md:flex-row md:items-baseline md:justify-between md:gap-8">
          <p className="as-body">
            Jesteśmy wpisani do RIS i BUR, a szkolenia mogą być finansowane m.in. ze środków KFS.
          </p>
          <ArrowLink href="#pytania" className="w-fit shrink-0">
            Jak skorzystać z dofinansowania
          </ArrowLink>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  03 — PROGRAM (cream-50)                                            */
/*  Kotwice #program-kurs-podstawowy i #program-super-natural-brows    */
/*  (linki ze stopki) — id na <article> każdego programu.              */
/* ================================================================== */

/* < md: tytuł, linia ceny/formatu i PROGRAM_PREVIEW pierwszych pozycji (sm–md: 4,
   pełne dwa rzędy); reszta za „Pełny program (N pozycji)". Od md cały program
   otwarty, jak dotąd. */
function ProgramArticle({ number, name, course, onBook }) {
  const [open, setOpen] = useState(false);
  const listId = `program-lista-${course.id}`;
  const total = course.program.length;

  return (
    <article
      id={`program-${course.id}`}
      className="mt-10 scroll-mt-28 border-t border-ink/15 pt-6 md:mt-12 lg:mt-14"
    >
      <Reveal className="flex flex-col gap-5 md:flex-row md:items-baseline md:justify-between md:gap-8">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <span className="as-kicker">{number}</span>
          <h3 className="as-title text-ink">{name}</h3>
          <p className="as-kicker">
            {priceLabel(course)} · {course.format}
          </p>
        </div>
        <ArrowLink
          onClick={(e) => onBook({ id: course.id, title: course.title }, e)}
          className="w-fit shrink-0"
        >
          Zapytaj o termin<span className="sr-only"> — {name}</span>
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
      </Reveal>
    </article>
  );
}

function ProgramBand({ onBook }) {
  return (
    <section id="program" className="as-section scroll-mt-28 border-t border-ink/10 bg-cream-50">
      <div className="as-shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <Reveal className="lg:col-span-7">
            <SectionLabel number="03">Program</SectionLabel>
            <h2 className="as-display-section as-text-balance mt-6 text-ink">Program krok po kroku.</h2>
          </Reveal>
          <Reveal delay={80} className="lg:col-span-5 lg:col-start-8">
            <p className="as-body">
              Teorię przerabiasz online, we własnym tempie. Dni stacjonarne to skórki i żywe
              modelki. Terminy części stacjonarnej ustalamy indywidualnie.
            </p>
          </Reveal>
        </div>

        {MAIN_PATHS.map((path) => (
          <ProgramArticle key={path.course.id} {...path} onBook={onBook} />
        ))}
      </div>
    </section>
  );
}

/* ================================================================== */
/*  04 — ABSOLWENTKI (cream-90)                                        */
/* ================================================================== */

/* Stykówka: trzy kadry 4:5 w jednej złotej ramce (bez mieszania proporcji).
   < sm: academy-01 (bliższy plan) na całą szerokość, pod nim dwa kadry obok siebie —
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
    <section className="as-section relative overflow-hidden bg-cream-90 text-ink">
      <div className="as-shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-5">
            <Reveal>
              <SectionLabel number="04">
                Absolwentki
              </SectionLabel>
              <h2 className="as-display-section as-text-balance mt-6 text-ink">
                Każdy kurs kończy się certyfikatem.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="as-body mt-6">
                Kameralne grupy 2–4 osób, a po kursie grupa wsparcia i stały kontakt z prowadzącą.
              </p>
              <ArrowLink
                href={CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
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
                    tone="light"
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
              <figcaption className="as-caption mt-3 max-w-none">
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
/*  05 — CO DOSTAJESZ + HARMONOGRAM (cream-50)                         */
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
            </Reveal>
            <Reveal delay={80}>
              {/* jedna kolumna < sm, dwie od sm; punkt tylko z karty SNB oznaczony etykietą.
                  < md: BENEFITS_PREVIEW pierwszych (sm–md: 4), reszta za rozwinięciem. */}
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
                <p className="as-kicker">Harmonogram · kurs podstawowy</p>
                <p className="mt-3 text-[0.9375rem] leading-[1.65] text-ink/75">
                  Cztery dni stacjonarne, godzina po godzinie. W Super Natural Brows część stacjonarna
                  trwa dwa dni: egzamin teoretyczny, praktyka na skórkach, pokaz i praktyka na modelkach.
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
/*  06 — PYTANIA + PROGRAM DO POBRANIA (cream-100)                     */
/* ================================================================== */

function QuestionsBand() {
  const [filesOpen, setFilesOpen] = useState(false);
  return (
    <section id="pytania" className="as-section scroll-mt-28 border-t border-ink/10 bg-cream-100">
      <div className="as-shell">
        <div className="grid gap-10 md:gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal>
              <SectionLabel number="06">Pytania</SectionLabel>
              <h2 className="as-display-section as-text-balance mt-6 text-ink">Zanim się zapiszesz.</h2>
            </Reveal>
            <Reveal delay={80}>
              <Faq items={FAQ_ITEMS} className="mt-8" />
            </Reveal>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <Reveal delay={120}>
              <p className="as-kicker">Program do pobrania</p>
              <p className="as-caption mt-3 max-w-none">
                Oryginalne karty programów {BRAND.academy} w formacie JPG — otwierają się w nowej karcie.
              </p>
              {/* < md: lista plików za rozwinięciem; md: dwie grupy obok siebie; lg: wąska kolumna */}
              <MobileMore
                open={filesOpen}
                onToggle={() => setFilesOpen((v) => !v)}
                controls="karty-do-pobrania"
                label={`Pokaż ${DOWNLOADS_COUNT} ${plural(DOWNLOADS_COUNT, 'plik', 'pliki', 'plików')} JPG`}
                openLabel="Zwiń listę plików"
                className="mt-6"
              />
              <div
                id="karty-do-pobrania"
                className={cn(
                  'mt-6 grid gap-6 md:grid-cols-2 md:gap-x-8 lg:grid-cols-1',
                  !filesOpen && 'max-md:hidden'
                )}
              >
                {DOWNLOADS.map((d) => (
                  <div key={d.group} className="border-t border-ink/15 pt-4">
                    <p className="as-label text-ink/70">{d.group}</p>
                    <ul className="mt-2">
                      {d.items.map((it) => (
                        <li key={it.image.src} className="border-b border-ink/10 last:border-b-0">
                          <a
                            href={it.image.src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex min-h-[44px] items-center justify-between gap-4 py-2 text-[0.9375rem] leading-snug text-ink transition-colors hover:text-gold-deep"
                          >
                            <span>
                              {it.caption} (JPG)
                              <span className="sr-only">
                                {' '}
                                — {d.group}, otwiera się w nowej karcie
                              </span>
                            </span>
                            <span aria-hidden="true" className="text-mocha transition-colors group-hover:text-gold-deep">
                              ↗
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  07 — KONTAKT (pas zamykający)                                      */
/* ================================================================== */

function ClosingBand({ onBook }) {
  return (
    <ClosingCta
      number="07"
      label="Zapisy"
      title="Zapytaj o miejsce"
      titleAccent="w grupie."
      lead={`Napisz, na jakim jesteś etapie — dobierzemy program i ustalimy najbliższy możliwy termin części stacjonarnej. Szkolenia prowadzi ${FOUNDER.name}, ${FOUNDER.role}.`}
      primary={{ label: 'Zapytaj o termin', onClick: (e) => onBook(null, e) }}
      secondary={{ href: '/kontakt', label: 'Napisz do nas' }}
    />
  );
}

/* ================================================================== */
/*  ZAPYTANIE O TERMIN                                                 */
/*  (bez płatności — formularz zbiera dane i informuje o kontakcie)    */
/* ================================================================== */

/* Tylko kursy z kart programów (kolejność jak w ścieżkach: od zera → technika).
   Wartość = pełna nazwa (trafia do wiadomości), etykieta = krótka nazwa ze ścieżek,
   żeby pole wyboru nie ucinało tekstu na telefonie. */
const COURSE_OPTIONS = MAIN_PATHS.map((p) => ({ value: p.course.title, label: p.name }));

function BookingDialog({ course, onClose, returnFocusRef }) {
  const [form, setForm] = useState({
    course: course?.title || COURSE_OPTIONS[0].value,
    name: '',
    phone: '',
    email: '',
    city: '',
    term: '',
    experience: '',
  });
  const [sent, setSent] = useState(null); // null | ENQUIRY_STATUS

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const { status } = sendEnquiry({
      subject: `Zapytanie o termin szkolenia — ${form.course}`,
      fields: [
        ['Szkolenie', form.course],
        ['Imię i nazwisko', form.name],
        ['Telefon', form.phone],
        ['E-mail', form.email],
        ['Miasto', form.city],
        ['Preferowany termin', form.term],
        ['Doświadczenie', form.experience],
      ],
    });
    setSent(status);
  };

  /* Dialog jest kontrolowany bez <DialogTrigger>, więc Radix nie wie, dokąd oddać
     fokus — oddajemy go ręcznie na przycisk, który dialog otworzył (A11Y-6). */
  const restoreFocus = (e) => {
    e.preventDefault();
    returnFocusRef?.current?.focus?.();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      {/* formularz ma dwie kolumny pól — stąd szerszy panel */}
      <DialogContent className="sm:max-w-[620px]" onCloseAutoFocus={restoreFocus}>
        <DialogHeader>
          <span className="as-kicker">Szkolenia · {BRAND.academy}</span>
          <DialogTitle>{sent ? enquiryMessage(sent).title : 'Zapytanie o termin'}</DialogTitle>
          <DialogDescription>
            {sent
              ? enquiryMessage(sent).body
              : 'Zostaw kontakt i kilka słów o swoim doświadczeniu. Ten formularz nie realizuje płatności — termin i rozliczenie ustalamy w rozmowie.'}
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="mt-8">
            <div className="border border-ink/15 bg-cream-100/70 p-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="as-kicker">Szkolenie</dt>
                  <dd className="mt-2 text-[0.9375rem] text-ink">{form.course}</dd>
                </div>
                {form.term && (
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
              Miejsce w grupie potwierdzamy dopiero po rozmowie — zapytanie nie jest opłacone ani
              wiążące. Najszybciej odpowiadamy na Instagramie.
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
            >
              {COURSE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
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

            <Field
              id="e-term"
              name="term"
              type="text"
              label="Preferowany termin części stacjonarnej"
              autoComplete="off"
              value={form.term}
              onChange={handleChange}
              placeholder="np. listopad, dowolny weekend"
            />

            <Field
              as="textarea"
              id="e-experience"
              name="experience"
              rows={4}
              label="Twoje doświadczenie w PMU"
              value={form.experience}
              onChange={handleChange}
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
  /* przycisk, który otworzył dialog — po zamknięciu wraca na niego fokus */
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
      <PathsBand />
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
