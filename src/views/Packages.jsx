'use client';

/**
 * Ścieżka zabiegowa.
 *
 * ⚠️ Poprzednia wersja tej strony pochodziła z szablonu „Brow Studio Pro":
 * angielskie nazwy, ceny w dolarach ($120 / $400 / $200) i usługi, których
 * AS nie wykonuje (brow lamination, tinting, aftercare kit). Wszystko to
 * zostało usunięte.
 *
 * Strona nie wymyśla pakietów ani rabatów. Pokazuje realną kolejność wizyt
 * i koszt każdego kroku — wyłącznie ceny z cennika w src/lib/site.js
 * (PRICING_PMU, PRICING_REFRESH, PRICING_REMOVAL). Jeśli powstaną prawdziwe
 * pakiety z własnymi cenami, dopisz je do site.js i podepnij tutaj.
 *
 * Układ i skala pisma — jak na stronie głównej (src/views/Home.jsx):
 * rytm .as-section, nagłówki .as-display-section, pozycje numerowane
 * z numerem i tytułem w jednej linii, kolumny rozdzielone złotą linią,
 * grupy zdjęć w .as-photo-frame, ton zdjęć dobrany do tła sekcji.
 * Rytm tła: hero (cream-50) → espresso → cream-100 → ClosingCta (espresso-900).
 */

import React from 'react';
import Link from 'next/link';
import {
  ArrowLink,
  ClosingCta,
  Figure,
  GoldArc,
  PageHero,
  PriceRow,
  Reveal,
  SectionLabel,
} from '@/components/as/Primitives';
import { PRICING_PMU, PRICING_REFRESH, PRICING_REMOVAL } from '@/lib/site';
import { STUDIO } from '@/lib/media';

/** Kolejne kroki — każdy z ceną wprost z cennika. */
const PATH = [
  {
    number: '01',
    title: 'Konsultacja',
    when: 'Przed zabiegiem',
    price: 'Bezpłatnie',
    desc: 'Dobieramy kształt i kolor do rysów twarzy oraz oceniamy skórę. Ustalamy, czy potrzebna będzie obowiązkowa korekta.',
  },
  {
    number: '02',
    title: 'Zabieg',
    when: 'Dzień zero',
    price: '1700 zł',
    desc: 'Super Natural Brows, Perfect Powder Brows lub Perfect Lips. Perfect Eyeliners — 1500 zł.',
  },
  {
    number: '03',
    title: 'Korekta',
    when: 'Do 3 miesięcy',
    price: '500 zł',
    desc: 'Na życzenie klientki. Obowiązkowa przy skórze tłustej, porowatej, z resztkami starego makijażu permanentnego oraz po usuwaniu.',
  },
  {
    number: '04',
    title: 'Odświeżenie',
    when: 'Do 1,5 roku',
    price: '850 zł',
    desc: 'Dla stałych klientek. Po 3 latach — 1000 zł, powyżej 3 lat — 1200 zł, niezależnie od strefy pigmentacji.',
  },
];

/* ================================================================== */
/*  01 — NAGŁÓWEK                                                      */
/* ================================================================== */

function Hero() {
  return (
    <PageHero
      number="01"
      label="Ścieżka zabiegowa"
      title="Od konsultacji"
      titleAccent="do odświeżenia."
      lead="Makijaż permanentny to nie jedna wizyta, tylko kilka kroków rozłożonych w czasie."
      image={STUDIO[11]}
      imageAlt="Andriana Babushkina — portret z sesji wizerunkowej"
      imagePosition="50% 20%"
      tone="cream"
      facts={['Konsultacja', 'Zabieg', 'Korekta', 'Odświeżenie']}
    >
      <div className="flex flex-wrap gap-4">
        <Link href="/kontakt" className="as-btn-solid">
          Umów konsultację
        </Link>
        <Link href="/uslugi#cennik" className="as-btn-ghost">
          Pełny cennik
        </Link>
      </div>
    </PageHero>
  );
}

/* ================================================================== */
/*  02 — KROK PO KROKU                                                 */
/* ================================================================== */

function StepsBand() {
  return (
    <section className="as-section relative overflow-hidden bg-espresso text-cream-50">
      <GoldArc className="-top-32 left-[-6%] h-[720px] w-[900px]" opacity={0.28} />

      <div className="as-shell relative">
        <Reveal>
          <SectionLabel number="02" tone="light">
            Krok po kroku
          </SectionLabel>
        </Reveal>

        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
          <Reveal className="lg:col-span-8">
            <h2 className="as-display-section as-text-balance">
              Cztery wizyty rozłożone na półtora roku.
            </h2>
          </Reveal>

          <Reveal delay={90} className="lg:col-span-4 lg:pt-1">
            <p className="as-caption-invert">
              Poniżej dokładnie, co się dzieje na każdym etapie i ile kosztuje — bez pakietów,
              które trzeba rozszyfrowywać.
            </p>
            <ArrowLink href="#cennik" tone="light" className="mt-6 w-fit">
              Zobacz pełen cennik
            </ArrowLink>
          </Reveal>
        </div>

        {/* cztery kroki jak karty „Efekty" na stronie głównej: kolumny rozdzielone
            pionową złotą linią, numer i tytuł w jednej linii, cena u dołu */}
        <div className="mt-10 grid gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-0">
          {PATH.map((step, i) => (
            <Reveal key={step.number} delay={i * 90}>
              <article className="as-card-col">
                <div className="flex items-baseline gap-3">
                  <span className="as-num text-lg text-gold-light sm:text-xl">{step.number}</span>
                  <h3 className="as-numbered-title text-cream-50">{step.title}</h3>
                </div>
                <p className="as-kicker-invert mt-3">{step.when}</p>
                <p className="as-numbered-desc flex-1 text-cream-200/75">{step.desc}</p>
                <p className="mt-6 font-display text-xl text-gold-light">{step.price}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  03 — CENNIK                                                        */
/* ================================================================== */

function PriceList({ group, footnote, className }) {
  return (
    <div className={className}>
      <h3 className="font-display text-2xl text-ink sm:text-[1.75rem]">{group.title}</h3>
      <p className="as-kicker mt-2">{group.subtitle}</p>
      {/* PriceRow rysuje górną linię sam (first:border-t) — bez border-t na wrapperze */}
      <div className="mt-6">
        {group.items.map((item) => (
          <PriceRow key={item.name} name={item.name} note={item.note} price={item.price} />
        ))}
      </div>
      {footnote && (
        <p className="mt-6 max-w-xl text-xs leading-relaxed text-mocha-400">{footnote}</p>
      )}
    </div>
  );
}

function PricingBand() {
  return (
    <section id="cennik" className="as-section relative overflow-hidden bg-cream-100">
      <GoldArc className="-top-10 right-[-8%] h-[600px] w-[820px]" flip opacity={0.4} />

      <div className="as-shell relative">
        <Reveal>
          <SectionLabel number="03">Cennik</SectionLabel>
        </Reveal>

        <Reveal>
          <h2 className="as-display-section as-text-balance mt-6 max-w-3xl text-ink">
            Wszystkie stawki w jednym miejscu.
          </h2>
        </Reveal>

        {/* dwie kolumny o zbliżonej wysokości: PMU + Refresh (8 pozycji) | Usuwanie (7 pozycji) */}
        <div className="mt-10 grid gap-x-16 gap-y-10 lg:grid-cols-2">
          <Reveal>
            <PriceList group={PRICING_PMU} footnote={PRICING_PMU.footnote} />
            <PriceList group={PRICING_REFRESH} className="mt-10" />
          </Reveal>

          <Reveal delay={90}>
            <PriceList group={PRICING_REMOVAL} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  04 — KONSULTACJA (CTA)                                             */
/* ================================================================== */

function ClosingBand() {
  return (
    <ClosingCta
      number="04"
      label="Konsultacja"
      title="Zacznijmy od"
      titleAccent="rozmowy."
      lead="Konsultacja jest bezpłatna i niezobowiązująca. Ustalimy, która technika ma sens przy Twojej skórze i czego realnie możesz się spodziewać po wygojeniu."
      primary={{ href: '/kontakt', label: 'Umów konsultację' }}
      secondary={{ href: '/uslugi', label: 'Zobacz zabiegi' }}
      photos={[
        { image: STUDIO[14], alt: 'Andriana Babushkina — sesja wizerunkowa AS Company' },
        { image: STUDIO[5], alt: 'Andriana Babushkina — sesja wizerunkowa AS Company', position: '50% 20%' },
      ]}
    />
  );
}

/* ================================================================== */

export default function Packages() {
  return (
    <>
      <Hero />
      <StepsBand />
      <PricingBand />
      <ClosingBand />
    </>
  );
}
