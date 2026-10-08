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
import { cutoutFor } from '@/lib/cutouts';
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

/* Warstwa „tekst za postacią” (od lg w poziomie, ekran ≥ 640 px wysokości): ta sama
   postać wycięta z tła (scripts/wyciecie-postaci.swift + .py – maska Vision, piksele
   identyczne z HERO_PHOTO, tylko kanał alfa) leży NAD hasłem, w tym samym pudełku, kadrze
   i z tym samym „oddechem” as-breathe co zdjęcie – dłoń i włosy przechodzą przed literami
   („precision.” chowa się za palcami). Wygaszenia zdjęcia (krem z lewej, u góry i u dołu)
   są tu maską przezroczystości, nie kremową nakładką – inaczej przykryłyby tekst. Tylko
   dekoracja: aria-hidden, bez zdarzeń wskaźnika (linki pod spodem klikalne), pobierana
   z niskim priorytetem (LCP = zdjęcie i tekst). Technika z filmów referencyjnych 7.10. */
const HERO_CUTOUT = {
  src: '/graphics/studio-05-wyciecie.webp',
  srcSet: '/graphics/studio-05-wyciecie-960.webp 960w, /graphics/studio-05-wyciecie.webp 1068w',
};
const HERO_CUTOUT_MASK =
  'linear-gradient(to right, transparent, rgb(0 0 0 / 0.45) 24%, #000 52%), ' +
  'linear-gradient(to bottom, rgb(0 0 0 / 0.2), #000 8rem), ' +
  'linear-gradient(to top, rgb(0 0 0 / 0.3), #000 25%)';

function HeroCutout() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 hidden overflow-hidden land:left-auto land:w-[min(60%,75rem)] lg:land:tall:block min-[2400px]:hidden"
      style={{
        maskImage: HERO_CUTOUT_MASK,
        WebkitMaskImage: HERO_CUTOUT_MASK,
        maskComposite: 'intersect',
        WebkitMaskComposite: 'source-in',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HERO_CUTOUT.src}
        srcSet={HERO_CUTOUT.srcSet}
        sizes={HERO_SIZES}
        alt=""
        width={HERO_PHOTO.w}
        height={HERO_PHOTO.h}
        loading="eager"
        fetchPriority="low"
        decoding="async"
        className="as-enter-breathe absolute inset-0 h-full w-full object-cover object-[52%_0%] land:object-[50%_8%]"
      />
    </div>
  );
}

/* Rozmiar hasła = zmienna --hw (wysokość „Beauty”) na bloku tekstu; z niej liczone są też
   „with precision.” (0,61 – proporcja z makiety: 7,46 / 12,2) i claim (0,1, 14–18 px),
   więc cały blok skaluje się razem. Od szerokości, ale nie więcej, niż pozwala wysokość:
   · pion: 21vw (telefon), do 13,5svh (tablet w pionie), maks. 11rem;
   · poziom: 10,2vw, do 16svh, od 3rem (telefon w poziomie 568 × 320 – tekst i przycisk
     w pierwszym ekranie) do 14rem (monitor 2560 px – hasło nadal wchodzi na zdjęcie);
   · od lg w poziomie przy ekranie ≥ 640 px wysokości: 14,6vw, do 23svh, maks. 17rem – hasło
     sięga dłoni i włosów, które leżą nad nim (HeroCutout). „!” – wariant złożony musi wygrać
     z land:[--hw] niezależnie od kolejności wariantów w CSS. */
const HERO_TYPE =
  '[--hw:clamp(4rem,min(21vw,13.5svh),11rem)] land:[--hw:clamp(3rem,min(10.2vw,16svh),14rem)] lg:land:tall:![--hw:clamp(3rem,min(14.6vw,23svh),17rem)]';

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
      {/* od 2400 px (ultrawide) rozkładówka nie rozjeżdża się na całą szerokość: tekst i zdjęcie
          w jednym bloku 2400 px, zewnętrzna krawędź zdjęcia wygaszona w krem */}
      <div className="relative flex min-h-[100svh] flex-col justify-end land:justify-center min-[2400px]:mx-auto min-[2400px]:max-w-[2400px]">
        {/* zdjęcie: w pionie cały ekran, w poziomie spad od prawej (60%, maks. 1200 px);
            overflow-hidden przycina „oddech” as-breathe (1,06 → 1) */}
        {/* poziom: lewa część zdjęcia przechodzi w krem MASKĄ (przezroczystość), nie kremową
            nakładką – przy ułamkowej szerokości kontenera nakładka zostawiała ciemniejszą kreskę
            1 px na krawędzi kadru */}
        <div className="absolute inset-0 overflow-hidden land:left-auto land:w-[min(60%,75rem)] land:[-webkit-mask-image:linear-gradient(to_right,transparent,rgb(0_0_0/0.45)_24%,#000_52%)] land:[mask-image:linear-gradient(to_right,transparent,rgb(0_0_0/0.45)_24%,#000_52%)]">
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
          {/* ultrawide: prawa krawędź zdjęcia w krem (blok 2400 px nie kończy się ostrą krawędzią) */}
          <div
            aria-hidden="true"
            className="absolute inset-0 hidden bg-gradient-to-l from-cream-50 to-transparent to-[14%] min-[2400px]:land:block"
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
        <HeroCutout />

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
            <p className={cn(GAP, 'max-w-[21.75em] text-[length:clamp(1rem,calc(var(--hw)*0.1),1.125rem)] leading-[1.75] text-ink/80 max-sm:text-[1rem] max-sm:leading-[1.6] short:text-[1rem] short:leading-[1.6]')}>
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
   Złącze z sekcją 03 (tekst – tekst): od lg 64 + 64 px zamiast 80 + 80.

   Propozycja H02-01 / H02-02 (runda 2, do akceptacji):
   · od lg portret jest lewą połową pasa – panel na pełną wysokość sekcji, od lewej krawędzi
     ekranu, szerokość = margines łamu + 40% łamu (≈ 576 px przy 1440); prawa krawędź twarda
     (bez maski), na dole krótkie wygaszenie 17% w krem pasa (cream-90) pod cytatem. Tekst,
     filary i liczby w kolumnach 6–12. Wcześniej portret 421 × 562 stał w środkowej kolumnie
     jako „karta”, a pod tekstem i filarami zostawało ok. 210–240 px pustki;
   · telefon: portret 4:5 na całą szerokość ekranu (spad jak zdjęcia sekcji 04 i 05),
     dalej po filarach; tablet 768–1023 bez zmian (portret 3:4 w kolumnie 6/12). */
const ABOUT_PANEL_WIDTH = 'calc(var(--as-gutter) + 0.4 * (min(100vw, 1440px) - 2 * var(--as-pad)))';

function AboutQuote({ className }) {
  /* H5: Jost italic zamiast Bodoni 16 px (Bodoni nie schodzi poniżej 22 px). Lite: ink/80 –
     od lg cytat leży na kremowym wygaszeniu dołu zdjęcia (jak claim hero na wygaszeniu) */
  return <p className={cn('as-quote as-text-balance text-ink/80', className)}>Narzędzia. Wiedza. Techniki. Realne efekty.</p>;
}

function AboutBand() {
  const alt = `${FOUNDER.name} – ${FOUNDER.rolePl}`;
  return (
    <section id="o-nas" className="as-section as-section-tight-bottom relative overflow-hidden bg-cream-90 text-ink">
      {/* lg+: panel portretu na pełną wysokość pasa (ten sam kadr co < lg – w DOM widoczny
          zawsze tylko jeden z nich, drugi ma display: none i się nie pobiera) */}
      <div className="absolute inset-y-0 left-0 hidden lg:block" style={{ width: ABOUT_PANEL_WIDTH }}>
        <Figure
          fill
          image={ROLES.aboutHome.image}
          alt={alt}
          position={ROLES.aboutHome.position}
          zoom={false}
          sizes="(min-width: 1440px) calc(50vw - 133px), 41vw"
        />
        {/* Lite: dół kadru w krem pasa (cream-90) zamiast espresso */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[17%] bg-gradient-to-t from-cream-90 via-cream-90/70 via-[35%] to-transparent"
        />
        <AboutQuote className="absolute bottom-7 left-[var(--as-gutter)] right-6 max-w-[18rem]" />
      </div>

      <div className="as-shell relative">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7 lg:col-start-6">
            <div className="grid gap-12 md:grid-cols-12 md:gap-8">
              {/* kolumna 1 – zdanie */}
              <div className="md:col-span-6 lg:col-span-12">
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
                  <p className="as-body mt-6 lg:max-w-[34rem]">
                    {nbspShort(
                      'Tworzymy kompleksowy ekosystem dla profesjonalistów PMU – łącząc najwyższej jakości produkty, zaawansowaną edukację i realną praktykę.'
                    )}
                  </p>
                  <ArrowLink href="/o-nas" className="mt-8 w-fit">
                    Poznaj nasze podejście
                  </ArrowLink>
                </Reveal>
              </div>

              {/* < lg: portret. Telefon (H2): po filarach (order-last), żeby dwa portrety
                  założycielki nie stały ekran po ekranie; 4:5 na całą szerokość ekranu.
                  Tablet: obok zdania, 3:4 w kolumnie 6/12. Telefon w poziomie: portret nie
                  wyższy niż 80% ekranu (H8) – short:md:, bo w CSS short stoi przed md. */}
              <Reveal delay={60} className="order-last md:order-none md:col-span-6 lg:hidden">
                <div className="-mx-[var(--as-pad)] md:mx-0 short:mx-auto short:max-w-[calc(80svh*4/5)] short:md:mx-auto short:md:max-w-[calc(80svh*3/4)]">
                  <div className="relative aspect-[4/5] md:aspect-[3/4]">
                    <Figure
                      fill
                      image={ROLES.aboutHome.image}
                      alt={alt}
                      position={ROLES.aboutHome.position}
                      sizes="(min-width: 768px) 46vw, 100vw"
                    />
                  </div>
                  <AboutQuote className="mt-4 px-[var(--as-pad)] text-right md:px-0 short:px-0" />
                </div>
              </Reveal>

              {/* 01 / 02 / 03 jako komórki: tablet i desktop – trzy obok siebie pod zdaniem.
                  Telefon (H2): same linki „01 Produkty →” – opisy powtarzają sekcje 03–05. */}
              <div className="md:col-span-12 md:grid md:grid-cols-3 md:gap-6">
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

            {/* liczby – najmocniejszy dowód marki, w pierwszych dwóch ekranach. Od lg obok panelu
                portretu w 2 kolumnach (2 × 2): w 4 kolumnach 7/12 łamu „10 lat” łamało się na dwie
                linie (kolumna ok. 150–175 px przy 1280–1920). Linię u góry ma każda liczba (Stat). */}
            <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 max-[319px]:grid-cols-1 md:grid-cols-4 lg:mt-16 lg:grid-cols-2">
              {ACHIEVEMENTS.map((a, i) => (
                <Reveal key={a.label} delay={i * 60}>
                  <Stat value={a.value} label={nbspShort(a.label)} />
                </Reveal>
              ))}
            </div>
          </div>
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
    <section className="as-section as-clip-x border-t border-ink/10 bg-cream-50">
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
              {nbspShort(
                'Przed każdą pigmentacją robimy rysunek wstępny dopasowany do architektury Twojej twarzy i wprowadzamy w nim zmiany według Twoich uwag. Kolor dobieramy do karnacji.'
              )}
            </p>
          </Reveal>

          {/* od md portret „jedzie” obok cennika (sticky) – kolumny bez pustego pasa pod zdjęciem */}
          <Reveal
            delay={60}
            className="md:sticky md:top-[calc(var(--as-header-h)+2rem)] md:col-span-5 md:col-start-1 md:row-span-2 md:row-start-1 md:self-start"
          >
            {/* Bez ramki, do krawędzi ekranu (jak zdjęcie hero): na telefonie na całą szerokość,
                od md do lewej krawędzi (Figure bleed); wysokość 4:5 z kolumny. Telefon
                w poziomie: kadr nie wyższy niż 80% ekranu (H8; short:sm/md – jak w O nas). */}
            <figure className="short:mx-auto short:max-w-[calc(80svh*4/5)] short:sm:max-w-[calc(80svh*4/5)] short:md:mx-0 short:md:max-w-[calc(80svh*4/5)]">
              <div className="relative" style={{ aspectRatio: '4 / 5' }}>
                {/* 7.10: portret bez tła studia (src/lib/cutouts.js) – pod postacią krem sekcji */}
                <Figure
                  image={cutoutFor(portrait.image)}
                  alt={`${FOUNDER.name} – ${FOUNDER.signature}`}
                  bleed="start"
                  /* Od md wewnętrzna (prawa) i dolna krawędź przechodzą maską w krem sekcji –
                     różowobeżowe tło sesji nie stoi już twardym prostokątem na cream-50
                     (jak zdjęcie hero; research 5.10.2026: Tina Davies, JP Studio). */
                  className="as-kadr-gora [&_.as-media]:bg-transparent md:[-webkit-mask-composite:source-in] md:[-webkit-mask-image:linear-gradient(to_left,transparent,#000_22%),linear-gradient(to_top,transparent,#000_14%)] md:[mask-composite:intersect] md:[mask-image:linear-gradient(to_left,transparent,#000_22%),linear-gradient(to_top,transparent,#000_14%)]"
                  position={portrait.position}
                  zoom={false}
                  sizes="(min-width: 1440px) 720px, (min-width: 1024px) 46vw, (min-width: 768px) 48vw, 100vw"
                />
              </div>
              <figcaption className="as-caption as-text-balance mt-6 lg:mt-8">
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
            <p className="as-caption mt-6 max-w-[36rem]">{nbspShort(PRICING_PMU.footnote)}</p>
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
/*  05 – SZKOLENIA (cream-75)                                          */
/* ================================================================== */

/* D4: na stronie głównej maks. 3 kursy w cenniku (COURSES[].home), reszta linkiem. */
const HOME_COURSES = COURSES.filter((c) => c.home);
const OTHER_COURSES = COURSES.filter((c) => !c.home);
const lowerFirst = (t) => t.charAt(0).toLowerCase() + t.slice(1);

function TrainingBand() {
  return (
    /* Propozycja H05-02: overflow-x-clip zamiast overflow-hidden – przycina spad zdjęcia
       w poziomie, ale (inaczej niż hidden) nie tworzy kontenera przewijania, więc kolumna
       tekstu może być sticky (Safari 16+, Chrome 90+, Firefox 81+) */
    <section className="as-section relative overflow-x-clip bg-cream-75 text-ink">
      <div className="as-shell relative">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          {/* Propozycja H05-02: od md kolumna tekstu stoi przy zdjęciu i cenach podczas
              przewijania (pod tekstem było ok. 390 px pustego pasa przy 1440) */}
          <div className="md:sticky md:top-[calc(var(--as-header-h)+2rem)] md:col-span-5 md:self-start">
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
                {nbspShort(
                  `Autorskie szkolenia ${BRAND.academy} to połączenie zaawansowanej techniki, wieloletniego doświadczenia i realnej praktyki. ${TRAINING_INTRO.levels} Uczysz się od ekspertów i dostajesz wsparcie na każdym etapie swojej drogi.`
                )}
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
              {/* Propozycja H05-01: kadr 4:3 zamiast 3:2 – widać cały szyld z koroną, pięć twarzy
                  i certyfikaty, o których mówi nagłówek (przy 3:2 ucięte dolną krawędzią) */}
              {/* 8.10: ostra karta z małym zaokrągleniem jak efekty na /uslugi – bez maski
                  wtapiającej krawędzie w tło (rozmyte brzegi wyglądały nieprofesjonalnie) */}
              <div className="relative short:ml-auto short:max-w-[calc(80svh*4/3)] [&_.as-media]:rounded-md">
                <Figure
                  image={GROUPS.trainingHome.image}
                  alt={`Absolwentki szkolenia Super Natural Brows z certyfikatami – ${BRAND.academy}`}
                  ratio="4 / 3"
                  position={GROUPS.trainingHome.position}
                  tone="light"
                  zoom={false}
                  sizes="(min-width: 1440px) 660px, (min-width: 1024px) 46vw, (min-width: 768px) 56vw, 100vw"
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
                /* leading-[2] + py-1 na linkach: cel dotyku linków „Pozostałe kursy” */
                <p className="as-caption mt-6 max-w-[36rem] leading-[2]">
                  Pozostałe kursy:{' '}
                  {OTHER_COURSES.map((c, i) => (
                    <React.Fragment key={c.id}>
                      {i > 0 && (i === OTHER_COURSES.length - 1 ? ' i ' : ', ')}
                      <Link
                        href={`/szkolenia#program-${c.id}`}
                        className="py-1 text-ink underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink"
                      >
                        {lowerFirst(c.fullTitle || c.title)}
                      </Link>
                      {c.price && (
                        <>
                          {' '}
                          <span className="whitespace-nowrap">({c.price})</span>
                        </>
                      )}
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
  '(orientation: portrait) calc((46vh + 5rem) * 1.5), (max-width: 1023px) and (max-height: 500px) 100vw, ' +
  '(max-aspect-ratio: 9/5) 120vh, (min-width: 1940px) 1280px, 66vw';

function InvitationBand() {
  return (
    <section data-sticky-hide className="relative overflow-hidden bg-cream-50">
      <div className="relative flex min-h-[88svh] flex-col justify-end land:min-h-[min(80svh,52rem)] land:justify-center min-[2400px]:mx-auto min-[2400px]:max-w-[2400px]">
        {/* pion: zdjęcie tylko nad treścią (46svh + 5rem), więc twarz zostaje nad etykietą także
            wtedy, gdy treść jest wyższa niż ekran (280–375 px) – wcześniej zdjęcie rosło z sekcją
            i napis wchodził na brodę i dłoń. Poziom: wygaszenie prawej krawędzi maską (bez kreski). */}
        <div className="absolute inset-x-0 top-0 h-[calc(46svh+5rem)] overflow-hidden land:inset-y-0 land:right-auto land:h-auto land:w-[min(66%,80rem)] short:land:w-1/2 land:[-webkit-mask-image:linear-gradient(to_left,transparent,rgb(0_0_0/0.45)_18%,#000_42%)] land:[mask-image:linear-gradient(to_left,transparent,rgb(0_0_0/0.45)_18%,#000_42%)]">
          <Figure
            fill
            image={cutoutFor(ROLES.closingHome.image)}
            alt={`${FOUNDER.name} – portret z sesji wizerunkowej`}
            zoom={false}
            /* 7.10: bez szarobeżowego tła studia (#B39D88) – postać na kremie sekcji */
            className="as-kadr-ruch as-kadr-gora [&_.as-media]:bg-transparent"
            imgClassName="object-[50%_0%]"
            sizes={INVITATION_SIZES}
          />
          {/* pion: krem od dołu pod treścią */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-cream-50 via-cream-50/70 via-[20%] to-transparent to-[45%] land:hidden"
          />
          {/* ultrawide: lewa (zewnętrzna) krawędź zdjęcia w krem */}
          <div
            aria-hidden="true"
            className="absolute inset-0 hidden bg-gradient-to-r from-cream-50 to-transparent to-[14%] min-[2400px]:land:block"
          />
        </div>

        <div className="as-shell relative z-10 pb-[clamp(3rem,8svh,5rem)] pt-[46svh] land:py-[clamp(3rem,8svh,5rem)]">
          <Reveal className="land:ml-auto land:max-w-[min(40%,30rem)] short:land:max-w-[55%]">
            {/* numer 11 px na wygaszeniu zdjęcia: gold-deep miał 3,3–4,1:1 (telefon w pionie) –
                w pionie ink/80 (≥ 7:1), w poziomie (tekst na kremie) gold-deep jak w innych sekcjach */}
            <SectionLabel number={<span className="text-ink/80 land:text-gold-deep">06</span>}>Kontakt</SectionLabel>
            {/* INNE-11/BIO-14: konsultacja jako „pierwszy krok każdego zabiegu” – bez źródła */}
            <h2 className="as-display-section as-text-balance mt-6 text-ink">
              Zacznijmy od <span className="italic text-gold-dark">rozmowy.</span>
            </h2>
            <p className="as-body mt-6">
              {nbspShort('Salon i akademia w Warszawie. Umów wizytę albo zapytaj o najbliższy termin szkolenia.')}
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
