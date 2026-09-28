'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLink,
  FactStrip,
  Figure,
  GoldArc,
  Reveal,
  SectionLabel,
} from '@/components/as/Primitives';
import { ACHIEVEMENTS, PILLARS, PRICING_PMU, PRODUCT_LINES, TRAINING_PILLARS } from '@/lib/site';
import { ACADEMY, BY_NAME, LIPS, STUDIO } from '@/lib/media';

/* ================================================================== */
/*  01 — HERO                                                          */
/* ================================================================== */

/* ==================================================================
   01 — HERO

   Geometria przeniesiona 1:1 z makiety (zmierzonej na oryginale
   1320×2868 px). Wszystkie wartości to ułamki szerokości kadru treści
   (W) przeliczone na procenty kontenera o proporcji W : 0.682W.
   ================================================================== */

const HERO_RATIO = 1 / 0.682; // szerokość : wysokość kadru hero

/* Ujęcie z sesji odpowiadające makiecie (dłoń pod brodą, biała tkanina). */
const HERO_PHOTO = STUDIO[4];

/* pozycje w % kontenera — x względem szerokości, y względem wysokości */
const G = {
  photo: { left: '33.7%', right: '33.5%', top: '12.6%', bottom: '19.0%' },
  /* linia pisma („baseline") wyrazów — ułamek wysokości kadru */
  beauty: { left: '0%', top: '36.3%' },
  with: { left: '71.4%', top: '37.0%' },
  precision: { left: '71.4%', top: '42.6%' },
  rule: { top: '50.6%' },
  lead: { left: '0%', top: '54.6%' },
  thumbs: { left: '0%', top: '74.0%', width: '23.1%' },
  facts: { top: '89.6%' },
  badge: { right: '0%', top: '78.5%' },
};

/* Rozmiary z makiety — „precision." jest wyraźnie mniejsze niż „Beauty". */
/* Rozmiary w jednostkach kontenera (cqw = 1% szerokości kadru hero),
   nie okna. Kadr hero ma stałą proporcję i mieści się w wysokości okna
   (patrz HERO_BOX), więc typografia skaluje się razem z całą kompozycją
   — pierwszy ekran jest zawsze kompletny, od 2065×590 po 1440×900.
   Wartości zmierzone: „Beauty" 160 px przy kadrze 1313 px = 12,2 cqw itd. */
const TYPE = {
  beauty: 'clamp(2.5rem, 12.2cqw, 14rem)',
  precision: 'clamp(1.5rem, 7.46cqw, 8.6rem)',
  with: 'clamp(1rem, 4.72cqw, 5.4rem)',
};

/* Kadr hero: szerokość = min(cały kadr treści, wysokość okna × proporcja).
   Dzięki temu przy niskim oknie kompozycja maleje zamiast się ucinać.
   6rem = wysokość nagłówka na lg. */
const HERO_BOX = {
  width: `min(100%, calc((100svh - 6rem) * ${HERO_RATIO}))`,
  aspectRatio: HERO_RATIO,
  containerType: 'inline-size',
  marginInline: 'auto',
};

function Hero() {
  /* Dwie szerokie miniatury jak w makiecie (brew + usta) — czyste panele
     wycięte ze sklejek, bez szwów i watermarków. */
  const thumbs = [
    { image: BY_NAME['brows-13-p3'], alt: 'Wygojona brew po zabiegu Super Natural Brows', position: '50% 50%' },
    { image: BY_NAME['lips-01-p2'], alt: 'Wygojone usta po zabiegu Perfect Lips', position: '50% 66%' },
  ];

  /* ——— Elementy współdzielone przez układ mobilny i desktopowy ——— */

  const lead = (
    <>
      <p className="max-w-[17rem] text-[0.8125rem] leading-[1.9] text-mocha">
        Profesjonalne produkty PMU, edukacja i doświadczenie tworzone przez praktyków.
      </p>
      <ArrowLink href="/o-nas" className="mt-7 w-fit">
        Poznaj AS
      </ArrowLink>
    </>
  );

  const thumbRow = (
    <div className="flex gap-1.5">
      {thumbs.map((t, i) => (
        <Figure
          key={i}
          image={t.image}
          alt={t.alt}
          ratio="2 / 1"
          position={t.position}
          className="flex-1"
          sizes="180px"
          priority
        />
      ))}
    </div>
  );

  const photo = (
    <div className="relative h-full w-full">
      {/* linie konstrukcyjne wychodzące poza kadr */}
      <span
        aria-hidden="true"
        className="absolute -top-[5.5%] bottom-[-3.5%] left-0 w-px bg-gold/45"
      />
      <span
        aria-hidden="true"
        className="absolute -top-[5.5%] bottom-[-3.5%] right-0 w-px bg-gold/45"
      />
      <span aria-hidden="true" className="absolute -left-[11%] -right-[11%] top-[-4%] h-px bg-gold/45" />
      <span aria-hidden="true" className="absolute -left-[11%] -right-[11%] bottom-0 h-px bg-gold/45" />

      <div className="as-media h-full w-full border border-gold/50">
        <picture>
          <source
            type="image/webp"
            srcSet={Object.entries(HERO_PHOTO.webp).map(([w, src]) => `${src} ${w}w`).join(', ')}
            sizes="(min-width: 1024px) 34vw, 90vw"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_PHOTO.src}
            alt="Andriana Babushkina — założycielka AS Company i Babushkina Academy"
            width={HERO_PHOTO.w}
            height={HERO_PHOTO.h}
            fetchPriority="high"
            decoding="sync"
            sizes="(min-width: 1024px) 34vw, 90vw"
          />
        </picture>
      </div>
    </div>
  );

  const badge = (
    <div className="flex items-center gap-5">
      <span className="h-px w-14 bg-gold/45" aria-hidden="true" />
      {/* W makiecie w kółku jest złoty pen — takiego zdjęcia nie ma w folderze.
          Makro skóry przy 70 px to nieczytelna plama, więc monogram. */}
      <span className="relative grid h-[4.5rem] w-[4.5rem] shrink-0 place-items-center rounded-full border border-gold/50">
        <span className="font-display text-xl italic text-gold-dark">AS</span>
      </span>
      <p className="as-label max-w-[7rem] leading-[2.1] text-ink/55">Profesjonalny system PMU</p>
    </div>
  );

  return (
    <section className="relative -mt-20 overflow-hidden bg-cream-50 lg:-mt-24">
      {/* ================= UKŁAD MOBILNY / TABLET ================= */}
      <div className="as-shell pb-14 pt-24 lg:hidden">
        <h1 className="as-display-xl text-ink">
          <span className="block">Beauty</span>
          <span className="block font-normal italic leading-[1.05]">with</span>
          <span className="block">precision.</span>
        </h1>

        <div className="relative mx-auto mt-8 w-full max-w-[380px]">
          <div style={{ aspectRatio: '7 / 10' }}>{photo}</div>
        </div>

        <div className="mt-10">{lead}</div>
        <div className="mt-10 max-w-[20rem]">{thumbRow}</div>

        <div className="mt-12 border-t border-ink/10 pt-6">
          <FactStrip items={['Sztuka', 'Technika', 'Ludzie', 'Realne efekty']} />
        </div>
      </div>

      {/* ================= UKŁAD DESKTOPOWY (wg makiety) ================= */}
      <div className="as-shell hidden lg:block">
        <div className="relative" style={HERO_BOX}>
          {/* — zdjęcie — */}
          <div
            className="absolute"
            style={{
              left: G.photo.left,
              right: G.photo.right,
              top: G.photo.top,
              bottom: G.photo.bottom,
            }}
          >
            {photo}
          </div>

          {/* — złote linijki na wysokości linii pisma — */}
          <span
            aria-hidden="true"
            className="absolute left-0 h-px bg-gold/40"
            style={{ top: G.rule.top, width: '31%' }}
          />
          <span
            aria-hidden="true"
            className="absolute right-0 h-px bg-gold/40"
            style={{ top: G.rule.top, width: '23%' }}
          />

          {/* — nagłówek: trzy wyrazy ustawione wg linii pisma z makiety — */}
          <h1 className="pointer-events-none absolute inset-0 z-20 text-ink">
            <span
              className="as-display absolute block whitespace-nowrap leading-none"
              style={{ left: G.beauty.left, top: G.beauty.top, fontSize: TYPE.beauty }}
            >
              Beauty
            </span>
            <span
              className="as-display absolute block whitespace-nowrap font-normal italic leading-none"
              style={{ left: G.with.left, top: G.with.top, fontSize: TYPE.with }}
            >
              with
            </span>
            <span
              className="as-display absolute block whitespace-nowrap leading-none"
              style={{ left: G.precision.left, top: G.precision.top, fontSize: TYPE.precision }}
            >
              precision.
            </span>
          </h1>

          {/* — opis + CTA — */}
          <div className="absolute z-20" style={{ left: G.lead.left, top: G.lead.top }}>
            {lead}
          </div>

          {/* — miniatury — */}
          <div
            className="absolute z-20"
            style={{ left: G.thumbs.left, top: G.thumbs.top, width: G.thumbs.width }}
          >
            {thumbRow}
          </div>

          {/* — sygnet „profesjonalny system PMU" — */}
          <div
            className="absolute z-20"
            style={{ right: G.badge.right, top: G.badge.top }}
          >
            {badge}
          </div>

          {/* — dolny pasek — */}
          <div className="absolute inset-x-0 z-20" style={{ top: G.facts.top }}>
            <FactStrip items={['Sztuka', 'Technika', 'Ludzie', 'Realne efekty']} />
          </div>

          <a
            href="#o-nas"
            className="as-label group absolute left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-3 text-ink/45 transition-colors hover:text-ink @[960px]:flex"
            style={{ top: G.facts.top }}
          >
            Przewiń dalej
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-y-1"
            >
              &#8595;
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
/* ================================================================== */
/*  02 — O NAS                                                         */
/* ================================================================== */

function AboutBand() {
  /* Trzy różne plany (makro / grupa / portret) zamiast trzech makr skóry.
     Panel brows-12-p3 to szeroki pasek — w kadrze 4/5 zostaje sam łuk brwi,
     bez szwu i bez tekstu. Zdjęcie grupowe kotwiczone u góry, żeby nie
     ucinać głów. */
  const shots = [
    { image: BY_NAME['brows-12-p3'], alt: 'Wygojony łuk brwi — włos maszynowy', position: '50% 50%' },
    { image: ACADEMY[2], alt: 'Kursantki Babushkina Academy z certyfikatami po szkoleniu', position: '50% 18%' },
    { image: STUDIO[12], alt: 'Andriana Babushkina — założycielka AS Company', position: '50% 20%' },
  ];

  return (
    <section id="o-nas" className="relative overflow-hidden bg-espresso py-12 text-cream-50 lg:py-14">
      <GoldArc className="-top-32 left-[-6%] h-[720px] w-[900px]" opacity={0.3} />

      <div className="as-shell relative">
        <Reveal>
          <SectionLabel number="02" tone="light">
            O nas
          </SectionLabel>
        </Reveal>

        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-8">
          {/* lewa kolumna — 33%, żeby „More than" mieściło się w jednym wierszu (3 wiersze jak w makiecie) */}
          <div className="lg:col-span-4">
            <Reveal>
              <h2 className="as-display-section as-text-balance">
                More than
                <br />
                permanent
                <br />
                makeup.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="mt-6 max-w-[17rem] text-[0.8125rem] leading-[1.75] text-cream-200/85">
                Tworzymy kompleksowy ekosystem dla profesjonalistów PMU — łącząc najwyższej jakości
                produkty, zaawansowaną edukację i realną praktykę.
              </p>
            </Reveal>
            <Reveal delay={140}>
              <ArrowLink href="/o-nas" tone="light" className="mt-8 w-fit">
                Poznaj nasze podejście
              </ArrowLink>
            </Reveal>
          </div>

          {/* trzy kadry — jak w makiecie: cienka złota ramka wokół trójki, odstępy ~4 px */}
          <div className="lg:col-span-8">
            <div className="grid gap-1 border border-gold/35 p-1 sm:grid-cols-3">
              {shots.map((s, i) => (
                <Reveal key={i} delay={i * 90}>
                  <Figure
                    image={s.image}
                    alt={s.alt}
                    ratio="7 / 8"
                    position={s.position}
                    tone="dark"
                    sizes="(min-width: 640px) 28vw, 90vw"
                    priority
                  />
                </Reveal>
              ))}
            </div>

            {/* podpisy 01 / 02 / 03 — numer i tytuł w jednej linii, drobny opis (jak w makiecie) */}
            <div className="mt-4 grid gap-6 sm:grid-cols-3">
              {PILLARS.map((p, i) => (
                <Reveal key={p.number} delay={i * 90}>
                  <Link href={p.href} className="group block">
                    <div className="flex items-baseline gap-3">
                      <span className="as-num text-lg sm:text-xl">{p.number}</span>
                      <h3 className="font-display text-xl italic text-cream-50 sm:text-2xl">{p.title}</h3>
                    </div>
                    <p className="mt-2 max-w-[15rem] text-[0.75rem] leading-[1.6] text-cream-200/75">{p.desc}</p>
                    <span
                      aria-hidden="true"
                      className="mt-2 inline-block text-gold-light transition-transform duration-300 group-hover:translate-x-1.5"
                    >
                      &#8594;
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* dopisek — w makiecie stoi przy zdjęciach u góry, nie jako osobny wiersz */}
        {/* right-14 = padding as-shell na lg; right-0 liczyłoby się od krawędzi paddingu i wchodziło w margines */}
        <Reveal className="mt-8 flex items-center justify-end gap-5 lg:absolute lg:right-14 lg:top-0 lg:mt-0">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold/40" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-gold" />
          </span>
          <p className="font-display text-sm italic leading-[1.65] text-cream-100">
            Narzędzia.
            <br />
            Wiedza.
            <br />
            Techniki.
            <br />
            Realne efekty.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  03 — EFEKTY                                                        */
/* ================================================================== */

const RESULT_CARDS = [
  {
    number: '01',
    title: 'Brwi',
    image: BY_NAME['brows-01-p1'],
    alt: 'Wygojone brwi po zabiegu Super Natural Brows',
    desc: 'Super Natural Brows i Perfect Powder Brows — włos maszynowy oraz technika pudrowa bez przerysowanych konturów.',
    cta: 'Zobacz zabiegi brwi',
    href: '/uslugi',
  },
  {
    number: '02',
    title: 'Usta',
    image: LIPS[3],
    position: '50% 55%',
    alt: 'Wygojone usta po zabiegu Perfect Lips',
    desc: 'Perfect Lips — lekka satynka, która po wygojeniu wygląda naturalnie i wyrównuje koloryt.',
    cta: 'Zobacz zabiegi ust',
    href: '/uslugi',
  },
  {
    number: '03',
    title: 'Kreski i korekty',
    image: BY_NAME['brows-18-p1'],
    alt: 'Perfect Eyeliners — kreska permanentna i linia zagęszczająca',
    desc: 'Perfect Eyeliners, linia zagęszczająca, korekty oraz usuwanie laserem i removerem.',
    cta: 'Zobacz pełen cennik',
    href: '/uslugi#cennik',
  },
];

function ResultsBand() {
  return (
    <section className="relative overflow-hidden bg-cream-100 py-12 lg:py-14">
      <GoldArc className="-top-10 right-[-8%] h-[600px] w-[820px]" flip opacity={0.4} />

      <div className="as-shell relative">
        <Reveal>
          <SectionLabel number="03">Efekty</SectionLabel>
        </Reveal>

        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
          <Reveal className="lg:col-span-7">
            <h2 className="as-display-section as-text-balance text-ink">
              Everything
              <br />
              behind the result.
            </h2>
          </Reveal>

          <Reveal delay={90} className="lg:col-span-5 lg:pt-1">
            <p className="max-w-[19rem] text-[0.8125rem] leading-[1.75] text-mocha">
              Realne prace, realne wygojenia. Specjalizujemy się w najbardziej naturalnym efekcie —
              bez przerysowanych konturów i bez kompromisów przy gojeniu.
            </p>
            <ArrowLink href="/uslugi" className="mt-6 w-fit">
              Zobacz wszystkie zabiegi
            </ArrowLink>
          </Reveal>
        </div>

        {/* karty jak w makiecie: kolumny rozdzielone pionową złotą linią, bez border-top */}
        <div className="mt-10 grid gap-y-10 md:grid-cols-3 md:gap-x-0">
          {RESULT_CARDS.map((card, i) => (
            <Reveal key={card.number} delay={i * 100}>
              <article className="group flex h-full flex-col border-l border-gold/35 pl-5 md:pr-7">
                <div className="mb-4 flex items-center gap-4">
                  <span className="as-num">{card.number}</span>
                  <span className="h-px w-10 bg-ink/15 transition-all duration-300 group-hover:w-16 group-hover:bg-gold" />
                </div>

                <Figure
                  image={card.image}
                  alt={card.alt}
                  ratio="5 / 4"
                  position={card.position}
                  sizes="(min-width: 768px) 30vw, 90vw"
                  priority
                />

                <h3 className="mt-5 font-display text-2xl text-ink sm:text-[1.75rem]">{card.title}</h3>
                <p className="mt-2 flex-1 text-[0.75rem] leading-[1.6] text-mocha">{card.desc}</p>
                <ArrowLink href={card.href} className="mt-5 w-fit">
                  {card.cta}
                </ArrowLink>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Linie produktowe — przeniesione tutaj z osobnego pasa, który był
            w całości tekstowy i wydłużał stronę bez żadnej treści wizualnej. */}
        <Reveal delay={80} className="mt-10 border-t border-ink/10 pt-5">
          <div className="flex flex-wrap items-center gap-x-10 gap-y-5">
            <span className="as-label text-ink/45">Produkty AS</span>
            {PRODUCT_LINES.map((line) => (
              <Link
                key={line.id}
                href={line.href}
                className="group inline-flex items-baseline gap-3 text-ink/70 transition-colors hover:text-ink"
              >
                <span className="as-num text-[1rem] sm:text-[1.1rem]">{line.number}</span>
                <span className="text-sm">{line.title}</span>
                <span
                  aria-hidden="true"
                  className="text-gold-dark transition-transform duration-300 group-hover:translate-x-1"
                >
                  &#8594;
                </span>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  05 — SZKOLENIA                                                     */
/* ================================================================== */

function TrainingBand() {
  return (
    <section className="relative overflow-hidden bg-mocha py-12 text-cream-50 lg:py-14">
      <GoldArc className="top-0 left-[8%] h-[760px] w-[900px]" opacity={0.25} />

      <div className="as-shell relative">
        <Reveal>
          <SectionLabel number="05" tone="light">
            Szkolenia
          </SectionLabel>
        </Reveal>

        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Reveal>
              {/* łamanie jak w makiecie: Szkolenia / oparte na / realnej praktyce */}
              <h2 className="as-display-section-sm">
                Szkolenia
                <br />
                oparte na
                <br />
                realnej praktyce
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="mt-6 max-w-[17rem] text-[0.8125rem] leading-[1.75] text-cream-200/85">
                Autorskie szkolenia AS to połączenie zaawansowanej techniki, wieloletniego
                doświadczenia i realnej praktyki. Uczysz się od ekspertów, zdobywasz pewność siebie
                i otrzymujesz wsparcie na każdym etapie swojej drogi.
              </p>
            </Reveal>
            <Reveal delay={140}>
              <ArrowLink href="/szkolenia" tone="light" className="mt-8 w-fit">
                Poznaj szkolenia
              </ArrowLink>
            </Reveal>
          </div>

          {/* kolaż zdjęć kursantek */}
          <div className="lg:col-span-8">
            <Reveal>
              {/* kolaż jak w makiecie: duże ~2,5:1, dwa małe ~2:1, złota linia wokół, odstępy 6 px */}
              <div className="grid gap-1.5 border border-gold/35 p-1.5">
                <Figure
                  image={ACADEMY[3]}
                  alt="Kursantki Babushkina Academy z certyfikatami Super Natural Brows"
                  ratio="5 / 2"
                  position="50% 18%"
                  tone="dark"
                  sizes="(min-width: 1024px) 60vw, 90vw"
                />
                <div className="grid grid-cols-2 gap-1.5">
                  <Figure
                    image={ACADEMY[5]}
                    alt="Absolwentki szkolenia PMU odbierają certyfikaty"
                    ratio="2 / 1"
                    position="50% 20%"
                    tone="dark"
                    sizes="(min-width: 1024px) 30vw, 45vw"
                  />
                  <Figure
                    image={ACADEMY[7]}
                    alt="Grupa kursantek Babushkina Academy po zakończonym kursie"
                    ratio="2 / 1"
                    position="50% 20%"
                    tone="dark"
                    sizes="(min-width: 1024px) 30vw, 45vw"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {TRAINING_PILLARS.map((p, i) => (
            <Reveal key={p.number} delay={i * 90}>
              <div className="flex items-baseline gap-4">
                <span className="as-num text-lg text-gold-light sm:text-xl">{p.number}</span>
                <div>
                  <h3 className="font-display text-xl italic text-cream-50 sm:text-2xl">{p.title}</h3>
                  <p className="mt-1.5 max-w-[16rem] text-[0.75rem] leading-[1.6] text-cream-200/75">{p.desc}</p>
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
/*  06 — CENNIK (zajawka)                                              */
/* ================================================================== */

function PricingTeaser() {
  return (
    <section className="relative overflow-hidden bg-cream-50 py-12 lg:py-14">
      <div className="as-shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          {/* kolumna ze zdjęciem — bez niej pas był w całości tekstowy */}
          <Reveal className="lg:col-span-4">
            <SectionLabel number="05">Cennik</SectionLabel>
            <h2 className="as-display-md as-text-balance mt-7 text-ink">
              Jasne stawki,
              <br />
              bez gwiazdek.
            </h2>
            <div className="mt-9">
              <Figure
                image={BY_NAME['lips-01-p1']}
                alt="Perfect Lips — efekt makijażu permanentnego ust po wygojeniu"
                ratio="2 / 1"
                position="50% 28%"
                sizes="(min-width: 1024px) 28vw, 90vw"
              />
            </div>
            <ArrowLink href="/uslugi#cennik" className="mt-8 w-fit">
              Zobacz pełen cennik
            </ArrowLink>
          </Reveal>

          <Reveal delay={90} className="lg:col-span-8">
            <p className="as-body max-w-lg">
              {PRICING_PMU.subtitle}. Pełen cennik obejmuje również odświeżenia oraz usuwanie
              laserem i removerem.
            </p>
            <ul className="mt-8">
              {PRICING_PMU.items.map((item) => (
                <li
                  key={item.name}
                  className="flex items-baseline gap-4 border-b border-ink/10 py-5 first:border-t"
                >
                  <span className="min-w-0 flex-1 text-base text-ink">{item.name}</span>
                  <span
                    className="hidden flex-1 translate-y-[-3px] border-b border-dotted border-ink/15 sm:block"
                    aria-hidden="true"
                  />
                  <span className="whitespace-nowrap font-display text-xl text-ink">
                    {item.price}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-xl text-xs leading-relaxed text-mocha-400">
              {PRICING_PMU.footnote}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  06 — OSIĄGNIĘCIA + CTA                                             */
/* ================================================================== */

function ClosingBand() {
  return (
    <section className="relative overflow-hidden bg-espresso-900 text-cream-50">
      <div className="as-shell py-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          {/* kolaż — pas domykający też miał zero zdjęć */}
          <Reveal className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-3">
              <Figure
                image={STUDIO[8]}
                alt="Sesja wizerunkowa AS Company"
                ratio="3 / 4"
                tone="dark"
                sizes="(min-width: 1024px) 20vw, 45vw"
              />
              <Figure
                image={STUDIO[15]}
                alt="Sesja wizerunkowa AS Company"
                ratio="3 / 4"
                position="50% 30%"
                tone="dark"
                className="mt-10"
                sizes="(min-width: 1024px) 20vw, 45vw"
              />
            </div>
          </Reveal>

          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="as-display-lg as-text-balance">
                Zacznijmy od <span className="italic text-gold-light">konsultacji.</span>
              </h2>
              <p className="as-body-invert mt-7 max-w-lg">
                Salon i akademia w Warszawie — wolnostojący budynek z prywatnym parkingiem. Umów
                wizytę albo zapytaj o najbliższy termin szkolenia.
              </p>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link href="/kontakt" className="as-btn-gold">
                  Umów wizytę
                </Link>
                <Link href="/szkolenia" className="as-btn-ghost-light">
                  Terminy szkoleń
                </Link>
              </div>
            </Reveal>

            <div className="mt-12 grid gap-8 border-t border-cream-200/12 pt-10 sm:grid-cols-2">
              {ACHIEVEMENTS.map((a, i) => (
                <Reveal key={a.label} delay={i * 70}>
                  <p className="as-display-sm text-gold-light">{a.value}</p>
                  <p className="as-body-invert mt-2 max-w-[16rem] text-[0.8125rem]">{a.label}</p>
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

export default function Home() {
  return (
    <>
      <Hero />
      <AboutBand />
      <ResultsBand />
      <TrainingBand />
      <PricingTeaser />
      <ClosingBand />
    </>
  );
}
