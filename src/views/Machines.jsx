'use client';

/**
 * /maszynki – „Numer 01”.
 *
 * W /Graphics nie ma packshotów maszynek (AS HERO / AS HERO 2 / AS PRINCESS),
 * kartridży ani akcesoriów, więc trasa jest w 100% typograficzna – świadoma
 * decyzja do czasu sesji packshotowej, nie brak. Zero portretów, zero makr.
 *
 * Rytm tła (Lite – same jasne tony, sąsiednie różnią się tonem):
 *   01 PageHero band (cream-100, bez zdjęcia, 3 Stat z karty AS PRINCESS)
 *   02 Katalog #katalog (cream-50) – model = wiersz pełnej szerokości,
 *      w wierszu parametry z karty produktu + link do sklepu; na telefonie
 *      parametry zwinięte w „Parametry”, od md widoczne od razu
 *   03 Parametry (cream-75) – 7 prędkości AS PRINCESS + skok i wysuw igły
 *   04 Wynajem (cream-100) – warunki ze sklepu, wniosek w dialogu (Field)
 *   05 ClosingCta (cream-90) + stopka (cream-100)
 * Każda sekcja: SectionLabel → H2 .as-display-section (mt-6) → treść.
 * Prostokątne przyciski tylko w hero (jeden), ClosingCta i formularzu;
 * w sekcjach akcje to ArrowLink (z onClick, gdy otwierają dialog).
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLink,
  ClosingCta,
  CtaButton,
  Field,
  FormNotice,
  PageHero,
  PriceRow,
  Reveal,
  RequiredLegend,
  SectionLabel,
} from '@/components/as/Primitives';
import { BRAND, LEGAL } from '@/lib/site';
import { LEGAL_COMPLETE } from '@/lib/legal';
import { cn } from '@/lib/utils';
import { enquiryMessage, sendEnquiry } from '@/lib/enquiry';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

/* ================================================================== */
/*  DANE – przepisane ze sklepu klienta (as-loveliness.eu), 29.09.2026  */
/* ================================================================== */
/*
 * Źródła (karty produktów WooCommerce):
 *   AS HERO      /produkt/as-hero-rotary-machine/ – sklep nie podaje parametrów
 *                technicznych, więc wiersz ma tylko typ i zastosowanie.
 *   AS HERO 2    /produkt/as-hero-2-next-generation-wireless-hybrid-pmu-machine/
 *                – specyfikacja 1:1 (10 500 obr./min przy 12 V, 141 g, 1 800 mAh,
 *                skok 2,2–4,2 mm, 12-miesięczna gwarancja producenta).
 *   AS PRINCESS  /produkt/as-princess-champagne-gold/, maszynka-pmu-gold/,
 *                maszynka-pmu-pink/ – trzy kolory, te same parametry i cena.
 *                Sklep podaje „poprzednią najniższą cenę” 2 999 zł, więc „ceny
 *                regularnej” 3 500 zł tu nie pokazujemy.
 *   Wynajem      /produkt/oferta-wynajmu-as-princess/ – 369 zł (300 zł netto)
 *                miesięcznie, zwrotna kaucja 500 zł, kolory Gold / Pink Gold /
 *                Champagne Gold.
 * Gwarancji AS HERO i AS PRINCESS sklep nie podaje – nie wpisujemy jej.
 */

/* 2999 → „2 999” (twarda spacja tysięcy) */
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
const zl = (n) => `${fmt(n)}\u00a0zł`;

/* Parametr w wierszu katalogu:
   `v` = liczba (nigdy nie łamie się w środku), `u` = jednostka (może zejść
   do nowej linii przy 320 px), `text` = opis zamiast liczby, `n` = dopisek,
   `span` = szerokość w siatce parametrów. */
const WIDE = 'col-span-2 xl:col-span-3';

const MACHINES_DATA = [
  {
    id: 'as-hero',
    number: '01',
    name: 'AS HERO',
    subtitle: 'Maszynka rotacyjna',
    price: 1499,
    description:
      'Urządzenie zaprojektowane przez profesjonalistów z myślą o makijażu permanentnym.',
    features: [
      'System kartridży AS: stały nacisk igły w górę i w dół, płynny i równomierny ruch',
      'Do pigmentacji brwi i ust, a także do tatuażu ciała',
    ],
    specs: [
      { label: 'Typ', text: 'Rotacyjna' },
      { label: 'Igła', text: 'Kartridże, system AS' },
      { label: 'Zastosowanie', text: 'Brwi, usta, tatuaż ciała', span: WIDE },
    ],
  },
  {
    id: 'as-hero-2',
    number: '02',
    name: 'AS HERO 2',
    subtitle: 'Hybrydowa, bezprzewodowa',
    price: 1999,
    description:
      'Hybrydowa maszynka PMU nowej generacji: wysoki moment obrotowy, minimalne wibracje, stała moc i płynny ruch igły także przy dłuższych zabiegach.',
    features: [
      'Długość skoku zmieniasz obrotem tylnej części – bez demontażu i wymiany mimośrodu',
      'Skok 2,2 / 2,6 / 3,0 / 3,4 / 3,8 / 4,2\u00a0mm: od miękkiego cieniowania po tatuaż',
      'Moment obrotowy 330\u00a0N·mm, wibracje 0,3\u00a0m/s², hałas 35–37\u00a0dB',
      'Do technik makijażu permanentnego, mikropigmentacji skóry głowy (SMP) i tatuażu',
    ],
    specs: [
      { label: 'Prędkość silnika', v: '10\u00a0500', u: 'obr./min', n: 'przy 12\u00a0V' },
      { label: 'Skok igły', v: '2,2–4,2', u: 'mm', n: '6 stopni regulacji' },
      { label: 'Waga', v: '141', u: 'g', n: 'bez baterii; z baterią 203,5\u00a0g' },
      { label: 'Bateria', v: '1\u00a0800', u: 'mAh', n: '5–7\u00a0h pracy, ładowanie 1,5–2\u00a0h' },
      { label: 'Gwarancja', v: '12', u: 'mies.', n: 'gwarancja producenta' },
    ],
  },
  {
    id: 'as-princess',
    number: '03',
    name: 'AS PRINCESS',
    subtitle: 'Bezprzewodowa',
    price: 2999,
    description:
      'Bezprzewodowa maszynka z aluminium o wadze 107\u00a0g – minimalne wibracje i cicha praca, przy której dobrze czujesz skórę.',
    features: [
      'Dwie wymienne baterie i ładowarka w zestawie; ponad 3\u00a0h pracy na jednej baterii, możliwa praca na kablu USB',
      'Skok 2,1–3,0\u00a0mm zmieniasz obrotem środkowej części korpusu – 7 stopni',
      'Wysuw igły regulowany od 0 do 3,2\u00a0mm – pod rzadsze i gęstsze pigmenty',
      'Kartridże o uniwersalnym wkręcie, także z większą liczbą igieł – do 9 Magnum',
    ],
    specs: [
      { label: 'Prędkości', v: '6\u00a0000–10\u00a0000', u: 'obr./min', n: '7 prędkości' },
      { label: 'Skok igły', v: '2,1–3,0', u: 'mm', n: '7 stopni regulacji' },
      { label: 'Waga', v: '107', u: 'g', n: 'korpus z aluminium' },
      { label: 'Wysuw igły', v: '0–3,2', u: 'mm' },
      { label: 'Zasilanie', text: '2 wymienne baterie + ładowarka', n: 'lub praca na kablu USB', span: 'col-span-2' },
      { label: 'Kolory', text: 'Champagne Gold, Gold, Pink', span: WIDE },
    ],
  },
];

const PRINCESS = MACHINES_DATA.find((m) => m.id === 'as-princess');

/* Prędkości AS PRINCESS – nazwy i obroty 1:1 z karty produktu. */
const SPEED_LEVELS = [
  { level: 1, rpm: 6000, name: 'Pikselowa' },
  { level: 2, rpm: 6500, name: 'Pudrowa' },
  { level: 3, rpm: 7000, name: 'Hybrydowa' },
  { level: 4, rpm: 7500, name: 'Liniowa' },
  { level: 5, rpm: 8000, name: 'Konturowa' },
  { level: 6, rpm: 9000, name: 'Tatuażowa' },
  { level: 7, rpm: 10000, name: 'Tatuażowa' },
];

/* 7 stopni skoku; twarde spacje: wiersz łamie się tylko po „·”, a ostatnia
   para z jednostką nie zostaje sama w nowej linii. */
const STROKE_STEPS = '2,1\u00a0· 2,2\u00a0· 2,4\u00a0· 2,55\u00a0· 2,7\u00a0· 2,9\u00a0·\u00a03,0\u00a0mm';

/* Rząd liczb w hero – wyłącznie parametry z karty AS PRINCESS w sklepie. */
const HERO_STATS = [
  { value: '7', label: 'prędkości AS\u00a0PRINCESS, od 6\u00a0000 do 10\u00a0000\u00a0obr./min' },
  { value: '2,1–3,0\u00a0mm', label: 'skok igły AS\u00a0PRINCESS, 7 stopni regulacji' },
  { value: '107\u00a0g', label: 'waga AS\u00a0PRINCESS, korpus z aluminium' },
];

const RENTAL_MONTHLY = 369;
const RENTAL_PRICE = `${zl(RENTAL_MONTHLY)}\u00a0/\u00a0mc`;
const RENTAL_DEPOSIT = zl(500);

const RENTAL_POINTS = [
  `Zwrotna kaucja ${RENTAL_DEPOSIT} – informację o wpłacie dostajesz razem z umową wynajmu`,
  'Do wyboru kolory Gold, Pink Gold i Champagne Gold',
];

const RENTAL_MATH = [
  { name: 'Zakup AS PRINCESS', price: zl(PRINCESS.price) },
  { name: 'Wynajem AS PRINCESS', note: `Plus zwrotna kaucja ${RENTAL_DEPOSIT}`, price: RENTAL_PRICE },
  { name: 'Zabiegi w miesiącu', note: 'Założenie do wyliczenia', price: '10' },
  { name: 'Koszt wynajmu na 1 zabieg', note: `${zl(RENTAL_MONTHLY)} : 10 zabiegów`, price: '36,90\u00a0zł' },
];

const RENTAL_FIELDS = [
  { id: 'name', label: 'Imię i nazwisko', placeholder: 'np. Anna Kowalska', autoComplete: 'name', required: true },
  { id: 'phone', label: 'Numer telefonu', placeholder: '+48 600 000 000', type: 'tel', autoComplete: 'tel', required: true },
  { id: 'email', label: 'Adres e-mail', placeholder: 'salon@example.com', type: 'email', autoComplete: 'email', required: true },
  { id: 'salonName', label: 'Nazwa salonu / działalności', placeholder: 'np. Studio Beauty Katowice', autoComplete: 'organization' },
];

const EMPTY_RENTAL_FORM = { name: '', phone: '', email: '', salonName: '' };

/* FormNotice renderuje się sam po uzupełnieniu LEGAL i zawiera już zdanie
   o polach wymaganych – do tego czasu legendę pokazuje RequiredLegend. */
const NOTICE_READY = LEGAL_COMPLETE;

const pad = (n) => String(n).padStart(2, '0');
const isRentable = (machine) => machine.id === PRINCESS.id;

/* ================================================================== */
/*  Lokalne klocki                                                     */
/* ================================================================== */

/* Wiersz katalogu – rozwinięcie IndexRow o parametry i drugą akcję (wynajem).
   Rozwijany opis stoi w kolumnie modelu, żeby zwinięty wiersz miał wysokość
   samych parametrów.
     < md   numerał 56 | model + „Opis i cechy” + „Parametry” (zwinięte) + cena
            i akcje – telefon widzi od razu nazwę, podtytuł, cenę i akcje.
     md     numerał | model, pod nim cena i akcje | parametry (2 kolumny).
     lg+    numerał | model | parametry (2 kol., 3 na xl) | cena + akcje.
   Parametry siedzą w jednym <details>: poniżej md działa jak akordeon, od md
   summary znika, a treść jest widoczna mimo zamkniętego <details>
   (::details-content) – bez migania przed hydracją i bez dublowania siatki.
   Przeglądarki bez ::details-content (Safari < 18.4, Firefox < 143) dostają
   otwarcie skryptem po wejściu w md. */
const MD_UP = '(min-width: 768px)';

function MachineRow({ machine, onRent, last }) {
  const specsRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia(MD_UP);
    const sync = () => {
      if (mq.matches && specsRef.current) specsRef.current.open = true;
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return (
    <article
      className={cn(
        'grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 gap-y-5 border-t border-ink/15 py-7',
        'sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-x-6',
        'md:grid-cols-[3.5rem_minmax(0,5fr)_minmax(0,7fr)] md:grid-rows-[auto_1fr] md:gap-y-6',
        'lg:grid-cols-[5rem_minmax(0,5fr)_minmax(0,6fr)_12rem] lg:grid-rows-none lg:gap-x-6 lg:gap-y-8',
        'xl:grid-cols-[6rem_minmax(0,4fr)_minmax(0,7fr)_12rem] xl:gap-x-8',
        last && 'border-b'
      )}
    >
      <span className="as-display-md leading-none text-gold-dark" aria-hidden="true">
        {machine.number}
      </span>

      <div>
        <h3 className="as-title as-text-balance text-ink">{machine.name}</h3>
        <p className="as-kicker mt-3">{machine.subtitle}</p>

        {/* Opis i cechy – zwinięte, żeby indeks czytał się jak spis modeli
            (parametry i cena na wierzchu), a treść nie znikała z widoku.
            Summary ma 44 px wysokości (cel dotykowy), tekst przy dolnej linii. */}
        <details className="group/more mt-1">
          <summary className="as-label inline-flex min-h-[44px] cursor-pointer list-none items-end gap-3 border-b border-ink/20 pb-1.5 text-ink/70 transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
            Opis i cechy
            <span
              aria-hidden="true"
              className="text-gold-deep transition-transform duration-300 group-open/more:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-5 max-w-[34rem] text-[0.9375rem] leading-[1.65] text-ink/75">
            {machine.description}
          </p>
          <ul className="mt-4 space-y-2" aria-label={`Cechy kluczowe – ${machine.name}`}>
            {machine.features.map((feat) => (
              <li key={feat} className="flex gap-4">
                <span aria-hidden="true" className="as-dash" />
                <span className="text-[0.9375rem] leading-[1.65] text-ink/75">{feat}</span>
              </li>
            ))}
          </ul>
        </details>
      </div>

      {/* Parametry – na telefonie -mt-4 dosuwa „Parametry” do „Opis i cechy”
          (ten sam odstęp co podtytuł → „Opis i cechy”). Na md prawa kolumna
          przez oba rzędy (model | parametry, pod modelem cena i akcje); 7fr,
          żeby „6 000–10 000 obr./min” mieściło się w jednej linii przy 768 px. */}
      <details
        ref={specsRef}
        className="group/specs col-start-2 -mt-4 self-start md:col-start-3 md:mt-0 md:row-span-2 md:[&::details-content]:[content-visibility:visible] lg:col-start-auto lg:row-auto"
      >
        <summary className="as-label inline-flex min-h-[44px] cursor-pointer list-none items-end gap-3 border-b border-ink/20 pb-1.5 text-ink/70 transition-colors hover:text-ink md:hidden [&::-webkit-details-marker]:hidden">
          Parametry
          <span
            aria-hidden="true"
            className="text-gold-deep transition-transform duration-300 group-open/specs:rotate-45"
          >
            +
          </span>
        </summary>
        <dl className="mt-5 grid grid-cols-2 content-start gap-x-4 gap-y-5 sm:gap-x-6 md:mt-0 xl:grid-cols-3">
          {machine.specs.map((spec) => (
            <div key={spec.label} className={spec.span}>
              <dt className="as-label text-ink/65">{spec.label}</dt>
              <dd className="mt-2 text-[0.9375rem] leading-[1.5] text-ink">
                {spec.text ?? (
                  <>
                    <span className="whitespace-nowrap">{spec.v}</span> {spec.u}
                  </>
                )}
                {spec.n && <span className="block text-ink/70">{spec.n}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </details>

      <div className="col-start-2 flex flex-col items-start gap-4 lg:col-start-auto lg:items-end lg:text-right">
        <p className="whitespace-nowrap font-display text-[1.375rem] leading-[1.2] text-ink">
          {zl(machine.price)}
        </p>
        <ArrowLink href="/kontakt" className="w-fit whitespace-nowrap">
          Zapytaj o dostępność
        </ArrowLink>
        {isRentable(machine) && (
          <ArrowLink onClick={() => onRent(machine)} className="w-fit whitespace-nowrap">
            Wynajmij {RENTAL_PRICE}
          </ArrowLink>
        )}
      </div>
    </article>
  );
}

/* ================================================================== */

export default function Machines() {
  const { toast } = useToast();
  const [selectedMachineForRental, setSelectedMachineForRental] = useState(null);
  const [rentalForm, setRentalForm] = useState(EMPTY_RENTAL_FORM);
  /* Przycisk, który otworzył dialog – po zamknięciu fokus wraca na niego. */
  const rentalTriggerRef = useRef(null);

  const openRental = (machine = PRINCESS) => {
    rentalTriggerRef.current = typeof document !== 'undefined' ? document.activeElement : null;
    setSelectedMachineForRental(machine);
  };

  // W projekcie nie ma koszyka ani backendu – wniosek idzie tą samą drogą
  // co pozostałe formularze (patrz src/lib/enquiry.js).
  const handleRentalSubmit = (e) => {
    e.preventDefault();
    const { status } = sendEnquiry({
      subject: `Wynajem maszynki${selectedMachineForRental ? ` – ${selectedMachineForRental.name}` : ''}`,
      fields: [
        ['Imię i nazwisko', rentalForm.name],
        ['Telefon', rentalForm.phone],
        ['E-mail', rentalForm.email],
        ['Salon', rentalForm.salonName],
        ['Urządzenie', selectedMachineForRental ? selectedMachineForRental.name : ''],
      ],
    });
    const msg = enquiryMessage(status);
    toast({ title: msg.title, description: msg.body });
    setSelectedMachineForRental(null);
    setRentalForm(EMPTY_RENTAL_FORM);
  };

  return (
    <>
      {/* ============================================================ */}
      {/*  01 – HERO: pas typograficzny (cream-100, bez zdjęcia)       */}
      {/* ============================================================ */}

      <PageHero
        variant="band"
        label="Urządzenia"
        number="01"
        title={'AS\u00a0HERO i\u00a0AS\u00a0PRINCESS.'}
        lead={
          'Trzy maszynki PMU: rotacyjna AS\u00a0HERO, hybrydowa AS\u00a0HERO\u00a02 i\u00a0bezprzewodowa AS\u00a0PRINCESS.'
        }
        stats={HERO_STATS}
      >
        <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
          <CtaButton href="#katalog" className="as-btn-solid">
            Przeglądaj modele
          </CtaButton>
          <ArrowLink onClick={() => openRental()} className="w-fit">
            Wynajmij {RENTAL_PRICE}
          </ArrowLink>
        </div>
      </PageHero>

      {/* ============================================================ */}
      {/*  02 – KATALOG (cream-50): model = wiersz pełnej szerokości    */}
      {/* ============================================================ */}

      <section id="katalog" className="as-section scroll-mt-24 bg-cream-50">
        <div className="as-shell">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-8">
            <Reveal className="lg:col-span-7">
              <SectionLabel number="02">Katalog</SectionLabel>
              <h2 className="as-display-section as-text-balance mt-6 text-ink">Katalog urządzeń PMU.</h2>
            </Reveal>
            <Reveal delay={80} className="lg:col-span-5">
              <p className="as-body">
                Ceny i parametry według kart produktów AS COMPANY. Napisz, który model Cię
                interesuje – potwierdzimy dostępność, kolor i sposób dostawy.
              </p>
              <ArrowLink href="/kontakt?temat=produkty" className="mt-6 w-fit">
                Zapytaj o zakup
              </ArrowLink>
            </Reveal>
          </div>

          <div className="mt-12">
            {MACHINES_DATA.map((machine, i) => (
              <Reveal key={machine.id} delay={i === 0 ? 0 : 60}>
                <MachineRow machine={machine} onRent={openRental} last={i === MACHINES_DATA.length - 1} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  03 – PARAMETRY AS PRINCESS (cream-75)                        */}
      {/* ============================================================ */}

      <section className="as-section bg-cream-75 text-ink">
        <div className="as-shell">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-8">
            <Reveal className="lg:col-span-7">
              <SectionLabel number="03">
                Prędkości
              </SectionLabel>
              <h2 className="as-display-section as-text-balance mt-6 text-ink">
                Siedem prędkości,
                <br />
                siedem stopni skoku.
              </h2>
            </Reveal>
            <Reveal delay={80} className="lg:col-span-5">
              <p className="as-body">
                AS&nbsp;PRINCESS według karty produktu: od prędkości pikselowej (6&nbsp;000&nbsp;obr./min)
                do tatuażowej (10&nbsp;000&nbsp;obr./min).
              </p>
            </Reveal>
          </div>

          {/* – siedem prędkości (nazwy i obroty 1:1 ze sklepu) – */}
          <Reveal delay={60} className="mt-10">
            <ol
              aria-label="Prędkości AS PRINCESS"
              className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7"
            >
              {SPEED_LEVELS.map((speed) => (
                <li
                  key={speed.level}
                  className="flex flex-col items-start gap-2 border border-ink/15 px-4 py-4 last:col-span-2 sm:px-5 lg:last:col-span-1"
                >
                  <span className="as-num">{pad(speed.level)}</span>
                  <span className="text-base text-ink">{speed.name}</span>
                  <span className="as-caption">
                    <span className="whitespace-nowrap">{fmt(speed.rpm)}</span> obr./min
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>

          {/* – skok i wysuw igły – */}
          <div className="mt-10 grid gap-6 lg:grid-cols-12 lg:gap-8">
            <p className="as-caption lg:col-span-5">
              Nazwy prędkości to ogólne wytyczne – ostateczny dobór prędkości, skoku i&nbsp;igły zależy
              od techniki i&nbsp;skóry.
            </p>
            <div className="lg:col-span-6 lg:col-start-7">
              <PriceRow
                name="Skok igły"
                note={`7 stopni: ${STROKE_STEPS}`}
                price={'2,1–3,0\u00a0mm'}
              />
              <PriceRow
                name="Wysuw igły"
                note="Pod rzadsze i gęstsze pigmenty"
                price={'0–3,2\u00a0mm'}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  04 – WYNAJEM (cream-100): warunki ze sklepu + wyliczenie      */}
      {/* ============================================================ */}

      <section id="wynajem" className="as-section scroll-mt-24 bg-cream-100">
        <div className="as-shell">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">
              <Reveal>
                <SectionLabel number="04">Wynajem</SectionLabel>
                <h2 className="as-display-section as-text-balance mt-6 text-ink">
                  Wynajem maszynki
                  <br />
                  AS&nbsp;PRINCESS.
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <p className="as-body mt-6">
                  Maszynkę <span className="whitespace-nowrap text-ink">AS PRINCESS</span> wynajmiesz
                  w&nbsp;abonamencie miesięcznym:{' '}
                  <span className="text-ink">{zl(RENTAL_MONTHLY)} brutto (300&nbsp;zł netto)</span>.
                  Umowę wynajmu wysyłamy po złożeniu zamówienia w&nbsp;sklepie.
                </p>
                <ul className="mt-6 space-y-2.5">
                  {RENTAL_POINTS.map((point) => (
                    <li key={point} className="flex gap-4">
                      <span aria-hidden="true" className="as-dash" />
                      <span className="text-[0.9375rem] leading-[1.65] text-ink/80">{point}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-[0.9375rem] leading-[1.65] text-ink/80">
                  Pozostałe warunki określa umowa wynajmu – zapytaj o nie przed zamówieniem.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
                  <ArrowLink onClick={() => openRental()} className="w-fit">
                    Zapytaj o warunki wynajmu
                  </ArrowLink>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 lg:pt-10">
              <Reveal delay={80}>
                <h3 className="as-title text-ink">Przykładowe wyliczenie</h3>
                <div className="mt-6">
                  {RENTAL_MATH.map((row) => (
                    <PriceRow key={row.name} name={row.name} note={row.note} price={row.price} />
                  ))}
                </div>
                <p className="as-caption mt-5 max-w-[30rem]">
                  Wyliczenie poglądowe przy 10 zabiegach w&nbsp;miesiącu; zwrotnej kaucji nie
                  wliczamy. Ceny według sklepu AS LOVELINESS.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  05 – KONTAKT (cream-90; wspólny pas zamykający)              */}
      {/* ============================================================ */}

      <ClosingCta
        number="05"
        label="Kontakt"
        title="Przetestuj maszynę"
        titleAccent="na żywo."
        lead={`Maszynę AS\u00a0PRINCESS przetestujesz na miejscu podczas szkolenia w\u00a0${BRAND.academy}. Napisz, jeśli chcesz porównać modele przed zakupem.`}
        primary={{ href: '/kontakt', label: 'Zapytaj o maszynkę' }}
        secondary={{ href: '/szkolenia', label: 'Zapytaj o termin' }}
      />

      {/* ============================================================ */}
      {/*  Formularz wynajmu                                           */}
      {/* ============================================================ */}

      <Dialog
        open={!!selectedMachineForRental}
        onOpenChange={(open) => {
          if (!open) setSelectedMachineForRental(null);
        }}
      >
        <DialogContent
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            rentalTriggerRef.current?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>Zapytanie o wynajem</DialogTitle>
            <DialogDescription>
              {selectedMachineForRental?.name ?? PRINCESS.name}: {RENTAL_PRICE}, zwrotna kaucja{' '}
              {RENTAL_DEPOSIT}. Zostaw kontakt – odpowiemy z&nbsp;warunkami umowy.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRentalSubmit} className="mt-8">
            <div className="space-y-6">
              {RENTAL_FIELDS.map((field) => (
                <Field
                  key={field.id}
                  as="input"
                  id={`rental-${field.id}`}
                  name={field.id}
                  label={field.label}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  required={field.required}
                  placeholder={field.placeholder}
                  value={rentalForm[field.id]}
                  onChange={(e) => setRentalForm({ ...rentalForm, [field.id]: e.target.value })}
                />
              ))}
            </div>

            <DialogFooter>
              <button type="submit" className="as-btn-solid">
                Wyślij zapytanie
              </button>
              <button
                type="button"
                onClick={() => setSelectedMachineForRental(null)}
                className="as-btn-ghost"
              >
                Anuluj
              </button>
            </DialogFooter>
            <FormNotice className="mt-6" />
            {!NOTICE_READY && <RequiredLegend className="mt-6" />}
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
