'use client';

/**
 * Strona główna – „Numer 01".
 *
 * Każda sekcja to rozkładówka: jeden kadr, jedno duże zdanie w Bodoni, jeden
 * link. Rytm tła: krem → espresso → cream-100 → krem → mocha → krem → stopka.
 * Portrety wyłącznie przez ROLES, grupy przez GROUPS, makra przez MACROS
 * (src/lib/roles.js) – każdy plik ma w serwisie jedno miejsce.
 */

import React from 'react';
import Link from 'next/link';
import {
  ArrowLink,
  FactStrip,
  Figure,
  GoldArc,
  IndexRow,
  PriceRow,
  Reveal,
  SectionLabel,
  Stat,
} from '@/components/as/Primitives';
import {
  ACHIEVEMENTS,
  BOOKING_URL,
  BRAND,
  COURSES,
  FOUNDER,
  PILLARS,
  PRICING_PMU,
  PRODUCT_LINES,
  TRAINING_INTRO,
  TRAINING_PILLARS,
} from '@/lib/site';
import { GROUPS, ROLES } from '@/lib/roles';

/* ==================================================================
   01 – HERO

   Geometria przeniesiona 1:1 z makiety (zmierzonej na oryginale
   1320×2868 px). Wszystkie wartości to ułamki szerokości kadru treści
   (W) przeliczone na procenty kontenera o proporcji W : 0.682W.
   ================================================================== */

const HERO_RATIO = 1 / 0.682; // szerokość : wysokość kadru hero
const HERO_PHOTO = ROLES.heroHome.image;

/* pozycje w % kontenera – x względem szerokości, y względem wysokości */
const G = {
  photo: { left: '33.7%', right: '33.5%', top: '12.6%', bottom: '19.0%' },
  /* słowa 4 pp wyżej niż w pierwszej wersji – złota linia (50,6%) biegnie
     pod literami, a nie przez nie (audyt AD-1) */
  beauty: { left: '0%', top: '32.3%' },
  with: { left: '71.4%', top: '33.0%' },
  precision: { left: '71.4%', top: '38.6%' },
  rule: { top: '50.6%' },
  lead: { left: '0%', top: '54.6%' },
  colophon: { left: '0%', top: '72.0%', width: '28%' },
  facts: { top: '89.6%' },
};

/* Typografia w cqw (1% szerokości kadru hero) – kompozycja skaluje się
   w całości i zawsze mieści się w pierwszym ekranie. */
const TYPE = {
  beauty: 'clamp(2.5rem, 12.2cqw, 14rem)',
  precision: 'clamp(1.5rem, 7.46cqw, 8.6rem)',
  with: 'clamp(1rem, 4.72cqw, 5.4rem)',
};

/* 6rem = wysokość nagłówka na lg */
const HERO_BOX = {
  width: `min(100%, calc((100svh - 6rem) * ${HERO_RATIO}))`,
  aspectRatio: HERO_RATIO,
  containerType: 'inline-size',
  marginInline: 'auto',
};

/* Fakty z briefu i ACHIEVEMENTS (src/lib/site.js), spójne z /o-nas („Opis”: „wykonała tysiące
   pigmentacji”, „przeszkoliła setki kursantek”). D7: zamiast „100+ kursantek w roku” (brzmiało
   jak średnia roczna – BIO-06) i wyliczonej sumy „10 lat salonów” (BIO-03) – sformułowania
   briefu; 100+ z włosa w ostatnim roku i lata salonów (7 + 3) z pełnym opisem są
   w statystykach sekcji 02. Długość paska jak dotąd (≈ 710 px): mieści się w jednej linii
   także przy niskim oknie laptopa (kadr hero zależy od wysokości ekranu). */
const HERO_FACTS = [
  `${ACHIEVEMENTS[0].value} podium Mistrzostw Świata`,
  'Setki kursantek',
  'Tysiące pigmentacji',
  BRAND.city,
];

/* D7: cztery role z briefu po polsku („Linergista, Trener, Prelegent oraz Sędzia”) zamiast
   angielskiego FOUNDER.role bez źródła (BIO-12). Pełne brzmienie (FOUNDER.rolePl) jest w alt
   portretu i na /o-nas; w kolofonie skrót mieszczący się w dwóch liniach jak dotąd (przy
   1280 × 600 trzecia linia dotykała paska faktów – pomiar). */
const ROLE_SHORT = 'Linergistka, trenerka, prelegentka i\u00a0sędzia';

/* Wejście tytułu: trzy wyrazy, 0 / 150 / 300 ms (wyłączone przy reduced-motion) */
const riseIn = (delay) => ({
  animation: `as-rise 600ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms both`,
});

function Hero() {
  const lead = (
    <>
      <p className="as-caption max-w-[17rem] leading-[1.9]">{BRAND.claim}</p>
      {/* D9: bez skrótu „AS” (makieta: „Discover AS”) – /o-nas opowiada o Andrianie i salonie */}
      <ArrowLink href="/o-nas" className="mt-7 w-fit">
        Poznaj nas
      </ArrowLink>
    </>
  );

  /* Kolofon zamiast miniatur makr – makra z telefonu nie wytrzymują hero. */
  const colophon = (
    <div className="border-t border-gold/40 pt-4">
      <p className="as-label text-ink">{FOUNDER.name}</p>
      <p className="as-label mt-2 text-ink/65">{ROLE_SHORT}</p>
    </div>
  );

  const photo = (
    <div className="relative h-full w-full">
      {/* linie konstrukcyjne wychodzące poza kadr (makieta) */}
      <span aria-hidden="true" className="absolute -top-[5.5%] bottom-[-3.5%] left-0 w-px bg-gold/45" />
      <span aria-hidden="true" className="absolute -top-[5.5%] bottom-[-3.5%] right-0 w-px bg-gold/45" />
      <span aria-hidden="true" className="absolute -left-[11%] -right-[11%] top-[-4%] h-px bg-gold/45" />
      <span aria-hidden="true" className="absolute -left-[11%] -right-[11%] bottom-0 h-px bg-gold/45" />

      <div className="as-media h-full w-full border border-gold/50">
        <picture>
          <source
            type="image/webp"
            srcSet={Object.entries(HERO_PHOTO.webp).map(([w, src]) => `${src} ${w}w`).join(', ')}
            sizes="(min-width: 1024px) 27vw, (min-width: 768px) 43vw, 90vw"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_PHOTO.src}
            /* bez „założycielki AS Company” – brak źródła (BIO-18, SRC-20); brief: prowadzi salon i akademię */
            alt={`${FOUNDER.name} – prowadzi salon i akademię ${BRAND.academy} w Warszawie`}
            width={HERO_PHOTO.w}
            height={HERO_PHOTO.h}
            fetchPriority="high"
            decoding="sync"
            sizes="(min-width: 1024px) 27vw, (min-width: 768px) 43vw, 90vw"
            style={{ objectPosition: ROLES.heroHome.position }}
          />
        </picture>
      </div>
    </div>
  );

  return (
    <section className="relative -mt-20 overflow-hidden bg-cream-50 lg:-mt-24">
      {/* jeden h1 w DOM – wersje wizualne (mobile / desktop) są aria-hidden */}
      <h1 className="sr-only">
        {BRAND.tagline} {BRAND.full} – makijaż permanentny i szkolenia PMU w Warszawie
      </h1>

      {/* ================= UKŁAD MOBILNY / TABLET ================= */}
      {/* telefon: jedna kolumna; tablet (md): tytuł i opis obok portretu */}
      <div className="as-shell pb-14 pt-28 lg:hidden">
        <div className="md:grid md:grid-cols-12 md:items-center md:gap-8">
          <div className="md:col-span-6">
            <p aria-hidden="true" className="as-display-xl text-ink md:text-[4.5rem]">
              <span className="block">Beauty</span>
              <span className="block font-normal italic leading-[1.05]">with</span>
              <span className="block">precision.</span>
            </p>

            <div className="mt-8">{lead}</div>
            <div className="mt-10 hidden max-w-[20rem] md:block">{colophon}</div>
          </div>

          <div className="relative mx-auto mt-10 w-full max-w-[380px] md:col-span-6 md:mt-0 md:max-w-none">
            <div style={{ aspectRatio: '4 / 5', maxHeight: '60svh', marginInline: 'auto' }}>{photo}</div>
          </div>
        </div>

        <div className="mt-12 max-w-[20rem] md:hidden">{colophon}</div>

        <div className="mt-10 border-t border-ink/10 pt-6">
          <FactStrip items={HERO_FACTS} />
        </div>
      </div>

      {/* ================= UKŁAD DESKTOPOWY (wg makiety) ================= */}
      <div className="as-shell hidden lg:block">
        <div className="relative" style={HERO_BOX}>
          <div
            className="absolute"
            style={{ left: G.photo.left, right: G.photo.right, top: G.photo.top, bottom: G.photo.bottom }}
          >
            {photo}
          </div>

          <span aria-hidden="true" className="absolute left-0 h-px bg-gold/40" style={{ top: G.rule.top, width: '31%' }} />
          <span aria-hidden="true" className="absolute h-px bg-gold/40" style={{ top: G.rule.top, left: '66.5%', width: '4.5%' }} />

          <p aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 text-ink">
            <span
              className="as-display absolute block whitespace-nowrap leading-none motion-reduce:!animate-none"
              style={{ left: G.beauty.left, top: G.beauty.top, fontSize: TYPE.beauty, ...riseIn(0) }}
            >
              Beauty
            </span>
            <span
              className="as-display absolute block whitespace-nowrap font-normal italic leading-none motion-reduce:!animate-none"
              style={{ left: G.with.left, top: G.with.top, fontSize: TYPE.with, ...riseIn(150) }}
            >
              with
            </span>
            <span
              className="as-display absolute block whitespace-nowrap leading-none motion-reduce:!animate-none"
              style={{ left: G.precision.left, top: G.precision.top, fontSize: TYPE.precision, ...riseIn(300) }}
            >
              precision.
            </span>
          </p>

          <div className="absolute z-20" style={{ left: G.lead.left, top: G.lead.top }}>
            {lead}
          </div>

          <div className="absolute z-20" style={{ left: G.colophon.left, top: G.colophon.top, width: G.colophon.width }}>
            {colophon}
          </div>

          <div className="absolute inset-x-0 z-20" style={{ top: G.facts.top }}>
            <FactStrip items={HERO_FACTS} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  02 – O NAS (espresso)                                              */
/* ================================================================== */

function AboutBand() {
  return (
    <section id="o-nas" className="as-section relative overflow-hidden bg-espresso text-cream-50">
      <GoldArc className="-top-32 left-[-6%] h-[720px] w-[900px]" opacity={0.28} />

      <div className="as-shell relative">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          {/* kolumna 1 – zdanie */}
          <div className="md:col-span-6 lg:col-span-4">
            <Reveal>
              <SectionLabel number="02" tone="light">
                O nas
              </SectionLabel>
              <h2 className="as-display-section as-text-balance mt-6 text-cream-100">
                Więcej niż
                <br />
                makijaż
                <br />
                permanentny.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="as-body-invert mt-6">
                Tworzymy kompleksowy ekosystem dla profesjonalistów PMU – łącząc najwyższej jakości
                produkty, zaawansowaną edukację i realną praktykę.
              </p>
              <ArrowLink href="/o-nas" tone="light" className="mt-8 w-fit">
                Poznaj nasze podejście
              </ArrowLink>
            </Reveal>
          </div>

          {/* kolumna 2 – jeden portret, inna poza niż w hero */}
          <Reveal delay={60} className="md:col-span-6 lg:col-span-4">
            <div className="mx-auto max-w-[16rem] sm:max-w-[20rem] md:max-w-none">
              <div className="as-photo-frame">
                <Figure
                  image={ROLES.aboutHome.image}
                  alt={`${FOUNDER.name} – ${FOUNDER.rolePl}`}
                  ratio="3 / 4"
                  position={ROLES.aboutHome.position}
                  tone="dark"
                  sizes="(min-width: 1024px) 28vw, 320px"
                />
              </div>
              <p className="mt-4 text-right font-display text-base italic text-cream-100/85">
                Narzędzia. Wiedza. Techniki. Realne efekty.
              </p>
            </div>
          </Reveal>

          {/* kolumna 3 – 01 / 02 / 03 jako komórki (tablet: trzy obok siebie pod spodem) */}
          <div className="md:col-span-12 md:grid md:grid-cols-3 md:gap-6 lg:col-span-4 lg:block">
            {PILLARS.map((p, i) => (
              <Reveal key={p.number} delay={i * 80}>
                <Link href={p.href} className="as-cell-invert group block pb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="as-num text-lg sm:text-xl">{p.number}</span>
                    <h3 className="as-numbered-title text-cream-100">{p.title}</h3>
                    <span
                      aria-hidden="true"
                      className="ml-auto text-gold-light transition-transform duration-300 group-hover:translate-x-1.5"
                    >
                      &#8594;
                    </span>
                  </div>
                  <p className="as-numbered-desc text-cream-200/85">{p.desc}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>

        {/* liczby – najmocniejszy dowód marki, w pierwszych dwóch ekranach */}
        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-cream-200/15 pt-10 md:grid-cols-4 lg:mt-16">
          {ACHIEVEMENTS.map((a, i) => (
            <Reveal key={a.label} delay={i * 60}>
              <Stat value={a.value} label={a.label} tone="light" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  03 – PRODUKTY (cream-100)                                          */
/* ================================================================== */

function ProductsBand() {
  return (
    <section className="as-section bg-cream-100">
      <div className="as-shell">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <Reveal className="md:col-span-5 lg:col-span-4">
            <SectionLabel number="03">Produkty</SectionLabel>
            <h2 className="as-display-section as-text-balance mt-6 text-ink">
              Wszystko, co stoi
              <br />
              za efektem.
            </h2>
            {/* INNE-13: zdanie z makiety (sekcja „Produkty”) zamiast „dokumentacji tworzonej przez
                praktyków” i „sami używamy w gabinecie” – bez źródła */}
            <p className="as-body mt-6">
              Profesjonalne produkty stworzone przez praktyków dla praktyków. Łączymy najwyższą
              jakość, innowacyjne technologie i realne doświadczenie, aby wspierać Cię na każdym
              etapie pracy.
            </p>
          </Reveal>

          <div className="md:col-span-7 md:col-start-6">
            {PRODUCT_LINES.map((line, i) => (
              <Reveal key={line.id} delay={i * 80}>
                <IndexRow
                  number={line.number}
                  title={line.title}
                  desc={line.desc}
                  href={line.href}
                  cta={line.cta}
                  className={i === PRODUCT_LINES.length - 1 ? 'border-b' : undefined}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  04 – ZABIEGI I CENNIK (cream-50)                                   */
/* ================================================================== */

function TreatmentsBand() {
  const portrait = ROLES.treatmentsHome;
  return (
    <section className="as-section bg-cream-50">
      <div className="as-shell">
        {/* telefon: nagłówek → portret → cennik; od lg: portret po lewej na całą wysokość */}
        <div className="grid gap-10 md:grid-cols-12 md:gap-x-8 md:gap-y-10">
          <Reveal className="md:col-span-7 md:col-start-6 md:row-start-1 lg:col-span-6 lg:col-start-7">
            <SectionLabel number="04">Zabiegi</SectionLabel>
            <h2 className="as-display-section as-text-balance mt-6 text-ink">
              Naturalny efekt,
              <br />
              precyzyjna technika.
            </h2>
            {/* Z15/BIO-14: „zabiegi zawierają konsultację” – bez źródła; brief (FAQ) potwierdza
                rysunek wstępny dopasowany do architektury twarzy i poprawki według uwag klientki */}
            <p className="as-body mt-6">
              Przed każdą pigmentacją robimy rysunek wstępny dopasowany do architektury Twojej
              twarzy i wprowadzamy w nim zmiany według Twoich uwag. Kolor dobieramy do karnacji.
            </p>
          </Reveal>

          <Reveal delay={60} className="md:col-span-5 md:col-start-1 md:row-span-2 md:row-start-1 md:self-start">
            <figure className="mx-auto max-w-[16rem] sm:max-w-[22rem] md:max-w-none">
              <Figure
                image={portrait.image}
                alt={`${FOUNDER.name} – ${FOUNDER.signature}`}
                ratio="4 / 5"
                position={portrait.position}
                framed
                sizes="(min-width: 1024px) 37vw, (min-width: 640px) 384px, 320px"
              />
              <figcaption className="as-caption mt-6 lg:mt-8">
                {FOUNDER.name} – {FOUNDER.signature.charAt(0).toLowerCase() + FOUNDER.signature.slice(1)}
              </figcaption>
            </figure>
          </Reveal>

          <div className="md:col-span-7 md:col-start-6 md:row-start-2 lg:col-span-6 lg:col-start-7">
            <Reveal delay={80}>
              {/* D2: nazwy technik wg briefu (Perfect Brows, Perfect Eyes) – pod nazwą technika
                  z cennika (PRICING_PMU.items[].technique), żeby nowe nazwy były czytelne */}
              {PRICING_PMU.items.map((item) => (
                <PriceRow key={item.id || item.name} name={item.name} note={item.note || item.technique} price={item.price} />
              ))}
            </Reveal>
            <p className="as-caption mt-6 max-w-[36rem]">{PRICING_PMU.footnote}</p>
            <ArrowLink href="/uslugi#cennik" className="mt-8 w-fit">
              Zobacz cennik
            </ArrowLink>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  05 – SZKOLENIA (mocha)                                             */
/* ================================================================== */

/* D4: na stronie głównej maks. 3 kursy w cenniku (COURSES[].home), reszta linkiem. */
const HOME_COURSES = COURSES.filter((c) => c.home);
const OTHER_COURSES = COURSES.filter((c) => !c.home);
const lowerFirst = (t) => t.charAt(0).toLowerCase() + t.slice(1);

function TrainingBand() {
  return (
    <section className="as-section relative overflow-hidden bg-mocha text-cream-50">
      <div className="as-shell relative">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <Reveal>
              <SectionLabel number="05" tone="light">
                Szkolenia
              </SectionLabel>
              <h2 className="as-display-section mt-6 text-cream-100">
                Szkolenia
                <br />
                oparte na
                <br />
                realnej praktyce
              </h2>
            </Reveal>
            <Reveal delay={80}>
              {/* Tekst makiety; D9: szkolenia pod nazwą akademii (brief, wszystkie plakaty kursów:
                  „Babushkina Academy”) zamiast „AS”. D4: zdanie o poziomach z briefu (TRAINING_INTRO) */}
              <p className="as-body-invert mt-6 max-w-[26rem]">
                Autorskie szkolenia {BRAND.academy} to połączenie zaawansowanej techniki,
                wieloletniego doświadczenia i realnej praktyki. {TRAINING_INTRO.levels} Uczysz się od
                ekspertów i dostajesz wsparcie na każdym etapie swojej drogi.
              </p>
              <ArrowLink href="/szkolenia" tone="light" className="mt-8 w-fit">
                Poznaj szkolenia
              </ArrowLink>
            </Reveal>
          </div>

          {/* grupa z telefonu mniejsza niż portrety sesji; kolumna 6/12 jak kadr w sekcji 06 */}
          <div className="md:col-span-7 lg:col-span-6 lg:col-start-7">
            <Reveal>
              <div className="as-photo-frame">
                <Figure
                  image={GROUPS.trainingHome.image}
                  alt={`Absolwentki szkolenia Super Natural Brows z certyfikatami – ${BRAND.academy}`}
                  ratio="3 / 2"
                  position={GROUPS.trainingHome.position}
                  tone="dark"
                  zoom={false}
                  sizes="(min-width: 1024px) 44vw, (min-width: 768px) 55vw, 92vw"
                />
              </div>
            </Reveal>

            <Reveal delay={80} className="mt-8">
              {/* D4: maks. 3 pozycje (COURSES[].home); pełna nazwa z briefu odróżnia kurs dla
                  linergistek od kursu od podstaw (osoba początkująca nie weźmie tańszego za start);
                  przy kursach z requiresContact – informacja z briefu o wstępnym kontakcie */}
              {HOME_COURSES.map((c) => (
                <PriceRow
                  key={c.id}
                  name={c.fullTitle || c.title}
                  note={[c.format, c.requiresContact && 'rezerwacja po wstępnym kontakcie'].filter(Boolean).join(' · ')}
                  price={[c.price, c.priceNote].filter(Boolean).join(' ')}
                  tone="light"
                />
              ))}
              {/* D4: pozostałe kursy z briefu – linkiem do ich programów na /szkolenia */}
              {OTHER_COURSES.length > 0 && (
                <p className="as-caption-invert mt-6 max-w-[36rem]">
                  Pozostałe kursy:{' '}
                  {OTHER_COURSES.map((c, i) => (
                    <React.Fragment key={c.id}>
                      {i > 0 && (i === OTHER_COURSES.length - 1 ? ' i ' : ', ')}
                      <Link
                        href={`/szkolenia#program-${c.id}`}
                        className="text-cream-50 underline decoration-cream-200/40 underline-offset-4 transition-colors hover:decoration-cream-50"
                      >
                        {lowerFirst(c.fullTitle || c.title)}
                      </Link>
                      {c.price && ` (${c.price})`}
                    </React.Fragment>
                  ))}
                  .
                </p>
              )}
            </Reveal>
          </div>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3 lg:mt-16">
          {TRAINING_PILLARS.map((p, i) => (
            <Reveal key={p.number} delay={i * 80}>
              <div className="flex items-baseline gap-3">
                <span className="as-num text-lg text-gold-light sm:text-xl">{p.number}</span>
                <h3 className="as-numbered-title text-cream-100">{p.title}</h3>
              </div>
              <p className="as-numbered-desc text-cream-200/90">{p.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  06 – ZAPROSZENIE (cream-50)                                        */
/* ================================================================== */

function InvitationBand() {
  return (
    <section data-sticky-hide className="as-section bg-cream-50">
      <div className="as-shell">
        <div className="grid gap-12 md:grid-cols-12 md:items-center md:gap-8">
          <Reveal className="md:col-span-5">
            <SectionLabel number="06">Kontakt</SectionLabel>
            {/* INNE-11/BIO-14: konsultacja jako „pierwszy krok każdego zabiegu” – bez źródła */}
            <h2 className="as-display-section as-text-balance mt-6 text-ink">
              Zacznijmy od <span className="italic text-gold-dark">rozmowy.</span>
            </h2>
            <p className="as-body mt-6">
              Salon i akademia w Warszawie. Umów wizytę albo zapytaj o najbliższy termin szkolenia.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
              <Link href={BOOKING_URL} className="as-btn-solid">
                Umów wizytę
              </Link>
              <ArrowLink href="/szkolenia" className="w-fit">
                Zapytaj o termin szkolenia
              </ArrowLink>
            </div>
          </Reveal>

          <Reveal delay={90} className="md:col-span-7 lg:col-span-6 lg:col-start-7">
            <Figure
              image={ROLES.closingHome.image}
              alt={`${FOUNDER.name} – portret z sesji wizerunkowej`}
              ratio="3 / 2"
              position={ROLES.closingHome.position}
              framed
              sizes="(min-width: 1024px) 46vw, 92vw"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */

export default function Home() {
  return (
    <>
      <Hero />
      <AboutBand />
      <ProductsBand />
      <TreatmentsBand />
      <TrainingBand />
      <InvitationBand />
    </>
  );
}
