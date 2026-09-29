'use client';

/**
 * /maszynki — „Numer 01".
 *
 * W /Graphics nie ma packshotów maszynek (AS HERO / AS HERO 2 / AS PRINCESS),
 * kartridży ani akcesoriów, więc trasa jest w 100% typograficzna — świadoma
 * decyzja do czasu sesji packshotowej, nie brak. Zero portretów, zero makr.
 *
 * Rytm tła (max 2 ciemne pasy, nigdy dwa ciemne obok siebie):
 *   01 PageHero band (espresso, bez zdjęcia, 3 Stat z parametrów widoku)
 *   02 Katalog #katalog (cream-50) — model = wiersz pełnej szerokości,
 *      w wierszu wszystkie parametry (obroty, skok, waga, zasilanie)
 *   03 Prędkości (espresso) — selektor 7 poziomów + rekomendowana igła
 *   04 Wynajem (cream-100) — kalkulator w PriceRow, wniosek w dialogu (Field)
 *   05 ClosingCta (espresso-900, jeden blok ze stopką)
 * Każda sekcja: SectionLabel → H2 .as-display-section (mt-6) → treść.
 * Prostokątne przyciski tylko w hero (jeden), ClosingCta i formularzu;
 * w sekcjach akcje to ArrowLink (z onClick, gdy otwierają dialog).
 */

import React, { useState } from 'react';
import {
  ArrowLink,
  ClosingCta,
  CtaButton,
  Field,
  PageHero,
  PriceRow,
  Reveal,
  SectionLabel,
} from '@/components/as/Primitives';
import { BRAND } from '@/lib/site';
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
/*  DANE (do potwierdzenia przez klienta — nie pochodzą z site.js)     */
/* ================================================================== */

/* Parametry: `v` = wartość z jednostką (nigdy nie łamie się w środku liczby),
   `n` = dopisek (liczba biegów, rodzaj skoku) — łamie się normalnie. */
const MACHINES_DATA = [
  {
    id: 'as-hero',
    number: '01',
    name: 'AS HERO',
    subtitle: 'Maszyna rotacyjna',
    price: 1499,
    originalPrice: null,
    description:
      'Kompaktowa, wysoce precyzyjna maszynka rotacyjna idealna dla ceniących lekkość i bezwzględną stabilność prowadzenia igły.',
    features: [
      'Silnik bezszczotkowy najnowszej generacji',
      'Ergonomiczny chwyt redukujący zmęczenie dłoni',
      'Uniwersalne złącze kartridży z systemem membranowym',
      'Waga zaledwie 105 g',
    ],
    specs: {
      rpm: { v: '6 000–9 500 RPM' },
      stroke: { v: '2,5 mm', n: 'stały' },
      weight: { v: '105 g' },
      power: { v: 'Przewodowe złącze RCA / opcja akumulatora', wrap: true },
    },
  },
  {
    id: 'as-hero-2',
    number: '02',
    name: 'AS HERO 2',
    subtitle: 'Hybrydowa, bezprzewodowa',
    price: 1999,
    originalPrice: null,
    description:
      'Hybrydowa bezprzewodowa maszynka nowej generacji. Łączy moc maszynek tatuażowych z miękkością wymaganą przy delikatnych pigmentacjach PMU.',
    features: [
      'Cyfrowy wyświetlacz OLED pokazujący stan baterii i napięcie',
      '2 wymienne akumulatory o pojemności 1200 mAh w zestawie',
      'System bezpośredniego przełożenia napędu (Direct Drive)',
      'Tryb pracy ciągłej z kablem USB-C',
    ],
    specs: {
      rpm: { v: '6 000–10 000 RPM', n: '7 prędkości' },
      stroke: { v: '2,1–3,0 mm', n: 'regulowany' },
      weight: { v: '107 g' },
      power: { v: '2\u00a0akumulatory (do 4\u00a0h pracy każdy) / USB-C', wrap: true },
    },
  },
  {
    id: 'as-princess-gold',
    number: '03',
    name: 'AS PRINCESS Champagne Gold',
    subtitle: 'Flagowa, bezprzewodowa',
    price: 2999,
    originalPrice: 3500,
    description:
      'Luksusowe urządzenie klasy Premium. Zaprojektowane z lotniczego aluminium w kolorze szampańskiego złota, z unikalną amortyzacją wibracji.',
    features: [
      'Bezprzewodowa swoboda ruchu z dołączonymi 2 bateriami',
      '7 precyzyjnych biegów dedykowanych technikom pikselowym i konturowym',
      'Płynny wysuw igły 0–3,2 mm z mikrometryczną podziałką',
      'Model objęty pełnym serwisem door-to-door',
    ],
    specs: {
      rpm: { v: '6 000–10 000 RPM', n: '7 biegów' },
      stroke: { v: '2,1–3,0 mm', n: '7 stopni skoku' },
      weight: { v: '107 g' },
      power: { v: '2\u00a0baterie bezprzewodowe + ładowarka', wrap: true },
    },
    color: 'Champagne Gold',
  },
  {
    id: 'as-princess-pink',
    number: '04',
    name: 'AS PRINCESS Rose Pink',
    subtitle: 'Flagowa, bezprzewodowa',
    price: 2999,
    originalPrice: 3500,
    description:
      'Elegancka wariacja flagowej maszynki AS PRINCESS w limitowanym wykończeniu różowego złota. Doskonała precyzja i nieskazitelna estetyka.',
    features: [
      'Stylowy, satynowy różowy korpus odporny na zarysowania',
      'Ultracicha praca nie powodująca dyskomfortu u klientki',
      'Rekomendowana do technik pudrowych oraz mikroblading hybrydowego',
      'W zestawie eleganckie etui podróżne',
    ],
    specs: {
      rpm: { v: '6 000–10 000 RPM' },
      stroke: { v: '2,1–3,0 mm' },
      weight: { v: '107 g' },
      power: { v: '2\u00a0baterie bezprzewodowe + ładowarka', wrap: true },
    },
    color: 'Rose Pink',
  },
];

const SPEED_LEVELS = [
  { level: 1, rpm: '6 000 RPM', name: 'Pikselowa', desc: 'Delikatny cień, idealna do miękkich przejść w brwiach pudrowych.' },
  { level: 2, rpm: '6 500 RPM', name: 'Pudrowa', desc: 'Zagęszczenie pigmentu, technika Ombre Brows i Powder Effect.' },
  { level: 3, rpm: '7 000 RPM', name: 'Hybrydowa', desc: 'Uniwersalna praca na ustach i brwiach z mieszanymi pigmentami.' },
  { level: 4, rpm: '7 500 RPM', name: 'Liniowa', desc: 'Włoskowa metoda Hairstrokes, precyzyjne mikrolinie.' },
  { level: 5, rpm: '8 000 RPM', name: 'Konturowa', desc: 'Wyrazisty kontur ust oraz kreska zagęszczająca linię rzęs (Eyeliner).' },
  { level: 6, rpm: '9 000 RPM', name: 'Tatuażowa I', desc: 'Głębokie nasycenie barwnika, praca z gęstszymi pigmentami.' },
  { level: 7, rpm: '10 000 RPM', name: 'Tatuażowa II', desc: 'Maksymalna częstotliwość nakłuć do zaawansowanych prac medycznych i kamuflażu.' },
];

/* Rząd liczb w hero — wyłącznie parametry, które widok już podaje
   (7 prędkości i skok 2,1–3,0 mm z MACHINES_DATA, gwarancja z katalogu). */
const HERO_STATS = [
  { value: '7', label: 'trybów prędkości, od 6 000 do 10 000 RPM' },
  { value: '2,1–3,0 mm', label: 'zmienny skok igły, 7 stopni regulacji' },
  { value: '24 mies.', label: 'gwarancji producenta i wsparcie techniczne' },
];

/* 2999 → „2 999" (twarda spacja tysięcy, jak w kalkulatorze wynajmu) */
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');

const RENTAL_PRICE = '369 zł / mc';

const RENTAL_POINTS = [
  'Brak wysokiej opłaty początkowej – startujesz od pierwszego dnia',
  'Pełny serwis i maszynka zastępcza w\u00a024\u00a0h w\u00a0przypadku awarii',
  'Możliwość wykupu urządzenia na własność po okresie subskrypcji',
];

const RENTAL_MATH = [
  { name: 'Koszt zakupu nowej maszynki', price: `${fmt(2999)} zł` },
  { name: 'Miesięczny koszt wynajmu', price: RENTAL_PRICE },
  { name: 'Przewidywana liczba zabiegów w miesiącu', price: '10 zabiegów' },
  { name: 'Koszt sprzętu na 1 zabieg', note: 'Przy 10 zabiegach miesięcznie', price: '36,90 zł' },
];

/* Parametry w wierszu katalogu — komplet (waga była wcześniej tylko w tabeli
   porównawczej, która dublowała katalog). Zasilanie to opis, nie liczba:
   na xl zajmuje cały drugi rząd siatki. */
const SPEC_ROWS = [
  { key: 'rpm', label: 'Obroty' },
  { key: 'stroke', label: 'Skok igły' },
  { key: 'weight', label: 'Waga' },
  { key: 'power', label: 'Zasilanie', className: 'xl:col-span-3' },
];

const RENTAL_FIELDS = [
  { id: 'name', label: 'Imię i nazwisko', placeholder: 'np. Anna Kowalska', required: true },
  { id: 'phone', label: 'Numer telefonu', placeholder: '+48 600 000 000', type: 'tel', required: true },
  { id: 'email', label: 'Adres e-mail', placeholder: 'salon@example.com', type: 'email', required: true },
  { id: 'salonName', label: 'Nazwa salonu / działalności', placeholder: 'np. Studio Beauty Katowice' },
];

const EMPTY_RENTAL_FORM = { name: '', phone: '', email: '', salonName: '' };

const pad = (n) => String(n).padStart(2, '0');
const isRentable = (machine) => machine.name.includes('PRINCESS');

/* ================================================================== */
/*  Lokalne klocki                                                     */
/* ================================================================== */

/* Wiersz katalogu — rozwinięcie IndexRow o parametry i drugą akcję (wynajem).
   Numerał 64 | model + „Opis i cechy" | parametry (2 kol. na lg, 3 na xl) |
   cena + akcje. Rozwijany opis stoi w kolumnie modelu, żeby zwinięty wiersz
   miał wysokość samych parametrów. */
function MachineRow({ machine, onRent, last }) {
  return (
    <article
      className={cn(
        'grid gap-5 border-t border-ink/15 py-7 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-x-6 lg:grid-cols-[5rem_minmax(0,5fr)_minmax(0,6fr)_12rem] lg:gap-x-6 lg:gap-y-8 xl:grid-cols-[6rem_minmax(0,4fr)_minmax(0,7fr)_12rem] xl:gap-x-8',
        last && 'border-b'
      )}
    >
      <span className="as-display-md leading-none text-gold-dark" aria-hidden="true">
        {machine.number}
      </span>

      <div>
        <h3 className="as-title as-text-balance text-ink">{machine.name}</h3>
        <p className="as-kicker mt-3">{machine.subtitle}</p>

        {/* Opis i cechy — zwinięte, żeby indeks czytał się jak spis modeli
            (parametry i cena na wierzchu), a treść nie znikała z widoku. */}
        <details className="group/more mt-6">
          <summary className="as-label inline-flex cursor-pointer list-none items-center gap-3 border-b border-ink/20 pb-1.5 text-ink/70 transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
            Opis i cechy
            <span
              aria-hidden="true"
              className="text-gold-dark transition-transform duration-300 group-open/more:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-5 max-w-[34rem] text-[0.9375rem] leading-[1.65] text-ink/75">
            {machine.description}
          </p>
          <ul className="mt-4 space-y-2" aria-label={`Cechy kluczowe — ${machine.name}`}>
            {machine.features.map((feat) => (
              <li key={feat} className="flex gap-4">
                <span aria-hidden="true" className="as-dash" />
                <span className="text-[0.9375rem] leading-[1.65] text-ink/75">{feat}</span>
              </li>
            ))}
          </ul>
        </details>
      </div>

      <dl className="grid grid-cols-2 content-start gap-x-6 gap-y-5 self-start sm:col-start-2 lg:col-start-auto xl:grid-cols-3">
        {SPEC_ROWS.map((row) => {
          const spec = machine.specs[row.key];
          return (
            <div key={row.key} className={row.className}>
              <dt className="as-label text-ink/55">{row.label}</dt>
              <dd className="mt-2 text-[0.9375rem] leading-[1.5] text-ink">
                <span className={spec.wrap ? undefined : 'whitespace-nowrap'}>{spec.v}</span>
                {spec.n && <span className="block text-ink/60">{spec.n}</span>}
              </dd>
            </div>
          );
        })}
      </dl>

      <div className="flex flex-col items-start gap-4 sm:col-start-2 lg:col-start-auto lg:items-end lg:text-right">
        <div>
          <p className="whitespace-nowrap font-display text-[1.375rem] leading-[1.2] text-ink">
            {fmt(machine.price)} zł
          </p>
          {machine.originalPrice && (
            <p className="as-caption mt-1 whitespace-nowrap">
              cena regularna {fmt(machine.originalPrice)} zł
            </p>
          )}
        </div>
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
  const [selectedSpeed, setSelectedSpeed] = useState(SPEED_LEVELS[0]);
  const [selectedMachineForRental, setSelectedMachineForRental] = useState(null);
  const [rentalForm, setRentalForm] = useState(EMPTY_RENTAL_FORM);

  const openRental = (machine = MACHINES_DATA[2]) => setSelectedMachineForRental(machine);

  // W projekcie nie ma koszyka ani backendu — wniosek idzie tą samą drogą
  // co pozostałe formularze (patrz src/lib/enquiry.js).
  const handleRentalSubmit = (e) => {
    e.preventDefault();
    const { status } = sendEnquiry({
      subject: `Wynajem maszynki${selectedMachineForRental ? ` — ${selectedMachineForRental.name}` : ''}`,
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
      {/*  01 — HERO: pas typograficzny (espresso, bez zdjęcia)        */}
      {/* ============================================================ */}

      <PageHero
        variant="band"
        label="Urządzenia"
        number="01"
        title={'AS\u00a0HERO i\u00a0AS\u00a0PRINCESS.'}
        lead={'Maszynki PMU z\u00a0lotniczego aluminium i\u00a0z\u00a0wymiennymi akumulatorami.'}
        stats={HERO_STATS}
      >
        <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
          <CtaButton href="#katalog" className="as-btn-invert">
            Przeglądaj modele
          </CtaButton>
          <ArrowLink onClick={() => openRental()} tone="light" className="w-fit">
            Wynajmij {RENTAL_PRICE}
          </ArrowLink>
        </div>
      </PageHero>

      {/* ============================================================ */}
      {/*  02 — KATALOG (cream-50): model = wiersz pełnej szerokości    */}
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
                Wszystkie maszynki objęte są 24-miesięczną gwarancją producenta oraz wsparciem
                technicznym.
              </p>
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
      {/*  03 — PRĘDKOŚCI (espresso) — jedyny ciemny pas w treści       */}
      {/* ============================================================ */}

      <section className="as-section bg-espresso text-cream-50">
        <div className="as-shell">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-8">
            <Reveal className="lg:col-span-7">
              <SectionLabel number="03" tone="light">
                Prędkości
              </SectionLabel>
              <h2 className="as-display-section as-text-balance mt-6 text-cream-100">
                Wybierz prędkość
                <br />
                i technikę pracy.
              </h2>
            </Reveal>
            <Reveal delay={80} className="lg:col-span-5">
              <p className="as-body-invert">
                Maszynki zoptymalizowane pod kątem pigmentów mineralnych i hybrydowych. Wybierz
                jeden z siedmiu poziomów obrotów, aby poznać zalecaną technikę pigmentacji.
              </p>
            </Reveal>
          </div>

          {/* — selektor prędkości — */}
          <Reveal delay={60} className="mt-10">
            <div
              role="group"
              aria-label="Poziomy prędkości"
              className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7"
            >
              {SPEED_LEVELS.map((speed) => {
                const active = selectedSpeed.level === speed.level;
                return (
                  <button
                    key={speed.level}
                    type="button"
                    onClick={() => setSelectedSpeed(speed)}
                    aria-pressed={active}
                    className={cn(
                      /* 7 pozycji w 2 i 4 kolumnach zostawiało pustą ósmą komórkę —
                         ostatnia rozciąga się na dwie kolumny do progu lg */
                      'flex flex-col items-start gap-3 border px-4 py-4 text-left transition-colors duration-300 last:col-span-2 sm:px-5 lg:last:col-span-1',
                      active
                        ? 'border-cream-100 bg-cream-100 text-ink'
                        : 'border-cream-200/25 text-cream-50 hover:border-gold-light'
                    )}
                  >
                    <span className={cn('as-num', active ? 'text-gold-dark' : 'text-gold-light')}>
                      {pad(speed.level)}
                    </span>
                    <span className={cn('as-label', active ? 'text-ink/70' : 'text-cream-200/75')}>
                      {speed.rpm}
                    </span>
                  </button>
                );
              })}
            </div>
          </Reveal>

          {/* — opis wybranego poziomu — */}
          <div
            aria-live="polite"
            className="mt-8 grid gap-4 lg:grid-cols-12 lg:items-start lg:gap-8"
          >
            <div className="lg:col-span-6">
              <p className="as-kicker-invert">
                Poziom {pad(selectedSpeed.level)} · {selectedSpeed.rpm}
              </p>
              <h3 className="as-title mt-3 text-cream-100">{selectedSpeed.name}</h3>
              <p className="as-body-invert mt-2">{selectedSpeed.desc}</p>
            </div>
            <div className="lg:col-span-6">
              <PriceRow
                name="Rekomendowana igła"
                note="Dobór zależny od skóry i techniki"
                price="1RL 0.25 / 3RL 0.18"
                tone="light"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  04 — WYNAJEM (cream-100): kalkulator w PriceRow               */}
      {/* ============================================================ */}

      <section id="wynajem" className="as-section scroll-mt-24 bg-cream-100">
        <div className="as-shell">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">
              <Reveal>
                <SectionLabel number="04">Wynajem</SectionLabel>
                <h2 className="as-display-section as-text-balance mt-6 text-ink">
                  Program wynajmu
                  <br />
                  dla salonów.
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <p className="as-body mt-6">
                  Rozwijaj swój salon bez zamrażania kapitału. Wynajmij bezprzewodową maszynkę{' '}
                  <span className="whitespace-nowrap text-ink">AS PRINCESS</span> na dogodnych warunkach ze stałą
                  opłatą <span className="text-ink">369 zł miesięcznie</span>.
                </p>
                <ul className="mt-6 space-y-2.5">
                  {RENTAL_POINTS.map((point) => (
                    <li key={point} className="flex gap-4">
                      <span aria-hidden="true" className="as-dash" />
                      <span className="text-[0.9375rem] leading-[1.65] text-ink/80">{point}</span>
                    </li>
                  ))}
                </ul>
                <ArrowLink onClick={() => openRental()} className="mt-8 w-fit">
                  Wyślij zapytanie o wynajem
                </ArrowLink>
              </Reveal>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 lg:pt-10">
              <Reveal delay={80}>
                <h3 className="as-title text-ink">Kalkulator korzyści</h3>
                <div className="mt-6">
                  {RENTAL_MATH.map((row) => (
                    <PriceRow key={row.name} name={row.name} note={row.note} price={row.price} />
                  ))}
                </div>
                <p className="as-caption mt-5 max-w-[30rem]">
                  Model subskrypcyjny B2B. Wyliczenie poglądowe dla 10 zabiegów miesięcznie;
                  szczegóły umowy ustalamy indywidualnie po wysłaniu zapytania.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  05 — KONTAKT (espresso-900; wspólny pas zamykający)          */}
      {/* ============================================================ */}

      <ClosingCta
        number="05"
        label="Kontakt"
        title="Przetestuj maszynę"
        titleAccent="na żywo."
        lead={`Maszynę AS\u00a0PRINCESS przetestujesz na miejscu podczas szkolenia w ${BRAND.academy}. Napisz, jeśli chcesz porównać modele przed zakupem.`}
        primary={{ href: '/kontakt', label: 'Zapytaj o maszynkę' }}
        secondary={{ href: '/szkolenia', label: 'Terminy szkoleń' }}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wniosek o wynajem maszynki PMU</DialogTitle>
            <DialogDescription>
              Wypełnij krótki formularz, aby zarezerwować model {selectedMachineForRental?.name} w
              opcji {RENTAL_PRICE}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRentalSubmit} className="mt-8">
            <div className="space-y-6">
              {RENTAL_FIELDS.map((field) => (
                <Field
                  key={field.id}
                  as="input"
                  id={`rental-${field.id}`}
                  label={field.label}
                  type={field.type}
                  required={field.required}
                  placeholder={field.placeholder}
                  value={rentalForm[field.id]}
                  onChange={(e) => setRentalForm({ ...rentalForm, [field.id]: e.target.value })}
                />
              ))}
            </div>

            <DialogFooter>
              <button type="submit" className="as-btn-solid">
                Wyślij wniosek
              </button>
              <button
                type="button"
                onClick={() => setSelectedMachineForRental(null)}
                className="as-btn-ghost"
              >
                Anuluj
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
