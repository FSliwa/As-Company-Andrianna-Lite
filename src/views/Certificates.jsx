'use client';

/**
 * Dokumentacja produktowa.
 *
 * ⚠️ UWAGA — poprzednia wersja tej strony zawierała WYMYŚLONE numery
 * certyfikatów („EU-REACH-2026-AS-091", „ISO-MED-992031-PL",
 * „MSDS-AS-PIGMENTS-2026", „CE-EO-STERILE-8812") przypisane prawdziwym
 * instytucjom (TÜV Rheinland, Główny Inspektorat Sanitarny) oraz przycisk
 * „Pobierz Oryginał PDF", który nic nie pobierał. Zostało to usunięte:
 * publikowanie nieistniejących numerów zgodności to ryzyko prawne dla marki
 * i dla salonów, które powołałyby się na nie podczas kontroli Sanepidu.
 *
 * Strona opisuje teraz RODZAJE dokumentacji dołączanej do zamówień,
 * bez podawania numerów. Żeby pokazać konkretne certyfikaty, wstaw tu
 * prawdziwe skany/PDF-y i ich numery — wtedy przywrócimy podgląd i pobieranie.
 */

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
import { BROWS, LIPS, STUDIO } from '@/lib/media';

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

export default function Certificates() {
  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-cream-50 pb-20 pt-28 lg:pb-28 lg:pt-36">
        <GoldArc className="-top-24 right-[-10%] h-[560px] w-[760px]" opacity={0.3} />

        <div className="as-shell relative">
          <Reveal>
            <SectionLabel number="01">Dokumentacja</SectionLabel>
          </Reveal>

          <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-16">
            <div className="lg:col-span-7">
              <Reveal>
                <h1 className="as-display-lg as-text-balance text-ink">
                  Papiery, które gabinet
                  <br />
                  <span className="italic text-gold-dark">musi mieć pod ręką.</span>
                </h1>
              </Reveal>
              <Reveal delay={80}>
                <p className="as-body mt-8 max-w-xl">
                  Do produktów, które dystrybuujemy, dołączamy dokumentację wymaganą przy pracy
                  z makijażem permanentnym — od deklaracji zgodności po karty charakterystyki.
                  Poniżej opisujemy, co dokładnie dostajesz.
                </p>
              </Reveal>
              <Reveal delay={140}>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link href="/kontakt" className="as-btn-solid">
                    Poproś o dokumentację
                  </Link>
                  <Link href="/pigmenty" className="as-btn-ghost">
                    Zobacz pigmenty
                  </Link>
                </div>
              </Reveal>
            </div>

            <Reveal delay={100} className="lg:col-span-5">
              <Figure
                image={STUDIO[11]}
                alt="Andriana Babushkina — AS Company, oficjalny dystrybutor marki w Polsce"
                ratio="4 / 5"
                framed
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
            </Reveal>
          </div>

          <Reveal delay={160} className="mt-16 border-t border-ink/10 pt-6">
            <FactStrip items={['Pigmenty', 'Urządzenia', 'Kartridże', 'Preparaty']} />
          </Reveal>
        </div>
      </section>

      {/* ============ RODZAJE DOKUMENTÓW ============ */}
      <section className="as-section relative overflow-hidden bg-espresso text-cream-50">
        <GoldArc className="-top-32 left-[-6%] h-[720px] w-[900px]" opacity={0.28} />

        <div className="as-shell relative">
          <Reveal>
            <SectionLabel number="02" tone="light">
              Co dostajesz
            </SectionLabel>
          </Reveal>

          <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <h2 className="as-display-lg as-text-balance">
                Cztery rodzaje
                <br />
                dokumentów.
              </h2>
              <p className="as-body-invert mt-8 max-w-sm">
                Nie publikujemy tu numerów ani skanów — dokumenty przekazujemy bezpośrednio
                kupującemu, razem z zamówieniem albo wcześniej, do wglądu.
              </p>
              <ArrowLink href="/kontakt" tone="light" className="mt-9 w-fit">
                Napisz po komplet
              </ArrowLink>
            </Reveal>

            <div className="lg:col-span-7">
              <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2">
                {DOCUMENT_TYPES.map((doc, i) => (
                  <Reveal key={doc.number} delay={i * 80}>
                    <div className="flex items-center gap-4">
                      <span className="as-num text-gold-light">{doc.number}</span>
                      <span className="h-px w-10 bg-cream-200/25" />
                    </div>
                    <h3 className="as-display-sm mt-4 italic text-cream-50">{doc.title}</h3>
                    <p className="as-label mt-3 text-gold-light/80">{doc.scope}</p>
                    <p className="as-body-invert mt-3 text-[0.8125rem]">{doc.desc}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ DLA SALONU ============ */}
      <section className="as-section bg-cream-100">
        <div className="as-shell">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-6">
              <SectionLabel number="03">Dla gabinetu</SectionLabel>
              <h2 className="as-display-lg as-text-balance mt-8 text-ink">
                Spokojna
                <br />
                kontrola.
              </h2>
              <ul className="mt-9 space-y-5">
                {FOR_SALON.map((item) => (
                  <li key={item} className="flex gap-4 border-b border-ink/10 pb-5">
                    <span className="mt-2 h-px w-6 shrink-0 bg-gold" aria-hidden="true" />
                    <span className="as-body">{item}</span>
                  </li>
                ))}
              </ul>
              <ArrowLink href="/kontakt" className="mt-9 w-fit">
                Zamów komplet dokumentów
              </ArrowLink>
            </Reveal>

            <Reveal delay={90} className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-3">
                <Figure
                  image={BROWS[5]}
                  alt="Efekt pracy pigmentami AS — wygojone brwi"
                  ratio="3 / 4"
                  sizes="(min-width: 1024px) 24vw, 45vw"
                />
                <Figure
                  image={LIPS[1]}
                  alt="Efekt pracy pigmentami AS — usta po wygojeniu"
                  ratio="3 / 4"
                  className="mt-10"
                  sizes="(min-width: 1024px) 24vw, 45vw"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative overflow-hidden bg-espresso-900 text-cream-50">
        <div className="as-shell py-20 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-7">
              <h2 className="as-display-lg as-text-balance">
                Potrzebujesz konkretnego <span className="italic text-gold-light">dokumentu?</span>
              </h2>
              <p className="as-body-invert mt-7 max-w-lg">
                Napisz, o który produkt chodzi — odeślemy aktualną dokumentację dla tej partii.
              </p>
            </Reveal>
            <Reveal delay={90} className="flex flex-wrap gap-4 lg:col-span-5 lg:justify-end">
              <Link href="/kontakt" className="as-btn-gold">
                Napisz do nas
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
