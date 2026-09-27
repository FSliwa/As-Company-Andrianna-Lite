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
 */

import React from 'react';
import Link from 'next/link';
import {
  ArrowLink,
  FactStrip,
  Figure,
  GoldArc,
  PriceRow,
  Reveal,
  SectionLabel,
} from '@/components/as/Primitives';
import { PRICING_PMU, PRICING_REFRESH, PRICING_REMOVAL } from '@/lib/site';
import { BROWS, LIPS } from '@/lib/media';

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

export default function Packages() {
  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-cream-50 pb-20 pt-28 lg:pb-28 lg:pt-36">
        <GoldArc className="-top-24 right-[-10%] h-[560px] w-[760px]" opacity={0.3} />

        <div className="as-shell relative">
          <Reveal>
            <SectionLabel number="01">Ścieżka zabiegowa</SectionLabel>
          </Reveal>

          <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-16">
            <div className="lg:col-span-7">
              <Reveal>
                <h1 className="as-display-lg as-text-balance text-ink">
                  Od konsultacji
                  <br />
                  <span className="italic text-gold-dark">do odświeżenia.</span>
                </h1>
              </Reveal>
              <Reveal delay={80}>
                <p className="as-body mt-8 max-w-xl">
                  Makijaż permanentny to nie jedna wizyta, tylko kilka kroków rozłożonych
                  w czasie. Poniżej dokładnie, co się dzieje na każdym etapie i ile kosztuje —
                  bez pakietów, które trzeba rozszyfrowywać.
                </p>
              </Reveal>
              <Reveal delay={140}>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link href="/kontakt" className="as-btn-solid">
                    Umów konsultację
                  </Link>
                  <Link href="/uslugi#cennik" className="as-btn-ghost">
                    Pełny cennik
                  </Link>
                </div>
              </Reveal>
            </div>

            <Reveal delay={100} className="lg:col-span-5">
              <Figure
                image={BROWS[9]}
                alt="Brwi przed zabiegiem i po wygojeniu — efekt techniki Super Natural Brows"
                ratio="4 / 5"
                framed
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
            </Reveal>
          </div>

          <Reveal delay={160} className="mt-16 border-t border-ink/10 pt-6">
            <FactStrip items={['Konsultacja', 'Zabieg', 'Korekta', 'Odświeżenie']} />
          </Reveal>
        </div>
      </section>

      {/* ============ KROKI ============ */}
      <section className="as-section relative overflow-hidden bg-espresso text-cream-50">
        <GoldArc className="-top-32 left-[-6%] h-[720px] w-[900px]" opacity={0.28} />

        <div className="as-shell relative">
          <Reveal>
            <SectionLabel number="02" tone="light">
              Krok po kroku
            </SectionLabel>
          </Reveal>

          <Reveal>
            <h2 className="as-display-lg as-text-balance mt-8 max-w-2xl">
              Cztery wizyty rozłożone na półtora roku.
            </h2>
          </Reveal>

          <div className="mt-14 border-t border-cream-200/15">
            {PATH.map((step, i) => (
              <Reveal key={step.number} delay={i * 80}>
                <div className="grid gap-4 border-b border-cream-200/15 py-9 sm:grid-cols-12 sm:items-baseline sm:gap-8">
                  <div className="flex items-center gap-4 sm:col-span-2">
                    <span className="as-num text-gold-light">{step.number}</span>
                    <span className="h-px w-8 bg-cream-200/25" aria-hidden="true" />
                  </div>

                  <div className="sm:col-span-3">
                    <h3 className="as-display-sm italic text-cream-50">{step.title}</h3>
                    <p className="as-label mt-2 text-gold-light/75">{step.when}</p>
                  </div>

                  <p className="as-body-invert text-[0.8125rem] sm:col-span-5">{step.desc}</p>

                  <p className="font-display text-2xl text-cream-50 sm:col-span-2 sm:text-right">
                    {step.price}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <p className="as-body-invert mt-8 max-w-2xl text-[0.8125rem]">
              {PRICING_PMU.footnote}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ PEŁNE CENNIKI ============ */}
      <section className="as-section bg-cream-100">
        <div className="as-shell">
          <Reveal>
            <SectionLabel number="03">Cennik</SectionLabel>
          </Reveal>

          <Reveal>
            <h2 className="as-display-lg as-text-balance mt-8 max-w-2xl text-ink">
              Wszystkie stawki w jednym miejscu.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-x-16 gap-y-14 lg:grid-cols-2">
            <Reveal>
              <h3 className="as-display-sm text-ink">{PRICING_PMU.title}</h3>
              <p className="as-label mt-2 text-ink/45">{PRICING_PMU.subtitle}</p>
              <div className="mt-6 border-t border-ink/10">
                {PRICING_PMU.items.map((item) => (
                  <PriceRow key={item.name} name={item.name} note={item.note} price={item.price} />
                ))}
              </div>
            </Reveal>

            <Reveal delay={90}>
              <h3 className="as-display-sm text-ink">{PRICING_REFRESH.title}</h3>
              <p className="as-label mt-2 text-ink/45">{PRICING_REFRESH.subtitle}</p>
              <div className="mt-6 border-t border-ink/10">
                {PRICING_REFRESH.items.map((item) => (
                  <PriceRow key={item.name} name={item.name} note={item.note} price={item.price} />
                ))}
              </div>

              <h3 className="as-display-sm mt-14 text-ink">{PRICING_REMOVAL.title}</h3>
              <p className="as-label mt-2 text-ink/45">{PRICING_REMOVAL.subtitle}</p>
              <div className="mt-6 border-t border-ink/10">
                {PRICING_REMOVAL.items.map((item) => (
                  <PriceRow key={item.name} name={item.name} note={item.note} price={item.price} />
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ EFEKTY + CTA ============ */}
      <section className="relative overflow-hidden bg-espresso-900 text-cream-50">
        <div className="as-shell py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <h2 className="as-display-lg as-text-balance">
                Zacznijmy od <span className="italic text-gold-light">rozmowy.</span>
              </h2>
              <p className="as-body-invert mt-7 max-w-md">
                Konsultacja jest bezpłatna i niezobowiązująca. Ustalimy, która technika ma sens
                przy Twojej skórze i czego realnie możesz się spodziewać po wygojeniu.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/kontakt" className="as-btn-gold">
                  Umów konsultację
                </Link>
                <ArrowLink href="/uslugi" tone="light" className="self-center">
                  Zobacz zabiegi
                </ArrowLink>
              </div>
            </Reveal>

            <Reveal delay={90} className="lg:col-span-7">
              <div className="grid grid-cols-3 gap-3">
                <Figure image={BROWS[12]} alt="Wygojone brwi" ratio="3 / 4" sizes="18vw" />
                <Figure image={LIPS[1]} alt="Wygojone usta" ratio="3 / 4" className="mt-8" sizes="18vw" />
                <Figure image={BROWS[17]} alt="Brwi — porównanie przed i po" ratio="3 / 4" sizes="18vw" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
