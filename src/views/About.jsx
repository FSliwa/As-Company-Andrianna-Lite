'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLink,
  FactStrip,
  Figure,
  GoldArc,
  NumberedItem,
  PageHero,
  Reveal,
  SectionLabel,
} from '@/components/as/Primitives';
import { ACHIEVEMENTS, BRAND, CONTACT, FOUNDER } from '@/lib/site';
import { ACADEMY, STUDIO } from '@/lib/media';

/* Wyróżnienia w tekście — dopasowane do jasnego / ciemnego pasa. */
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
    >
      <FactStrip
        items={['Linergistka', 'Trenerka', 'Prime Speaker', 'Sędzia międzynarodowa']}
      />
      <div className="mt-9 flex flex-wrap gap-4">
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

        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-14">
          {/* lewa kolumna — nagłówek i portrety */}
          <div className="lg:col-span-5">
            <Reveal>
              <h2 className="as-display-lg as-text-balance">
                Od podium
                <br />
                Mistrzostw Świata
                <br />
                do <span className="italic text-gold-light">własnej techniki.</span>
              </h2>
            </Reveal>

            <Reveal delay={90}>
              <div className="mt-12 grid grid-cols-2 gap-3">
                <Figure
                  image={STUDIO[0]}
                  alt={`${FOUNDER.name} — portret z sesji wizerunkowej, dłoń oparta na ramieniu`}
                  ratio="3 / 4"
                  position="50% 20%"
                  tone="dark"
                  sizes="(min-width: 1024px) 20vw, 45vw"
                />
                <Figure
                  image={STUDIO[7]}
                  alt={`${FOUNDER.name} — portret z przymkniętymi oczami, z sesji wizerunkowej marki`}
                  ratio="3 / 4"
                  position="50% 20%"
                  tone="dark"
                  className="mt-10"
                  sizes="(min-width: 1024px) 20vw, 45vw"
                />
              </div>
            </Reveal>

            <Reveal delay={150}>
              <FactStrip
                tone="light"
                className="mt-12"
                items={['Katowice', 'Warszawa', 'Szkolenia za granicą']}
              />
            </Reveal>
          </div>

          {/* prawa kolumna — biografia */}
          <div className="lg:col-span-7">
            <Reveal>
              <div className="as-body-invert space-y-5">
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

            <Reveal delay={120}>
              <Figure
                image={STUDIO[13]}
                alt={`${FOUNDER.name} — uśmiechnięty portret z sesji wizerunkowej, dłoń pod brodą`}
                ratio="16 / 10"
                position="50% 40%"
                tone="dark"
                className="mt-12"
                sizes="(min-width: 1024px) 52vw, 90vw"
              />
            </Reveal>

            <Reveal delay={170}>
              <p className="as-label mt-5 text-cream-200/45">{FOUNDER.signature}</p>
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

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
          <Reveal className="lg:col-span-7">
            <h2 className="as-display-lg as-text-balance text-ink">
              Liczby, które
              <br />
              stoją za techniką.
            </h2>
          </Reveal>
          <Reveal delay={90} className="lg:col-span-5 lg:pb-3">
            <p className="as-body max-w-md">
              Międzynarodowe podium, setki przeszkolonych kursantek i dziesięć lat prowadzenia
              salonów — w Katowicach, a od trzech lat w Warszawie.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-10 border-t border-ink/10 pt-12 sm:grid-cols-2 lg:grid-cols-4">
          {ACHIEVEMENTS.map((a, i) => (
            <Reveal key={a.label} delay={i * 80}>
              <p className="as-display-md text-gold-dark">{a.value}</p>
              <p className="as-body mt-3 max-w-[15rem] text-[0.8125rem]">{a.label}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <h3 className="as-display-sm italic text-ink">Kategorie mistrzowskie</h3>
            <p className="as-body mt-4 max-w-xs text-[0.8125rem]">
              Tytuły zdobyte na Światowych Mistrzostwach makijażu permanentnego.
            </p>
          </Reveal>

          <Reveal delay={90} className="lg:col-span-8">
            <ul>
              {TITLES.map((t) => (
                <li
                  key={t.category}
                  className="flex items-baseline gap-4 border-b border-ink/10 py-5 first:border-t"
                >
                  <span className="min-w-0 flex-1 text-base text-ink">{t.category}</span>
                  <span
                    className="hidden flex-1 translate-y-[-3px] border-b border-dotted border-ink/15 sm:block"
                    aria-hidden="true"
                  />
                  <span className="whitespace-nowrap font-display text-lg text-ink sm:text-xl">
                    {t.result}
                  </span>
                </li>
              ))}
            </ul>
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

        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-16">
          <Reveal className="lg:col-span-7">
            <h2 className="as-display-lg as-text-balance">
              Tak wyglądają
              <br />
              nasze <span className="italic text-gold-light">szkolenia.</span>
            </h2>
          </Reveal>
          <Reveal delay={90} className="lg:col-span-5 lg:pb-3">
            <p className="as-body-invert max-w-md">
              Zdjęcia pochodzą z ostatnich dni kursów w {BRAND.academy} — momentu, w którym
              kursantki odbierają certyfikaty. W tle widać wnętrza, w których pracujemy i szkolimy.
            </p>
            <ArrowLink href="/szkolenia" tone="light" className="mt-8 w-fit">
              Poznaj programy szkoleń
            </ArrowLink>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {ACADEMY_SHOTS.map((shot, i) => (
            <Reveal key={shot.caption} delay={i * 90}>
              <Figure
                image={shot.image}
                alt={shot.alt}
                ratio="3 / 4"
                position="50% 20%"
                tone="dark"
                sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
              />
              <p className="as-body-invert mt-4 text-[0.8125rem]">{shot.caption}</p>
            </Reveal>
          ))}
        </div>
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

        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* tekst */}
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="as-display-lg as-text-balance text-ink">
                {BRAND.academy}
                <br />
                <span className="italic text-gold-dark">{CONTACT.city}</span>
              </h2>
            </Reveal>

            <Reveal delay={80}>
              <FactStrip className="mt-8" items={[CONTACT.city, CONTACT.venueNote]} />
            </Reveal>

            <Reveal delay={120}>
              <div className="as-body mt-9 space-y-5">
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
              <blockquote className="mt-12 border-l border-gold/60 pl-7">
                <p className="font-display text-xl italic leading-[1.5] text-ink sm:text-2xl">
                  „Proszę zrobić brwi, aby nikt nie zauważył, że były zrobione”
                </p>
                <footer className="as-body mt-5 max-w-xl text-[0.8125rem]">
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
              <div className="flex flex-col gap-10 border-t border-ink/10 pt-10">
                {VENUE_FACTS.map((fact) => (
                  <NumberedItem key={fact.number} number={fact.number} title={fact.title}>
                    {fact.desc}
                  </NumberedItem>
                ))}
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="mt-12 border-l border-gold/60 bg-cream-100 p-8">
                <p className="as-label text-gold-dark">Działalność charytatywna</p>
                <p className="as-body mt-4">
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
    <section className="relative overflow-hidden bg-espresso-900 text-cream-50">
      <div className="as-shell py-20 lg:py-28">
        <Reveal>
          <SectionLabel number="06" tone="light">
            Zaproszenie
          </SectionLabel>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <h2 className="as-display-lg as-text-balance">
              Zacznijmy od <span className="italic text-gold-light">konsultacji.</span>
            </h2>
            <p className="as-body-invert mt-7 max-w-lg">
              Salon i akademia w Warszawie — {CONTACT.venueNote.toLowerCase()}. Umów wizytę
              albo zapytaj o najbliższy termin szkolenia.
            </p>
          </Reveal>

          <Reveal delay={90} className="flex flex-wrap gap-4 lg:col-span-5 lg:justify-end">
            <Link href="/kontakt" className="as-btn-gold">
              Umów wizytę
            </Link>
            <Link href="/szkolenia" className="as-btn-ghost-light">
              Terminy szkoleń
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 border-t border-cream-200/12 pt-8">
          <FactStrip
            tone="light"
            items={['Zabiegi PMU', 'Szkolenia', 'Pigmenty AS OPIUM', 'Maszynki AS']}
          />
        </div>
      </div>
    </section>
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
