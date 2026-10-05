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
import { cn, nbspShort } from '@/lib/utils';

/* ==================================================================
   01 – HERO

   Prośba klientki (30.09.2026): „zdjęcie na tło, napisy na nim, aby nie wyglądało
   jak w ramce”. Portret z sesji jest tłem, bez ramki i linii konstrukcyjnych.

   Jeden blok, układ zależy od ORIENTACJI ekranu (portret jest pionowy 2:3):
   · ekran pionowy (telefony, tablety w pionie, obrócone monitory) – zdjęcie wypełnia
     pierwszy ekran (także pod przezroczystym nagłówkiem), hasło, claim i przyciski leżą
     na dole kadru, na jasnej tkaninie, na kremowym wygaszeniu od dołu; kolofon (imię
     i role) – pod zdjęciem, w tym samym kremie, w który przechodzi wygaszenie (bez szwu);
   · ekran poziomy (laptopy, monitory, tablety i telefony w poziomie) – zdjęcie spadem
     od prawej krawędzi przez całą wysokość (60% szerokości, maks. 1200 px – plik ma
     1068 px szerokości, szerszy kadr byłby mocno powiększony), jego lewa część
     przechodzi w krem tła, a tekst stoi na tym przejściu (hasło wchodzi na zdjęcie).
   Wcześniej o układzie decydowała szerokość (md), więc tablet w pionie dostawał pionowe
   zdjęcie na pół ekranu i pustą plamę kremu pod tekstem.

   Rozmiary hasła i odstępy liczone są z szerokości ORAZ wysokości ekranu (vw / svh),
   więc kompozycja skaluje się płynnie bez progów: od 320 × 568 i telefonu w poziomie
   (568 × 320) po monitor 2560 px; „Umów wizytę” zostaje w pierwszym ekranie.

   Portret: studio-05 (tiul) – jasne tło sesji i biała tkanina na dole kadru dają
   miejsce na ciemny tekst. Ruch przy wejściu: słowa wjeżdżają kolejno (as-enter-rise),
   portret „oddycha” 1,06 → 1 (as-enter-breathe, przycięty overflow-hidden); tylko
   transform, więc zdjęcie (LCP) i tekst są widoczne od pierwszej klatki;
   prefers-reduced-motion wyłącza ruch w CSS.
   ================================================================== */

const HERO_PHOTO = ROLES.heroHome.image;

/* Bez paska faktów w hero (30.09.2026): te same liczby (5× podium, 100+, 50+, lata salonów)
   stoją w sekcji 02 tuż pod zdjęciem – hero ze zdjęciem na tle zostaje czyste; w kolofonie
   imię i role. */

/* D7: cztery role z briefu po polsku („Linergista, Trener, Prelegent oraz Sędzia”) zamiast
   angielskiego FOUNDER.role bez źródła (BIO-12). Pełne brzmienie (FOUNDER.rolePl) jest w alt
   portretu i na /o-nas; w kolofonie skrót mieszczący się w dwóch liniach. */
const ROLE_SHORT = 'Linergistka, trenerka, prelegentka i sędzia';

/* Opóźnienie wejścia (klasy .as-enter-* mają animation-fill-mode: both). */
const delay = (ms) => ({ animationDelay: `${ms}ms` });

/* Szerokość, w jakiej przeglądarka RYSUJE portret (object-fit: cover), a nie szerokość
   kadru – inaczej bierze za mały plik i go rozciąga (tablet w pionie: 480 px na 683 px).
   · pion: kadr = cały ekran; gdy ekran jest węższy niż 2:3, zdjęcie wypełnia wysokość
     i ma 2/3 wysokości ekranu szerokości;
   · poziom: kadr = min(60vw, 1200 px) × 100vh; przy proporcji ekranu < 10:9 rysunek
     wyznacza wysokość (2/3 × 100vh > 60vw). */
const HERO_SIZES =
  '(orientation: portrait) and (max-aspect-ratio: 2/3) 67vh, (orientation: portrait) 100vw, ' +
  '(max-aspect-ratio: 10/9) 67vh, (min-width: 2000px) 1200px, 60vw';

/* Portret – jeden <img> dla obu układów (jedno pobranie). Bez lazy i bez opacity:
   to element LCP. Kadr: w pionie od góry (włosy, twarz, tiul), w poziomie 8% od góry. */
function HeroPicture() {
  return (
    <picture>
      <source
        type="image/webp"
        srcSet={Object.entries(HERO_PHOTO.webp).map(([w, src]) => `${src} ${w}w`).join(', ')}
        sizes={HERO_SIZES}
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
        sizes={HERO_SIZES}
        className="as-enter-breathe absolute inset-0 h-full w-full object-cover object-[52%_0%] land:object-[50%_8%]"
      />
    </picture>
  );
}

/* Rozmiar hasła = zmienna --hw (wysokość „Beauty”) na bloku tekstu; z niej liczone są też
   „with precision.” (0,61 – proporcja z makiety: 7,46 / 12,2) i claim (0,1, 14–18 px),
   więc cały blok skaluje się razem. Od szerokości, ale nie więcej, niż pozwala wysokość:
   · pion: 21vw (telefon), do 13,5svh (tablet w pionie), maks. 11rem;
   · poziom: 10,2vw, do 16svh, od 3rem (telefon w poziomie 568 × 320 – tekst i przycisk
     w pierwszym ekranie) do 14rem (monitor 2560 px – hasło nadal wchodzi na zdjęcie). */
const HERO_TYPE =
  '[--hw:clamp(4rem,min(21vw,13.5svh),11rem)] land:[--hw:clamp(3rem,min(10.2vw,16svh),14rem)]';

/* Hasło „Beauty / with precision.” – wersja wizualna h1 (aria-hidden, h1 jest w sr-only). */
function HeroWords() {
  return (
    <p aria-hidden="true" className="text-ink">
      <span
        data-hero-word
        className="as-display as-enter-rise block whitespace-nowrap text-[length:var(--hw)] leading-[0.9]"
        style={delay(0)}
      >
        Beauty
      </span>
      <span
        data-hero-word
        className="as-enter-rise mt-[0.12em] block whitespace-nowrap text-[length:calc(var(--hw)*0.61)]"
        style={delay(150)}
      >
        <span className="as-display italic">with</span> <span className="as-display">precision.</span>
      </span>
    </p>
  );
}

/* Odstępy pionowe w hero rosną z wysokością ekranu (svh) w granicach clamp – bez progów
   wysokości (dawne short:/tall: i ich kolejność w CSS). */
const GAP = 'mt-[clamp(1rem,2.6svh,2rem)]';

function Hero() {
  const colophon = (
    <div className="border-t border-gold/40 pt-4">
      <p className="as-label text-ink">{FOUNDER.name}</p>
      <p className="as-label mt-2 text-ink/65">{ROLE_SHORT}</p>
    </div>
  );
  const colophonBlock = (
    <div data-hero-colophon className="max-w-[20rem]">
      {colophon}
    </div>
  );

  return (
    /* cofnięcie o pełną wysokość nagłówka razem z linią 1 px (--as-header-h, src/index.css) –
       zdjęcie zaczyna się pod przezroczystym nagłówkiem, bez jasnej kreski u góry */
    <section className="relative mt-[calc(var(--as-header-h)*-1)] overflow-hidden bg-cream-50">
      <h1 className="sr-only">
        {BRAND.tagline} {BRAND.full} – makijaż permanentny i szkolenia PMU w Warszawie
      </h1>

      {/* pierwszy ekran: w pionie tekst na dole kadru, w poziomie na środku wysokości */}
      <div className="relative flex min-h-[100svh] flex-col justify-end land:justify-center">
        {/* zdjęcie: w pionie cały ekran, w poziomie spad od prawej (60%, maks. 1200 px);
            overflow-hidden przycina „oddech” as-breathe (1,06 → 1) */}
        <div className="absolute inset-0 overflow-hidden land:left-auto land:w-[min(60%,75rem)]">
          <HeroPicture />
          {/* pion: kremowe wygaszenie od dołu (pod tekstem krem, w połowie kadru już
              przezroczyste – twarz bez zmian) i górny pas pod nagłówkiem */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-cream-50 from-[6%] via-cream-50/80 via-[30%] to-transparent to-[58%] land:hidden"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-cream-50/90 via-cream-50/50 to-transparent land:hidden"
          />
          {/* poziom: lewa część zdjęcia przechodzi w krem tła (na tym przejściu stoi hasło);
              u góry 80% kremu + nawigacja w pełnym ink (Layout, overPhoto) – „O nas”
              i „Kontakt” na włosach ≥ 5,4:1; dół kadru łagodnie w krem (fakty i kolofon) */}
          <div
            aria-hidden="true"
            className="absolute inset-0 hidden bg-gradient-to-r from-cream-50 via-cream-50/55 via-[24%] to-transparent to-[52%] land:block"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 hidden h-32 bg-gradient-to-b from-cream-50/80 to-transparent land:block"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 hidden h-1/4 bg-gradient-to-t from-cream-50/70 to-transparent land:block"
          />
        </div>

        {/* Odstęp górny:
            · pion: połowa ekranu, ale na niskich telefonach (Safari z paskami ≈ 550 px)
              mniej – treść (≈ 300 px) + pb-8 = 21rem, więc „Umów wizytę” zostaje
              w pierwszym ekranie;
            · poziom: wysokość nagłówka (--as-header-h, także wariant short) + odstęp
              zależny od wysokości ekranu. */}
        <div className="as-shell relative z-10 pb-8 pt-[max(calc(var(--as-header-h)+1rem),min(52svh,calc(100svh-21rem)))] land:pb-[clamp(1.5rem,4svh,2.5rem)] land:pt-[calc(var(--as-header-h)+clamp(0.75rem,4svh,2.5rem))]">
          <div data-hero-lead className={HERO_TYPE}>
            <HeroWords />
            {/* nbspShort: jednoliterowe „i” / „w” nie zostają na końcu wiersza.
                Claim na zdjęciu: ink/80 zamiast mocha (na wygaszeniu kontrast ≥ 7:1). */}
            <p className={cn(GAP, 'max-w-[21.75em] text-[length:clamp(0.875rem,calc(var(--hw)*0.1),1.125rem)] leading-[1.75] text-ink/80 max-sm:text-[1rem] max-sm:leading-[1.6] short:text-[1rem] short:leading-[1.6]')}>
              {nbspShort(BRAND.claim)}
            </p>
            {/* H1: pierwszy przycisk w pierwszym ekranie (pigułka w nagłówku jest ukryta
                < 640 px); od lg „Umów wizytę” jest w nagłówku. Drugi link prowadzi do zabiegów
                (30.09.2026) – „Poznaj nas” dublował „Poznaj nasze podejście” z sekcji 02 tuż
                pod hero (oba na /o-nas). */}
            <div className={cn(GAP, 'flex flex-wrap items-center gap-x-8 gap-y-5')}>
              <Link href={BOOKING_URL} className="as-btn-solid lg:hidden">
                Umów wizytę
              </Link>
              <ArrowLink href="/uslugi" className="w-fit">
                Zobacz zabiegi
              </ArrowLink>
            </div>
          </div>
          {/* poziom: kolofon pod tekstem (w telefonie w poziomie – pod pierwszym ekranem) */}
          <div className="mt-[clamp(1.5rem,5svh,3rem)] hidden land:block">{colophonBlock}</div>
        </div>
      </div>

      {/* pion: kolofon pod zdjęciem */}
      <div className="as-shell pb-12 pt-4 land:hidden">{colophonBlock}</div>
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

          {/* kolumna 2 – jeden portret, inna poza niż w hero, bez ramki (jak zdjęcie hero –
              prośba klientki „nie w ramce”). Telefon (H2): portret po filarach (order-last),
              żeby dwa portrety założycielki nie stały ekran po ekranie; od md w siatce obok
              zdania. Telefon w poziomie: portret nie wyższy niż 80% ekranu (H8) – short:sm: /
              short:md:, bo w CSS warianty sm/md stoją po short i by go nadpisały. */}
          <Reveal delay={60} className="order-last md:order-none md:col-span-6 lg:col-span-4">
            <div className="mx-auto max-w-[16rem] sm:max-w-[20rem] md:max-w-none short:max-w-[calc(80svh*3/4)] short:sm:max-w-[calc(80svh*3/4)] short:md:max-w-[calc(80svh*3/4)]">
              <Figure
                image={ROLES.aboutHome.image}
                alt={`${FOUNDER.name} – ${FOUNDER.rolePl}`}
                ratio="3 / 4"
                position={ROLES.aboutHome.position}
                sizes="(min-width: 1440px) 400px, (min-width: 1024px) 28vw, (min-width: 768px) 46vw, 320px"
              />
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
                  <p className="as-numbered-desc hidden text-mocha sm:block">{nbspShort(p.desc)}</p>
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
    /* H14: linia na styku cream-100 → cream-50 (dwa jasne pasy z rzędu);
       overflow-hidden – portret wychodzi do lewej krawędzi ekranu (bleed) */
    <section className="as-section overflow-hidden border-t border-ink/10 bg-cream-50">
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
            {/* Bez ramki, do krawędzi ekranu (jak zdjęcie hero): na telefonie na całą szerokość,
                od md do lewej krawędzi (Figure bleed); wysokość 4:5 z kolumny. Telefon
                w poziomie: kadr nie wyższy niż 80% ekranu (H8; short:sm/md – jak w O nas). */}
            <figure className="short:max-w-[calc(80svh*4/5)] short:sm:max-w-[calc(80svh*4/5)] short:md:max-w-[calc(80svh*4/5)]">
              <div className="relative" style={{ aspectRatio: '4 / 5' }}>
                <Figure
                  image={portrait.image}
                  alt={`${FOUNDER.name} – ${FOUNDER.signature}`}
                  bleed="start"
                  position={portrait.position}
                  zoom={false}
                  sizes="(min-width: 1440px) 720px, (min-width: 1024px) 46vw, (min-width: 768px) 48vw, 100vw"
                />
              </div>
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
              {/* Bez ramki, do krawędzi ekranu (jak zdjęcie hero): na telefonie na całą szerokość,
                  od md do prawej krawędzi (Figure bleed); wysokość 3:2 z kolumny. Telefon
                  w poziomie: kadr nie wyższy niż 80% ekranu (jak portrety, H8). */}
              <div className="relative short:ml-auto short:max-w-[calc(80svh*3/2)]" style={{ aspectRatio: '3 / 2' }}>
                <Figure
                  image={GROUPS.trainingHome.image}
                  alt={`Absolwentki szkolenia Super Natural Brows z certyfikatami – ${BRAND.academy}`}
                  bleed="end"
                  position={GROUPS.trainingHome.position}
                  tone="light"
                  zoom={false}
                  sizes="(min-width: 1440px) 860px, (min-width: 1024px) 52vw, (min-width: 768px) 62vw, 100vw"
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
              <p className="as-numbered-desc text-mocha">{nbspShort(p.desc)}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  06 – ZAPROSZENIE (cream-50) – klamra z hero                        */
/* ================================================================== */

/* Ostatnia sekcja powtarza język hero: jedyny poziomy kadr z sesji (studio-14 – uśmiech,
   dłoń pod brodą) jako tło, napis i przyciski na zdjęciu, bez ramki.
   · pion: zdjęcie na całą sekcję (rysowane z wysokości – twarz na środku kadru), treść
     na dole na kremowym wygaszeniu;
   · poziom: zdjęcie spadem od LEWEJ krawędzi (lustro hero), prawa część przechodzi
     w krem, tekst po prawej; kadr przesunięty w prawo (object-position 100%), żeby twarz
     stała przed wygaszeniem.
   data-sticky-hide: pasek CTA chowa się przy tej sekcji (ma własne przyciski). */
const INVITATION_SIZES =
  '(orientation: portrait) 132vh, (max-aspect-ratio: 9/5) 120vh, (min-width: 1940px) 1280px, 66vw';

function InvitationBand() {
  return (
    <section data-sticky-hide className="relative overflow-hidden bg-cream-50">
      <div className="relative flex min-h-[88svh] flex-col justify-end land:min-h-[min(80svh,52rem)] land:justify-center">
        <div className="absolute inset-0 overflow-hidden land:right-auto land:w-[min(66%,80rem)]">
          <Figure
            fill
            image={ROLES.closingHome.image}
            alt={`${FOUNDER.name} – portret z sesji wizerunkowej`}
            zoom={false}
            imgClassName="object-[50%_35%] land:object-[100%_40%]"
            sizes={INVITATION_SIZES}
          />
          {/* pion: krem od dołu pod treścią */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-cream-50 from-[34%] via-cream-50/70 via-[48%] to-transparent to-[66%] land:hidden"
          />
          {/* poziom: prawa krawędź zdjęcia w krem (tekst po prawej) */}
          <div
            aria-hidden="true"
            className="absolute inset-0 hidden bg-gradient-to-l from-cream-50 via-cream-50/55 via-[18%] to-transparent to-[42%] land:block"
          />
        </div>

        <div className="as-shell relative z-10 pb-[clamp(3rem,8svh,5rem)] pt-[46svh] land:py-[clamp(3rem,8svh,5rem)]">
          <Reveal className="land:ml-auto land:max-w-[min(40%,30rem)]">
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
