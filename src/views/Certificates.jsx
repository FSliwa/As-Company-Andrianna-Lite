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
 * Strona opisuje RODZAJE dokumentacji dołączanej do zamówień, bez podawania
 * numerów. Żeby pokazać konkretne certyfikaty, wstaw tu prawdziwe skany/PDF-y
 * i ich numery — wtedy dodamy wiersze „nazwa dokumentu | Pobierz".
 *
 * Trasa bez packshotów, więc cała jest typograficzna — bez portretów i makr.
 * Rytm tła: 01 pas espresso (PageHero band) → 02 cream-50 → hairline →
 * 03 cream-100 → 04 ClosingCta (espresso-900, jeden blok ze stopką).
 * Każda sekcja: SectionLabel → H2 .as-display-section (mt-6) → treść → max 1 ArrowLink.
 */

import React from 'react';
import Link from 'next/link';
import { ArrowLink, ClosingCta, PageHero, Reveal, SectionLabel } from '@/components/as/Primitives';

/** Rodzaje dokumentacji — bez numerów, bo tych nie mamy potwierdzonych. */
const DOCUMENT_TYPES = [
  {
    number: '01',
    title: 'Zgodność REACH',
    scope: 'Pigmenty AS OPIUM i Light Minerals',
    desc: 'Deklaracja zgodności z unijnym rozporządzeniem ograniczającym substancje stosowane w tuszach do tatuażu i makijażu permanentnego.',
  },
  {
    number: '02',
    title: 'Karta charakterystyki (MSDS / SDS)',
    scope: 'Barwniki organiczne i mineralne',
    desc: 'Dokument chemiczny opisujący skład, zagrożenia i sposób postępowania z produktem. To ten papier, o który pyta Sanepid podczas kontroli gabinetu.',
  },
  {
    number: '03',
    title: 'Sterylność kartridży',
    scope: 'Kartridże jednorazowe',
    desc: 'Potwierdzenie sterylizacji i jednorazowego przeznaczenia wkładów igłowych wraz z datą ważności opakowania.',
  },
  {
    number: '04',
    title: 'Dokumentacja urządzeń',
    scope: 'Maszynki AS PRINCESS i AS HERO',
    desc: 'Deklaracja zgodności, instrukcja obsługi i warunki gwarancji urządzenia.',
  },
];

const FOR_SALON = [
  'Każde zamówienie hurtowe zawiera komplet dokumentacji w wersji cyfrowej.',
  'Dokumenty wysyłamy również na żądanie — przed zakupem, do wglądu.',
  'Na życzenie przygotowujemy komplet w wersji papierowej do segregatora gabinetowego.',
];

/* Rząd Stat w pasie hero — wyłącznie fakty z treści powyżej (nic spoza strony). */
const HERO_STATS = [
  { value: String(DOCUMENT_TYPES.length), label: 'rodzaje dokumentów dołączanych do produktów' },
  { value: 'REACH', label: 'deklaracja zgodności z rozporządzeniem UE' },
  { value: 'SDS', label: 'karta charakterystyki, o którą pyta Sanepid' },
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
      title="Papiery, które gabinet"
      titleAccent="musi mieć pod ręką."
      lead="Do produktów, które dystrybuujemy, dołączamy dokumentację wymaganą przy pracy z makijażem permanentnym — od deklaracji zgodności po karty charakterystyki. Poniżej opisujemy, co dokładnie dostajesz."
      stats={HERO_STATS}
    >
      {/* jeden prostokątny przycisk + ArrowLink jako druga akcja */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
        <Link href="/kontakt" className="as-btn-invert">
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
/*  02 — RODZAJE DOKUMENTÓW (cream-50)                                 */
/* ================================================================== */

function DocumentsBand() {
  return (
    <section className="as-section bg-cream-50">
      <div className="as-shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Reveal>
              <SectionLabel number="02">Co dostajesz</SectionLabel>
              <h2 className="as-display-section as-text-balance mt-6 text-ink">
                Cztery rodzaje
                <br />
                dokumentów.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="as-body mt-6 max-w-[24rem]">
                Nie publikujemy tu numerów ani skanów — dokumenty przekazujemy bezpośrednio
                kupującemu, razem z zamówieniem albo wcześniej, do wglądu.
              </p>
            </Reveal>
          </div>

          {/* 01–04 jako komórki dokumentów (ten sam układ co /pigmenty 04):
              hairline u góry → numer (.as-kicker) → tytuł (.as-title) → zakres (.as-kicker) → opis 15 px */}
          <ol className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
            {DOCUMENT_TYPES.map((doc, i) => (
              <Reveal as="li" key={doc.number} delay={(i % 2) * 90} className="as-cell">
                <p className="as-kicker">{doc.number}</p>
                <h3 className="as-title as-text-balance mt-3 text-ink">{doc.title}</h3>
                <p className="as-kicker mt-3">{doc.scope}</p>
                <p className="mt-4 max-w-[30rem] text-[0.9375rem] leading-[1.65] text-ink/75">{doc.desc}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  03 — DLA GABINETU (cream-100, hairline od sekcji 02)               */
/* ================================================================== */

function SalonBand() {
  return (
    <section className="as-section border-t border-ink/10 bg-cream-100">
      <div className="as-shell">
        {/* mobile: nagłówek → lista → link; lg: link wraca pod nagłówek w lewej kolumnie */}
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-4">
            <SectionLabel number="03">Dla gabinetu</SectionLabel>
            <h2 className="as-display-section as-text-balance mt-6 text-ink">
              Spokojna
              <br />
              kontrola.
            </h2>
          </Reveal>

          <Reveal delay={80} className="lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">
            <ul className="border-t border-ink/10">
              {FOR_SALON.map((item) => (
                <li key={item} className="flex gap-5 border-b border-ink/10 py-5">
                  <span aria-hidden="true" className="as-dash" />
                  <span className="as-body">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={140} className="lg:col-span-4 lg:col-start-1 lg:row-start-2 lg:self-start">
            <ArrowLink href="/kontakt" className="w-fit">
              Zamów komplet dokumentów
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
      title="Potrzebujesz konkretnego"
      titleAccent="dokumentu?"
      lead="Napisz, o który produkt chodzi — odeślemy aktualną dokumentację dla tej partii."
      primary={{ href: '/kontakt', label: 'Napisz do nas' }}
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
      <SalonBand />
      <ClosingBand />
    </>
  );
}
