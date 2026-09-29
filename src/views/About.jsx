'use client';

/**
 * /o-nas — „Numer 01".
 *
 * Rozkładówki: okładka (studio-11) → Droga zawodowa na espresso (jeden portret
 * studio-08 + biografia z inicjałem) → Liczby (cream-50) → Cytat (cream-100)
 * → Metoda (cream-50, typograficznie; link do /uslugi) → ClosingCta.
 * Portrety wyłącznie przez ROLES (src/lib/roles.js); zdjęcia grupowe są na
 * /szkolenia, informacje o lokalu (CONTACT.venueNote) wyłącznie na /kontakt.
 */

import React from 'react';
import Link from 'next/link';
import {
  ArrowLink,
  ClosingCta,
  Figure,
  NumberedItem,
  PageHero,
  PriceRow,
  Reveal,
  SectionLabel,
  Stat,
} from '@/components/as/Primitives';
import { ACHIEVEMENTS, BRAND, FOUNDER } from '@/lib/site';
import { ROLES } from '@/lib/roles';

/* Wyróżnienia w biografii — marka pisze lekko, więc tylko font-medium. */
const Em = ({ children }) => <strong className="font-medium text-cream-50">{children}</strong>;

/* Tytuły zdobyte na Mistrzostwach Świata — treść z dotychczasowej strony. */
const TITLES = [
  { category: 'Włos maszynowy', result: '1. i 2. miejsce' },
  { category: 'Brwi pudrowe', result: '1. miejsca' },
  { category: 'Usta', result: '1. miejsce' },
];

/* Metoda — trzy kroki, które poprzedzają każdy zabieg (treść z serwisu). */
const METHOD = [
  {
    number: '01',
    title: 'Konsultacja',
    desc: 'Zaczynamy od rozmowy — każda osoba jest tu profesjonalnie zaopiekowana i wysłuchana przez specjalistę.',
  },
  {
    number: '02',
    title: 'Architektura twarzy',
    desc: 'Kształt dobieramy do rysów twarzy, a kolory do natury — podkreślamy indywidualną urodę, bez konturów i wyraźnych odcieni.',
  },
  {
    number: '03',
    title: 'Rysunek wstępny',
    desc: 'Dopasowany do architektury twarzy. Przy sprawdzaniu wprowadzamy zmiany według Twoich uwag i życzeń — dopiero potem sięgamy po maszynkę.',
  },
];

/* ================================================================== */
/*  01 — OKŁADKA                                                       */
/* ================================================================== */

function Hero() {
  return (
    <PageHero
      number="01"
      label="O nas"
      title="Andriana"
      titleAccent="Babushkina"
      lead={`Linergistka, trenerka, prelegentka oraz sędzia w dziedzinie makijażu permanentnego na poziomie międzynarodowym. ${FOUNDER.signature}.`}
      image={ROLES.heroAbout.image}
      imagePosition={ROLES.heroAbout.position}
      imageAlt={`${FOUNDER.name} — sesja wizerunkowa założycielki ${BRAND.name}`}
      tone="cream"
      /* ≤ 343 px @375 — dłuższy pasek rozpycha kolumnę hero (PageHero bez min-w-0) i ucina H1 */
      facts={['Linergistka', 'Trenerka', 'Sędzia']}
    >
      <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
        <Link href="/szkolenia" className="as-btn-solid">
          Zobacz szkolenia
        </Link>
        <ArrowLink href="/kontakt" className="w-fit">
          Umów wizytę
        </ArrowLink>
      </div>
    </PageHero>
  );
}

/* ================================================================== */
/*  02 — DROGA ZAWODOWA (espresso)                                     */
/*  Jeden portret 4:5 po lewej (przyklejony przy przewijaniu), po      */
/*  prawej etykieta, H2 i biografia z inicjałem — jedyny taki detal    */
/*  w serwisie. Na telefonie: etykieta → H2 → portret → tekst.         */
/* ================================================================== */

function StoryBand() {
  return (
    <section className="as-section bg-espresso text-cream-50">
      <div className="as-shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-10">
          <Reveal className="lg:col-span-6 lg:col-start-7 lg:row-start-1">
            <SectionLabel number="02" tone="light">
              Droga zawodowa
            </SectionLabel>
            <h2 className="as-display-section mt-6 text-cream-100">
              Od podium
              <br />
              Mistrzostw Świata
              <br />
              do własnej techniki.
            </h2>
          </Reveal>

          <div className="lg:col-span-5 lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <Reveal className="lg:sticky lg:top-28">
              <figure className="mx-auto max-w-[26rem] lg:max-w-none">
                <Figure
                  image={ROLES.storyAbout.image}
                  alt={`${FOUNDER.name} — portret z przymkniętymi oczami, z sesji wizerunkowej marki`}
                  ratio="4 / 5"
                  position={ROLES.storyAbout.position}
                  tone="dark"
                  zoom={false}
                  sizes="(min-width: 1024px) 36vw, 90vw"
                />
                <figcaption className="as-caption-invert mt-3">{FOUNDER.signature}</figcaption>
              </figure>
            </Reveal>
          </div>

          <Reveal delay={80} className="lg:col-span-6 lg:col-start-7 lg:row-start-2">
            <div className="as-body-invert space-y-5">
              <p className="as-dropcap">
                Kilka razy wygrała podium Światowych Mistrzostw.{' '}
                <Em>2 razy w kategorii włos maszynowy (1. oraz 2. miejsce)</Em>,{' '}
                <Em>2 razy w kategorii brwi pudrowe (1. miejsca)</Em>, a także kategoria{' '}
                <Em>usta (1. miejsce)</Em>.
              </p>
              <p>
                Wykonała tysiące pigmentacji dla klientek oraz przeszkoliła setki kursantek z różnych
                technologii, za ostatni rok tylko ponad{' '}
                <Em>100 kursantek z techniki włosa maszynowego</Em>.
              </p>
              <p>
                Twórczyni szybkich, naturalnych technik makijażu permanentnego brwi oraz ust z 80%
                wygojeniem. Autorka techniki <Em>Super Natural Brows</Em> — włos maszynowy bez
                kompromisów między jakością a szybkością. Pigmentacja jej kursantek wykonywana jest
                w 2–2,5 godziny, a sama wykonuje włos maszynowy w{' '}
                <Em>1,5–2 godziny, bez bólu, bez blizn i migracji pigmentu po czasie</Em>.
              </p>
              <p>
                <Em>7 lat prowadziła salon w Katowicach</Em>, który stał się najbardziej wybieranym
                i zaufanym salonem makijażu permanentnego na Śląsku — z listą oczekiwania na zabieg
                ponad pół roku.
              </p>
              <p>
                <Em>3 lata prowadzi salon i akademię makijażu permanentnego w Warszawie</Em>,
                szkoląc osoby z różnych zakątków Polski i świata. Jest zapraszana na pokazy,
                masterclassy i kursy w innych krajach — baza kursantek za granicą liczy już ponad 50
                osób. Na branżowych wydarzeniach występuje jako{' '}
                <Em>Prime Speaker i Stage Prelegent</Em>.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  03 — LICZBY (cream-50)                                             */
/* ================================================================== */

function NumbersBand() {
  return (
    <section className="as-section bg-cream-50">
      <div className="as-shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Reveal>
              <SectionLabel number="03">Osiągnięcia</SectionLabel>
              <h2 className="as-display-section mt-6 text-ink">
                Liczby, które
                <br />
                stoją za techniką.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="as-body mt-6 max-w-[26rem]">
                Międzynarodowe podium, setki przeszkolonych kursantek i dziesięć lat prowadzenia
                salonów — w Katowicach, a od trzech lat w Warszawie.
              </p>
            </Reveal>
          </div>

          {/* kategorie mistrzowskie jako wiersze cennikowe: kategoria | leader | miejsce */}
          <Reveal delay={80} className="lg:col-span-6 lg:col-start-7 lg:pt-10">
            <h3 className="as-kicker">Kategorie mistrzowskie — Mistrzostwa Świata</h3>
            <div className="mt-5">
              {TITLES.map((t) => (
                <PriceRow key={t.category} name={t.category} price={t.result} />
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-y-10 lg:mt-16 lg:grid-cols-4">
          {ACHIEVEMENTS.map((a, i) => (
            <Reveal key={a.label} delay={i * 60}>
              <Stat value={a.value} label={a.label} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  04 — CYTAT (cream-100) — jedyny wyśrodkowany blok na stronie       */
/* ================================================================== */

function QuoteBand() {
  return (
    <section className="as-section border-y border-ink/10 bg-cream-100">
      <div className="as-shell">
        <Reveal className="mx-auto flex max-w-[40rem] flex-col items-center text-center">
          <SectionLabel number="04" line={false} className="justify-center">
            Filozofia
          </SectionLabel>
          {/* podpis w figcaption, nie w znaczniku footer — ten chowa mobilny pasek CTA */}
          <figure className="mt-8">
            <blockquote>
              <p className="as-pullquote as-text-balance text-ink">
                „Proszę zrobić brwi, aby nikt nie zauważył, że były zrobione”
              </p>
            </blockquote>
            <figcaption className="as-label mt-6 text-ink/70">
              Życzenie, które spełniamy w 100% — techniką Super Natural Brows
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  05 — METODA (cream-50) — typograficznie, bez zdjęć; link /uslugi   */
/* ================================================================== */

function MethodBand() {
  return (
    <section className="as-section bg-cream-50">
      <div className="as-shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-8">
          <Reveal className="lg:col-span-5">
            <SectionLabel number="05">Metoda</SectionLabel>
            <h2 className="as-display-section mt-6 text-ink">
              Subtelnie,
              <br />
              naturalnie,
              <br />
              bez przesady.
            </h2>
          </Reveal>
          <Reveal delay={80} className="lg:col-span-6 lg:col-start-7">
            <p className="as-body">
              Akademia i salon makijażu permanentnego „{BRAND.academy}” w Warszawie. Stawiamy na
              sztukę piękna, polegającą na naturalności, subtelności i podkreśleniu indywidualnej
              urody każdej klientki — uzupełniamy niedoskonałości wynikające z natury lub przeżytych
              chorób. Charytatywnie opiekujemy się osobami, które straciły włoski w wyniku chorób
              onkologicznych.
            </p>
            <ArrowLink href="/uslugi" className="mt-8 w-fit">
              Zobacz zabiegi
            </ArrowLink>
          </Reveal>
        </div>

        {/* trzy kroki przed każdym zabiegiem — komórki z hairline, bez zdjęć */}
        <div className="mt-12 grid gap-8 md:grid-cols-3 lg:mt-16">
          {METHOD.map((m, i) => (
            <Reveal key={m.number} delay={i * 60} className="as-cell">
              <NumberedItem number={m.number} title={m.title}>
                {m.desc}
              </NumberedItem>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  06 — ZAPROSZENIE (ClosingCta, bez zdjęć)                           */
/* ================================================================== */

function ClosingBand() {
  return (
    <ClosingCta
      number="06"
      label="Zaproszenie"
      title="Zobacz technikę"
      titleAccent="z bliska."
      lead="Salon i akademia w Warszawie. Umów wizytę albo zapytaj o najbliższy termin szkolenia."
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
      <NumbersBand />
      <QuoteBand />
      <MethodBand />
      <ClosingBand />
    </>
  );
}
