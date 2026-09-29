'use client';

/**
 * Ścieżka zabiegowa — „Numer 01".
 *
 * Strona nie wymyśla pakietów ani rabatów. Pokazuje realną kolejność wizyt
 * i koszt każdego kroku — wyłącznie ceny z cennika w src/lib/site.js
 * (PRICING_PMU, PRICING_REFRESH), pobierane po nazwie pozycji, nie wpisywane
 * ręcznie. Jeśli powstaną prawdziwe pakiety z własnymi cenami, dopisz je do
 * site.js i podepnij tutaj.
 *
 * Pełny cennik (PMU / Refresh / Usuwanie) żyje WYŁĄCZNIE na /uslugi#cennik —
 * tu są tylko linki, bez duplikatu tabel.
 *
 * Rytm tła: hero band (espresso) → kroki (cream-50) → ClosingCta + stopka
 * (espresso-900). Bez portretu — ROLES.heroPackages jest wycofane.
 */

import React from 'react';
import Link from 'next/link';
import { ArrowLink, ClosingCta, PageHero, Reveal, SectionLabel } from '@/components/as/Primitives';
import { PRICING_PMU, PRICING_REFRESH } from '@/lib/site';

/* ------------------------------------------------------------------ */
/*  Ceny — wyłącznie z cennika (site.js), wyszukiwane po nazwie        */
/* ------------------------------------------------------------------ */

const pick = (list, name) => list.items.find((item) => item.name === name) || { name, price: '' };

const SNB = pick(PRICING_PMU, 'Super Natural Brows');
const EYELINERS = pick(PRICING_PMU, 'Perfect Eyeliners');
const CORRECTION = pick(PRICING_PMU, 'Korekta do 3 miesięcy');
const REFRESH_18M = pick(PRICING_REFRESH, 'Odświeżenie do 1,5 roku');
const REFRESH_3Y = pick(PRICING_REFRESH, 'Odświeżenie do 3 lat');
const REFRESH_AFTER_3Y = pick(PRICING_REFRESH, 'Odświeżenie po 3 latach');

/** Zabiegi w tej samej cenie co Super Natural Brows (dziś: SNB, Powder Brows, Lips). */
const SAME_PRICE_TREATMENTS = PRICING_PMU.items
  .filter((item) => item.price === SNB.price && !item.name.startsWith('Korekta'))
  .map((item) => item.name);

const joinOr = (names) =>
  names.length > 1 ? `${names.slice(0, -1).join(', ')} lub ${names[names.length - 1]}` : names[0];

/* Rząd Stat w hero — wartości z cennika, podpisy z nazw pozycji */
const HERO_STATS = [
  { value: SNB.price, label: 'zabieg' },
  { value: CORRECTION.price, label: CORRECTION.name.toLowerCase() },
  { value: REFRESH_18M.price, label: REFRESH_18M.name.toLowerCase() },
];

/** Kolejne kroki — każdy z ceną wprost z cennika. */
const PATH = [
  {
    number: '01',
    title: 'Konsultacja',
    when: 'Przed zabiegiem',
    /* do potwierdzenia przez klienta — nie ma tego w site.js */
    price: 'Bezpłatnie',
    desc: 'Dobieramy kształt i kolor do rysów twarzy oraz oceniamy skórę. Ustalamy, czy potrzebna będzie obowiązkowa korekta.',
  },
  {
    number: '02',
    title: 'Zabieg',
    when: 'Dzień zero',
    price: SNB.price,
    desc: `${joinOr(SAME_PRICE_TREATMENTS)}. ${EYELINERS.name} — ${EYELINERS.price}.`,
  },
  {
    number: '03',
    title: 'Korekta',
    when: 'Do 3 miesięcy',
    price: CORRECTION.price,
    desc: 'Na życzenie klientki. Obowiązkowa przy skórze tłustej, porowatej, z resztkami starego makijażu permanentnego oraz po usuwaniu.',
  },
  {
    number: '04',
    title: 'Odświeżenie',
    when: 'Do 1,5 roku',
    price: REFRESH_18M.price,
    desc: `Dla stałych klientek. Do 3 lat — ${REFRESH_3Y.price}, po 3 latach — ${REFRESH_AFTER_3Y.price}, niezależnie od strefy pigmentacji.`,
  },
];

/* ================================================================== */
/*  01 — HERO (band, espresso, bez zdjęcia)                            */
/* ================================================================== */

function Hero() {
  return (
    <PageHero
      variant="band"
      number="01"
      label="Ścieżka zabiegowa"
      title="Od konsultacji"
      titleAccent="do odświeżenia."
      lead="Makijaż permanentny to nie jedna wizyta, tylko kilka kroków rozłożonych w czasie."
      stats={HERO_STATS}
    >
      <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
        <Link href="/kontakt" className="as-btn-invert">
          Umów wizytę
        </Link>
        <ArrowLink href="/uslugi#cennik" tone="light" className="w-fit">
          Zobacz cennik
        </ArrowLink>
      </div>
    </PageHero>
  );
}

/* ================================================================== */
/*  02 — CZTERY KROKI (cream-50)                                       */
/* ================================================================== */

function StepsBand() {
  return (
    <section className="as-section bg-cream-50">
      <div className="as-shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-8">
          <Reveal className="lg:col-span-7">
            <SectionLabel number="02">Krok po kroku</SectionLabel>
            <h2 className="as-display-section as-text-balance mt-6 text-ink">
              Cztery wizyty rozłożone na półtora roku.
            </h2>
          </Reveal>

          <Reveal delay={80} className="lg:col-span-4 lg:col-start-9 lg:justify-self-end">
            <ArrowLink href="/uslugi#cennik" className="w-fit">
              Zobacz cennik
            </ArrowLink>
          </Reveal>
        </div>

        {/* cztery komórki redakcyjne: hairline u góry, numer, tytuł, kiedy, opis, cena */}
        <ol className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
          {PATH.map((step, i) => (
            <Reveal as="li" key={step.number} delay={i * 80} className="as-cell flex flex-col">
              <p className="as-kicker">{step.number}</p>
              <h3 className="as-title mt-3 text-ink">{step.title}</h3>
              <p className="as-kicker mt-3">{step.when}</p>
              <p className="as-numbered-desc mt-4 flex-1 text-mocha">{step.desc}</p>
              <p className="mt-5 font-display text-xl text-ink">{step.price}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  03 — PIERWSZY KROK (ClosingCta, bez zdjęć)                         */
/* ================================================================== */

function ClosingBand() {
  return (
    <ClosingCta
      number="03"
      label="Kontakt"
      title="Pierwszy krok:"
      titleAccent="konsultacja."
      lead="Konsultacja jest pierwszym krokiem każdego zabiegu."
      primary={{ href: '/kontakt', label: 'Umów wizytę' }}
      secondary={{ href: '/uslugi', label: 'Zobacz zabiegi' }}
    />
  );
}

/* ================================================================== */

export default function Packages() {
  return (
    <>
      <Hero />
      <StepsBand />
      <ClosingBand />
    </>
  );
}
