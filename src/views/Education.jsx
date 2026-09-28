'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  Faq,
  Field,
  Figure,
  GoldArc,
  NumberedItem,
  PageHero,
  Reveal,
  SectionLabel,
} from '@/components/as/Primitives';
import {
  BRAND,
  CONTACT,
  COURSES,
  COURSE_BENEFITS,
  COURSE_SCHEDULE,
  FOUNDER,
} from '@/lib/site';
import { ACADEMY, BROWS, BY_NAME, COURSE, LIPS, STUDIO } from '@/lib/media';
import { enquiryMessage, sendEnquiry } from '@/lib/enquiry';
import { cn } from '@/lib/utils';

/**
 * Szkolenia (/szkolenia)
 *
 * Zasady:
 *  • zdjęcia wyłącznie z '@/lib/media' (folder /Graphics) — zero zewnętrznych URL-i,
 *  • efekty brwi wyłącznie z czystych paneli (BY_NAME['…-pN']) albo pojedynczych
 *    makr — nigdy z plików zbiorczych sklejek „przed/po" (szwy, watermarki);
 *    żaden plik nie występuje na stronie dwa razy, grupy kursantek zawsze z
 *    position u góry, a w ciemnych sekcjach zdjęcia dostają tone="dark",
 *    w kremowych — tone="light" (poza plakatami z wtopionym tekstem),
 *  • rytm tła przeplata się bez wyjątku: cream-50 → espresso → cream-100 → mocha
 *    → cream-50 → espresso-900 → cream-100 → mocha → cream-100 → espresso-900
 *    (ClosingCta); galeria kursantek jest kolażem w sekcji „Dofinansowanie",
 *    żeby dwie jasne sekcje nie stały obok siebie,
 *  • rytm, skala pisma i komponenty 1:1 ze stroną główną (src/views/Home.jsx):
 *    .as-section, SectionLabel → h2 .as-display-section (mt-6) → treść (mt-6)
 *    → CTA (mt-8); grupy zdjęć w .as-photo-frame z podpisami .as-caption(-invert),
 *    rzędy kart w .as-card-col, pozycje 01/02/03 jako NumberedItem, kicker
 *    kart .as-kicker, FAQ przez <Faq/>, pola formularza przez <Field/>,
 *    ostatnia sekcja przez <ClosingCta/>,
 *  • dane programów, korzyści i harmonogram pochodzą z '@/lib/site'
 *    (COURSES, COURSE_BENEFITS, COURSE_SCHEDULE) — czyli 1:1 z grafik marki,
 *  • grafiki COURSE mają wtopiony tekst, więc występują wyłącznie jako
 *    samodzielne plakaty (bez tonu) — nigdy jako tło pod inny tekst,
 *  • nie ma zdjęć produktów, budynku ani recepcji, więc sekcje, które ich
 *    wymagały (metoda, dofinansowanie, programy dodatkowe), są zbudowane
 *    typograficznie,
 *  • formularz zgłoszenia NIE realizuje płatności — zbiera dane i informuje,
 *    że skontaktujemy się w sprawie potwierdzenia terminu i rozliczenia.
 */

/* ------------------------------------------------------------------ */
/*  Dane pomocnicze                                                    */
/* ------------------------------------------------------------------ */

/* Plakaty dwóch głównych programów — samodzielne karty, bez nadpisywania tekstem. */
const COURSE_POSTERS = {
  'super-natural-brows': {
    image: COURSE[1],
    alt: 'Plakat szkolenia Super Natural Brows — maszynowy włos, Babushkina Academy',
  },
  'kurs-podstawowy': {
    image: COURSE[6],
    alt: 'Plakat kursu podstawowego Super Natural Brows — Babushkina Academy',
  },
};

/* Oryginalne materiały kursowe marki (grafiki z wtopionym tekstem). */
const COURSE_SHEETS = [
  {
    image: COURSE[0],
    kicker: 'Super Natural Brows',
    title: 'Program szkolenia',
    desc: '14 dni online, 2 dni stacjonarnej praktyki, modelki pokazowe i modelki dla praktyki.',
    alt: 'Grafika programu szkolenia Super Natural Brows — 14 dni online i 2 dni stacjonarne',
  },
  {
    image: COURSE[2],
    kicker: 'Super Natural Brows',
    title: 'Zakres i cena',
    desc: 'Algorytmy pracy, opieka po kursie i cena szkolenia — 7 000 zł netto.',
    alt: 'Grafika z zakresem szkolenia Super Natural Brows i ceną 7 000 zł netto',
  },
  {
    image: COURSE[3],
    kicker: 'Kurs podstawowy',
    title: 'Program szkolenia',
    desc: '16 dni online, 4 dni stacjonarnie, 2 modelki pokazowe i 4 modelki dla praktyki.',
    alt: 'Grafika programu kursu podstawowego — 16 dni online i 4 dni stacjonarne',
  },
  {
    image: COURSE[4],
    kicker: 'Kurs podstawowy',
    title: 'Zakres i cena',
    desc: 'Pełna lista tego, co otrzymujesz w cenie, oraz cena — 15 000 zł netto.',
    alt: 'Grafika z zakresem kursu podstawowego i ceną 15 000 zł netto',
  },
  {
    image: COURSE[5],
    kicker: 'Kurs podstawowy',
    title: 'Harmonogram',
    desc: 'Cztery dni stacjonarne rozpisane godzina po godzinie.',
    alt: 'Grafika z harmonogramem czterech dni stacjonarnych kursu podstawowego',
  },
];

/* Programy spoza dwóch głównych ścieżek — treść z dotychczasowej wersji strony. */
const EXTRA_COURSES = [
  {
    id: 'snb-expert',
    number: '01',
    kicker: 'Poziom zaawansowany',
    title: 'Master Class „SNB Expert”',
    price: '5 000 zł',
    desc: 'Autorski Masterclass dla profesjonalistek, które chcą dopracować najdrobniejsze detale w technice Super Natural Brows.',
    facts: [
      ['Format', '7 dni online + 1 dzień stacjonarny'],
      ['Grupa', 'Kameralna grupa: 3–4 osoby'],
      [
        'Dla kogo',
        'Minimum rok ciągłej pracy włosem maszynowym lub podwyższenie kwalifikacji po kursie w akademii',
      ],
    ],
  },
  {
    id: 'online-perfect-lips',
    number: '02',
    kicker: 'Szkolenie wideo',
    title: 'Kurs online „Perfect Lips”',
    price: '1 500 zł',
    desc: 'Cała esencja wiedzy o naturalnej pigmentacji ust bez konturów, w ponad 20 lekcjach wideo.',
    facts: [
      ['Format', 'Ponad 20 filmów szkoleniowych'],
      ['Tryb', 'Nauka w dowolnym czasie i miejscu'],
      ['Dla kogo', 'Każdy poziom zaawansowania'],
    ],
  },
  {
    id: 'szyty-na-miare',
    number: '03',
    kicker: 'Szkolenie indywidualne',
    title: 'Kurs „Szyty na miarę”',
    price: 'Wycena indywidualna',
    desc: 'Program spersonalizowany pod Twoje potrzeby, luki w wiedzy lub wybraną strefę pigmentacji.',
    facts: [
      ['Format', 'Harmonogram dopasowany do Ciebie'],
      ['Grupa', 'Szkolenie 1 na 1 z Andrianą'],
      ['Dla kogo', 'Dopasowany budżet, strefa i technika'],
    ],
  },
];

/* Dofinansowania — fakty z dotychczasowej sekcji FAQ. */
const FUNDING = [
  { number: '01', short: 'RIS', title: 'Rejestr Instytucji Szkoleniowych' },
  { number: '02', short: 'KFS', title: 'Krajowy Fundusz Szkoleniowy' },
  { number: '03', short: 'BUR', title: 'Baza Usług Rozwojowych' },
];

/* Cztery różne grupy kursantek — każda tylko raz na stronie; pomijamy
   academy-05 (choinka) i academy-03 (wypalona ikonka w rogu). */
const GALLERY = [
  {
    image: ACADEMY[0],
    alt: 'Trzy kursantki z certyfikatami ukończenia szkolenia pod logo Babushkina Academy',
  },
  {
    image: ACADEMY[7],
    alt: 'Trzy absolwentki w czerni z certyfikatami Super Natural Brows na tle logo Babushkina Academy',
  },
  {
    image: ACADEMY[3],
    alt: 'Pięć absolwentek kursu z certyfikatami przed białą ścianą Babushkina Academy',
  },
  {
    image: ACADEMY[5],
    alt: 'Cztery kursantki z certyfikatami ukończenia szkolenia w Babushkina Academy',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Czy po szkoleniu zacznę pracę z klientkami?',
    a: 'Tak, właśnie po to stworzyliśmy unikatowy system szkolenia online + offline, aby na kursie głównie skupić się na praktyce i pokonać lęk przed pracą z klientami. Przy pierwszej modelce zrobisz pracę z moją delikatną pomocą, przy ostatniej wykonasz ją zupełnie samodzielnie!',
  },
  {
    q: 'Czy podczas szkolenia można zakupić produkty, potrzebne do wykonywania zabiegu?',
    a: 'Tak, oczywiście! Otrzymasz kod rabatowy na zakupy online, ale także można będzie zaopatrzyć się w niezbędne akcesoria od razu na miejscu. Jako nasza kursantka będziesz mieć znacznie atrakcyjniejsze ceny i moje rekomendacje, aby nie przepłacać.',
  },
  {
    q: 'Czy mogę skorzystać z dofinansowania na te szkolenia?',
    a: 'Tak, jesteśmy zarejestrowani w RIS (Rejestr Instytucji Szkoleniowych), KFS (Krajowy Fundusz Szkoleniowy) oraz BUR (Baza Usług Rozwojowych). Wybierz dogodną dla Ciebie placówkę, udaj się po wiedzę i wymagania dla akceptacji Twojego wniosku do Urzędu Miasta/Pracy i niech Twój operator się z nami skontaktuje - udzielimy mu wszystkich niezbędnych informacji i dokumentów!',
  },
  {
    q: 'Czy jest opieka po szkoleniu?',
    a: 'Tak, będziemy w ciągłym kontakcie, bez ograniczeń i ramek czasowych! Nawet po kilku latach możesz nadal liczyć na moją pomoc, konsultacje prac i wsparcie w rozwoju.',
  },
  {
    q: 'Czy na szkoleniu będą inne osoby?',
    a: 'Zdecydowanie tak, zawsze polecamy kursy grupowe (kameralne 2-4 osoby), ponieważ istnieje na nich zdrowa konkurencja, wesoły klimat, nowe znajomości, pomoc od innych kursantek i możliwość podzielenia się oraz pochwalenia swoimi postępami – a czasami nawet znalezienie wiernej koleżanki w branży PMU na długie lata!',
  },
];

/* Etapy nauki — złożone z faktów zapisanych w COURSES i COURSE_BENEFITS. */
const METHOD_STEPS = [
  {
    number: '01',
    title: 'Przygotowanie online',
    desc: 'Filmy instruktażowe w dostępie na zawsze, skrypt z teorią i ćwiczeniami. Paczkę z materiałami i akcesoriami wysyłamy przed częścią stacjonarną.',
  },
  {
    number: '02',
    title: 'Dni stacjonarne',
    desc: 'Egzamin teoretyczny, praktyka na skórkach, modelki pokazowe i modelki dla praktyki — o różnych skórach i układach włosków.',
  },
  {
    number: '03',
    title: 'Opieka po kursie',
    desc: 'Dożywotnia opieka i grupa wsparcia: konsultacje prac, odpowiedzi na pytania i pomoc w rozwoju bez ram czasowych.',
  },
];

const pad = (n) => String(n).padStart(2, '0');

/* ================================================================== */
/*  01 — HERO                                                          */
/* ================================================================== */

function Hero() {
  return (
    <PageHero
      number="01"
      label="Szkolenia"
      title="Szkolenia oparte na"
      titleAccent="realnej praktyce."
      lead="Nasze programy opierają się na dużej ilości praktyki, zniwelowaniu lęku przed pracą z klientkami i efektywnym zastosowaniu wiedzy w gabinecie. Uczymy nie tylko tego, jak wykonać jakościowy zabieg, ale też jak wykonać go szybko, komfortowo, bezboleśnie i bezpiecznie."
      image={ACADEMY[1]}
      imageAlt="Grupa kursantek Babushkina Academy z certyfikatami Super Natural Brows"
      imageTone="light"
      imagePosition="50% 20%"
      tone="cream"
      facts={['RIS · KFS · BUR', CONTACT.city, 'Kameralne grupy']}
    >
      <div className="flex flex-wrap gap-4">
        <a href="#kursy" className="as-btn-solid">
          Zobacz programy
        </a>
        <Link href="/kontakt" className="as-btn-ghost">
          Zapytaj o termin
        </Link>
      </div>
    </PageHero>
  );
}

/* ================================================================== */
/*  02 — METODA                                                        */
/* ================================================================== */

function MethodBand() {
  return (
    <section className="as-section relative overflow-hidden bg-espresso text-cream-50">
      <GoldArc className="-top-28 left-[-6%] h-[700px] w-[880px]" opacity={0.28} />

      <div className="as-shell relative">
        <Reveal>
          <SectionLabel number="02" tone="light">
            Metoda
          </SectionLabel>
        </Reveal>

        {/* układ jak w pasie „Szkolenia" na stronie głównej: kolumna 33% + kolaż */}
        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Reveal>
              <h2 className="as-display-section-sm">
                Teoria w domu.
                <br />
                Praktyka na
                <br />
                <span className="italic text-gold-light">modelkach.</span>
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="as-caption-invert mt-6">
                Teorię przerabiasz online, we własnym tempie. Dni stacjonarne to wyłącznie skórki i
                żywe modelki — wychodzisz z kursu z realnie przepracowanymi zabiegami, nie z
                notatkami.
              </p>
            </Reveal>
            <Reveal delay={140}>
              <ArrowLink href="#kursy" tone="light" className="mt-8 w-fit">
                Zobacz programy
              </ArrowLink>
            </Reveal>
          </div>

          <div className="lg:col-span-8">
            <Reveal>
              <div className="as-photo-frame grid gap-1">
                <Figure
                  image={ACADEMY[6]}
                  alt="Cztery kursantki z certyfikatami Super Natural Brows przed ścianą z logo Babushkina Academy"
                  ratio="5 / 2"
                  position="50% 20%"
                  tone="dark"
                  sizes="(min-width: 1024px) 60vw, 90vw"
                />
                <div className="grid grid-cols-2 gap-1">
                  <Figure
                    image={STUDIO[13]}
                    alt="Andriana Babushkina — portret z sesji wizerunkowej AS Company"
                    ratio="2 / 1"
                    position="50% 30%"
                    tone="dark"
                    sizes="(min-width: 1024px) 30vw, 45vw"
                  />
                  <Figure
                    image={BY_NAME['brows-13-p1']}
                    alt="Wygojony łuk brwi z pojedynczymi włoskami po pigmentacji — zbliżenie"
                    ratio="2 / 1"
                    tone="dark"
                    sizes="(min-width: 1024px) 30vw, 45vw"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {METHOD_STEPS.map((step, i) => (
            <Reveal key={step.number} delay={i * 90}>
              <NumberedItem number={step.number} title={step.title} tone="light">
                {step.desc}
              </NumberedItem>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  03 — PROGRAMY AUTORSKIE                                            */
/* ================================================================== */

/* Pasek efektów: jedno pojedyncze makro + trzy czyste panele (bez sklejek „przed/po"). */
const EFFECT_THUMBS = [
  {
    image: BROWS[16],
    alt: 'Twarz modelki na wprost — obie brwi po pigmentacji włosem maszynowym',
    position: '50% 45%',
  },
  {
    image: BY_NAME['brows-02-p3'],
    alt: 'Oczy i brwi modelki z opaską na włosach po zabiegu pigmentacji',
  },
  {
    image: BY_NAME['brows-12-p1'],
    alt: 'Para oczu z brwiami po pigmentacji — wygojone, pojedyncze włoski',
  },
  {
    image: BY_NAME['brows-01-p2'],
    alt: 'Oko i brew po pigmentacji — naturalne, wygojone włoski',
    position: '20% 50%',
  },
];

function ProgramsBand({ onBook }) {
  return (
    <section id="kursy" className="as-section relative overflow-hidden scroll-mt-20 bg-cream-100">
      <GoldArc className="-top-12 right-[-8%] h-[640px] w-[860px]" flip opacity={0.35} />

      <div className="as-shell relative">
        <Reveal>
          <SectionLabel number="03">Programy</SectionLabel>
        </Reveal>

        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
          <Reveal className="lg:col-span-7">
            <h2 className="as-display-section as-text-balance text-ink">
              Dwie ścieżki
              <br />
              Super Natural Brows.
            </h2>
          </Reveal>
          <Reveal delay={90} className="lg:col-span-5 lg:pt-1">
            <p className="as-caption">
              Program i ceny pochodzą wprost z materiałów {BRAND.academy}. Wybierz ścieżkę zależnie
              od tego, czy dopiero zaczynasz, czy chcesz przejść z pudru na maszynowy włos.
            </p>
            <ArrowLink href="#materialy" className="mt-6 w-fit">
              Zobacz karty programów
            </ArrowLink>
          </Reveal>
        </div>

        {/* pasek efektów techniki, której uczymy — czwórka w jednej złotej ramce */}
        <Reveal delay={120} className="mt-8">
          <div className="as-photo-frame grid grid-cols-2 gap-1 sm:grid-cols-4">
            {EFFECT_THUMBS.map((t, i) => (
              <Figure
                key={i}
                image={t.image}
                alt={t.alt}
                ratio="2 / 1"
                position={t.position}
                tone="light"
                sizes="(min-width: 640px) 22vw, 45vw"
              />
            ))}
          </div>
          <p className="as-caption mt-3">Efekty techniki, której uczymy</p>
        </Reveal>

        {/* dwa programy — każdy jako karta z pionową złotą linią, plakat + treść */}
        <div className="mt-10 grid gap-y-12">
          {COURSES.map((course, index) => {
            const poster = COURSE_POSTERS[course.id];
            const reversed = index % 2 === 1;

            return (
              <article key={course.id} className="as-card-col md:pr-0">
                <div className="mb-5 flex items-center gap-4">
                  <span className="as-num">{pad(index + 1)}</span>
                  <span className="h-px w-10 bg-ink/15" aria-hidden="true" />
                </div>

                <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
                  {/* plakat programu — samodzielna karta z wtopionym tekstem */}
                  {poster && (
                    <Reveal className={cn('lg:col-span-4', reversed && 'lg:order-2')}>
                      <Figure
                        image={poster.image}
                        alt={poster.alt}
                        ratio="9 / 16"
                        zoom={false}
                        sizes="(min-width: 1024px) 30vw, 85vw"
                      />
                    </Reveal>
                  )}

                  <div className={cn('lg:col-span-8', reversed && 'lg:order-1')}>
                    <Reveal>
                      <span className="as-kicker">{course.kicker}</span>
                      <h3 className="mt-3 font-display text-2xl text-ink sm:text-[1.75rem]">
                        {course.title}
                      </h3>
                      <p className="as-caption mt-4 max-w-md">{course.lead}</p>
                    </Reveal>

                    <Reveal delay={80}>
                      <div className="mt-6 flex flex-wrap items-baseline gap-x-10 gap-y-4 border-y border-ink/10 py-5">
                        <div>
                          <span className="as-kicker block">Format</span>
                          <span className="mt-2 block text-[0.8125rem] text-ink">{course.format}</span>
                        </div>
                        <div>
                          <span className="as-kicker block">Cena</span>
                          <span className="mt-1.5 block font-display text-xl text-ink">
                            {course.price}
                            {course.priceNote && (
                              <span className="as-label ml-2 align-middle text-mocha-400">
                                {course.priceNote}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </Reveal>

                    <Reveal delay={120}>
                      <ul className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                        {course.program.map((item, i) => (
                          <li key={item.label}>
                            <div className="flex items-baseline gap-3">
                              <span className="as-num text-lg sm:text-xl">{pad(i + 1)}</span>
                              <h4 className="as-numbered-title text-ink">{item.label}</h4>
                            </div>
                            {item.detail && (
                              <p className="as-numbered-desc max-w-[19rem] text-mocha">
                                {item.detail}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </Reveal>

                    <Reveal delay={160}>
                      <div className="mt-8 flex flex-wrap items-center gap-4">
                        <button
                          type="button"
                          onClick={() => onBook({ id: course.id, title: course.title })}
                          className="as-btn-solid"
                        >
                          Zgłoś się na szkolenie
                        </button>
                        <span className="as-kicker">Terminy zjazdów ustalamy indywidualnie</span>
                      </div>
                    </Reveal>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  04 — MATERIAŁY KURSOWE                                             */
/* ================================================================== */

function SheetsBand() {
  return (
    <section
      id="materialy"
      className="as-section relative overflow-hidden scroll-mt-20 bg-mocha text-cream-50"
    >
      <GoldArc className="top-0 left-[6%] h-[740px] w-[880px]" opacity={0.25} />

      <div className="as-shell relative">
        <Reveal>
          <SectionLabel number="04" tone="light">
            Materiały
          </SectionLabel>
        </Reveal>

        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
          <Reveal className="lg:col-span-7">
            <h2 className="as-display-section as-text-balance">Program w oryginale.</h2>
          </Reveal>
          <Reveal delay={90} className="lg:col-span-5 lg:pt-1">
            <p className="as-caption-invert">
              Karty programów {BRAND.academy} — dokładnie te, które dostają kursantki. Zakres, ceny
              i harmonogram bez skrótów i bez tłumaczenia na marketingowy język.
            </p>
          </Reveal>
        </div>

        {/* pięć plakatów w jednej złotej ramce (tekst wtopiony w grafikę — bez tonu),
            podpisy w tej samej siatce pod ramką */}
        <Reveal delay={120} className="mt-10">
          <div className="as-photo-frame grid grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-5">
            {COURSE_SHEETS.map((sheet) => (
              <Figure
                key={sheet.alt}
                image={sheet.image}
                alt={sheet.alt}
                ratio="9 / 16"
                zoom={false}
                sizes="(min-width: 1024px) 18vw, (min-width: 768px) 30vw, 45vw"
              />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-1 gap-y-6 px-1 md:grid-cols-3 lg:grid-cols-5">
            {COURSE_SHEETS.map((sheet) => (
              <div key={sheet.alt}>
                <span className="as-kicker-invert">{sheet.kicker}</span>
                <h3 className="as-numbered-title mt-2 text-cream-50">{sheet.title}</h3>
                <p className="as-caption-invert mt-2">{sheet.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  05 — W CENIE SZKOLENIA                                             */
/* ================================================================== */

function BenefitsBand() {
  return (
    <section className="as-section bg-cream-50">
      <div className="as-shell">
        {/* układ jak w zajawce cennika na stronie głównej: kolumna 33% + lista */}
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <Reveal>
              <SectionLabel number="05">W cenie</SectionLabel>
              <h2 className="as-display-section-sm mt-6 text-ink">
                Wszystko,
                <br />
                co dostajesz
                <br />
                w cenie kursu.
              </h2>
              <p className="as-caption mt-6">
                Lista wspólna dla obu programów — spisana z kart szkoleniowych, bez gwiazdek i
                dopłat ukrytych w regulaminie.
              </p>
              <ArrowLink href="#kursy" className="mt-8 w-fit">
                Wróć do programów
              </ArrowLink>
            </Reveal>
          </div>

          <div className="lg:col-span-8">
            <Reveal delay={90}>
              <ul className="grid gap-x-8 sm:grid-cols-2">
                {COURSE_BENEFITS.map((benefit, i) => (
                  <li
                    key={benefit}
                    className="flex items-baseline gap-4 border-b border-ink/10 py-4 first:border-t sm:[&:nth-child(2)]:border-t"
                  >
                    <span className="as-num text-lg sm:text-xl">{pad(i + 1)}</span>
                    <span className="text-[0.8125rem] leading-[1.75] text-ink">{benefit}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  06 — HARMONOGRAM                                                   */
/* ================================================================== */

function ScheduleBand() {
  return (
    <section className="as-section relative overflow-hidden bg-espresso-900 text-cream-50">
      <div className="as-shell">
        <Reveal>
          <SectionLabel number="06" tone="light">
            Harmonogram
          </SectionLabel>
        </Reveal>

        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
          <Reveal className="lg:col-span-7">
            <h2 className="as-display-section as-text-balance">
              Cztery dni,
              <br />
              godzina po godzinie.
            </h2>
          </Reveal>
          <Reveal delay={90} className="lg:col-span-5 lg:pt-1">
            <p className="as-caption-invert">
              Plan części stacjonarnej kursu podstawowego. W programie Super Natural Brows część
              stacjonarna trwa dwa dni i przebiega w tym samym rytmie: egzamin, skórki, modelki.
            </p>
          </Reveal>
        </div>

        {/* cztery dni jako rząd kart z pionową złotą linią */}
        <div className="mt-10 grid gap-y-10 md:grid-cols-2 md:gap-x-0 lg:grid-cols-4">
          {COURSE_SCHEDULE.map((day, i) => (
            <Reveal key={day.day} delay={i * 80}>
              <article className="as-card-col">
                <h3 className="font-display text-2xl text-cream-50 sm:text-[1.75rem]">{day.day}</h3>
                <ul className="mt-4">
                  {day.rows.map(([time, text]) => (
                    <li
                      key={`${day.day}-${time}-${text}`}
                      className="flex gap-4 border-b border-cream-200/12 py-3"
                    >
                      <span className="w-12 shrink-0 font-display text-base text-gold-light">
                        {time}
                      </span>
                      <span className="text-[0.75rem] leading-[1.6] text-cream-200/75">{text}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  07 — POZOSTAŁE PROGRAMY                                            */
/* ================================================================== */

function ExtraCoursesBand({ onBook }) {
  return (
    <section className="as-section relative overflow-hidden bg-cream-100">
      <GoldArc className="-top-16 left-[-8%] h-[620px] w-[840px]" opacity={0.3} />

      <div className="as-shell relative">
        <Reveal>
          <SectionLabel number="07">Pozostałe programy</SectionLabel>
        </Reveal>

        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="as-display-section as-text-balance text-ink">
                Masterclass, online
                <br />i szkolenia 1 na 1.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="as-caption mt-6">
                Poza dwiema głównymi ścieżkami prowadzimy programy dla osób, które mają już swoją
                technikę i chcą dopracować detal, przejść na nową strefę albo uczyć się
                indywidualnie.
              </p>
            </Reveal>
          </div>

          {/* jedyne zdjęcie, które faktycznie pasuje do tej sekcji: efekt Perfect Lips */}
          <Reveal delay={120} className="lg:col-span-5">
            <Figure
              image={LIPS[3]}
              alt="Zbliżenie na dolną część twarzy modelki — usta po pigmentacji w odcieniu czerwieni"
              ratio="2 / 1"
              position="50% 55%"
              tone="light"
              sizes="(min-width: 1024px) 38vw, 90vw"
            />
            <p className="as-caption mt-3">
              Perfect Lips — naturalna pigmentacja ust bez konturów. Tej techniki uczymy w kursie
              online, a wykonujemy ją także w gabinecie.
            </p>
            <ArrowLink href="/uslugi" className="mt-4 w-fit">
              Zobacz zabiegi ust
            </ArrowLink>
          </Reveal>
        </div>

        {/* trzy programy jako rząd kart (jak „Efekty" na stronie głównej) */}
        <div className="mt-10 grid gap-y-10 md:grid-cols-3 md:gap-x-0">
          {EXTRA_COURSES.map((course, i) => (
            <Reveal key={course.id} delay={i * 100}>
              <article className="as-card-col group">
                <div className="mb-4 flex items-center gap-4">
                  <span className="as-num">{course.number}</span>
                  <span
                    className="h-px w-10 bg-ink/15 transition-all duration-300 group-hover:w-16 group-hover:bg-gold"
                    aria-hidden="true"
                  />
                </div>

                <span className="as-kicker">{course.kicker}</span>
                <h3 className="mt-3 font-display text-2xl text-ink sm:text-[1.75rem]">
                  {course.title}
                </h3>
                <span className="mt-2 block font-display text-xl text-ink">{course.price}</span>
                <p className="as-caption mt-4 text-[0.75rem] leading-[1.6]">{course.desc}</p>

                <dl className="mt-5 flex-1 space-y-3">
                  {course.facts.map(([term, value]) => (
                    <div key={`${course.id}-${term}`}>
                      <dt className="as-kicker">{term}</dt>
                      <dd className="mt-1 max-w-[17rem] text-[0.8125rem] leading-[1.6] text-mocha">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <button
                  type="button"
                  onClick={() => onBook({ id: course.id, title: course.title })}
                  className="as-arrow-dark group mt-6 w-fit"
                >
                  <span>Zapytaj o ten program</span>
                  <span className="as-arrow-glyph" aria-hidden="true">
                    &#8594;
                  </span>
                </button>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  08 — DOFINANSOWANIE + KURSANTKI                                    */
/* ================================================================== */

function FundingBand() {
  return (
    <section className="as-section bg-mocha text-cream-50">
      <div className="as-shell">
        <Reveal>
          <SectionLabel number="08" tone="light">
            Dofinansowanie
          </SectionLabel>
        </Reveal>

        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
          <Reveal className="lg:col-span-7">
            <h2 className="as-display-section as-text-balance">
              Szkolenie
              <br />
              <span className="italic text-gold-light">z dofinansowaniem.</span>
            </h2>
          </Reveal>

          <Reveal delay={90} className="lg:col-span-5 lg:pt-1">
            <p className="as-caption-invert max-w-sm">
              Jesteśmy zarejestrowani w RIS, KFS oraz BUR. Wybierz dogodną dla Ciebie placówkę,
              sprawdź wymagania potrzebne do akceptacji wniosku w Urzędzie Miasta lub Pracy i poproś
              swojego operatora o kontakt z nami — przekażemy wszystkie niezbędne informacje i
              dokumenty.
            </p>
          </Reveal>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {FUNDING.map((f, i) => (
            <Reveal key={f.short} delay={i * 90}>
              <NumberedItem number={f.number} title={f.short} tone="light">
                {f.title}
              </NumberedItem>
            </Reveal>
          ))}
        </div>

        {/* kolaż kursantek — czwórka w jednej złotej ramce (grupy kotwiczone u góry) */}
        <Reveal delay={120} className="mt-10">
          <div className="as-photo-frame grid grid-cols-2 gap-1 lg:grid-cols-4">
            {GALLERY.map((shot) => (
              <Figure
                key={shot.alt}
                image={shot.image}
                alt={shot.alt}
                ratio="5 / 4"
                position="50% 20%"
                tone="dark"
                sizes="(min-width: 1024px) 22vw, 45vw"
              />
            ))}
          </div>
          <p className="as-caption-invert mt-3">
            Każdy kurs kończy się certyfikatem. Zdjęcia z zakończonych szkoleń w {CONTACT.venue} —
            kameralne grupy 2–4 osób, a po kursie grupa wsparcia i stały kontakt z prowadzącą.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  09 — FAQ                                                           */
/* ================================================================== */

function FaqBand() {
  return (
    <section className="as-section relative overflow-hidden bg-cream-100">
      <GoldArc className="-top-10 right-[-10%] h-[600px] w-[820px]" flip opacity={0.3} />

      <div className="as-shell relative">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <Reveal>
              <SectionLabel number="09">Pytania</SectionLabel>
              <h2 className="as-display-section mt-6 text-ink">
                Zanim
                <br />
                się zapiszesz.
              </h2>
              <p className="as-caption mt-6">
                Organizacja, praktyka, dofinansowania i opieka po kursie — odpowiedzi na pytania,
                które dostajemy najczęściej.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-8">
            <Reveal delay={90}>
              <Faq items={FAQ_ITEMS} />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  10 — KONTAKT (pas zamykający)                                      */
/* ================================================================== */

function ClosingBand({ onBook }) {
  return (
    <ClosingCta
      number="10"
      label="Kontakt"
      title="Zacznijmy od"
      titleAccent="rozmowy."
      lead={`Napisz, na jakim jesteś etapie — dobierzemy program i ustalimy najbliższy możliwy termin części stacjonarnej. Szkolenia prowadzi ${FOUNDER.name}, ${FOUNDER.role}.`}
      primary={{ label: 'Zgłoś się', onClick: () => onBook(null) }}
      secondary={{ href: CONTACT.instagram, label: CONTACT.instagramHandle }}
    />
  );
}

/* ================================================================== */
/*  ZGŁOSZENIE NA SZKOLENIE                                            */
/*  (bez płatności — formularz zbiera dane i informuje o kontakcie)    */
/* ================================================================== */

const ALL_COURSE_TITLES = [
  ...COURSES.map((c) => c.title),
  ...EXTRA_COURSES.map((c) => c.title),
];

function BookingDialog({ course, onClose }) {
  const [form, setForm] = useState({
    course: course?.title || ALL_COURSE_TITLES[0],
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
      subject: `Zgłoszenie na szkolenie — ${form.course}`,
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

  return (
    <Dialog open onOpenChange={onClose}>
      {/* formularz ma dwie kolumny pól — stąd szerszy panel */}
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <span className="as-kicker">Zgłoszenie na szkolenie</span>
          <DialogTitle>{sent ? enquiryMessage(sent).title : form.course}</DialogTitle>
          <DialogDescription>
            {sent
              ? enquiryMessage(sent).body
              : 'Zostaw kontakt i kilka słów o swoim doświadczeniu. Ten formularz nie realizuje płatności — potwierdzenie terminu i rozliczenie ustalamy osobno.'}
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
              Miejsce w grupie rezerwujemy dopiero po rozmowie — zgłoszenie nie jest jeszcze
              opłacone ani potwierdzone. Najszybciej odpowiadamy na Instagramie.
            </p>

            <DialogFooter>
              <a
                href={CONTACT.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="as-btn-gold"
              >
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
            >
              {ALL_COURSE_TITLES.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </Field>

            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <Field
                id="e-name"
                name="name"
                type="text"
                label="Imię i nazwisko"
                value={form.name}
                onChange={handleChange}
                required
              />
              <Field
                id="e-phone"
                name="phone"
                type="tel"
                label="Telefon"
                value={form.phone}
                onChange={handleChange}
                required
              />
              <Field
                id="e-email"
                name="email"
                type="email"
                label="E-mail"
                value={form.email}
                onChange={handleChange}
                required
              />
              <Field
                id="e-city"
                name="city"
                type="text"
                label="Miasto"
                value={form.city}
                onChange={handleChange}
              />
            </div>

            <Field
              id="e-term"
              name="term"
              type="text"
              label="Preferowany termin części stacjonarnej"
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

            <p className="border-l border-gold/35 pl-5 text-xs leading-relaxed text-mocha-400">
              Wysłanie formularza nie jest płatnością ani rezerwacją miejsca. Termin, dostępność i
              sposób rozliczenia potwierdzamy w rozmowie.
            </p>

            <DialogFooter>
              <button type="submit" className="as-btn-gold">
                Wyślij zgłoszenie
              </button>
              <button type="button" onClick={onClose} className="as-btn-ghost">
                Anuluj
              </button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ================================================================== */

export default function Education() {
  const [booking, setBooking] = useState(null); // { course } | null

  const openBooking = (course) => setBooking({ course });
  const closeBooking = () => setBooking(null);

  return (
    <>
      <Hero />
      <MethodBand />
      <ProgramsBand onBook={openBooking} />
      <SheetsBand />
      <BenefitsBand />
      <ScheduleBand />
      <ExtraCoursesBand onBook={openBooking} />
      <FundingBand />
      <FaqBand />
      <ClosingBand onBook={openBooking} />

      {booking && (
        <BookingDialog
          key={booking.course?.id || 'ogolne'}
          course={booking.course}
          onClose={closeBooking}
        />
      )}
    </>
  );
}
