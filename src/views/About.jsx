'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLink,
  ClosingCta,
  FactStrip,
  Figure,
  GoldArc,
  NumberedItem,
  PageHero,
  PriceRow,
  Reveal,
  SectionLabel,
  Stat,
} from '@/components/as/Primitives';
import { ACHIEVEMENTS, BRAND, CONTACT, FOUNDER } from '@/lib/site';
import { ACADEMY, STUDIO } from '@/lib/media';

/* Wyróżnienia w tekście — marka pisze lekko, więc tylko font-medium,
   dopasowane do jasnego / ciemnego pasa. */
const EmLight = ({ children }) => (
  <strong className="font-medium text-cream-50">{children}</strong>
);
const EmDark = ({ children }) => <strong className="font-medium text-ink">{children}</strong>;

/* Tytuły zdobyte na Mistrzostwach Świata — treść z dotychczasowej strony. */
const TITLES = [
  { category: 'Włos maszynowy', result: '1. i 2. miejsce' },
  { category: 'Brwi pudrowe', result: '1. miejsca' },
  { category: 'Usta', result: '1. miejsce' },
];

/* ================================================================== */
/*  01 — NAGŁÓWEK                                                      */
/* ================================================================== */

function Hero() {
  return (
    <PageHero
      number="01"
      label="O nas"
      title="Andriana"
      titleAccent="Babushkina"
      lead="Linergistka, trenerka, prelegentka oraz sędzia w dziedzinie makijażu permanentnego na poziomie międzynarodowym. Autorka techniki Super Natural Brows."
      image={STUDIO[10]}
      imageAlt={`${FOUNDER.name} — sesja wizerunkowa założycielki ${BRAND.name}`}
      tone="cream"
      facts={['Linergistka', 'Trenerka', 'Prime Speaker', 'Sędzia międzynarodowa']}
    >
      <div className="flex flex-wrap gap-4">
        <Link href="/szkolenia" className="as-btn-solid">
          Zobacz ofertę szkoleń
        </Link>
        <Link href="/uslugi" className="as-btn-ghost">
          Zarezerwuj zabieg
        </Link>
      </div>
    </PageHero>
  );
}

/* ================================================================== */
/*  02 — DROGA ZAWODOWA                                                */
/* ================================================================== */

function StoryBand() {
  return (
    <section className="as-section relative overflow-hidden bg-espresso text-cream-50">
      <GoldArc className="-top-28 left-[-6%] h-[720px] w-[900px]" opacity={0.28} />

      <div className="as-shell relative">
        <Reveal>
          <SectionLabel number="02" tone="light">
            Droga zawodowa
          </SectionLabel>
        </Reveal>

        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* lewa kolumna — nagłówek, fakty, kolaż portretów */}
          <div className="lg:col-span-5">
            <Reveal>
              {/* trzy wiersze w wąskiej kolumnie — jak „Szkolenia oparte na realnej praktyce" */}
              <h2 className="as-display-section-sm as-text-balance">
                Od podium
                <br />
                Mistrzostw Świata
                <br />
                do <span className="italic text-gold-light">własnej techniki.</span>
              </h2>
            </Reveal>

            <Reveal delay={80}>
              <FactStrip
                tone="light"
                className="mt-6"
                items={['Katowice', 'Warszawa', 'Szkolenia za granicą']}
              />
            </Reveal>

            <Reveal delay={140}>
              {/* kolaż jak w „Szkoleniach" na stronie głównej: szeroki kadr u góry,
                  dwa portrety pod nim, cienka złota linia wokół całości */}
              <div className="as-photo-frame mt-8 grid gap-1">
                <Figure
                  image={STUDIO[13]}
                  alt={`${FOUNDER.name} — uśmiechnięty portret z sesji wizerunkowej, dłoń pod brodą`}
                  ratio="16 / 10"
                  position="50% 40%"
                  tone="dark"
                  sizes="(min-width: 1024px) 36vw, 90vw"
                />
                <div className="grid grid-cols-2 gap-1">
                  <Figure
                    image={STUDIO[0]}
                    alt={`${FOUNDER.name} — portret z sesji wizerunkowej, dłoń oparta na ramieniu`}
                    ratio="4 / 5"
                    position="50% 20%"
                    tone="dark"
                    sizes="(min-width: 1024px) 18vw, 45vw"
                  />
                  <Figure
                    image={STUDIO[7]}
                    alt={`${FOUNDER.name} — portret z przymkniętymi oczami, z sesji wizerunkowej marki`}
                    ratio="4 / 5"
                    position="50% 20%"
                    tone="dark"
                    sizes="(min-width: 1024px) 18vw, 45vw"
                  />
                </div>
              </div>
              <p className="as-caption-invert mt-3">{FOUNDER.signature}</p>
            </Reveal>
          </div>

          {/* prawa kolumna — biografia */}
          <div className="lg:col-span-7">
            <Reveal delay={90}>
              <div className="as-body-invert max-w-xl space-y-5">
                <p>
                  Kilka razy wygrała podium Światowych Mistrzostw.{' '}
                  <EmLight>2 razy w kategorii włos maszynowy (1. oraz 2. miejsce)</EmLight>,{' '}
                  <EmLight>2 razy w kategorii brwi pudrowe (1. miejsca)</EmLight>, a także
                  kategoria <EmLight>usta (1. miejsce)</EmLight>.
                </p>
                <p>
                  Wykonała tysiące pigmentacji dla klientek oraz przeszkoliła setki kursantek z
                  różnych technologii, za ostatni rok tylko ponad{' '}
                  <EmLight>100 kursantek z techniki włosa maszynowego</EmLight>.
                </p>
                <p>
                  Twórczyni szybkich, naturalnych technik makijażu permanentnego brwi oraz ust z
                  80% wygojeniem. Autorka techniki <EmLight>„SuperNatural brows”</EmLight> — włos
                  maszynowy bez kompromisów między jakością a szybkością. Pigmentacja jej
                  kursantek jest na wysokim poziomie i wykonywana w 2–2,5 godziny, a sama wykonuje
                  włos maszynowy w{' '}
                  <EmLight>1,5–2 godziny, bez bólu, bez blizn i migracji pigmentu po czasie</EmLight>
                  .
                </p>
                <p>
                  <EmLight>7 lat prowadziła salon w Katowicach</EmLight>, który stał się najbardziej
                  wybieranym oraz zaufanym wśród klientek na całym Śląsku salonem makijażu
                  permanentnego z listą oczekiwania na zabieg ponad pół roku.
                </p>
                <p>
                  <EmLight>
                    3 lata prowadzi salon i akademię makijażu permanentnego w Warszawie
                  </EmLight>
                  , wykonując pigmentację i szkoląc osoby z różnych zakątków Polski i świata. Jest
                  zapraszana na pokazy, masterclassy i prowadzenie kursów w innych krajach, baza
                  kursantek za granicą już nalicza ponad 50 osób.
                </p>
                <p>
                  Sama również przeszła ogromną ilość szkoleń, odwiedziła mnóstwo konferencji i
                  pokazów od światowych liderek branży, a teraz sama znajduje się na tym poziomie i
                  jest często spotykana na najlepszych branżowych wydarzeniach jako{' '}
                  <EmLight>Prime Speaker i Stage Prelegent</EmLight>.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  03 — OSIĄGNIĘCIA                                                   */
/* ================================================================== */

function AchievementsBand() {
  return (
    <section className="as-section relative overflow-hidden bg-cream-100">
      <GoldArc className="-top-16 right-[-8%] h-[620px] w-[840px]" flip opacity={0.35} />

      <div className="as-shell relative">
        <Reveal>
          <SectionLabel number="03">Osiągnięcia</SectionLabel>
        </Reveal>

        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
          <Reveal className="lg:col-span-7">
            <h2 className="as-display-section as-text-balance text-ink">
              Liczby, które
              <br />
              stoją za techniką.
            </h2>
          </Reveal>
          <Reveal delay={90} className="lg:col-span-5 lg:pt-1">
            <p className="as-caption">
              Międzynarodowe podium, setki przeszkolonych kursantek i dziesięć lat prowadzenia
              salonów — w Katowicach, a od trzech lat w Warszawie.
            </p>
          </Reveal>
        </div>

        {/* liczby — kolumny rozdzielone pionową złotą linią, jak karty w „Efektach" */}
        <div className="mt-10 grid gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-0">
          {ACHIEVEMENTS.map((a, i) => (
            <Reveal key={a.label} delay={i * 80}>
              <Stat value={a.value} label={a.label} />
            </Reveal>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-4">
            <h3 className="font-display text-2xl italic text-ink sm:text-[1.75rem]">
              Kategorie mistrzowskie
            </h3>
            <p className="as-caption mt-3">
              Tytuły zdobyte na Światowych Mistrzostwach makijażu permanentnego.
            </p>
          </Reveal>

          <Reveal delay={90} className="lg:col-span-8">
            <div>
              {TITLES.map((t) => (
                <PriceRow key={t.category} name={t.category} price={t.result} />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  04 — AKADEMIA (zdjęcia ze szkoleń)                                 */
/* ================================================================== */

/* Zdjęcia grupowe są pionowe — kotwiczymy kadr u góry, żeby nie ucinać głów. */
const ACADEMY_SHOTS = [
  {
    image: ACADEMY[0],
    alt: 'Trzy kursantki z certyfikatami Super Natural Brows pod logo Babushkina Academy',
    caption: 'Ostatni dzień szkolenia — wręczenie certyfikatów',
  },
  {
    image: ACADEMY[1],
    alt: 'Kilkunastoosobowa grupa kursantek z certyfikatami Super Natural Brows przed banerem Babushkina Academy',
    caption: 'Duża grupa kursowa z certyfikatami',
  },
  {
    image: ACADEMY[6],
    alt: 'Cztery absolwentki z certyfikatami Supernatural Brows przy ścianie z logo Babushkina Academy',
    caption: 'Absolwentki kursu Super Natural Brows',
  },
  {
    image: ACADEMY[3],
    alt: 'Pięć kursantek z certyfikatami Super Natural Brows przy ścianie z logo Babushkina Academy',
    caption: 'Zdjęcie grupowe przy ścianie akademii',
  },
];

function AcademyBand() {
  return (
    <section className="as-section relative overflow-hidden bg-mocha text-cream-50">
      <GoldArc className="top-0 left-[6%] h-[760px] w-[900px]" opacity={0.25} />

      <div className="as-shell relative">
        <Reveal>
          <SectionLabel number="04" tone="light">
            Akademia
          </SectionLabel>
        </Reveal>

        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
          <Reveal className="lg:col-span-7">
            <h2 className="as-display-section as-text-balance">
              Tak wyglądają
              <br />
              nasze <span className="italic text-gold-light">szkolenia.</span>
            </h2>
          </Reveal>
          <Reveal delay={90} className="lg:col-span-5 lg:pt-1">
            <p className="as-caption-invert">
              Zdjęcia z ostatnich dni kursów w {BRAND.academy}, gdy kursantki odbierają
              certyfikaty. W tle — wnętrza, w których pracujemy i szkolimy.
            </p>
            <ArrowLink href="/szkolenia" tone="light" className="mt-8 w-fit">
              Poznaj programy szkoleń
            </ArrowLink>
          </Reveal>
        </div>

        {/* cztery kadry w jednej złotej ramce — jak trójka w „O nas" na stronie głównej */}
        <Reveal className="mt-10">
          <div className="as-photo-frame grid grid-cols-2 gap-1">
            {ACADEMY_SHOTS.map((shot) => (
              <Figure
                key={shot.caption}
                image={shot.image}
                alt={shot.alt}
                ratio="5 / 4"
                position="50% 20%"
                tone="dark"
                sizes="(min-width: 1024px) 23vw, 45vw"
              />
            ))}
          </div>
        </Reveal>

        {/* podpisy w kolumnach zgodnych z kadrami */}
        <Reveal delay={60}>
          <div className="mt-3 grid grid-cols-2 gap-x-1 gap-y-4 px-1">
            {ACADEMY_SHOTS.map((shot) => (
              <p key={shot.caption} className="as-caption-invert pr-4">
                {shot.caption}
              </p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  05 — SALON I AKADEMIA W WARSZAWIE                                  */
/* ================================================================== */

const VENUE_FACTS = [
  {
    number: '01',
    title: 'Wolnostojący budynek',
    desc: `Studio ${BRAND.academy} mieści się w wolnostojącym budynku w Warszawie — kameralnie, bez przypadkowego ruchu.`,
  },
  {
    number: '02',
    title: 'Prywatny parking',
    desc: 'Przy budynku znajduje się prywatny parking dla klientek i kursantek.',
  },
  {
    number: '03',
    title: 'Opieka specjalisty',
    desc: 'Każda osoba jest tu profesjonalnie zaopiekowana, upiększona i wysłuchana przez specjalistę.',
  },
];

function VenueBand() {
  return (
    <section className="as-section bg-cream-50">
      <div className="as-shell">
        <Reveal>
          <SectionLabel number="05">Salon i akademia</SectionLabel>
        </Reveal>

        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* tekst */}
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="as-display-section as-text-balance text-ink">
                {BRAND.academy}
                <br />
                <span className="italic text-gold-dark">{CONTACT.city}</span>
              </h2>
            </Reveal>

            <Reveal delay={80}>
              <p className="as-caption mt-6">
                {CONTACT.city} — {CONTACT.venueNote.toLowerCase()}.
              </p>
            </Reveal>

            <Reveal delay={120}>
              <div className="as-body mt-8 max-w-xl space-y-5">
                <p>
                  Akademia i salon makijażu permanentnego{' '}
                  <EmDark>„{BRAND.academy}” w Warszawie</EmDark> to prestiżowe, ładnie
                  wykończone studio w wolnostojącym budynku z prywatnym parkingiem dla klientów, w
                  którym każdy poczuje się profesjonalnie zaopiekowany, upiększony i usłyszany przez
                  specjalistę.
                </p>
                <p>
                  Stawiamy na sztukę piękna, polegającą na{' '}
                  <EmDark>naturalności, subtelności i podkreśleniu indywidualnej urody</EmDark>{' '}
                  każdej klientki. Za pomocą technik makijażu permanentnego dodajemy kobietom i
                  mężczyznom pewności siebie, radości z wyglądu w lustrze, uzupełniamy
                  niedoskonałości wynikające z natury lub przeżytych chorób.
                </p>
                <p>
                  Wykonamy również technikę pudrową lub combo dla tych, którzy chcą mieć bardziej
                  podkreślony kształt, ale nadal w naturalnej wersji. Zadbamy, aby makijaż
                  permanentny ust wyglądał o tyle subtelnie, żeby klientki zawsze czuły się z nim
                  komfortowo. Dobieramy kolory do natury, wyrównujemy koloryt, nadajemy świeżości i
                  podkreślamy kształt — bez konturów, bez przesady, bez wyraźnych odcieni.
                </p>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <blockquote className="mt-10 max-w-xl border-l border-gold/35 pl-5">
                <p className="as-pullquote text-ink">
                  „Proszę zrobić brwi, aby nikt nie zauważył, że były zrobione”
                </p>
                <footer className="as-caption mt-4 max-w-md">
                  Życzenie, które spełniamy w 100%, specjalizując się w uzyskaniu najbardziej
                  realistycznego efektu w świecie makijażu permanentnego, wykorzystując technikę
                  włosa maszynowego „SuperNatural brows”.
                </footer>
              </blockquote>
            </Reveal>
          </div>

          {/* fakty o obiekcie + działalność charytatywna */}
          <div className="lg:col-span-5">
            <Reveal delay={90}>
              <div className="flex flex-col gap-8 lg:pt-2">
                {VENUE_FACTS.map((fact) => (
                  <NumberedItem key={fact.number} number={fact.number} title={fact.title}>
                    {fact.desc}
                  </NumberedItem>
                ))}
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="as-card-col mt-10 md:pr-0">
                <p className="as-kicker">Działalność charytatywna</p>
                <p className="as-caption mt-3 max-w-[22rem]">
                  Charytatywnie opiekujemy się osobami, które straciły włoski w wyniku chorób
                  onkologicznych, oraz tworzymy brwi od nowa na najbardziej wymagającym płótnie —
                  twarzach klientów, którzy nam zaufali.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  06 — ZAPROSZENIE                                                   */
/* ================================================================== */

function ClosingBand() {
  return (
    <ClosingCta
      number="06"
      label="Zaproszenie"
      title="Zacznijmy od"
      titleAccent="konsultacji."
      lead={`Salon i akademia w Warszawie — ${CONTACT.venueNote.toLowerCase()}. Umów wizytę albo zapytaj o najbliższy termin szkolenia.`}
      primary={{ href: '/kontakt', label: 'Umów wizytę' }}
      secondary={{ href: '/szkolenia', label: 'Terminy szkoleń' }}
    />
  );
}

/* ================================================================== */

export default function About() {
  return (
    <>
      <Hero />
      <StoryBand />
      <AchievementsBand />
      <AcademyBand />
      <VenueBand />
      <ClosingBand />
    </>
  );
}
