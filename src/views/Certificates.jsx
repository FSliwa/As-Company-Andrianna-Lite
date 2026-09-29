'use client';

/**
 * Dokumentacja produktowa — „Numer 01".
 *
 * ⚠️ UWAGA — poprzednia wersja tej strony zawierała WYMYŚLONE numery
 * certyfikatów („EU-REACH-2026-AS-091", „ISO-MED-992031-PL",
 * „MSDS-AS-PIGMENTS-2026", „CE-EO-STERILE-8812") przypisane prawdziwym
 * instytucjom (TÜV Rheinland, Główny Inspektorat Sanitarny) oraz przycisk
 * „Pobierz Oryginał PDF", który nic nie pobierał. Zostało to usunięte:
 * publikowanie nieistniejących numerów zgodności to ryzyko prawne dla marki
 * i dla salonów, które powołałyby się na nie podczas kontroli Sanepidu.
 *
 * D9/D10 (raport zgodności INNE-01, INNE-02): strona mówi WYŁĄCZNIE o tym, co ma
 * źródło — karty charakterystyki pigmentów. Sklep klientki (as-loveliness.eu/certyfikaty/,
 * „Certyfikaty do pobrania”, stan 29.09.2026) publikuje 6 PDF-ów: AS CLASSIC, AS OPIUM,
 * AS OPIUM LIGHT MINERALS, Harley Quinn, PARADISE, TRICHO. Każdy to „KARTA
 * CHARAKTERYSTYKI zgodnie z rozporządzeniem (WE) nr 1907/2006” (REACH).
 * Usunięte jako bez źródła: „deklaracja zgodności” z rozporządzeniem o tuszach
 * (SDS-y go nie wymieniają), sterylność kartridży, dokumentacja i gwarancja maszynek,
 * „komplet dokumentów do każdego zamówienia hurtowego”, wersja papierowa,
 * dokumenty „dla tej partii”, „papier, o który pyta Sanepid” i „nie publikujemy
 * skanów” (sklep je publikuje). Dostęp: „na prośbę” — bez linków do PDF-ów w sklepie
 * (prośba klientki: bez przekierowań do zewnętrznego sklepu; decyzja o linkach
 * lub plikach na tej stronie — pytanie do klientki).
 *
 * Trasa bez packshotów, więc cała jest typograficzna — bez portretów i makr.
 * Rytm tła: 01 pas espresso (PageHero band) → 02 cream-50 → hairline →
 * 03 cream-100 → 04 ClosingCta (espresso-900, jeden blok ze stopką).
 * Każda sekcja: SectionLabel → H2 .as-display-section (mt-6) → treść → max 1 ArrowLink.
 */

import React from 'react';
import Link from 'next/link';
import { ArrowLink, ClosingCta, PageHero, Reveal, SectionLabel } from '@/components/as/Primitives';

/* Kolekcje z kartą charakterystyki — lista 1:1 ze sklepu klientki (6 PDF-ów, zob. nagłówek).
   Nazwy jak w katalogu /pigmenty (w sklepie „TRICHO” = kolekcja Trichopigmentation).
   D9: bez rozszerzania na linie, których dokumenty nie obejmują — Hairstrokes
   i Areola/Camouflage w sklepie nie mają PDF-u, więc ich tu nie wymieniamy. */
const SDS_COLLECTIONS = [
  'AS OPIUM',
  'AS OPIUM Light Minerals',
  'AS Classic',
  'Paradise',
  'Harley Quinn',
  'Trichopigmentation',
];

const SDS_LABEL = 'Karta charakterystyki (SDS)';

/* Zamiast „komplet dokumentów do zamówienia hurtowego / wersja papierowa” (bez źródła):
   jedyna obietnica to udostępnienie na prośbę (D10). */
const ON_REQUEST = [
  'Karty charakterystyki udostępniamy na prośbę — napisz, której kolekcji dotyczy pytanie.',
  'Możesz o nie poprosić także przed zakupem, do wglądu.',
  'Pytasz o kolekcję spoza listy? Napisz — sprawdzimy, jakie dokumenty są dostępne.',
];

/* Rząd Stat w pasie hero — wyłącznie fakty z treści poniżej (nic spoza strony). */
const HERO_STATS = [
  { value: String(SDS_COLLECTIONS.length), label: 'kolekcji pigmentów z kartą charakterystyki' },
  { value: 'SDS', label: 'karta charakterystyki — na prośbę' },
  { value: 'REACH', label: 'rozporządzenie (WE) nr\u00a01907/2006' },
];

/* ================================================================== */
/*  01 — NAGŁÓWEK (pas espresso, bez zdjęcia)                          */
/* ================================================================== */

function Hero() {
  return (
    <PageHero
      variant="band"
      number="01"
      label="Dokumentacja"
      title="Karty charakterystyki"
      titleAccent="pigmentów."
      /* D9: REACH tylko w zakresie dokumentów ze sklepu (karty wg rozporządzenia 1907/2006);
         „dokumentacja wymagana przy pracy z PMU” i „deklaracje zgodności” — bez źródła, usunięte. */
      lead={'Karty charakterystyki sześciu kolekcji pigmentów AS\u00a0COMPANY, sporządzone zgodnie z\u00a0rozporządzeniem REACH. Udostępniamy je na prośbę.'}
      stats={HERO_STATS}
    >
      {/* jeden prostokątny przycisk + ArrowLink jako druga akcja */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
        <Link href="/kontakt?temat=produkty" className="as-btn-invert">
          Poproś o dokumentację
        </Link>
        <ArrowLink href="/pigmenty" tone="light" className="w-fit">
          Zobacz pigmenty
        </ArrowLink>
      </div>
    </PageHero>
  );
}

/* ================================================================== */
/*  02 — KARTY CHARAKTERYSTYKI (cream-50)                              */
/* ================================================================== */

function DocumentsBand() {
  return (
    <section className="as-section bg-cream-50">
      <div className="as-shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Reveal>
              <SectionLabel number="02">Co udostępniamy</SectionLabel>
              <h2 className="as-display-section as-text-balance mt-6 text-ink">
                Sześć kolekcji,
                <br />
                sześć kart.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              {/* D9: „pigmenty zgodne z rozporządzeniem REACH” — zawężone do kolekcji z listy obok */}
              <p className="as-body mt-6 max-w-[24rem]">
                Pigmenty zgodne z rozporządzeniem REACH: do każdej kolekcji z tej listy mamy kartę
                charakterystyki sporządzoną według rozporządzenia (WE) nr&nbsp;1907/2006.
              </p>
            </Reveal>
          </div>

          {/* 01–06 jako komórki dokumentów (ten sam układ co /pigmenty 04):
              hairline u góry → numer (.as-kicker) → kolekcja (.as-title) → rodzaj dokumentu (.as-kicker) */}
          <ol className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
            {SDS_COLLECTIONS.map((name, i) => (
              <Reveal as="li" key={name} delay={(i % 2) * 90} className="as-cell">
                <p className="as-kicker">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="as-title as-text-balance mt-3 text-ink">{name}</h3>
                <p className="as-kicker mt-3">{SDS_LABEL}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  03 — NA PROŚBĘ (cream-100, hairline od sekcji 02)                  */
/* ================================================================== */

function OnRequestBand() {
  return (
    <section className="as-section border-t border-ink/10 bg-cream-100">
      <div className="as-shell">
        {/* mobile: nagłówek → lista → link; lg: link wraca pod nagłówek w lewej kolumnie */}
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-4">
            <SectionLabel number="03">Jak otrzymać</SectionLabel>
            <h2 className="as-display-section as-text-balance mt-6 text-ink">
              Dokumenty
              <br />
              na prośbę.
            </h2>
          </Reveal>

          <Reveal delay={80} className="lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">
            <ul className="border-t border-ink/10">
              {ON_REQUEST.map((item) => (
                <li key={item} className="flex gap-5 border-b border-ink/10 py-5">
                  <span aria-hidden="true" className="as-dash" />
                  <span className="as-body">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={140} className="lg:col-span-4 lg:col-start-1 lg:row-start-2 lg:self-start">
            <ArrowLink href="/kontakt?temat=produkty" className="w-fit">
              Poproś o kartę charakterystyki
            </ArrowLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  04 — KONTAKT (pas zamykający)                                      */
/* ================================================================== */

function ClosingBand() {
  return (
    <ClosingCta
      number="04"
      label="Kontakt"
      title="Potrzebujesz karty"
      titleAccent="charakterystyki?"
      /* D10: bez „dokumentacji dla tej partii” — brak źródła */
      lead="Napisz, o którą kolekcję pigmentów chodzi — odeślemy jej kartę charakterystyki."
      primary={{ href: '/kontakt?temat=produkty', label: 'Napisz do nas' }}
      secondary={{ href: '/maszynki', label: 'Zobacz maszynki' }}
    />
  );
}

/* ================================================================== */

export default function Certificates() {
  return (
    <>
      <Hero />
      <DocumentsBand />
      <OnRequestBand />
      <ClosingBand />
    </>
  );
}
