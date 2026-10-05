'use client';

/**
 * /maszynki – „Numer 01”.
 *
 * Jedna maszynka: AS PRINCESS (klientka sprzedaje tylko ten model, 30.09.2026).
 * Zdjęcia: dwa packshoty z 29.09.2026 (PRODUCTS w media.js) – AS PRINCESS Gold
 * i Pink, 1080×1080 na białym tle, bez gradingu. Stoją tylko w karcie modelu (02),
 * na kremie z mix-blend-multiply. Trzeci kolor (Champagne Gold) nie ma zdjęcia –
 * żadnego z dwóch plików nie podpisujemy tą nazwą, a pod zdjęciami stoi zawsze
 * widoczna adnotacja „Również w kolorze Champagne Gold (bez zdjęcia).” (nagłówek
 * mówi o trzech kolorach, a na telefonie parametr „Kolory” jest zwinięty).
 * Packshoty kartridży Satellite i lamp pierścieniowych z /Graphics pipeline pomija
 * (NEW_SKIP w scripts/przygotuj-grafiki.py), więc ta trasa ich nie pokazuje.
 * Zero portretów, zero makr.
 * Hero zostaje typograficzne: na espresso białe tło packshotu nie da się wtopić
 * (multiply ściemnia cały korpus), a wersji z przezroczystym tłem pipeline nie ma.
 *
 * Rytm tła (max 2 ciemne pasy, nigdy dwa ciemne obok siebie):
 *   01 PageHero band (espresso, bez zdjęcia, 3 Stat z karty AS PRINCESS)
 *   02 Model #katalog (cream-50) – karta AS PRINCESS jako wiersz pełnej
 *      szerokości: packshoty Gold i Pink z podpisami kolorów i adnotacją
 *      o Champagne Gold bez zdjęcia, parametry z karty produktu + „Zapytaj
 *      o dostępność” (/kontakt?temat=produkty; bez linków do sklepu – prośba
 *      klientki); na telefonie opis i parametry pod JEDNYM przyciskiem „Opis
 *      i parametry” (wzorzec MobileMore), od md widoczne od razu
 *   03 Parametry (espresso) – 7 prędkości AS PRINCESS (wiersze z linią u góry,
 *      bez ramek) + skok i wysuw igły
 *   04 Wynajem (cream-100) – warunki z karty wynajmu, wniosek w dialogu (Field);
 *      po wysłaniu potwierdzenie W DIALOGU (jak zapytanie o termin na /szkolenia),
 *      bez komunikatu nad stroną
 *   05 ClosingCta (espresso, jeden blok ze stopką)
 * Każda sekcja: SectionLabel → H2 .as-display-section (mt-6) → treść.
 * Prostokątne przyciski tylko w hero (jeden), ClosingCta i formularzu;
 * w sekcjach akcje to ArrowLink (z onClick, gdy otwierają dialog).
 */

import React, { useRef, useState } from 'react';
import {
  ArrowLink,
  ClosingCta,
  CtaButton,
  Field,
  Figure,
  FormNotice,
  MobileMore,
  PageHero,
  PriceRow,
  Reveal,
  RequiredLegend,
  SectionLabel,
} from '@/components/as/Primitives';
import { BRAND, CONTACT } from '@/lib/site';
import { PRODUCTS } from '@/lib/media';
import { LEGAL_PUBLIC } from '@/lib/legal';
import { cn, nbspShort } from '@/lib/utils';
import { enquiryMessage, sendEnquiry } from '@/lib/enquiry';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

/* ================================================================== */
/*  DANE – z karty produktu w dawnym sklepie, 29.09.2026               */
/* ================================================================== */
/*
 * Źródła (karty produktów):
 *   AS PRINCESS  karty trzech kolorów (Champagne Gold, Gold, Pink) – te same
 *                parametry i cena. Karta podaje „poprzednią najniższą cenę”
 *                2 999 zł, więc „ceny regularnej” 3 500 zł tu nie pokazujemy.
 *   Wynajem      karta wynajmu AS PRINCESS – 369 zł (300 zł netto) miesięcznie,
 *                zwrotna kaucja 500 zł, kolory Gold / Pink Gold / Champagne Gold.
 *                Warunki z dawnego sklepu – do potwierdzenia przez klientkę.
 * Gwarancji AS PRINCESS karta produktu nie podaje – nie wpisujemy jej.
 */

/* 2999 → „2 999” (twarda spacja tysięcy) */
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
const zl = (n) => `${fmt(n)}\u00a0zł`;

/* Parametr w wierszu karty:
   `v` = liczba (nigdy nie łamie się w środku), `u` = jednostka (może zejść
   do nowej linii przy 320 px), `text` = opis zamiast liczby, `n` = dopisek,
   `span` = szerokość w siatce parametrów. */
const WIDE = 'col-span-2 xl:col-span-3';

/* Kolory z kart produktu – parametr „Kolory” i adnotacja pod packshotami
   (kolory bez zdjęcia) biorą je z jednej listy. */
const PRINCESS_COLORS = ['Champagne Gold', 'Gold', 'Pink'];

const PRINCESS = {
  id: 'as-princess',
  number: '01',
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
    { label: 'Kolory', text: PRINCESS_COLORS.join(', '), span: WIDE },
  ],
  colors: PRINCESS_COLORS,
  /* Packshoty z 29.09.2026 – podpis = kolor widoczny na zdjęciu (złoty korpus = Gold,
     różowy = Pink); Champagne Gold bez zdjęcia – MachinePhotos dopisuje go
     w adnotacji pod zdjęciami. */
  photos: [
    { image: PRODUCTS['product-as-princess-gold'], color: 'Gold' },
    { image: PRODUCTS['product-as-princess-pink'], color: 'Pink' },
  ].filter((p) => p.image),
};

/* Prędkości AS PRINCESS – nazwy i obroty 1:1 z listy na stronie maszynki w dawnym
   sklepie (sprawdzone 29.09.2026: „1 – pikselowa 6000 … 7 – tatuażowa 10000”).
   Raport INNE-14: karty produktów mają zdanie
   „Od pikselowej prędkości 1 (6000RPM) do liniowej 7 (10000RPM)”, sprzeczne z tą listą
   (7 = tatuażowa, „liniowa” = 4). D10: zostaje lista (pełne źródło), rozbieżność
   zgłoszona klientce do potwierdzenia. */
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

/* Rząd liczb w hero – wyłącznie parametry z karty AS PRINCESS (nazwa stoi w H1,
   więc podpisy jej nie powtarzają). */
const HERO_STATS = [
  { value: '7', label: 'prędkości, od 6\u00a0000 do 10\u00a0000\u00a0obr./min' },
  { value: '2,1–3,0\u00a0mm', label: 'skok igły, 7 stopni regulacji' },
  { value: '107\u00a0g', label: 'waga, korpus z\u00a0aluminium' },
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
  /* „np.” jak w pozostałych polach – puste pole nie wygląda na wypełnione */
  { id: 'phone', label: 'Numer telefonu', placeholder: 'np. +48 600 000 000', type: 'tel', autoComplete: 'tel', required: true },
  { id: 'email', label: 'Adres e-mail', placeholder: 'np. salon@example.com', type: 'email', autoComplete: 'email', required: true },
  { id: 'salonName', label: 'Nazwa salonu / działalności', placeholder: 'np. Studio Beauty Katowice', autoComplete: 'organization' },
];

const EMPTY_RENTAL_FORM = { name: '', phone: '', email: '', salonName: '' };

/* FormNotice renderuje się sam, gdy dokumenty są publiczne (LEGAL_PUBLIC), i zawiera
   już zdanie o polach wymaganych – bez niego legendę pokazuje RequiredLegend.
   Wysyłkę wniosku bez adresu e-mail blokuje sam sendEnquiry (ENQUIRY_LIVE). */
const NOTICE_READY = LEGAL_PUBLIC;

const pad = (n) => String(n).padStart(2, '0');

/* ================================================================== */
/*  Lokalne klocki                                                     */
/* ================================================================== */

/* Packshoty kolorów obok siebie, pod każdym linia i nazwa koloru, a pod siatką
   adnotacja o kolorach z karty bez zdjęcia (dziś Champagne Gold) – zawsze widoczna,
   także na telefonie, bo nagłówek sekcji mówi o trzech kolorach, a parametr „Kolory”
   stoi tam w zwiniętym panelu. Bez „zdjęcie wkrótce” – tego nikt nie obiecał.
   Plik jest kwadratem z wąskim, pionowym korpusem pośrodku (ok. 1/9 szerokości kadru),
   więc kadr ma stałą WYSOKOŚĆ, a nie proporcję: przy kadrze węższym niż wysoki
   object-cover skaluje plik do wysokości i przycina tylko białe boki – korpus zostaje
   cały na każdej szerokości. Wysokość ogranicza też wysokość okna: poniżej md 62svh,
   od md 72svh – w telefonie w poziomie (568 × 320, 667 × 375) maszynka z podpisem
   mieści się w jednym ekranie pod nagłówkiem; telefony w pionie bez zmian (62svh
   ≥ 18 rem od 465 px wysokości).
   Białe tło przechodzi w krem przez mix-blend-multiply. Tło kadru = tło sekcji
   (cream-50, zamiast cream-200 z .as-media): Reveal zostawia transform, czyli własny
   kontekst mieszania – bez tła kadru multiply nie miałby z czym się zmieszać i biel
   by została. Bez ramki, bez tonu (wierna barwa korpusu), bez powiększenia. */
function MachinePhotos({ machine, className }) {
  if (!machine.photos?.length) return null;
  const withoutPhoto = (machine.colors ?? []).filter((c) => !machine.photos.some((p) => p.color === c));
  /* twarde spacje w nazwach kolorów i po „(bez” – „Champagne Gold” i „(bez zdjęcia)”
     nie łamią się w środku */
  const list = new Intl.ListFormat('pl', { type: 'conjunction' }).format(
    withoutPhoto.map((c) => c.replace(/ /g, '\u00a0'))
  );
  return (
    <div className={cn('max-w-[22rem]', className)}>
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {machine.photos.map((photo) => (
          <figure key={photo.color} className="min-w-0">
            <div className="relative h-[min(18rem,62svh)] sm:h-[min(20rem,62svh)] md:h-[min(26rem,72svh)] lg:h-[min(28rem,72svh)]">
              <Figure
                fill
                image={photo.image}
                alt={`Maszynka ${machine.name} w kolorze ${photo.color}`}
                zoom={false}
                sizes="(min-width: 1024px) 28rem, (min-width: 768px) 26rem, (min-width: 640px) 20rem, 18rem"
                className="[&_.as-media]:bg-cream-50"
                imgClassName="mix-blend-multiply"
              />
            </div>
            <figcaption className="as-kicker mt-3 border-t border-ink/15 pt-3 text-center">
              {photo.color}
            </figcaption>
          </figure>
        ))}
      </div>
      {withoutPhoto.length > 0 && (
        <p className="as-caption as-text-balance mx-auto mt-4 text-center">
          {withoutPhoto.length === 1
            ? `Również w kolorze ${list} (bez\u00a0zdjęcia).`
            : `Również w kolorach ${list} (bez\u00a0zdjęć).`}
        </p>
      )}
    </div>
  );
}

/* Karta modelu – rozwinięcie IndexRow o zdjęcia, opis, parametry i drugą akcję
   (wynajem). Jeden model na stronie, więc od md opis i cechy stoją od razu (bez
   przełącznika – ten miał sens w spisie kilku modeli), a karta układa się jak
   strona produktu: model i zdjęcia po lewej, opis, dane i zakup po prawej.
     < md   numerał 56 | model, packshoty Gold / Pink z adnotacją o Champagne
            Gold, JEDEN przycisk „Opis i parametry” (MobileMore – ten sam wzorzec
            „Więcej” co na innych trasach) + cena i akcje; po rozwinięciu opis,
            cechy i parametry.
     md+    numerał | model, packshoty i adnotacja (przez oba rzędy) | opis,
            cechy, linia i parametry (2 kol., 3 na xl), pod nimi linia i cena
            + akcje.
   Stan `open` działa tylko poniżej md (klasy max-md:hidden). Bez <details>
   i bez skryptu z matchMedia – SSR i przeglądarka renderują to samo. */
function MachineRow({ machine, onRent }) {
  const [open, setOpen] = useState(false);
  const detailsId = `${machine.id}-opis-parametry`;

  return (
    <article
      className={cn(
        'grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 gap-y-5 border-y border-ink/15 py-7',
        'sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-x-6',
        'md:grid-cols-[3.5rem_minmax(0,5fr)_minmax(0,7fr)] md:grid-rows-[auto_1fr] md:gap-y-8',
        'lg:grid-cols-[5rem_minmax(0,5fr)_minmax(0,6fr)] lg:gap-x-8',
        'xl:grid-cols-[6rem_minmax(0,5fr)_minmax(0,6fr)]'
      )}
    >
      <span className="as-display-md leading-none text-gold-dark" aria-hidden="true">
        {machine.number}
      </span>

      <div className="md:row-span-2">
        <h3 className="as-title as-text-balance text-ink">{machine.name}</h3>
        <p className="as-kicker mt-3">{machine.subtitle}</p>

        <MachinePhotos machine={machine} className="mt-4 md:mt-6" />

        {/* telefon: jeden przełącznik dla opisu i parametrów */}
        <MobileMore
          open={open}
          onToggle={() => setOpen((o) => !o)}
          controls={detailsId}
          label="Opis i parametry"
          openLabel="Zwiń opis i parametry"
          className="mt-6"
        />
      </div>

      {/* Opis, cechy i parametry – poniżej md pod przyciskiem (po rozwinięciu), od md
          prawa kolumna (pierwszy rząd, pod nimi cena i akcje); 7fr, żeby
          „6 000–10 000 obr./min” mieściło się w jednej linii przy 768 px.
          Etykiety dt ink/65 (5,2:1), dopiski ink/70 (6,1:1) – AA dla 11/15 px. */}
      <div
        id={detailsId}
        className={cn('col-start-2 self-start md:col-start-3 md:row-start-1', !open && 'max-md:hidden')}
      >
        <p className="max-w-[34rem] text-[0.9375rem] leading-[1.65] text-ink/75">{nbspShort(machine.description)}</p>
        <ul className="mt-4 space-y-2" aria-label={`Cechy kluczowe – ${machine.name}`}>
          {machine.features.map((feat) => (
            <li key={feat} className="flex gap-4">
              <span aria-hidden="true" className="as-dash" />
              <span className="text-[0.9375rem] leading-[1.65] text-ink/75">{nbspShort(feat)}</span>
            </li>
          ))}
        </ul>

        <h4 className="sr-only">Parametry – {machine.name}</h4>
        <dl className="mt-6 grid grid-cols-2 content-start gap-x-4 gap-y-5 border-t border-ink/15 pt-6 sm:gap-x-6 md:mt-8 xl:grid-cols-3">
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
      </div>

      {/* cena i akcje: odstęp 20 px między linkami – pola dotyku (::before) nie nachodzą;
          od ~390 px cena i pierwszy link w jednym rzędzie; od md pod parametrami,
          oddzielone linią (jak wiersz cennika). Poniżej 360 px pod numerałem na całej
          szerokości – w kolumnie 168 px linki (nowrap) wychodziły w margines. */}
      <div className="col-start-2 flex flex-wrap items-baseline gap-x-6 gap-y-5 max-[359px]:col-span-2 max-[359px]:col-start-1 md:col-start-3 md:row-start-2 md:self-start md:border-t md:border-ink/15 md:pt-6 lg:gap-x-8">
        <p className="whitespace-nowrap font-display text-[1.375rem] leading-[1.2] text-ink">{zl(machine.price)}</p>
        <ArrowLink href="/kontakt?temat=produkty" className="w-fit whitespace-nowrap">
          Zapytaj o dostępność
        </ArrowLink>
        <ArrowLink onClick={onRent} className="w-fit whitespace-nowrap">
          Wynajmij {RENTAL_PRICE}
        </ArrowLink>
      </div>
    </article>
  );
}

/* ================================================================== */

export default function Machines() {
  /* Jeden model do wynajmu (AS PRINCESS), więc dialog to zwykłe otwarte/zamknięte. */
  const [rentalOpen, setRentalOpen] = useState(false);
  const [rentalForm, setRentalForm] = useState(EMPTY_RENTAL_FORM);
  /* Po wysłaniu: status z sendEnquiry (null = formularz). Potwierdzenie zostaje
     w dialogu – komunikat nad stroną zasłaniał na telefonie nagłówek i menu. */
  const [rentalSent, setRentalSent] = useState(null);
  /* Przycisk, który otworzył dialog – po zamknięciu fokus wraca na niego. */
  const rentalTriggerRef = useRef(null);
  const rentalContentRef = useRef(null);
  const rentalTitleRef = useRef(null);

  const openRental = () => {
    rentalTriggerRef.current = typeof document !== 'undefined' ? document.activeElement : null;
    setRentalSent(null);
    setRentalOpen(true);
  };

  const closeRental = () => {
    setRentalOpen(false);
    /* formularz czyścimy dopiero po wysłaniu – zamknięcie w trakcie nie gubi danych */
    if (rentalSent) setRentalForm(EMPTY_RENTAL_FORM);
  };

  // W projekcie nie ma koszyka ani backendu – wniosek idzie tą samą drogą
  // co pozostałe formularze (patrz src/lib/enquiry.js).
  const handleRentalSubmit = (e) => {
    e.preventDefault();
    const { status } = sendEnquiry({
      subject: `Wynajem maszynki – ${PRINCESS.name}`,
      fields: [
        ['Imię i nazwisko', rentalForm.name],
        ['Telefon', rentalForm.phone],
        ['E-mail', rentalForm.email],
        ['Salon', rentalForm.salonName],
        ['Urządzenie', PRINCESS.name],
      ],
    });
    setRentalSent(status);
    /* panel na górę, fokus na tytule – czytnik ogłasza nowy tytuł i opis */
    requestAnimationFrame(() => {
      rentalContentRef.current?.scrollTo({ top: 0 });
      rentalTitleRef.current?.focus({ preventScroll: true });
    });
  };
  const sentMessage = rentalSent ? enquiryMessage(rentalSent) : null;

  return (
    <>
      {/* ============================================================ */}
      {/*  01 – HERO: pas typograficzny (espresso, bez zdjęcia)        */}
      {/* ============================================================ */}

      <PageHero
        variant="band"
        label="Maszynka"
        number="01"
        title={'AS\u00a0PRINCESS.'}
        lead={
          'Bezprzewodowa maszynka PMU z\u00a0aluminium\u00a0– minimalne wibracje, cicha praca i\u00a0dwie wymienne baterie w\u00a0zestawie.'
        }
        stats={HERO_STATS}
        /* długie podpisy (zakres, jednostki): poniżej sm lista „wartość | podpis”
           zamiast trzech kolumn po ~105 px (wartość „2,1–3,0 mm” w jednej linii) */
        statsLayout="list"
      >
        <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
          <CtaButton href="#katalog" className="as-btn-invert">
            Cena i parametry
          </CtaButton>
          <ArrowLink onClick={openRental} tone="light" className="w-fit">
            Wynajmij {RENTAL_PRICE}
          </ArrowLink>
        </div>
      </PageHero>

      {/* ============================================================ */}
      {/*  02 – MODEL (cream-50): karta AS PRINCESS, wiersz pełnej     */}
      {/*  szerokości (kotwica #katalog bez zmian – linki z hero)      */}
      {/* ============================================================ */}

      <section id="katalog" className="as-section bg-cream-50">
        <div className="as-shell">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-8">
            <Reveal className="lg:col-span-7">
              <SectionLabel number="02">Model</SectionLabel>
              <h2 className="as-display-section as-text-balance mt-6 text-ink">Jeden model, trzy kolory.</h2>
            </Reveal>
            {/* bez osobnego „Zapytaj o zakup” – ta sama akcja stoi w karcie tuż pod spodem */}
            <Reveal delay={80} className="lg:col-span-5">
              <p className="as-body">
                Ceny i parametry według karty produktu. Napisz, który kolor Cię interesuje –
                potwierdzimy dostępność i sposób dostawy.
              </p>
            </Reveal>
          </div>

          <Reveal className="mt-12">
            <MachineRow machine={PRINCESS} onRent={openRental} />
          </Reveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  03 – PARAMETRY AS PRINCESS (espresso) – jedyny ciemny pas    */}
      {/* ============================================================ */}

      <section className="as-section bg-espresso text-cream-50">
        <div className="as-shell">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-8">
            <Reveal className="lg:col-span-7">
              <SectionLabel number="03" tone="light">
                Prędkości
              </SectionLabel>
              {/* złamanie wiersza od sm; na telefonie tekst łamie się sam (przy 320 px
                  3 linie zamiast 4 z wymuszonym <br />) */}
              <h2 className="as-display-section as-text-balance mt-6 text-cream-100">
                Siedem prędkości, <br className="max-sm:hidden" />
                siedem stopni skoku.
              </h2>
            </Reveal>
            <Reveal delay={80} className="lg:col-span-5">
              {/* INNE-14: bez „według karty produktu” – karta produktu nazywa prędkość 7 „liniową”,
                  nazwy poniżej są z listy prędkości na stronie maszynki (zob. SPEED_LEVELS). */}
              <p className="as-body-invert">
                AS&nbsp;PRINCESS: od prędkości pikselowej (6&nbsp;000&nbsp;obr./min)
                do tatuażowej (10&nbsp;000&nbsp;obr./min).
              </p>
            </Reveal>
          </div>

          {/* – siedem prędkości (nazwy i obroty 1:1 ze sklepu) –
              Komórki z linią u góry, bez pełnych ramek (zasada 6). Telefon: tabela
              wierszy „numer | nazwa | obroty”; od sm komórki w 4, od lg w 7 kolumnach. */}
          <Reveal delay={60} className="mt-10">
            <ol
              aria-label="Prędkości AS PRINCESS"
              className="grid grid-cols-1 border-b border-cream-200/15 sm:grid-cols-4 sm:gap-x-6 sm:gap-y-8 sm:border-b-0 lg:grid-cols-7 lg:gap-x-5"
            >
              {SPEED_LEVELS.map((speed) => (
                <li
                  key={speed.level}
                  className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-x-4 border-t border-cream-200/15 py-3 sm:flex sm:flex-col sm:items-start sm:gap-2 sm:pb-0 sm:pt-5"
                >
                  <span className="as-num-invert">{pad(speed.level)}</span>
                  <span className="text-[0.9375rem] text-cream-50">{speed.name}</span>
                  <span className="as-caption-invert whitespace-nowrap">
                    {fmt(speed.rpm)}
                    {'\u00a0'}obr./min
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>

          {/* – skok i wysuw igły – */}
          <div className="mt-10 grid gap-6 lg:grid-cols-12 lg:gap-8">
            <p className="as-caption-invert lg:col-span-5">
              Nazwy prędkości to ogólne wytyczne – ostateczny dobór prędkości, skoku i&nbsp;igły zależy
              od techniki i&nbsp;skóry.
            </p>
            <div className="lg:col-span-6 lg:col-start-7">
              <PriceRow
                name="Skok igły"
                note={`7 stopni: ${STROKE_STEPS}`}
                price={'2,1–3,0\u00a0mm'}
                tone="light"
              />
              <PriceRow
                name="Wysuw igły"
                note="Pod rzadsze i gęstsze pigmenty"
                price={'0–3,2\u00a0mm'}
                tone="light"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  04 – WYNAJEM (cream-100): karta wynajmu + wyliczenie        */}
      {/*  (warunki z dawnego sklepu, do potwierdzenia przez klientkę) */}
      {/* ============================================================ */}

      <section id="wynajem" className="as-section bg-cream-100">
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
                {/* INNE-18/D9: bez „w sklepie” – strona nie linkuje do sklepu (prośba klientki),
                    wynajem zamawia się przez zapytanie; zdanie wg karty wynajmu: „Po dokonaniu
                    zakupu, wysyłamy umowę wynajmu”. */}
                <p className="as-body mt-6">
                  Maszynkę <span className="whitespace-nowrap text-ink">AS PRINCESS</span> wynajmiesz
                  w&nbsp;abonamencie miesięcznym:{' '}
                  <span className="text-ink">{zl(RENTAL_MONTHLY)} brutto (300&nbsp;zł netto)</span>.
                  Umowę wynajmu wysyłamy po złożeniu zamówienia.
                </p>
                <ul className="mt-6 space-y-2.5">
                  {RENTAL_POINTS.map((point) => (
                    <li key={point} className="flex gap-4">
                      <span aria-hidden="true" className="as-dash" />
                      <span className="text-[0.9375rem] leading-[1.65] text-ink/80">{nbspShort(point)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-[0.9375rem] leading-[1.65] text-ink/80">
                  Pozostałe warunki określa umowa wynajmu – zapytaj o nie przed zamówieniem.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
                  <ArrowLink onClick={openRental} className="w-fit">
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
                {/* Bez nazwy sklepu i firmy (prośba klientki, 30.09.2026) – strona nie linkuje
                    do sklepu; źródło: karty zakupu i wynajmu AS PRINCESS. */}
                <p className="as-caption mt-5 max-w-[30rem]">
                  Wyliczenie poglądowe przy 10 zabiegach w&nbsp;miesiącu; zwrotnej kaucji nie
                  wliczamy. Ceny według kart produktów.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  05 – KONTAKT (espresso-900; wspólny pas zamykający)          */}
      {/* ============================================================ */}

      <ClosingCta
        number="05"
        label="Kontakt"
        title="Przetestuj maszynę"
        titleAccent="na żywo."
        lead={`Maszynę AS\u00a0PRINCESS przetestujesz na miejscu podczas szkolenia w\u00a0${BRAND.academy}. Napisz, jeśli masz pytania przed zakupem lub wynajmem.`}
        primary={{ href: '/kontakt?temat=produkty', label: 'Zapytaj o maszynkę' }}
        secondary={{ href: '/szkolenia', label: 'Zapytaj o termin' }}
      />

      {/* ============================================================ */}
      {/*  Formularz wynajmu                                           */}
      {/* ============================================================ */}

      <Dialog
        open={rentalOpen}
        onOpenChange={(open) => {
          if (!open) closeRental();
        }}
      >
        <DialogContent
          ref={rentalContentRef}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            rentalTriggerRef.current?.focus();
          }}
        >
          <DialogHeader>
            {/* Fokus trafia tu tylko ze skryptu (po wysłaniu) – bez obrysu, jak nagłówek
                potwierdzenia rezerwacji (BookingDone); obrys na całą szerokość wchodził pod ×. */}
            <DialogTitle ref={rentalTitleRef} tabIndex={-1} className="focus-visible:outline-none">
              {sentMessage ? sentMessage.title : 'Zapytanie o wynajem'}
            </DialogTitle>
            <DialogDescription>
              {sentMessage ? (
                sentMessage.body
              ) : (
                <>
                  {PRINCESS.name}: {RENTAL_PRICE}, zwrotna kaucja{' '}
                  {RENTAL_DEPOSIT}. Zostaw kontakt – odpowiemy z&nbsp;warunkami umowy.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {sentMessage ? (
            /* potwierdzenie w dialogu – ten sam wzorzec co zapytanie o termin na /szkolenia */
            <>
              <div className="mt-8 border border-ink/15 bg-cream-100/70 p-6">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="as-kicker">Urządzenie</dt>
                    <dd className="mt-2 text-[0.9375rem] text-ink">
                      {PRINCESS.name}, {RENTAL_PRICE}
                    </dd>
                  </div>
                  <div>
                    <dt className="as-kicker">Kontakt</dt>
                    <dd className="mt-2 text-[0.9375rem] text-ink">
                      {rentalForm.name}
                      {rentalForm.phone ? ` · ${rentalForm.phone}` : ''}
                    </dd>
                  </div>
                </dl>
              </div>
              <DialogFooter>
                <a href={CONTACT.instagram} target="_blank" rel="noreferrer noopener" className="as-btn-solid">
                  {CONTACT.instagramHandle}
                  <span className="sr-only"> (Instagram, otwiera się w nowej karcie)</span>
                </a>
                <button type="button" onClick={closeRental} className="as-btn-ghost">
                  Zamknij
                </button>
              </DialogFooter>
            </>
          ) : (
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

              <FormNotice className="mt-6" />
              {!NOTICE_READY && <RequiredLegend className="mt-6" />}

              <DialogFooter>
                <button type="submit" className="as-btn-solid">
                  Wyślij zapytanie
                </button>
                <button type="button" onClick={closeRental} className="as-btn-ghost">
                  Anuluj
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
