'use client';

/**
 * Pigmenty — „Numer 01".
 *
 * Po audycie publikacyjnym (K1 / TRESC-1) strona NIE pokazuje katalogu:
 * 13 produktów z cenami i pojemnościami pochodziło z szablonu i nie zgadzało
 * się ze sklepem klienta. Pigmenty kupuje się w sklepie AS LOVELINESS
 * (SHOP w src/lib/site.js), a ta strona opisuje linie i prowadzi do ich
 * kategorii w sklepie. Katalog może wrócić wyłącznie z danymi 1:1 ze sklepu
 * lub z cennika klienta — wtedy razem z netto/brutto, ceną za ml i najniższą
 * ceną z 30 dni przy promocjach (PRAWO-8, TRESC-7).
 *
 * Opisy linii zawierają tylko to, co widać w kategoriach sklepu (sprawdzone
 * 29.09.2026): strefy, serie, zestawy. Bez parametrów, cen, liczby odcieni
 * i bez deklaracji medycznych (PRAWO-9).
 *
 * Układ:
 *   01 PageHero band (espresso, bez zdjęcia, bez liczb)
 *   02 Linie #linie (cream-50) — 5 × .as-cell, każda z linkiem do kategorii w sklepie
 *   03 Efekt (cream-100) — JEDYNE makro na trasie: MACROS.brows12p3 1:1 ≤ 320 px
 *   04 Dokumentacja (cream-50) — 3 × .as-cell, dokumenty na prośbę → /certyfikaty
 *   05 ClosingCta
 * Jasne sekcje obok siebie dzieli hairline (border-t ink/10).
 */

import React from 'react';
import {
  ArrowLink,
  ClosingCta,
  CtaButton,
  Figure,
  PageHero,
  Reveal,
  SectionLabel,
} from '@/components/as/Primitives';
import { MACROS } from '@/lib/roles';
import { SHOP } from '@/lib/site';

/* Linki do sklepu otwierają się w nowej karcie. */
const EXTERNAL = { target: '_blank', rel: 'noreferrer noopener' };

/* ArrowLink dokleja własną strzałkę „→" — przy linku do sklepu strzałką
   jest „↗" w etykiecie, więc tę domyślną chowamy (bez podwójnej strzałki). */
const EXTERNAL_ARROW = '[&_.as-arrow-glyph]:hidden';

/* Etykieta linku do sklepu: „↗" dla oka, informacja o nowej karcie dla czytnika. */
function ShopLabel({ children }) {
  return (
    <>
      {children} <span aria-hidden="true">↗</span>
      <span className="sr-only"> (sklep internetowy, otwiera się w nowej karcie)</span>
    </>
  );
}

/* Kategorie kolekcji w sklepie (WooCommerce) — adresy sprawdzone 29.09.2026,
   wszystkie HTTP 200. Budowane od SHOP.url, więc przeniesienie sklepu na inną
   domenę zmieni je razem z nim. */
const SHOP_ORIGIN = new URL(SHOP.url).origin;
const shopCategory = (slug) => `${SHOP_ORIGIN}/kategoria-produktu/${slug}/`;

const LINES = [
  {
    number: '01',
    name: 'AS OPIUM',
    desc: 'Pigmenty do brwi, ust i kresek oraz modyfikatory. Odcienie do ust w seriach Colors i Organic.',
    href: shopCategory('kolekcja-as-opium'),
  },
  {
    number: '02',
    name: 'AS OPIUM Light Minerals',
    desc: 'Linia do brwi i kresek, z modyfikatorami — pojedyncze odcienie i zestawy.',
    href: shopCategory('kolekcja-as-opium-light-minerals'),
  },
  {
    number: '03',
    name: 'AS Classic',
    desc: 'Pigmenty do brwi, ust i kresek oraz korektory. Do ust także seria Concentrate.',
    href: shopCategory('kolekcja-as-classic'),
  },
  {
    number: '04',
    name: 'Areola i Camouflage',
    desc: 'Dwie serie w jednej kategorii: odcienie brązu do pigmentacji otoczki (Areola) oraz Camouflage — od beżu po biel.',
    href: shopCategory('areola-camouflage'),
  },
  {
    number: '05',
    name: 'Trychopigmentacja',
    desc: 'Do mikropigmentacji skóry głowy — pojedyncze odcienie i zestaw.',
    href: shopCategory('trichopigmentation'),
  },
];

/* Dokumentacja w skrócie — bez obietnic „do każdego zamówienia" (TRESC-10):
   dopóki klient nie potwierdzi dokumentów dla każdej linii, piszemy tylko,
   że udostępniamy je na prośbę. */
const DOCS = [
  {
    number: '01',
    title: 'Zgodność z REACH',
    desc: 'Unijne rozporządzenie REACH określa wymagania dla tuszy do tatuażu i makijażu permanentnego. Zapytaj o dokumenty dla linii, której używasz.',
  },
  {
    number: '02',
    title: 'Karta charakterystyki',
    desc: 'Skład, zagrożenia i sposób postępowania z produktem — dokument, o który może zapytać Sanepid podczas kontroli gabinetu.',
  },
  {
    number: '03',
    title: 'Przed zakupem',
    desc: 'Dokumentację udostępniamy na prośbę — napisz, której linii i których odcieni dotyczy pytanie.',
  },
];

/* ================================================================== */
/*  01 — HERO (pas typograficzny, espresso)                            */
/* ================================================================== */

function Hero() {
  return (
    <PageHero
      variant="band"
      label="Pigmenty"
      number="01"
      title="Pigmenty"
      titleAccent="AS OPIUM."
      lead="AS OPIUM, Light Minerals i AS Classic do brwi, ust i kresek oraz pigmenty do areoli i trychopigmentacji. Pełną paletę odcieni z cenami znajdziesz w naszym sklepie internetowym."
    >
      {/* jeden prostokątny przycisk (sklep) + ArrowLink jako druga akcja */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
        <CtaButton href={SHOP.url} {...EXTERNAL} className="as-btn-invert">
          <ShopLabel>Zobacz pigmenty w sklepie</ShopLabel>
        </CtaButton>
        <ArrowLink href="/certyfikaty" tone="light" className="w-fit">
          Dokumentacja produktów
        </ArrowLink>
      </div>
    </PageHero>
  );
}

/* ================================================================== */
/*  02 — LINIE (opis linii + kategorie w sklepie)                      */
/* ================================================================== */

function Lines() {
  return (
    <section id="linie" className="as-section scroll-mt-24 bg-cream-50">
      <div className="as-shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <Reveal className="lg:col-span-8">
            <SectionLabel number="02">Linie</SectionLabel>
            <h2 className="as-display-section as-text-balance mt-6 text-ink">Linie pigmentów.</h2>
            <p className="as-body mt-6">
              W sklepie znajdziesz też kolekcje do ust Paradise i Harley Quinn, serię Hairstrokes
              do brwi oraz zestawy.
            </p>
          </Reveal>
          {/* jedyne CTA sekcji — cały sklep */}
          <Reveal delay={80} className="lg:col-span-4 lg:justify-self-end">
            <ArrowLink href={SHOP.url} {...EXTERNAL} className={`w-fit ${EXTERNAL_ARROW}`}>
              <ShopLabel>Zobacz pigmenty w sklepie</ShopLabel>
            </ArrowLink>
          </Reveal>
        </div>

        {/* komórki redakcyjne: hairline → numer → nazwa → opis → link do kategorii */}
        <ol className="mt-12 grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {LINES.map((line, i) => (
            <Reveal as="li" key={line.number} delay={(i % 3) * 70} className="as-cell flex flex-col">
              <p className="as-kicker">{line.number}</p>
              <h3 className="as-title as-text-balance mt-3 text-ink">{line.name}</h3>
              <p className="mt-3 max-w-[26rem] text-[0.9375rem] leading-[1.65] text-ink/75">{line.desc}</p>
              <ArrowLink href={line.href} {...EXTERNAL} className={`mt-6 w-fit ${EXTERNAL_ARROW}`}>
                <ShopLabel>Kolekcja w sklepie</ShopLabel>
              </ArrowLink>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  03 — EFEKT (jedyne makro na trasie)                                */
/* ================================================================== */

function Effect() {
  /* brows-12-p3 (1638 × 820) w kadrze 1:1 — ostre przy 320 px */
  const macro = MACROS.brows12p3;
  return (
    <section className="as-section border-t border-ink/10 bg-cream-100">
      <div className="as-shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-8">
          <div className="lg:col-span-6">
            <Reveal>
              <SectionLabel number="03">Efekt</SectionLabel>
              <h2 className="as-display-section as-text-balance mt-6 text-ink">Pigment w skórze.</h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="as-body mt-6">
                Na zdjęciu brwi wykonane techniką Super Natural Brows — autorską metodą Andriany
                Babushkiny. Efekt zależy od techniki, doboru odcienia i indywidualnego gojenia skóry.
              </p>
              <ArrowLink href="/uslugi" className="mt-8 w-fit">
                Zobacz zabiegi
              </ArrowLink>
            </Reveal>
          </div>

          <Reveal delay={90} className="lg:col-span-4 lg:col-start-9">
            <figure className="max-w-[20rem]">
              <Figure
                image={macro.image}
                alt="Brwi po makijażu permanentnym metodą Super Natural Brows — zbliżenie"
                ratio={macro.ratio}
                position={macro.position}
                tone="light"
                zoom={false}
                sizes="640px"
              />
              <figcaption className="as-caption mt-3">{macro.caption}</figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  04 — DOKUMENTACJA W SKRÓCIE (układ jak /certyfikaty 02)            */
/* ================================================================== */

function Documentation() {
  return (
    <section className="as-section border-t border-ink/10 bg-cream-50">
      <div className="as-shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Reveal>
              <SectionLabel number="04">Dokumentacja</SectionLabel>
              <h2 className="as-display-section as-text-balance mt-6 text-ink">
                Dokumenty na prośbę.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <ArrowLink href="/certyfikaty" className="mt-8 w-fit">
                Zobacz dokumentację
              </ArrowLink>
            </Reveal>
          </div>

          {/* komórki dokumentów: hairline → numer (.as-kicker) → tytuł (.as-title) → opis 15 px */}
          <ol className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:col-span-8 lg:col-start-5 xl:grid-cols-3">
            {DOCS.map((d, i) => (
              <Reveal as="li" key={d.number} delay={i * 80} className="as-cell">
                <p className="as-kicker">{d.number}</p>
                <h3 className="as-title as-text-balance mt-3 text-ink">{d.title}</h3>
                <p className="mt-4 max-w-[30rem] text-[0.9375rem] leading-[1.65] text-ink/75">{d.desc}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  05 — PAS ZAMYKAJĄCY                                                */
/* ================================================================== */

function ClosingBand() {
  return (
    <ClosingCta
      number="05"
      label="Kontakt"
      title="Pytanie o"
      titleAccent="odcień?"
      lead="Napisz, do jakiej techniki i strefy szukasz pigmentu — podpowiemy, od której linii zacząć. Zamówienia składasz w sklepie internetowym."
      primary={{
        href: SHOP.url,
        ...EXTERNAL,
        label: <ShopLabel>Zobacz pigmenty w sklepie</ShopLabel>,
      }}
      secondary={{ href: '/kontakt', label: 'Napisz do nas' }}
    />
  );
}

/* ================================================================== */

export default function Pigments() {
  return (
    <>
      <Hero />
      <Lines />
      <Effect />
      <Documentation />
      <ClosingBand />
    </>
  );
}
