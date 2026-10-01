'use client';

/**
 * Strona główna – „Numer 01".
 *
 * Każda sekcja to rozkładówka: jeden kadr, jedno duże zdanie w Bodoni, jeden
 * link. Rytm tła (Lite, tony z makiety): cream-50 → cream-90 → cream-100 → cream-50
 * → cream-75 → cream-50 → stopka cream-100. Bez ciemnych pasów.
 * Portrety wyłącznie przez ROLES, grupy przez GROUPS, makra przez MACROS
 * (src/lib/roles.js) – każdy plik ma w serwisie jedno miejsce.
 */

import React from 'react';
import Link from 'next/link';
import {
  ArrowLink,
  FactStrip,
  Figure,
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
import { nbspShort } from '@/lib/utils';

/* ==================================================================
   01 – HERO

   Prośba klientki (30.09.2026): „zdjęcie na tło, napisy na nim, aby nie wyglądało
   jak w ramce”. Portret z sesji jest więc tłem, bez ramki i linii konstrukcyjnych:

   · telefon w pionie – zdjęcie wypełnia pierwszy ekran (także pod półprzezroczystym
     nagłówkiem), hasło, claim i przyciski leżą na dole kadru, na jasnej tkaninie,
     na kremowym wygaszeniu od dołu; kolofon i fakty – pod zdjęciem, w tym samym kremie,
     w który przechodzi wygaszenie (bez szwu);
   · od tabletu (md) i telefon w poziomie (short) – zdjęcie spadem od prawej krawędzi
     przez całą wysokość, jego lewa część przechodzi w krem tła, a tekst stoi
     na tym przejściu (hasło wchodzi na zdjęcie).

   Portret: studio-05 (tiul) – jasne tło sesji i biała tkanina na dole kadru dają
   miejsce na ciemny tekst. Ruch przy wejściu jak dotąd: słowa wjeżdżają kolejno
   (as-enter-rise), portret „oddycha” 1,06 → 1 (as-enter-breathe); tylko transform,
   więc zdjęcie (LCP) i tekst są widoczne od pierwszej klatki; prefers-reduced-motion
   wyłącza ruch w CSS.
   ================================================================== */

const HERO_PHOTO = ROLES.heroHome.image;

/* Fakty z briefu i ACHIEVEMENTS (src/lib/site.js), spójne z /o-nas („Opis”: „wykonała tysiące
   pigmentacji”, „przeszkoliła setki kursantek”). D7: zamiast „100+ kursantek w roku” (brzmiało
   jak średnia roczna – BIO-06) i wyliczonej sumy „10 lat salonów” (BIO-03) – sformułowania
   briefu; 100+ z włosa w ostatnim roku i lata salonów (7 + 3) z pełnym opisem są
   w statystykach sekcji 02. */
const HERO_FACTS = [
  `${ACHIEVEMENTS[0].value} podium Mistrzostw Świata`,
  'Setki kursantek',
  'Tysiące pigmentacji',
  BRAND.city,
];

/* D7: cztery role z briefu po polsku („Linergista, Trener, Prelegent oraz Sędzia”) zamiast
   angielskiego FOUNDER.role bez źródła (BIO-12). Pełne brzmienie (FOUNDER.rolePl) jest w alt
   portretu i na /o-nas; w kolofonie skrót mieszczący się w dwóch liniach. */
const ROLE_SHORT = 'Linergistka, trenerka, prelegentka i sędzia';

/* Opóźnienie wejścia (klasy .as-enter-* mają animation-fill-mode: both). */
const delay = (ms) => ({ animationDelay: `${ms}ms` });

/* Rozmiary hasła. Telefon: od szerokości ekranu. Od md: od szerokości, ale nie więcej,
   niż pozwala wysokość (niski laptop, telefon w poziomie) – cały tekst mieści się
   w pierwszym ekranie; poniżej 640 px wysokości (wariant tall) odstępy hero są ciaśniejsze,
   żeby fakty i „Umów wizytę” zostały w pierwszym ekranie.
   „with precision.” : „Beauty” jak w makiecie (7,46 / 12,2 ≈ 0,61). */
const WORDS = {
  phone: { beauty: 'clamp(4rem, 21vw, 7rem)', line2: 'clamp(2.5rem, 12.8vw, 4.25rem)' },
  split: {
    beauty: 'clamp(3.5rem, min(10.2vw, 16svh), 11.5rem)',
    line2: 'clamp(2.125rem, min(6.2vw, 9.8svh), 7rem)',
  },
};

/* Portret – ten sam plik i te same sizes w obu układach (przeglądarka pobiera jeden
   wariant). Bez lazy i bez opacity: to element LCP. */
function HeroPicture({ position }) {
  const sizes = '(min-width: 1024px) 60vw, (min-width: 768px) 56vw, 100vw';
  return (
    <picture>
      <source
        type="image/webp"
        srcSet={Object.entries(HERO_PHOTO.webp).map(([w, src]) => `${src} ${w}w`).join(', ')}
        sizes={sizes}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HERO_PHOTO.src}
        alt={`${FOUNDER.name} – prowadzi salon i akademię ${BRAND.academy} w Warszawie`}
        width={HERO_PHOTO.w}
        height={HERO_PHOTO.h}
        loading="eager"
        fetchPriority="high"
        decoding="sync"
        sizes={sizes}
        className="as-enter-breathe absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: position }}
      />
    </picture>
  );
}

/* Hasło „Beauty / with precision.” – wersja wizualna h1 (aria-hidden, h1 jest w sr-only). */
function HeroWords({ size }) {
  const s = WORDS[size];
  return (
    <p aria-hidden="true" className="text-ink">
      <span data-hero-word className="as-display as-enter-rise block whitespace-nowrap leading-[0.9]" style={{ fontSize: s.beauty, ...delay(0) }}>
        Beauty
      </span>
      <span data-hero-word className="as-enter-rise mt-[0.12em] block whitespace-nowrap" style={{ fontSize: s.line2, ...delay(150) }}>
        <span className="as-display italic">with</span> <span className="as-display">precision.</span>
      </span>
    </p>
  );
}

function Hero() {
  const colophon = (
    <div className="border-t border-gold/40 pt-4">
      <p className="as-label text-ink">{FOUNDER.name}</p>
      <p className="as-label mt-2 text-ink/65">{ROLE_SHORT}</p>
    </div>
  );

  /* nbspShort: jednoliterowe „i” / „w” nie zostają na końcu wiersza.
     Claim na zdjęciu: ink/80 zamiast mocha (na wygaszeniu kontrast ≥ 7:1). */
  const claim = <p className="max-w-[19rem] text-[0.875rem] leading-[1.75] text-ink/80">{nbspShort(BRAND.claim)}</p>;

  /* H1: pierwszy przycisk w pierwszym ekranie (pigułka w nagłówku jest ukryta < 640 px);
     od lg „Umów wizytę” jest w nagłówku, więc w hero zostaje link jak w makiecie. */
  const actions = (
    <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-5 short:mt-4 lg:tall:mt-8">
      <Link href={BOOKING_URL} className="as-btn-solid lg:hidden">
        Umów wizytę
      </Link>
      {/* D9: bez skrótu „AS” (makieta: „Discover AS”) – /o-nas opowiada o Andrianie i salonie. */}
      <ArrowLink href="/o-nas" className="w-fit">
        Poznaj nas
      </ArrowLink>
    </div>
  );

  return (
    /* cofnięcie o pełną wysokość nagłówka razem z linią 1 px (--as-header-h, src/index.css) –
       przy -mt-20 / -24 / -16 nad zdjęciem zostawała jasna kreska 1 px */
    <section className="relative mt-[calc(var(--as-header-h)*-1)] overflow-hidden bg-cream-50">
      {/* jeden h1 w DOM – wersje wizualne (telefon / od md) są aria-hidden */}
      <h1 className="sr-only">
        {BRAND.tagline} {BRAND.full} – makijaż permanentny i szkolenia PMU w Warszawie
      </h1>

      {/* ================= TELEFON W PIONIE: zdjęcie na cały ekran ================= */}
      <div className="md:hidden short:hidden">
        <div className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
          <HeroPicture position="52% 0%" />
          {/* kremowe wygaszenie od dołu: pod tekstem krem, w połowie kadru już przezroczyste
              (twarz bez zmian); górny pas – pod półprzezroczystym nagłówkiem */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-cream-50 from-[6%] via-cream-50/80 via-[30%] to-transparent to-[58%]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-cream-50/90 via-cream-50/50 to-transparent"
          />
          {/* odstęp: połowa ekranu, ale na niskich telefonach (Safari z paskami ≈ 550 px)
              mniej – treść (≈ 300 px) + pb-8 = 21rem, więc „Umów wizytę” zostaje w pierwszym ekranie */}
          <div data-hero-lead className="as-shell relative z-10 pb-8 pt-[min(52svh,calc(100svh-21rem))]">
            <HeroWords size="phone" />
            <div className="mt-5">{claim}</div>
            {actions}
          </div>
        </div>

        <div className="as-shell pb-14 pt-4">
          <div data-hero-colophon className="max-w-[20rem]">
            {colophon}
          </div>
          <div className="mt-8 border-t border-ink/10 pt-6">
            <FactStrip items={HERO_FACTS} />
          </div>
        </div>
      </div>

      {/* ================= OD TABLETU I TELEFON W POZIOMIE: zdjęcie spadem od prawej ================= */}
      <div className="relative hidden min-h-[100svh] md:flex short:flex">
        {/* overflow-hidden: wejście as-breathe skaluje zdjęcie 1,06 → 1 – bez przycięcia
            wystawało poza wygaszenia na krem obok */}
        <div className="absolute inset-y-0 right-0 w-[56%] overflow-hidden lg:w-[60%]">
          <HeroPicture position="50% 8%" />
          {/* lewa część zdjęcia przechodzi w krem tła – na tym przejściu stoi hasło */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-cream-50 via-cream-50/55 via-[24%] to-transparent to-[52%]"
          />
          {/* góra kadru pod przezroczystym nagłówkiem (nawigacja czytelna na zdjęciu) */}
          {/* 80% kremu + nawigacja w pełnym ink (Layout, overPhoto): „O nas” i „Kontakt” na włosach ≥ 5,4:1 */}
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cream-50/80 to-transparent" />
          {/* dół kadru łagodnie w krem – fakty i kolofon czytelne także na zdjęciu */}
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-cream-50/70 to-transparent" />
        </div>

        <div className="as-shell relative z-10 flex w-full flex-col justify-center pb-10 pt-28 short:pb-6 short:pt-20 lg:tall:pt-32">
          <div data-hero-lead className="max-w-[46rem]">
            <HeroWords size="split" />
            <div className="mt-6 short:mt-4 lg:tall:mt-8">{claim}</div>
            {actions}
          </div>
          {/* telefon w poziomie: kolofon i fakty pod pierwszym ekranem (sekcja się wydłuża) */}
          <div className="mt-10 grid max-w-[48rem] gap-6 short:mt-6 lg:mt-8 lg:tall:mt-12">
            <div data-hero-colophon className="max-w-[20rem]">
              {colophon}
            </div>
            <FactStrip items={HERO_FACTS} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  02 – O NAS (cream-90 – ton pasa „O nas” z makiety)                */
/* ================================================================== */

/* Bez złotego łuku: przecinał etykietę „02 / O nas” i H2 (audyt AD4 / H12), a w tym pasie
   nie ma dla niego wolnego pola (kolumny tekstu, portret, filary i liczby).
   Złącze z sekcją 03 (tekst – tekst): od lg 64 + 64 px zamiast 80 + 80. */
function AboutBand() {
  return (
    <section id="o-nas" className="as-section as-section-tight-bottom relative overflow-hidden bg-cream-90 text-ink">
      <div className="as-shell relative">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          {/* kolumna 1 – zdanie */}
          <div className="md:col-span-6 lg:col-span-4">
            <Reveal>
              <SectionLabel number="02">
                O nas
              </SectionLabel>
              <h2 className="as-display-section as-text-balance mt-6 text-ink">
                Więcej niż
                <br />
                makijaż
                <br />
                permanentny.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="as-body mt-6">
                Tworzymy kompleksowy ekosystem dla profesjonalistów PMU – łącząc najwyższej jakości
                produkty, zaawansowaną edukację i realną praktykę.
              </p>
              <ArrowLink href="/o-nas" className="mt-8 w-fit">
                Poznaj nasze podejście
              </ArrowLink>
            </Reveal>
          </div>

          {/* kolumna 2 – jeden portret, inna poza niż w hero. Telefon (H2): portret po filarach
              (order-last), żeby dwa portrety założycielki nie stały ekran po ekranie; od md
              w siatce obok zdania. Telefon w poziomie: portret nie wyższy niż 80% ekranu (H8) –
              short:sm: / short:md:, bo w CSS warianty sm/md stoją po short i by go nadpisały. */}
          <Reveal delay={60} className="order-last md:order-none md:col-span-6 lg:col-span-4">
            <div className="mx-auto max-w-[16rem] sm:max-w-[20rem] md:max-w-none short:max-w-[calc(80svh*3/4)] short:sm:max-w-[calc(80svh*3/4)] short:md:max-w-[calc(80svh*3/4)]">
              <div className="as-photo-frame">
                <Figure
                  image={ROLES.aboutHome.image}
                  alt={`${FOUNDER.name} – ${FOUNDER.rolePl}`}
                  ratio="3 / 4"
                  position={ROLES.aboutHome.position}
                  sizes="(min-width: 1024px) 28vw, 320px"
                />
              </div>
              {/* H5: Jost italic zamiast Bodoni 16 px (Bodoni nie schodzi poniżej 22 px) */}
              <p className="as-quote as-text-balance mt-4 text-right text-ink/75">
                Narzędzia. Wiedza. Techniki. Realne efekty.
              </p>
            </div>
          </Reveal>

          {/* kolumna 3 – 01 / 02 / 03 jako komórki (tablet: trzy obok siebie pod spodem).
              Telefon (H2): same linki „01 Produkty →” – opisy powtarzają sekcje 03–05. */}
          <div className="md:col-span-12 md:grid md:grid-cols-3 md:gap-6 lg:col-span-4 lg:block">
            {PILLARS.map((p, i) => (
              <Reveal key={p.number} delay={i * 80}>
                <Link href={p.href} className="as-cell group block pb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="as-num">{p.number}</span>
                    <h3 className="as-numbered-title text-ink">{p.title}</h3>
                    <span
                      aria-hidden="true"
                      className="ml-auto text-gold-dark transition-transform duration-300 group-hover:translate-x-1.5"
                    >
                      &#8594;
                    </span>
                  </div>
                  <p className="as-numbered-desc hidden text-mocha sm:block">{p.desc}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>

        {/* liczby – najmocniejszy dowód marki, w pierwszych dwóch ekranach. Linię u góry ma
            każda liczba (Stat), więc rząd nie ma już własnej – bez podwójnej kreski. */}
        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4 lg:mt-16">
          {ACHIEVEMENTS.map((a, i) => (
            <Reveal key={a.label} delay={i * 60}>
              <Stat value={a.value} label={nbspShort(a.label)} />
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
    <section className="as-section as-section-tight-top bg-cream-100">
      <div className="as-shell">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <Reveal className="md:col-span-5 lg:col-span-4">
            <SectionLabel number="03">Produkty</SectionLabel>
            {/* AD6: bez wymuszonego łamania – w kolumnie 4/12 dawało sierotę „stoi” */}
            <h2 className="as-display-section as-text-balance mt-6 text-ink">Wszystko, co stoi za efektem.</h2>
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
    /* H14: linia na styku cream-100 → cream-50 (dwa jasne pasy z rzędu) */
    <section className="as-section border-t border-ink/10 bg-cream-50">
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
            {/* telefon w poziomie: portret nie wyższy niż 80% ekranu (H8; short:sm/md – jak w O nas) */}
            <figure className="mx-auto max-w-[16rem] sm:max-w-[22rem] md:max-w-none short:max-w-[calc(80svh*4/5)] short:sm:max-w-[calc(80svh*4/5)] short:md:max-w-[calc(80svh*4/5)]">
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
    <section className="as-section relative overflow-hidden bg-cream-75 text-ink">
      <div className="as-shell relative">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <Reveal>
              <SectionLabel number="05">
                Szkolenia
              </SectionLabel>
              <h2 className="as-display-section mt-6 text-ink">
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
              <p className="as-body mt-6 max-w-[26rem]">
                Autorskie szkolenia {BRAND.academy} to połączenie zaawansowanej techniki,
                wieloletniego doświadczenia i realnej praktyki. {TRAINING_INTRO.levels} Uczysz się od
                ekspertów i dostajesz wsparcie na każdym etapie swojej drogi.
              </p>
              {/* H3: na telefonie link stoi pod cenami kursów (niżej), tu od md */}
              <ArrowLink href="/szkolenia" className="mt-8 hidden w-fit md:inline-flex">
                Poznaj szkolenia
              </ArrowLink>
            </Reveal>
          </div>

          {/* grupa z telefonu mniejsza niż portrety sesji; kolumna 6/12 jak kadr w sekcji 06 */}
          <div className="md:col-span-7 lg:col-span-6 lg:col-start-7">
            <Reveal>
              {/* telefon w poziomie: kadr 3:2 nie wyższy niż 80% ekranu (jak portrety, H8) */}
              <div className="as-photo-frame short:mx-auto short:max-w-[calc(80svh*3/2)]">
                <Figure
                  image={GROUPS.trainingHome.image}
                  alt={`Absolwentki szkolenia Super Natural Brows z certyfikatami – ${BRAND.academy}`}
                  ratio="3 / 2"
                  position={GROUPS.trainingHome.position}
                  tone="light"
                  zoom={false}
                  sizes="(min-width: 1024px) 44vw, (min-width: 768px) 55vw, 92vw"
                />
              </div>
            </Reveal>

            <Reveal delay={80} className="mt-8">
              {/* D4: maks. 3 pozycje (COURSES[].home); pełna nazwa z briefu odróżnia kurs dla
                  linergistek od kursu od podstaw (osoba początkująca nie weźmie tańszego za start);
                  przy kursach z requiresContact – informacja z briefu o wstępnym kontakcie */}
              {/* H10: „netto” pod ceną (priceNote), nie w jednym wierszu z ceną */}
              {HOME_COURSES.map((c) => (
                <PriceRow
                  key={c.id}
                  name={c.fullTitle || c.title}
                  note={[c.format, c.requiresContact && 'rezerwacja po wstępnym kontakcie'].filter(Boolean).join(' · ')}
                  price={c.price}
                  priceNote={c.priceNote}
                />
              ))}
              {/* D4: pozostałe kursy z briefu – linkiem do ich programów na /szkolenia */}
              {OTHER_COURSES.length > 0 && (
                <p className="as-caption mt-6 max-w-[36rem]">
                  Pozostałe kursy:{' '}
                  {OTHER_COURSES.map((c, i) => (
                    <React.Fragment key={c.id}>
                      {i > 0 && (i === OTHER_COURSES.length - 1 ? ' i ' : ', ')}
                      <Link
                        href={`/szkolenia#program-${c.id}`}
                        className="text-ink underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink"
                      >
                        {lowerFirst(c.fullTitle || c.title)}
                      </Link>
                      {c.price && ` (${c.price})`}
                    </React.Fragment>
                  ))}
                  .
                </p>
              )}
              <ArrowLink href="/szkolenia" className="mt-8 w-fit md:hidden">
                Poznaj szkolenia
              </ArrowLink>
            </Reveal>
          </div>
        </div>

        {/* H3: filary powtarzają akapit – na telefonie ukryte, od md trzy kolumny */}
        <div className="mt-14 hidden gap-8 md:grid md:grid-cols-3 lg:mt-16">
          {TRAINING_PILLARS.map((p, i) => (
            <Reveal key={p.number} delay={i * 80}>
              <div className="flex items-baseline gap-3">
                <span className="as-num">{p.number}</span>
                <h3 className="as-numbered-title text-ink">{p.title}</h3>
              </div>
              <p className="as-numbered-desc text-mocha">{p.desc}</p>
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
              className="short:mx-auto short:max-w-[calc(80svh*3/2)]"
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
