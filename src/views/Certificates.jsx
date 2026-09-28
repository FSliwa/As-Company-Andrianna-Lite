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
 *
 * Układ: ten sam rytm i skala co strona główna (as-section, as-display-section,
 * pozycje numerowane, złota ramka wokół zdjęć, ton zdjęć wg tła sekcji).
 */

import React from 'react';
import Link from 'next/link';
import {
  ArrowLink,
  ClosingCta,
  Figure,
  GoldArc,
  PageHero,
  Reveal,
  SectionLabel,
} from '@/components/as/Primitives';
import { BROWS, STUDIO } from '@/lib/media';

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

/* ================================================================== */
/*  01 — NAGŁÓWEK                                                      */
/* ================================================================== */

function Hero() {
  /* Portret STUDIO na kremie — bez korekty tonu (zdjęcie jest jasne). */
  return (
    <PageHero
      number="01"
      label="Dokumentacja"
      title="Papiery, które gabinet"
      titleAccent="musi mieć pod ręką."
      lead="Do produktów, które dystrybuujemy, dołączamy dokumentację wymaganą przy pracy z makijażem permanentnym — od deklaracji zgodności po karty charakterystyki. Poniżej opisujemy, co dokładnie dostajesz."
      image={STUDIO[11]}
      imageAlt="Andriana Babushkina — portret z sesji wizerunkowej AS Company"
      imagePosition="50% 20%"
      tone="cream"
      facts={['Pigmenty', 'Urządzenia', 'Kartridże', 'Preparaty']}
    >
      <div className="flex flex-wrap gap-4">
        <Link href="/kontakt" className="as-btn-solid">
          Poproś o dokumentację
        </Link>
        <Link href="/pigmenty" className="as-btn-ghost">
          Zobacz pigmenty
        </Link>
      </div>
    </PageHero>
  );
}

/* ================================================================== */
/*  02 — RODZAJE DOKUMENTÓW                                            */
/* ================================================================== */

function DocumentsBand() {
  return (
    <section className="as-section relative overflow-hidden bg-espresso text-cream-50">
      <GoldArc className="-top-32 left-[-6%] h-[720px] w-[900px]" opacity={0.28} />

      <div className="as-shell relative">
        <Reveal>
          <SectionLabel number="02" tone="light">
            Co dostajesz
          </SectionLabel>
        </Reveal>

        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Reveal>
              <h2 className="as-display-section as-text-balance">
                Cztery rodzaje
                <br />
                dokumentów.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="as-caption-invert mt-6">
                Nie publikujemy tu numerów ani skanów — dokumenty przekazujemy bezpośrednio
                kupującemu, razem z zamówieniem albo wcześniej, do wglądu.
              </p>
            </Reveal>
            <Reveal delay={140}>
              <ArrowLink href="/kontakt" tone="light" className="mt-8 w-fit">
                Napisz po komplet
              </ArrowLink>
            </Reveal>
          </div>

          {/* pozycje 01–04 jak filary „Szkolenia" na stronie głównej:
              numer + tytuł w jednej linii, etykieta zakresu, drobny opis */}
          <div className="lg:col-span-8">
            <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
              {DOCUMENT_TYPES.map((doc, i) => (
                <Reveal key={doc.number} delay={i * 90}>
                  <div className="flex items-baseline gap-4">
                    <span className="as-num text-lg text-gold-light sm:text-xl">{doc.number}</span>
                    <div>
                      <h3 className="as-numbered-title text-cream-50">{doc.title}</h3>
                      <p className="as-kicker-invert mt-2">{doc.scope}</p>
                      <p className="as-numbered-desc text-cream-200/75">{doc.desc}</p>
                    </div>
                  </div>
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
/*  03 — DLA GABINETU                                                  */
/* ================================================================== */

function SalonBand() {
  return (
    <section className="as-section relative overflow-hidden bg-cream-100">
      <GoldArc className="-top-10 right-[-8%] h-[600px] w-[820px]" flip opacity={0.4} />

      <div className="as-shell relative">
        <Reveal>
          <SectionLabel number="03">Dla gabinetu</SectionLabel>
        </Reveal>

        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <Reveal>
              <h2 className="as-display-section as-text-balance text-ink">
                Spokojna
                <br />
                kontrola.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <ul className="mt-6 max-w-[22rem]">
                {FOR_SALON.map((item) => (
                  <li key={item} className="flex gap-4 border-b border-ink/10 py-4">
                    <span aria-hidden="true" className="as-dash" />
                    <span className="as-caption max-w-none">{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={140}>
              <ArrowLink href="/kontakt" className="mt-8 w-fit">
                Zamów komplet dokumentów
              </ArrowLink>
            </Reveal>
          </div>

          {/* dwa makra brwi w jednej złotej ramce, ton „light" na kremie */}
          <Reveal delay={90} className="lg:col-span-6">
            <div className="as-photo-frame grid grid-cols-2 gap-1">
              <Figure
                image={BROWS[7]}
                alt="Zbliżenie brwi po makijażu permanentnym — jasne włoski, zielone oko"
                ratio="4 / 5"
                tone="light"
                sizes="(min-width: 1024px) 24vw, 45vw"
              />
              <Figure
                image={BROWS[14]}
                alt="Zbliżenie brwi po makijażu permanentnym — ciemne włoski, brązowe oko"
                ratio="4 / 5"
                position="50% 45%"
                tone="light"
                sizes="(min-width: 1024px) 24vw, 45vw"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  04 — KONTAKT (CTA)                                                 */
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
      secondary={{ href: '/pigmenty', label: 'Zobacz pigmenty' }}
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
