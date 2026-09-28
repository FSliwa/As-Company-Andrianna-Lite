'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLink,
  FactStrip,
  Figure,
  GoldArc,
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
import { ENQUIRY_STATUS, enquiryMessage, sendEnquiry } from '@/lib/enquiry';

/**
 * Szkolenia (/szkolenia)
 *
 * Zasady:
 *  • zdjęcia wyłącznie z '@/lib/media' (folder /Graphics) — zero zewnętrznych URL-i,
 *  • efekty brwi wyłącznie z czystych paneli (BY_NAME['…-pN']) albo pojedynczych
 *    makr — nigdy z plików zbiorczych sklejek „przed/po" (szwy, watermarki);
 *    żaden plik nie występuje na stronie dwa razy, grupy kursantek zawsze z
 *    position u góry, a w ciemnych sekcjach zdjęcia dostają tone="dark",
 *  • dane programów, korzyści i harmonogram pochodzą z '@/lib/site'
 *    (COURSES, COURSE_BENEFITS, COURSE_SCHEDULE) — czyli 1:1 z grafik marki,
 *  • grafiki COURSE mają wtopiony tekst, więc występują wyłącznie jako
 *    samodzielne karty/plakaty — nigdy jako tło pod inny tekst,
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
    desc: 'Filmy instruktażowe w dostępie na zawsze, skrypt z teorią i ćwiczeniami. Paczkę z materiałami i akcesoriami wysyłamy przed rozpoczęciem części stacjonarnej.',
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

const FIELD_CLASS =
  'w-full border border-ink/15 bg-cream-50 px-4 py-3 text-[0.9375rem] text-ink transition-colors placeholder:text-mocha-400/70 focus:border-gold focus:outline-none';

const LABEL_CLASS = 'as-label mb-2.5 block text-ink/55';

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
      tone="cream"
    >
      <div className="flex flex-wrap items-center gap-4">
        <a href="#kursy" className="as-btn-solid">
          Zobacz programy
        </a>
        <Link href="/kontakt" className="as-btn-ghost">
          Zapytaj o termin
        </Link>
      </div>
      <FactStrip
        className="mt-10 border-t border-ink/10 pt-6"
        items={['RIS · KFS · BUR', CONTACT.venue, CONTACT.city, 'Kameralne grupy']}
      />
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

        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <Reveal>
              <h2 className="as-display-lg as-text-balance">
                Teoria w domu.
                <br />
                Praktyka na
                <br />
                <span className="italic text-gold-light">modelkach.</span>
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="as-body-invert mt-8 max-w-sm">
                Teorię i przygotowanie przerabiasz online, we własnym tempie. Podczas dni
                stacjonarnych pracujemy wyłącznie na skórkach i żywych modelkach — dlatego wychodzisz
                z kursu z realnie przepracowanymi zabiegami, a nie z notatkami.
              </p>
            </Reveal>
            <Reveal delay={140}>
              <ArrowLink href="#kursy" tone="light" className="mt-10 w-fit">
                Zobacz programy
              </ArrowLink>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal>
              <div className="grid gap-3">
                <Figure
                  image={ACADEMY[6]}
                  alt="Cztery kursantki z certyfikatami Super Natural Brows przed ścianą z logo Babushkina Academy"
                  ratio="16 / 10"
                  position="50% 18%"
                  tone="dark"
                  sizes="(min-width: 1024px) 55vw, 90vw"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Figure
                    image={STUDIO[13]}
                    alt="Andriana Babushkina — portret z sesji wizerunkowej AS Company"
                    ratio="2 / 1"
                    position="50% 30%"
                    tone="dark"
                    sizes="(min-width: 1024px) 27vw, 45vw"
                  />
                  <Figure
                    image={BY_NAME['brows-13-p1']}
                    alt="Wygojony łuk brwi z pojedynczymi włoskami po pigmentacji — zbliżenie"
                    ratio="2 / 1"
                    tone="dark"
                    sizes="(min-width: 1024px) 27vw, 45vw"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="mt-14 grid gap-10 border-t border-cream-200/15 pt-10 md:grid-cols-3">
          {METHOD_STEPS.map((step, i) => (
            <Reveal key={step.number} delay={i * 90}>
              <div className="flex items-start gap-6">
                <span className="as-num text-gold-light">{step.number}</span>
                <div>
                  <h3 className="as-display-sm italic text-cream-50">{step.title}</h3>
                  <p className="as-body-invert mt-2.5 text-[0.8125rem]">{step.desc}</p>
                </div>
              </div>
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
    <section id="kursy" className="as-section relative overflow-hidden bg-cream-100">
      <GoldArc className="-top-12 right-[-8%] h-[640px] w-[860px]" flip opacity={0.35} />

      <div className="as-shell relative">
        <Reveal>
          <SectionLabel number="03">Programy</SectionLabel>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
          <Reveal className="lg:col-span-7">
            <h2 className="as-display-lg as-text-balance text-ink">
              Dwie ścieżki
              <br />
              Super Natural Brows.
            </h2>
          </Reveal>
          <Reveal delay={90} className="lg:col-span-5 lg:pb-2">
            <p className="as-body max-w-md">
              Program i ceny pochodzą wprost z materiałów {BRAND.academy}. Wybierz ścieżkę zależnie
              od tego, czy dopiero zaczynasz, czy chcesz przejść z pudru na maszynowy włos.
            </p>
          </Reveal>
        </div>

        {/* pasek efektów techniki, której uczymy */}
        <Reveal delay={120}>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {EFFECT_THUMBS.map((t, i) => (
              <Figure
                key={i}
                image={t.image}
                alt={t.alt}
                ratio="16 / 10"
                position={t.position}
                sizes="(min-width: 640px) 22vw, 45vw"
              />
            ))}
          </div>
          <p className="as-label mt-4 text-ink/45">Efekty techniki, której uczymy</p>
        </Reveal>

        <div className="mt-20 space-y-20 lg:space-y-28">
          {COURSES.map((course, index) => {
            const poster = COURSE_POSTERS[course.id];
            const reversed = index % 2 === 1;

            return (
              <article key={course.id} className="border-t border-ink/10 pt-12">
                <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
                  {/* plakat programu — samodzielna karta */}
                  {poster && (
                    <Reveal
                      className={`lg:col-span-4 ${reversed ? 'lg:order-2' : ''}`}
                    >
                      <Figure
                        image={poster.image}
                        alt={poster.alt}
                        ratio="9 / 16"
                        framed
                        zoom={false}
                        sizes="(min-width: 1024px) 30vw, 85vw"
                      />
                    </Reveal>
                  )}

                  <div className={`lg:col-span-8 ${reversed ? 'lg:order-1' : ''}`}>
                    <Reveal>
                      <span className="as-label text-gold-dark">{course.kicker}</span>
                      <h3 className="as-display-md mt-4 text-ink">{course.title}</h3>
                      <p className="as-body mt-5 max-w-xl">{course.lead}</p>
                    </Reveal>

                    <Reveal delay={80}>
                      <div className="mt-9 flex flex-wrap items-baseline gap-x-10 gap-y-4 border-y border-ink/10 py-6">
                        <div>
                          <span className="as-label block text-ink/45">Format</span>
                          <span className="mt-2 block text-base text-ink">{course.format}</span>
                        </div>
                        <div>
                          <span className="as-label block text-ink/45">Cena</span>
                          <span className="mt-1 block font-display text-2xl text-ink">
                            {course.price}
                            {course.priceNote && (
                              <span className="ml-2 align-middle text-xs uppercase tracking-wider2 text-mocha-400">
                                {course.priceNote}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </Reveal>

                    <Reveal delay={120}>
                      <ul className="mt-9 grid gap-x-10 gap-y-7 sm:grid-cols-2">
                        {course.program.map((item, i) => (
                          <li key={item.label} className="flex gap-4">
                            <span className="as-num text-lg sm:text-xl">
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <div>
                              <span className="block text-[0.9375rem] leading-snug text-ink">
                                {item.label}
                              </span>
                              {item.detail && (
                                <span className="mt-1.5 block text-[0.8125rem] leading-relaxed text-mocha-400">
                                  {item.detail}
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </Reveal>

                    <Reveal delay={160}>
                      <div className="mt-10 flex flex-wrap items-center gap-4">
                        <button
                          type="button"
                          onClick={() => onBook({ id: course.id, title: course.title })}
                          className="as-btn-solid"
                        >
                          Zgłoś się na szkolenie
                        </button>
                        <span className="as-label text-ink/45">
                          Terminy zjazdów ustalamy indywidualnie
                        </span>
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
    <section className="as-section relative overflow-hidden bg-mocha text-cream-50">
      <GoldArc className="top-0 left-[6%] h-[740px] w-[880px]" opacity={0.25} />

      <div className="as-shell relative">
        <Reveal>
          <SectionLabel number="04" tone="light">
            Materiały
          </SectionLabel>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
          <Reveal className="lg:col-span-7">
            <h2 className="as-display-lg as-text-balance">Program w oryginale.</h2>
          </Reveal>
          <Reveal delay={90} className="lg:col-span-5 lg:pb-2">
            <p className="as-body-invert max-w-md">
              Karty programów {BRAND.academy} — dokładnie te, które dostają kursantki. Zakres, ceny
              i harmonogram bez skrótów i bez tłumaczenia na marketingowy język.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {COURSE_SHEETS.map((sheet, i) => (
            <Reveal key={sheet.alt} delay={i * 80}>
              <article className="flex h-full flex-col">
                <Figure
                  image={sheet.image}
                  alt={sheet.alt}
                  ratio="9 / 16"
                  zoom={false}
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                />
                <span className="as-label mt-6 text-gold-light">{sheet.kicker}</span>
                <h3 className="as-display-sm mt-3 italic text-cream-50">{sheet.title}</h3>
                <p className="as-body-invert mt-2.5 text-[0.8125rem]">{sheet.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
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
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <SectionLabel number="05">W cenie</SectionLabel>
              <h2 className="as-display-lg as-text-balance mt-8 text-ink">
                Wszystko, co dostajesz
                <br />
                w cenie kursu.
              </h2>
              <p className="as-body mt-7 max-w-sm">
                Lista wspólna dla obu programów — spisana z kart szkoleniowych, bez gwiazdek i
                dopłat ukrytych w regulaminie.
              </p>
              <ArrowLink href="#kursy" className="mt-9 w-fit">
                Wróć do programów
              </ArrowLink>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={90}>
              <ul className="grid gap-x-10 sm:grid-cols-2">
                {COURSE_BENEFITS.map((benefit, i) => (
                  <li
                    key={benefit}
                    className="flex gap-4 border-b border-ink/10 py-5 first:border-t sm:[&:nth-child(2)]:border-t"
                  >
                    <span className="as-num text-lg sm:text-xl">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[0.9375rem] leading-relaxed text-ink">{benefit}</span>
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
    <section className="relative overflow-hidden bg-espresso-900 text-cream-50">
      <div className="as-shell py-20 lg:py-28">
        <Reveal>
          <SectionLabel number="06" tone="light">
            Harmonogram
          </SectionLabel>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
          <Reveal className="lg:col-span-7">
            <h2 className="as-display-lg as-text-balance">Cztery dni, godzina po godzinie.</h2>
          </Reveal>
          <Reveal delay={90} className="lg:col-span-5 lg:pb-2">
            <p className="as-body-invert max-w-md">
              Plan części stacjonarnej kursu podstawowego. W programie Super Natural Brows część
              stacjonarna trwa dwa dni i przebiega według tego samego rytmu: egzamin, skórki,
              modelki.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-x-12 gap-y-12 border-t border-cream-200/12 pt-12 md:grid-cols-2">
          {COURSE_SCHEDULE.map((day, i) => (
            <Reveal key={day.day} delay={i * 80}>
              <h3 className="as-display-sm italic text-cream-50">{day.day}</h3>
              <ul className="mt-6">
                {day.rows.map(([time, text]) => (
                  <li
                    key={`${day.day}-${time}-${text}`}
                    className="flex gap-6 border-b border-cream-200/12 py-3.5"
                  >
                    <span className="w-14 shrink-0 font-display text-base text-gold-light">
                      {time}
                    </span>
                    <span className="text-[0.8125rem] leading-relaxed text-cream-200/75">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
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

        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="as-display-lg as-text-balance text-ink">
                Masterclass, online
                <br />i szkolenia 1 na 1.
              </h2>
              <p className="as-body mt-8 max-w-lg">
                Poza dwiema głównymi ścieżkami prowadzimy programy dla osób, które mają już swoją
                technikę i chcą dopracować detal, przejść na nową strefę albo uczyć się w trybie
                indywidualnym.
              </p>
            </Reveal>

            <div className="mt-12 border-t border-ink/10">
              {EXTRA_COURSES.map((course, i) => (
                <Reveal key={course.id} delay={i * 80}>
                  <article className="border-b border-ink/10 py-10">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
                      <div className="flex items-center gap-5">
                        <span className="as-num">{course.number}</span>
                        <div>
                          <span className="as-label block text-gold-dark">{course.kicker}</span>
                          <h3 className="as-display-sm mt-2 text-ink">{course.title}</h3>
                        </div>
                      </div>
                      <span className="font-display text-xl text-ink">{course.price}</span>
                    </div>

                    <p className="as-body mt-6 max-w-xl">{course.desc}</p>

                    <dl className="mt-7 grid gap-x-10 gap-y-4 sm:grid-cols-3">
                      {course.facts.map(([term, value]) => (
                        <div key={`${course.id}-${term}`}>
                          <dt className="as-label text-ink/45">{term}</dt>
                          <dd className="mt-2 text-[0.8125rem] leading-relaxed text-mocha">
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <button
                      type="button"
                      onClick={() => onBook({ id: course.id, title: course.title })}
                      className="as-arrow-dark group mt-8"
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

          {/* jedyne zdjęcie, które faktycznie pasuje do tej sekcji: efekt Perfect Lips */}
          <div className="lg:col-span-5">
            <Reveal delay={120}>
              <Figure
                image={LIPS[3]}
                alt="Zbliżenie na dolną część twarzy modelki — usta po pigmentacji w odcieniu czerwieni"
                ratio="4 / 3"
                framed
                sizes="(min-width: 1024px) 38vw, 90vw"
              />
              <p className="as-body mt-8 max-w-sm text-[0.8125rem]">
                Perfect Lips — naturalna pigmentacja ust bez konturów. Tej techniki uczymy w kursie
                online, a wykonujemy ją także w gabinecie.
              </p>
              <ArrowLink href="/uslugi" className="mt-6 w-fit">
                Zobacz zabiegi ust
              </ArrowLink>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  08 — DOFINANSOWANIE                                                */
/* ================================================================== */

function FundingBand() {
  return (
    <section className="relative overflow-hidden bg-mocha text-cream-50">
      <div className="as-shell py-20 lg:py-28">
        <Reveal>
          <SectionLabel number="08" tone="light">
            Dofinansowanie
          </SectionLabel>
        </Reveal>

        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <h2 className="as-display-lg as-text-balance">
              Szkolenie
              <br />
              <span className="italic text-gold-light">z dofinansowaniem.</span>
            </h2>
          </Reveal>

          <Reveal delay={90} className="lg:col-span-7">
            <p className="as-body-invert max-w-xl">
              Jesteśmy zarejestrowani w RIS, KFS oraz BUR. Wybierz dogodną dla Ciebie placówkę, zbierz
              wiedzę i wymagania potrzebne do akceptacji wniosku w Urzędzie Miasta lub Pracy, a
              następnie poproś swojego operatora o kontakt z nami — przekażemy wszystkie niezbędne
              informacje i dokumenty.
            </p>

            <div className="mt-12 grid gap-8 border-t border-cream-200/15 pt-10 sm:grid-cols-3">
              {FUNDING.map((f) => (
                <div key={f.short}>
                  <span className="as-num text-gold-light">{f.number}</span>
                  <h3 className="as-display-sm mt-3 italic text-cream-50">{f.short}</h3>
                  <p className="as-body-invert mt-2 text-[0.8125rem]">{f.title}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  09 — KURSANTKI                                                     */
/* ================================================================== */

/* Cztery różne grupy — każda tylko raz na stronie; pomijamy academy-05 (choinka) i academy-03 (wypalona ikonka w rogu). */
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

function GalleryBand() {
  return (
    <section className="as-section bg-cream-50">
      <div className="as-shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
          <Reveal className="lg:col-span-7">
            <SectionLabel number="09">Kursantki</SectionLabel>
            <h2 className="as-display-lg as-text-balance mt-8 text-ink">
              Każdy kurs kończy się
              <br />
              certyfikatem.
            </h2>
          </Reveal>
          <Reveal delay={90} className="lg:col-span-5 lg:pb-2">
            <p className="as-body max-w-md">
              Zdjęcia z zakończonych szkoleń w {CONTACT.venue}. Kameralne grupy 2–4 osób, a po
              kursie — grupa wsparcia i stały kontakt z prowadzącą.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GALLERY.map((shot, i) => (
            <Reveal key={shot.alt} delay={i * 80}>
              <Figure
                image={shot.image}
                alt={shot.alt}
                ratio="3 / 4"
                position="50% 20%"
                sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  10 — FAQ                                                           */
/* ================================================================== */

function FaqBand() {
  return (
    <section className="as-section relative overflow-hidden bg-cream-100">
      <GoldArc className="-top-10 right-[-10%] h-[600px] w-[820px]" flip opacity={0.3} />

      <div className="as-shell relative">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Reveal>
              <SectionLabel number="10">Pytania</SectionLabel>
              <h2 className="as-display-lg as-text-balance mt-8 text-ink">
                Zanim
                <br />
                się zapiszesz.
              </h2>
              <p className="as-body mt-7 max-w-sm">
                Organizacja, praktyka, dofinansowania i opieka po kursie — odpowiedzi na pytania,
                które dostajemy najczęściej.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-8">
            <Reveal delay={90}>
              <Accordion type="single" collapsible className="w-full border-t border-ink/10">
                {FAQ_ITEMS.map((item, idx) => (
                  <AccordionItem key={item.q} value={`faq-${idx}`} className="border-ink/10">
                    <AccordionTrigger className="gap-6 py-6 text-left font-display text-lg leading-snug text-ink hover:no-underline sm:text-xl">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="as-body max-w-2xl pb-7 pr-6">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  11 — CTA                                                           */
/* ================================================================== */

function ClosingBand({ onBook }) {
  return (
    <section className="relative overflow-hidden bg-espresso text-cream-50">
      <div className="as-shell py-20 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <h2 className="as-display-lg as-text-balance">
              Zacznijmy od <span className="italic text-gold-light">rozmowy.</span>
            </h2>
            <p className="as-body-invert mt-7 max-w-lg">
              Napisz, na jakim jesteś etapie — dobierzemy program i ustalimy najbliższy możliwy
              termin części stacjonarnej. Szkolenia prowadzi {FOUNDER.name}, {FOUNDER.role}.
            </p>
          </Reveal>
          <Reveal delay={90} className="flex flex-wrap gap-4 lg:col-span-5 lg:justify-end">
            <button
              type="button"
              onClick={() => onBook(null)}
              className="as-btn-gold"
            >
              Wyślij zgłoszenie
            </button>
            <a
              href={CONTACT.instagram}
              target="_blank"
              rel="noreferrer noopener"
              className="as-btn-ghost-light"
            >
              {CONTACT.instagramHandle}
            </a>
          </Reveal>
        </div>
      </div>
    </section>
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
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto rounded-none border-ink/15 bg-cream-50 p-7 sm:max-w-[620px] sm:rounded-none sm:p-10">
        <DialogHeader className="space-y-3 text-left">
          <span className="as-label text-gold-dark">Zgłoszenie na szkolenie</span>
          <DialogTitle className="as-display-md text-left font-normal text-ink">
            {sent ? enquiryMessage(sent).title : form.course}
          </DialogTitle>
          <DialogDescription className="as-body text-left">
            {sent
              ? enquiryMessage(sent).body
              : 'Zostaw kontakt i kilka słów o swoim doświadczeniu. Ten formularz nie realizuje płatności — potwierdzenie terminu i rozliczenie ustalamy osobno.'}
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="mt-8">
            <div className="border border-ink/10 bg-cream-100/70 p-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="as-label text-ink/45">Szkolenie</dt>
                  <dd className="mt-2 text-[0.9375rem] text-ink">{form.course}</dd>
                </div>
                {form.term && (
                  <div>
                    <dt className="as-label text-ink/45">Preferowany termin</dt>
                    <dd className="mt-2 text-[0.9375rem] text-ink">{form.term}</dd>
                  </div>
                )}
                <div>
                  <dt className="as-label text-ink/45">Kontakt</dt>
                  <dd className="mt-2 text-[0.9375rem] text-ink">
                    {form.name}
                    {form.phone ? ` · ${form.phone}` : ''}
                  </dd>
                </div>
              </dl>
            </div>

            <p className="as-body mt-6 text-[0.8125rem]">
              Miejsce w grupie rezerwujemy dopiero po rozmowie — zgłoszenie nie jest jeszcze
              opłacone ani potwierdzone. Najszybciej odpowiadamy na Instagramie.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
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
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="e-course" className={LABEL_CLASS}>
                Szkolenie
              </label>
              <select
                id="e-course"
                name="course"
                value={form.course}
                onChange={handleChange}
                className={FIELD_CLASS}
              >
                {ALL_COURSE_TITLES.map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="e-name" className={LABEL_CLASS}>
                  Imię i nazwisko
                </label>
                <input
                  id="e-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  className={FIELD_CLASS}
                  required
                />
              </div>
              <div>
                <label htmlFor="e-phone" className={LABEL_CLASS}>
                  Telefon
                </label>
                <input
                  id="e-phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className={FIELD_CLASS}
                  required
                />
              </div>
              <div>
                <label htmlFor="e-email" className={LABEL_CLASS}>
                  E-mail
                </label>
                <input
                  id="e-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={FIELD_CLASS}
                  required
                />
              </div>
              <div>
                <label htmlFor="e-city" className={LABEL_CLASS}>
                  Miasto
                </label>
                <input
                  id="e-city"
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange}
                  className={FIELD_CLASS}
                />
              </div>
            </div>

            <div>
              <label htmlFor="e-term" className={LABEL_CLASS}>
                Preferowany termin części stacjonarnej
              </label>
              <input
                id="e-term"
                name="term"
                type="text"
                value={form.term}
                onChange={handleChange}
                className={FIELD_CLASS}
                placeholder="np. listopad, dowolny weekend"
              />
            </div>

            <div>
              <label htmlFor="e-experience" className={LABEL_CLASS}>
                Twoje doświadczenie w PMU
              </label>
              <textarea
                id="e-experience"
                name="experience"
                rows={4}
                value={form.experience}
                onChange={handleChange}
                className={`${FIELD_CLASS} resize-none`}
                placeholder="Od kiedy pracujesz, jakie techniki wykonujesz, czego chcesz się nauczyć."
              />
            </div>

            <p className="border-l border-gold/50 pl-4 text-xs leading-relaxed text-mocha-400">
              Wysłanie formularza nie jest płatnością ani rezerwacją miejsca. Termin, dostępność i
              sposób rozliczenia potwierdzamy w rozmowie.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button type="submit" className="as-btn-solid">
                Wyślij zgłoszenie
              </button>
              <button type="button" onClick={onClose} className="as-btn-ghost">
                Anuluj
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ================================================================== */

export default function Education() {
  const [booking, setBooking] = useState(null); // { open, course } | null

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
      <GalleryBand />
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
