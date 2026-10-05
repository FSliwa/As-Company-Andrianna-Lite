'use client';

/**
 * Ścieżka zabiegowa – „Numer 01".
 *
 * Strona nie wymyśla pakietów ani rabatów. Pokazuje realną kolejność wizyt
 * i koszt każdego kroku – wyłącznie ceny z cennika w src/lib/site.js
 * (PRICING_PMU, PRICING_REFRESH), pobierane po nazwie pozycji, nie wpisywane
 * ręcznie. Jeśli powstaną prawdziwe pakiety z własnymi cenami, dopisz je do
 * site.js i podepnij tutaj.
 *
 * Pełny cennik (PMU / Refresh / Usuwanie) żyje WYŁĄCZNIE na /uslugi#cennik –
 * tu są tylko linki, bez duplikatu tabel.
 *
 * D6 (Z13/Z15): „konsultacja” jako osobny krok nie ma źródła (brief zna tylko
 * rysunek wstępny dopasowany do architektury twarzy – część zabiegu), więc
 * ścieżka ma trzy kroki: zabieg → korekta (w razie potrzeby, od miesiąca do
 * 3 miesięcy – brief) → odświeżenie (raz na 1–3 lata – brief). Z12: bez tezy
 * „to nie jedna wizyta” – korekta najczęściej nie jest obowiązkowa (FAQ briefu).
 * D5: przy cenie odświeżenia warunek z grafiki („dla klientek, którym
 * wykonałyśmy makijaż permanentny”), nie „stałe klientki”.
 * Sama podstrona nie ma odpowiednika w briefie – pytanie do klientki (Z13).
 *
 * Rytm tła: 01 hero band (espresso) → 02 kroki (cream-50) → 03 Statement
 * (portret ROLES.statementPackages, espresso-900) → 04 cennik (cream-100,
 * jasny oddech – Statement nie może stykać się z ClosingCta) → 05 ClosingCta
 * + stopka (espresso-900, jeden blok).
 * Kroki 02 – wzorzec numerowanych pozycji serwisu: numer .as-num obok tytułu
 * .as-numbered-title, pod nim kicker „kiedy”, opis, cena Bodoni 22 px (na telefonie
 * w wierszu numeru – przy nazwie kroku, od sm pod opisem).
 * Statement bez kursywnego akcentu – kursywa H2 zostaje w hero i pasie zamykającym.
 */

import React from 'react';
import Link from '@/components/as/LocaleLink';
import { ArrowLink, ClosingCta, PageHero, Reveal, SectionLabel, Statement } from '@/components/as/Primitives';
import { BOOKING_URL, FOUNDER, PRICING_PMU, PRICING_REFRESH } from '@/lib/site';
import { ROLES } from '@/lib/roles';
import { cn, nbspShort } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Ceny – wyłącznie z cennika (site.js); PMU po stałym `id` (D2 zmienia */
/*  tylko nazwy widoczne), refresh po nazwie pozycji                    */
/* ------------------------------------------------------------------ */

const pick = (list, name) => list.items.find((item) => item.name === name) || { name, price: '' };
const pickId = (list, id) => list.items.find((item) => item.id === id) || { id, name: '', price: '' };

/** Twarda spacja przed „zł” – cena nie łamie się na końcu wiersza. */
const zl = (price) => String(price || '').replace(/\s+zł$/, '\u00a0zł');

const SNB = pickId(PRICING_PMU, 'super-natural-brows');
const EYES = pickId(PRICING_PMU, 'perfect-eyeliners'); // D2: „Perfect Eyes” (dawniej „Perfect Eyeliners”)
const CORRECTION = pickId(PRICING_PMU, 'korekta');
const REFRESH_18M = pick(PRICING_REFRESH, 'Odświeżenie do 1,5 roku');
const REFRESH_3Y = pick(PRICING_REFRESH, 'Odświeżenie do 3 lat');
const REFRESH_AFTER_3Y = pick(PRICING_REFRESH, 'Odświeżenie po 3 latach');

/** Zabiegi w tej samej cenie co Super Natural Brows (dziś: SNB, Perfect Brows, Perfect Lips). */
const SAME_PRICE_TREATMENTS = PRICING_PMU.items
  .filter((item) => item.price === SNB.price && item.id !== 'korekta')
  .map((item) => item.name);

const joinOr = (names) =>
  names.length > 1 ? `${names.slice(0, -1).join(', ')} lub ${names[names.length - 1]}` : names[0];

/* Warunek z grafiki cennika odświeżenia (D5), małą literą do wtrąceń. */
const REFRESH_CONDITION = PRICING_REFRESH.condition.replace(/^D/, 'd');

/* Rząd Stat w hero – wartości z cennika. Podpisy: 1700 zł to zabieg brwi lub ust
   (Perfect Eyes kosztuje 1500 zł – krok 01), korekta z terminem z briefu (D5),
   odświeżenie z warunkiem z grafiki (D5). Podpis odświeżenia jest długi (6 linii
   w kolumnie 1/3 przy 390 px), więc poniżej sm liczby stoją listą „wartość | podpis”
   (PageHero statsLayout="list"). */
const HERO_STATS = [
  { value: zl(SNB.price), label: 'zabieg brwi lub ust' },
  { value: zl(CORRECTION.price), label: 'korekta po 1–3 miesiącach' },
  { value: zl(REFRESH_18M.price), label: `${REFRESH_18M.name.toLowerCase()}, ${REFRESH_CONDITION}` },
];

/** Kolejne kroki – cena wprost z cennika. */
const PATH = [
  {
    number: '01',
    title: 'Zabieg',
    when: 'Dzień zero',
    price: zl(SNB.price),
    /* rysunek wstępny – brief (FAQ): „Bez niego nie ruszymy” */
    desc: `Zaczynamy od rysunku wstępnego dopasowanego do architektury twarzy. ${joinOr(SAME_PRICE_TREATMENTS)}; ${EYES.name} – ${zl(EYES.price)}.`,
  },
  {
    number: '02',
    title: 'Korekta',
    /* D5: „Robi się po miesiącu do 3 od pierwotnego zabiegu” (brief) */
    when: 'Po 1–3 miesiącach',
    price: zl(CORRECTION.price),
    /* brief: po co korekta; grafika cennika: kiedy obowiązkowa */
    desc: 'W razie potrzeby lub na życzenie klientki – by uzupełnić ubytki albo wzmocnić efekt. Obowiązkowa przy skórze tłustej, porowatej, z resztkami starego makijażu permanentnego oraz po usuwaniu.',
  },
  {
    number: '03',
    title: 'Odświeżenie',
    /* Z18: „kiedy” = rytm z briefu („raz na 1–3 lata”); progi cenowe z grafiki – w opisie */
    when: 'Raz na 1–3 lata',
    price: `od\u00a0${zl(REFRESH_18M.price)}`,
    desc: `${PRICING_REFRESH.condition}. Do 1,5 roku – ${zl(REFRESH_18M.price)}, do 3 lat – ${zl(REFRESH_3Y.price)}, po 3 latach – ${zl(REFRESH_AFTER_3Y.price)}, niezależnie od strefy pigmentacji.`,
  },
];

/* ================================================================== */
/*  01 – HERO (band, espresso, bez zdjęcia)                            */
/* ================================================================== */

function Hero() {
  return (
    <PageHero
      variant="band"
      number="01"
      label="Ścieżka zabiegowa"
      title="Od zabiegu"
      /* twarda spacja: akcent nie rozpada się na „do” / „odświeżenia.” (przy 280 px ma
         ok. 218 px w łamie 240 px) */
      titleAccent={'do\u00a0odświeżenia.'}
      /* Z12: bez „to nie jedna wizyta, tylko kilka kroków” – terminy z briefu. Zakresy
         w nowrap (jak frazy z zakresami w About.jsx): bez „1–” / „3 lata.” przy 600 px
         i bez samotnego „lata.” od 667 px. */
      lead={
        <>
          Zabieg, w&nbsp;razie potrzeby korekta po <span className="whitespace-nowrap">1–3 miesiącach</span>{' '}
          i&nbsp;odświeżenie raz na <span className="whitespace-nowrap">1–3 lata</span>.
        </>
      }
      stats={HERO_STATS}
      statsLayout="list"
    >
      <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
        <Link href={BOOKING_URL} className="as-btn-invert">
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
/*  02 – TRZY KROKI (cream-50)                                         */
/* ================================================================== */

function StepsBand() {
  return (
    <section className="as-section bg-cream-50">
      <div className="as-shell">
        <Reveal className="max-w-3xl">
          <SectionLabel number="02">Krok po kroku</SectionLabel>
          <h2 className="as-display-section as-text-balance mt-6 text-ink">
            Trzy kroki, każdy w{'\u00a0'}swoim czasie.
          </h2>
        </Reveal>

        {/* trzy komórki redakcyjne: hairline u góry, numer + tytuł (+ cena na telefonie),
            kiedy, opis, cena (od sm); sm: 2 + 1 (ostatnia na całą szerokość łamu),
            lg: trzy kolumny. Cena w wierszu numeru tylko w 360–639 px – w węższych
            kolumnach (sm–lg) tytuł obok ceny by się nie zmieścił, a poniżej 360 px
            wiersz „03 Odświeżenie od 850 zł” (259 px) jest szerszy niż łam (240 px), więc
            cena stoi pod opisem jak od sm. grid-cols-1 = minmax(0,1fr): kolumna nie rośnie
            ponad łam do min-content wiersza. */}
        <ol className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {PATH.map((step, i) => (
            <Reveal
              as="li"
              key={step.number}
              delay={i * 80}
              className={cn(
                'as-cell flex flex-col',
                i === PATH.length - 1 && PATH.length % 2 === 1 && 'sm:col-span-2 lg:col-span-1'
              )}
            >
              <div className="flex items-baseline gap-3">
                <span className="as-num">{step.number}</span>
                <h3 className="as-numbered-title flex-1 text-ink">{step.title}</h3>
                {step.price && (
                  <p className="whitespace-nowrap font-display text-[1.375rem] leading-none text-ink max-[359px]:hidden sm:hidden">
                    {step.price}
                  </p>
                )}
              </div>
              <p className="as-kicker mt-3">{step.when}</p>
              <p className="as-numbered-desc mt-3 flex-1 text-mocha">{nbspShort(step.desc)}</p>
              {step.price && (
                <p className="mt-5 hidden font-display text-[1.375rem] leading-none text-ink max-[359px]:block sm:block">
                  {step.price}
                </p>
              )}
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  03 – STATEMENT (moment strony: portret + jedno zdanie z leadu)     */
/* ================================================================== */

function StatementBand() {
  const { image, position } = ROLES.statementPackages;
  return (
    <Statement
      image={image}
      position={position}
      alt={`${FOUNDER.name} – portret z sesji wizerunkowej marki`}
      number="03"
      label="Rozłożone w czasie"
      /* Z12: zamiast „Nie jedna wizyta, tylko kilka kroków” – rytm z briefu (odświeżenie raz na 1–3 lata).
         Bez titleAccent: kursywa H2 zostaje w hero i pasie zamykającym (jedna fraza na pas). */
      title="Zabieg dziś, odświeżenie za 1–3 lata."
    />
  );
}

/* ================================================================== */
/*  04 – CENNIK (cream-100, sam link – tabele żyją na /uslugi#cennik)  */
/* ================================================================== */

function PricingLinkBand() {
  return (
    <section className="as-section bg-cream-100">
      <div className="as-shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-8">
          <Reveal className="lg:col-span-7">
            <SectionLabel number="04">Cennik</SectionLabel>
            <h2 className="as-display-section as-text-balance mt-6 text-ink">Wszystkie ceny w{'\u00a0'}jednym miejscu.</h2>
            <p className="as-body mt-6 max-w-xl">
              Makijaż permanentny, korekta, odświeżenie i{'\u00a0'}usuwanie – pełny cennik jest na stronie zabiegów.
            </p>
          </Reveal>

          <Reveal delay={80} className="lg:col-span-4 lg:col-start-9 lg:justify-self-end">
            <ArrowLink href="/uslugi#cennik" className="w-fit">
              Zobacz cennik
            </ArrowLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  05 – PIERWSZY KROK (ClosingCta, bez zdjęć)                         */
/* ================================================================== */

function ClosingBand() {
  return (
    <ClosingCta
      number="05"
      label="Kontakt"
      title="Pierwszy krok:"
      /* D6 (Z15): zamiast „konsultacji” – rysunek wstępny (brief, FAQ) */
      titleAccent="rysunek wstępny."
      lead="Dopasowujemy go do architektury twarzy i Twoich uwag – bez niego nie zaczynamy."
      primary={{ href: BOOKING_URL, label: 'Umów wizytę' }}
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
      <StatementBand />
      <PricingLinkBand />
      <ClosingBand />
    </>
  );
}
