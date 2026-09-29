'use client';

/**
 * Strona główna — „Numer 01".
 *
 * Każda sekcja to rozkładówka: jeden kadr, jedno duże zdanie w Bodoni, jeden
 * link. Rytm tła: krem → espresso → cream-100 → krem → mocha → krem → stopka.
 * Portrety wyłącznie przez ROLES, grupy przez GROUPS, makra przez MACROS
 * (src/lib/roles.js) — każdy plik ma w serwisie jedno miejsce.
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
  BRAND,
  COURSES,
  FOUNDER,
  PILLARS,
  PRICING_PMU,
  PRODUCT_LINES,
  TRAINING_PILLARS,
} from '@/lib/site';
import { GROUPS, MACROS, ROLES } from '@/lib/roles';

/* ==================================================================
   01 — HERO

   Geometria przeniesiona 1:1 z makiety (zmierzonej na oryginale
   1320×2868 px). Wszystkie wartości to ułamki szerokości kadru treści
   (W) przeliczone na procenty kontenera o proporcji W : 0.682W.
   ================================================================== */

const HERO_RATIO = 1 / 0.682; // szerokość : wysokość kadru hero
const HERO_PHOTO = ROLES.heroHome.image;

/* pozycje w % kontenera — x względem szerokości, y względem wysokości */
const G = {
  photo: { left: '33.7%', right: '33.5%', top: '12.6%', bottom: '19.0%' },
  beauty: { left: '0%', top: '36.3%' },
  with: { left: '71.4%', top: '37.0%' },
  precision: { left: '71.4%', top: '42.6%' },
  rule: { top: '50.6%' },
  lead: { left: '0%', top: '54.6%' },
  colophon: { left: '0%', top: '74.0%', width: '23.1%' },
  facts: { top: '89.6%' },
  badge: { right: '0%', top: '80%' },
};

/* Typografia w cqw (1% szerokości kadru hero) — kompozycja skaluje się
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

/* Fakty wyłącznie z ACHIEVEMENTS / BRAND (src/lib/site.js) */
const HERO_FACTS = [
  `${ACHIEVEMENTS[0].value} podium Mistrzostw Świata`,
  `${ACHIEVEMENTS[1].value} kursantek w roku`,
  `${ACHIEVEMENTS[3].value} salonów`,
  BRAND.city,
];

/* Wejście tytułu: trzy wyrazy, 0 / 150 / 300 ms (wyłączone przy reduced-motion) */
const riseIn = (delay) => ({
  animation: `as-rise 600ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms both`,
});

function Hero() {
  const lead = (
    <>
      <p className="as-caption max-w-[17rem] leading-[1.9]">{BRAND.claim}</p>
      <ArrowLink href="/o-nas" className="mt-7 w-fit">
        Poznaj AS
      </ArrowLink>
    </>
  );

  /* Kolofon zamiast miniatur makr — makra z telefonu nie wytrzymują hero. */
  const colophon = (
    <div className="border-t border-gold/40 pt-4">
      <p className="as-label text-ink">{FOUNDER.name}</p>
      <p className="as-label mt-2 text-ink/60">{FOUNDER.role}</p>
      <p className="as-label mt-2 text-ink/60">{FOUNDER.signature}</p>
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
            sizes="(min-width: 1024px) 34vw, 90vw"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_PHOTO.src}
            alt={`${FOUNDER.name} — założycielka AS Company i ${BRAND.academy}`}
            width={HERO_PHOTO.w}
            height={HERO_PHOTO.h}
            fetchPriority="high"
            decoding="sync"
            sizes="(min-width: 1024px) 34vw, 90vw"
            style={{ objectPosition: ROLES.heroHome.position }}
          />
        </picture>
      </div>
    </div>
  );

  /* Sygnet z makiety bez atrapy: sama linia i podpis (monogram w kółku
     udawał zdjęcie maszynki, którego nie mamy). */
  const badge = (
    <div className="flex items-center gap-5">
      <span className="h-px w-14 bg-gold/45" aria-hidden="true" />
      <p className="as-label max-w-[8rem] leading-[2.1] text-ink/60">Profesjonalny system PMU</p>
    </div>
  );

  return (
    <section className="relative -mt-20 overflow-hidden bg-cream-50 lg:-mt-24">
      {/* ================= UKŁAD MOBILNY / TABLET ================= */}
      <div className="as-shell pb-14 pt-28 lg:hidden">
        <h1 className="as-display-xl text-ink">
          <span className="block">Beauty</span>
          <span className="block font-normal italic leading-[1.05]">with</span>
          <span className="block">precision.</span>
        </h1>

        <div className="mt-8">{lead}</div>

        <div className="relative mx-auto mt-10 w-full max-w-[380px]">
          <div style={{ aspectRatio: '4 / 5', maxHeight: '60svh', marginInline: 'auto' }}>{photo}</div>
        </div>

        <div className="mt-12 max-w-[20rem]">{colophon}</div>

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
          <span aria-hidden="true" className="absolute right-0 h-px bg-gold/40" style={{ top: G.rule.top, width: '23%' }} />

          <h1 className="pointer-events-none absolute inset-0 z-20 text-ink">
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
          </h1>

          <div className="absolute z-20" style={{ left: G.lead.left, top: G.lead.top }}>
            {lead}
          </div>

          <div className="absolute z-20" style={{ left: G.colophon.left, top: G.colophon.top, width: G.colophon.width }}>
            {colophon}
          </div>

          <div className="absolute z-20" style={{ right: G.badge.right, top: G.badge.top }}>
            {badge}
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
/*  02 — O NAS (espresso)                                              */
/* ================================================================== */

function AboutBand() {
  return (
    <section id="o-nas" className="as-section relative overflow-hidden bg-espresso text-cream-50">
      <GoldArc className="-top-32 left-[-6%] h-[720px] w-[900px]" opacity={0.28} />

      <div className="as-shell relative">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
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
              <p className="as-body-invert mt-6 max-w-[24rem]">
                Tworzymy kompleksowy ekosystem dla profesjonalistów PMU — łącząc najwyższej jakości
                produkty, zaawansowaną edukację i realną praktykę.
              </p>
              <ArrowLink href="/o-nas" tone="light" className="mt-8 w-fit">
                Poznaj nasze podejście
              </ArrowLink>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            {/* dopisek z makiety — nad ramką, do prawej */}
            <Reveal className="mb-5 flex justify-end">
              <p className="font-display text-base italic text-cream-100/85">
                Narzędzia. Wiedza. Techniki. Realne efekty.
              </p>
            </Reveal>
            <Reveal>
              <div className="as-photo-frame">
                <Figure
                  image={ROLES.aboutHome.image}
                  alt={`${FOUNDER.name} — ${FOUNDER.signature}`}
                  ratio="3 / 2"
                  position={ROLES.aboutHome.position}
                  tone="dark"
                  sizes="(min-width: 1024px) 50vw, 92vw"
                />
              </div>
            </Reveal>

            {/* 01 / 02 / 03 — jak w makiecie: numer i tytuł w jednej linii */}
            <div className="mt-8 grid gap-8 sm:grid-cols-3">
              {PILLARS.map((p, i) => (
                <Reveal key={p.number} delay={i * 80}>
                  <Link href={p.href} className="group block">
                    <div className="flex items-baseline gap-3">
                      <span className="as-num text-lg sm:text-xl">{p.number}</span>
                      <h3 className="as-numbered-title text-cream-100">{p.title}</h3>
                    </div>
                    <p className="as-numbered-desc text-cream-200/85">{p.desc}</p>
                    <span
                      aria-hidden="true"
                      className="mt-3 inline-block text-gold-light transition-transform duration-300 group-hover:translate-x-1.5"
                    >
                      &#8594;
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* liczby — najmocniejszy dowód marki, w pierwszych dwóch ekranach */}
        <div className="mt-14 grid gap-8 border-t border-cream-200/15 pt-10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
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
/*  03 — PRODUKTY (cream-100)                                          */
/* ================================================================== */

function ProductsBand() {
  return (
    <section className="as-section bg-cream-100">
      <div className="as-shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <SectionLabel number="03">Produkty</SectionLabel>
            <h2 className="as-display-section as-text-balance mt-6 text-ink">
              Wszystko, co stoi
              <br />
              za efektem.
            </h2>
          </Reveal>
          <Reveal delay={80} className="lg:col-span-5">
            <p className="as-body">
              Pigmenty, urządzenia i dokumentacja tworzone przez praktyków dla praktyków — to, czego
              sami używamy w gabinecie i na szkoleniach.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-4">
            <div className="mx-auto max-w-[22rem] lg:max-w-none">
              <Figure
                image={ROLES.productsHome.image}
                alt={`${FOUNDER.name} — ${FOUNDER.role}`}
                ratio="2 / 3"
                position={ROLES.productsHome.position}
                framed
                sizes="(min-width: 1024px) 30vw, 80vw"
              />
            </div>
          </Reveal>

          <div className="lg:col-span-7 lg:col-start-6">
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
/*  04 — ZABIEGI I CENNIK (cream-50)                                   */
/* ================================================================== */

function TreatmentsBand() {
  const macro = MACROS.brows09;
  return (
    <section className="as-section bg-cream-50">
      <div className="as-shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Reveal>
              <SectionLabel number="04">Zabiegi</SectionLabel>
              <h2 className="as-display-section as-text-balance mt-6 text-ink">
                Naturalny efekt,
                <br />
                precyzyjna technika.
              </h2>
            </Reveal>
            <Reveal delay={80} className="mt-10">
              <figure className="max-w-[20rem]">
                <Figure
                  image={macro.image}
                  alt="Brwi po makijażu permanentnym — zbliżenie"
                  ratio={macro.ratio}
                  position={macro.position}
                  tone="light"
                  zoom={false}
                  sizes="320px"
                />
                <figcaption className="as-caption mt-3">{macro.caption}</figcaption>
              </figure>
            </Reveal>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal>
              <p className="as-body">
                Każdy zabieg zaczynamy od konsultacji, architektury twarzy i rysunku wstępnego. Ceny
                obejmują konsultację — bez gwiazdek i ukrytych dopłat.
              </p>
            </Reveal>
            <Reveal delay={80} className="mt-8">
              {PRICING_PMU.items.map((item) => (
                <PriceRow key={item.name} name={item.name} note={item.note} price={item.price} />
              ))}
            </Reveal>
            <p className="as-caption mt-6 max-w-[36rem]">{PRICING_PMU.footnote}</p>
            <ArrowLink href="/uslugi#cennik" className="mt-8 w-fit">
              Zobacz pełen cennik
            </ArrowLink>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  05 — SZKOLENIA (mocha)                                             */
/* ================================================================== */

function TrainingBand() {
  return (
    <section className="as-section relative overflow-hidden bg-mocha text-cream-50">
      <div className="as-shell relative">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
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
              <p className="as-body-invert mt-6 max-w-[26rem]">
                Autorskie szkolenia AS to połączenie zaawansowanej techniki, wieloletniego
                doświadczenia i realnej praktyki. Uczysz się od ekspertów i dostajesz wsparcie na
                każdym etapie swojej drogi.
              </p>
              <ArrowLink href="/szkolenia" tone="light" className="mt-8 w-fit">
                Poznaj szkolenia
              </ArrowLink>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal>
              <div className="as-photo-frame">
                <Figure
                  image={GROUPS.trainingHome.image}
                  alt={`Absolwentki szkolenia Super Natural Brows z certyfikatami — ${BRAND.academy}`}
                  ratio="16 / 9"
                  position={GROUPS.trainingHome.position}
                  tone="dark"
                  zoom={false}
                  sizes="(min-width: 1024px) 50vw, 92vw"
                />
              </div>
            </Reveal>

            <Reveal delay={80} className="mt-8">
              {COURSES.map((c) => (
                <PriceRow key={c.id} name={c.title} note={c.format} price={`${c.price} ${c.priceNote}`} tone="light" />
              ))}
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
/*  06 — ZAPROSZENIE (cream-50)                                        */
/* ================================================================== */

function InvitationBand() {
  return (
    <section data-sticky-hide className="as-section bg-cream-50">
      <div className="as-shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-8">
          <Reveal className="lg:col-span-6">
            <SectionLabel number="06">Kontakt</SectionLabel>
            <h2 className="as-display-section as-text-balance mt-6 text-ink">
              Zacznijmy od <span className="italic text-gold-dark">konsultacji.</span>
            </h2>
            <p className="as-body mt-6">
              Salon i akademia w Warszawie. Umów wizytę albo zapytaj o najbliższy termin szkolenia —
              konsultacja jest pierwszym krokiem każdego zabiegu.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
              <Link href="/kontakt" className="as-btn-solid">
                Umów wizytę
              </Link>
              <ArrowLink href="/szkolenia" className="w-fit">
                Terminy szkoleń
              </ArrowLink>
            </div>
          </Reveal>

          <Reveal delay={90} className="lg:col-span-4 lg:col-start-9">
            <div className="mx-auto max-w-[24rem] lg:max-w-none">
              <Figure
                image={ROLES.closingHome.image}
                alt={`${FOUNDER.name} — sesja wizerunkowa ${BRAND.name}`}
                ratio="4 / 5"
                position={ROLES.closingHome.position}
                framed
                sizes="(min-width: 1024px) 36vw, 90vw"
              />
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
