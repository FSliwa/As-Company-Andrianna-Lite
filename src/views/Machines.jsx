// Uwaga: w /Graphics nie ma packshotów maszynek (AS HERO / AS HERO 2 /
// AS PRINCESS), kartridży ani akcesoriów. Strona jest więc zbudowana
// typograficznie: numerowane karty specyfikacji, tabele parametrów i złote
// linie.
//
// Zdjęcia: w hero portret założycielki (studio-04 — kadr 4/5 z prymitywu
// PageHero), w sekcji „Efekty” panele BY_NAME + makra BROWS/LIPS podpisane
// jako efekt zabiegu — nigdy jako zdjęcie sprzętu. Sekcja jest ciemna
// (bg-mocha), więc każdy kadr dostaje tone="dark"; pliki zbiorcze sklejek są
// zakazane. Gdy pojawią się prawdziwe packshoty, można je wpiąć w sekcję 03
// (katalog).
//
// Rytm tła (jasna/ciemna na przemian, bez wyjątku):
//   01 hero (cream-50) → 02 Parametry + Prędkości (espresso)
//   → 03 Katalog (cream-100) → 04 Efekty (mocha) → 05 Wynajem (cream-50)
//   → 06 ClosingCta (espresso-900).
// Układ sekcji dziedziczy rytm strony głównej (src/views/Home.jsx):
// SectionLabel → nagłówek .as-display-section (mt-6) → zajawka .as-caption
// → treść (mt-10) → CTA (mt-8). Karty to .as-card-col, grupa zdjęć siedzi
// w jednej ramce .as-photo-frame.

'use client';

import React, { useState } from 'react';
import {
  ArrowLink,
  ClosingCta,
  CtaButton,
  Field,
  Figure,
  GoldArc,
  NumberedItem,
  PageHero,
  PriceRow,
  Reveal,
  SectionLabel,
} from '@/components/as/Primitives';
import { BRAND } from '@/lib/site';
import { BROWS, BY_NAME, LIPS, STUDIO } from '@/lib/media';
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
/*  DANE                                                               */
/* ================================================================== */

const MACHINES_DATA = [
  {
    id: 'as-hero',
    number: '01',
    name: 'AS HERO',
    subtitle: 'Precision Rotary PMU Machine',
    price: 1499,
    originalPrice: null,
    badge: 'Bestseller',
    description:
      'Kompaktowa, wysoce precyzyjna maszynka rotacyjna idealna dla ceniących lekkość i bezwzględną stabilność prowadzenia igły.',
    features: [
      'Silnik bezszczotkowy najnowszej generacji',
      'Ergonomiczny chwyt redukujący zmęczenie dłoni',
      'Uniwersalne złącze kartridży z systemem membranowym',
      'Waga zaledwie 105g',
    ],
    specs: {
      rpm: '6 000 - 9 500 RPM',
      stroke: '2.5 mm (stały)',
      weight: '105 g',
      power: 'Przewodowe złącze RCA / opcja akumulatora',
    },
  },
  {
    id: 'as-hero-2',
    number: '02',
    name: 'AS HERO 2',
    subtitle: 'Next-Gen Wireless Hybrid PMU Machine',
    price: 1999,
    originalPrice: null,
    badge: 'Nowość 2026',
    description:
      'Hybrydowa bezprzewodowa maszynka nowej generacji. Łączy moc maszynek tatuażowych z miękkością wymaganą przy delikatnych pigmentacjach PMU.',
    features: [
      'Cyfrowy wyświetlacz OLED pokazujący stan baterii i napięcie',
      '2 wymienne akumulatory o pojemności 1200mAh w zestawie',
      'System bezpośredniego przełożenia napędu (Direct Drive)',
      'Tryb pracy ciągłej z kablem USB-C',
    ],
    specs: {
      rpm: '6 000 - 10 000 RPM (7 prędkości)',
      stroke: '2.1 - 3.0 mm (regulowany)',
      weight: '107 g',
      power: '2x Akumulator (do 4h pracy każdy) / USB-C',
    },
  },
  {
    id: 'as-princess-gold',
    number: '03',
    name: 'AS PRINCESS Champagne Gold',
    subtitle: 'Luxury Flagship PMU Machine',
    price: 2999,
    originalPrice: 3500,
    badge: 'Promocja -500 PLN',
    description:
      'Luksusowe urządzenie klasy Premium. Zaprojektowane z lotniczego aluminium w kolorze szampańskiego złota, z unikalną amortyzacją wibracji.',
    features: [
      'Bezprzewodowa swoboda ruchu z dołączonymi 2 bateriami',
      '7 precyzyjnych biegów dedykowanych technikom pikselowym i konturowym',
      'Płynny wysuw igły 0 - 3.2 mm z mikrometryczną podziałką',
      'Model objęty pełnym serwisem door-to-door',
    ],
    specs: {
      rpm: '6 000 - 10 000 RPM (7 biegów)',
      stroke: '2.1 - 3.0 mm (7 stopni skoku)',
      weight: '107 g',
      power: '2x Bezprzewodowa bateria + Ładowarka',
    },
    color: 'Champagne Gold',
  },
  {
    id: 'as-princess-pink',
    number: '04',
    name: 'AS PRINCESS Rose Pink',
    subtitle: 'Luxury Flagship PMU Machine',
    price: 2999,
    originalPrice: 3500,
    badge: 'Promocja -500 PLN',
    description:
      'Elegancka wariacja flagowej maszynki AS PRINCESS w limitowanym wykończeniu różowego złota. Doskonała precyzja i nieskazitelna estetyka.',
    features: [
      'Stylowy, satynowy różowy korpus odporny na zarysowania',
      'Ultracicha praca nie powodująca dyskomfortu u klientki',
      'Rekomendowana do technik pudrowych oraz mikroblading hybrydowego',
      'W zestawie eleganckie etui podróżne',
    ],
    specs: {
      rpm: '6 000 - 10 000 RPM',
      stroke: '2.1 - 3.0 mm',
      weight: '107 g',
      power: '2x Bezprzewodowa bateria + Ładowarka',
    },
    color: 'Rose Pink',
  },
];

const SPEED_LEVELS = [
  { level: 1, rpm: '6 000 RPM', name: 'Pikselowa', desc: 'Delikatny cień, idealna do miękkich przejsć w brwiach pudrowych.' },
  { level: 2, rpm: '6 500 RPM', name: 'Pudrowa', desc: 'Zagęszczenie pigmentu, technika Ombre Brows i Powder Effect.' },
  { level: 3, rpm: '7 000 RPM', name: 'Hybrydowa', desc: 'Uniwersalna praca na ustach i brwiach z mieszanymi pigmentami.' },
  { level: 4, rpm: '7 500 RPM', name: 'Liniowa', desc: 'Włoskowa metoda Hairstrokes, precyzyjne mikrolinie.' },
  { level: 5, rpm: '8 000 RPM', name: 'Konturowa', desc: 'Wyrazisty kontur ust oraz kreska zagęszczająca linię rzęs (Eyeliner).' },
  { level: 6, rpm: '9 000 RPM', name: 'Tatuażowa I', desc: 'Głębokie nasycenie barwnika, praca z gęstszymi pigmentami.' },
  { level: 7, rpm: '10 000 RPM', name: 'Tatuażowa II', desc: 'Maksymalna częstotliwość nakłuć do zaawansowanych prac medycznych i kamuflażu.' },
];

/* Numerowane pozycje specyfikacji — jak 01/02/03 pod zdjęciami w makiecie. */
const SPEC_PILLARS = [
  {
    number: '01',
    title: '7 trybów prędkości',
    desc: 'Precyzyjnie skalibrowane od 6 000 do 10 000 RPM z cyfrowym sterowaniem dla każdego rodzaju skóry.',
  },
  {
    number: '02',
    title: 'Zmienny skok 2.1 – 3.0 mm',
    desc: '7 stopni regulacji skoku igły poprzez proste obrócenie korpusu. Idealne dopasowanie oporu.',
  },
  {
    number: '03',
    title: 'Waga zaledwie 107 g',
    desc: 'Aerodynamiczne aluminium sprawia, że dłoń nie męczy się nawet podczas wielogodzinnych sesji.',
  },
  {
    number: '04',
    title: 'Wysuw igły 0 – 3.2 mm',
    desc: 'Rozkręcana konstrukcja kompatybilna z uniwersalnymi kartridżami z membraną sterylną.',
  },
];

/* Zdjęcia WYŁĄCZNIE jako efekt pracy — nigdy jako zdjęcie sprzętu.
   Cztery kadry w jednej złotej ramce → jedna proporcja 16/10 dla wszystkich.
   Panele są poziome (ok. 1.7:1 – 2.9:1), makro brows-14 jest pionowe
   i w poziomej ramce pokazuje pas brew + oko. Maks. dwa makra na stronę. */
const EFFECT_SHOTS = [
  {
    image: BY_NAME['brows-02-p3'],
    caption: 'Brwi — efekt po wygojeniu',
    alt: 'Para oczu z brwiami po pigmentacji metodą włoskową, twarz na wprost, opaska na włosach',
    ratio: '16 / 10',
  },
  {
    image: BY_NAME['brows-13-p1'],
    caption: 'Brwi — zbliżenie na efekt pracy',
    alt: 'Zbliżenie na pojedynczy łuk brwi z naniesionymi włoskami po pigmentacji',
    ratio: '16 / 10',
  },
  {
    image: BROWS[13],
    caption: 'Brwi — kształt i domknięcie konturu',
    alt: 'Makro oka z brwią po pigmentacji — czytelny kształt łuku i domknięty ogon brwi',
    ratio: '16 / 10',
    position: '50% 48%',
  },
  {
    image: LIPS[3],
    caption: 'Usta — efekt Perfect Lips',
    alt: 'Usta w kolorze czerwieni po makijażu permanentnym, ujęcie dolnej części twarzy',
    ratio: '16 / 10',
    position: '50% 55%',
  },
];

const RENTAL_POINTS = [
  'Brak wysokiej opłaty początkowej – startujesz od pierwszego dnia',
  'Pełny serwis i maszynka zastępcza w 24h w przypadku awarii',
  'Możliwość wykupu urządzenia na własność po okresie subskrypcji',
];

const RENTAL_MATH = [
  { name: 'Koszt zakupu nowej maszynki', price: '2 999 zł' },
  { name: 'Miesięczny koszt wynajmu', price: '369 zł / mc' },
  { name: 'Przewidywana liczba zabiegów w miesiącu', price: '10 zabiegów' },
  { name: 'Koszt sprzętu na 1 zabieg', note: 'Przy 10 zabiegach miesięcznie', price: '36,90 zł' },
];

const SPEC_ROWS = [
  { key: 'rpm', label: 'Obroty' },
  { key: 'stroke', label: 'Skok igły' },
  { key: 'weight', label: 'Waga' },
  { key: 'power', label: 'Zasilanie' },
];

const RENTAL_FIELDS = [
  { id: 'name', label: 'Imię i nazwisko', placeholder: 'np. Anna Kowalska', required: true },
  { id: 'phone', label: 'Numer telefonu', placeholder: '+48 600 000 000', type: 'tel', required: true },
  { id: 'email', label: 'Adres e-mail', placeholder: 'salon@example.com', type: 'email', required: true },
  { id: 'salonName', label: 'Nazwa salonu / działalności', placeholder: 'np. Studio Beauty Katowice' },
];

const EMPTY_RENTAL_FORM = { name: '', phone: '', email: '', salonName: '' };

/* ================================================================== */
/*  Lokalne klocki                                                     */
/* ================================================================== */

/* Wartości specyfikacji bywają długie („2x Akumulator (do 4h pracy każdy)
   / USB-C"), a PriceRow trzyma wartość w jednym wierszu — na 375 px
   wychodziłaby poza kadr. Stąd lista definicji w tym samym rytmie linii. */
function SpecList({ specs, className }) {
  return (
    <dl className={className}>
      {SPEC_ROWS.map((row) => (
        <div
          key={row.key}
          className="grid grid-cols-[5.5rem_1fr] gap-4 border-b border-ink/10 py-3 sm:grid-cols-[6.5rem_1fr]"
        >
          <dt className="as-kicker pt-1.5">{row.label}</dt>
          <dd className="text-[0.8125rem] leading-[1.75] text-ink">{specs[row.key]}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ================================================================== */

export default function Machines() {
  const { toast } = useToast();
  const [selectedSpeed, setSelectedSpeed] = useState(SPEED_LEVELS[0]);
  const [selectedMachineForRental, setSelectedMachineForRental] = useState(null);
  const [rentalForm, setRentalForm] = useState(EMPTY_RENTAL_FORM);

  // W projekcie nie ma koszyka ani sklepu — zapytanie idzie tą samą drogą
  // co pozostałe formularze (patrz src/lib/enquiry.js).
  const handleAskAbout = (machine) => {
    const { status } = sendEnquiry({
      subject: `Zapytanie o ${machine.name}`,
      fields: [
        ['Produkt', machine.name],
        ['Cena z katalogu', `${machine.price} zł`],
      ],
    });
    const msg = enquiryMessage(status);
    toast({ title: msg.title, description: msg.body });
  };

  const openRental = (machine = MACHINES_DATA[2]) => setSelectedMachineForRental(machine);

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
      {/*  01 — HERO (cream-50)                                        */}
      {/* ============================================================ */}

      <PageHero
        label="Urządzenia"
        number="01"
        title="Maszynki PMU"
        titleAccent="AS HERO & AS PRINCESS"
        lead="Zaprojektowane z myślą o najwyższym komforcie pracy linergistek. Lekka konstrukcja ze stopu lotniczego aluminium, 7 trybów prędkości, zmienny skok i wymienne akumulatory zapewniają bezkompromisową precyzję."
        image={STUDIO[3]}
        imageAlt="Andriana Babushkina — założycielka AS Company"
        imagePosition="50% 12%"
        facts={['7 prędkości', 'Skok 2.1 – 3.0 mm', '107 g', '24 miesiące gwarancji']}
        tone="cream"
      >
        <div className="flex flex-wrap gap-4">
          <CtaButton href="#katalog" className="as-btn-solid">
            Przeglądaj modele
          </CtaButton>
          <CtaButton onClick={() => openRental()} className="as-btn-ghost">
            Wynajem 369 zł / mc
          </CtaButton>
        </div>
      </PageHero>

      {/* ============================================================ */}
      {/*  02 — PARAMETRY + PRĘDKOŚCI (espresso)                       */}
      {/* ============================================================ */}

      <section className="as-section relative overflow-hidden bg-espresso text-cream-50">
        <GoldArc className="-top-32 left-[-6%] h-[720px] w-[900px]" opacity={0.28} />

        <div className="as-shell relative">
          <Reveal>
            <SectionLabel number="02" tone="light">
              Parametry
            </SectionLabel>
          </Reveal>

          <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
            <Reveal className="lg:col-span-7">
              <h2 className="as-display-section as-text-balance">
                Zaawansowane
                <br />
                parametry techniczne.
              </h2>
            </Reveal>
            <Reveal delay={90} className="lg:col-span-5 lg:pt-1">
              <p className="as-caption-invert">
                Przełom w dziedzinie makijażu permanentnego — zoptymalizowane pod kątem pigmentów
                mineralnych i hybrydowych.
              </p>
            </Reveal>
          </div>

          <div className="mt-10 grid gap-y-10 md:grid-cols-2 md:gap-x-0 lg:grid-cols-4">
            {SPEC_PILLARS.map((pillar, i) => (
              <Reveal key={pillar.number} delay={i * 90}>
                <div className="as-card-col">
                  <NumberedItem number={pillar.number} title={pillar.title} tone="light">
                    {pillar.desc}
                  </NumberedItem>
                </div>
              </Reveal>
            ))}
          </div>

          {/* — drugi blok: interaktywny przewodnik po prędkościach — */}
          <div className="mt-14 border-t border-cream-200/15 pt-10">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
              <Reveal className="lg:col-span-7">
                <h3 className="font-display text-2xl text-cream-50 sm:text-[1.75rem]">
                  Wybierz prędkość i technikę pracy.
                </h3>
              </Reveal>
              <Reveal delay={90} className="lg:col-span-5 lg:pt-1">
                <p className="as-caption-invert">
                  Kliknij poszczególne poziomy obrotów RPM, aby poznać dedykowane zastosowanie i
                  zalecaną technikę pigmentacji.
                </p>
              </Reveal>
            </div>

            <Reveal delay={80}>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
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
                        'flex flex-col items-start gap-3 border px-5 py-6 text-left transition-colors duration-300 last:col-span-2 lg:last:col-span-1',
                        active
                          ? 'border-gold bg-gold text-espresso-900'
                          : 'border-cream-200/30 text-cream-50 hover:border-gold-light'
                      )}
                    >
                      <span className={cn('as-num', active ? 'text-espresso-900' : 'text-gold-light')}>
                        {String(speed.level).padStart(2, '0')}
                      </span>
                      <span className={cn('as-label', active ? 'text-espresso-900/75' : 'text-cream-200/70')}>
                        {speed.rpm}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-12">
                <div className="as-card-col lg:col-span-7">
                  <div className="flex items-center gap-4">
                    <span className="as-label text-gold-light">{selectedSpeed.rpm}</span>
                    <span className="h-px w-10 bg-cream-200/20" aria-hidden="true" />
                    <span className="as-kicker-invert">
                      Poziom {String(selectedSpeed.level).padStart(2, '0')}
                    </span>
                  </div>
                  <h4 className="mt-5 font-display text-2xl text-cream-50 sm:text-[1.75rem]">
                    {selectedSpeed.name}
                  </h4>
                  <p className="as-caption-invert mt-2">{selectedSpeed.desc}</p>
                </div>

                <div className="lg:col-span-5">
                  <p className="as-kicker-invert">Parametry poziomu</p>
                  <div className="mt-2">
                    <PriceRow name="Obroty" price={selectedSpeed.rpm} tone="light" />
                    <PriceRow name="Technika" price={selectedSpeed.name} tone="light" />
                    <PriceRow
                      name="Rekomendowana igła"
                      note="Dobór zależny od skóry i techniki"
                      price="1RL 0.25 / 3RL 0.18"
                      tone="light"
                    />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  03 — KATALOG (cream-100; karty .as-card-col + tabela)       */}
      {/* ============================================================ */}

      <section id="katalog" className="as-section relative scroll-mt-28 overflow-hidden bg-cream-100">
        <GoldArc className="-top-10 right-[-8%] h-[600px] w-[820px]" flip opacity={0.35} />

        <div className="as-shell relative">
          <Reveal>
            <SectionLabel number="03">Katalog</SectionLabel>
          </Reveal>

          <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
            <Reveal className="lg:col-span-7">
              <h2 className="as-display-section as-text-balance text-ink">
                Katalog
                <br />
                urządzeń PMU.
              </h2>
            </Reveal>
            <Reveal delay={90} className="lg:col-span-5 lg:pt-1">
              <p className="as-caption">
                Wszystkie maszynki objęte są 24-miesięczną gwarancją producenta oraz wsparciem
                technicznym.
              </p>
            </Reveal>
          </div>

          <div className="mt-10 grid gap-y-10 md:grid-cols-2 md:gap-x-0">
            {MACHINES_DATA.map((machine, i) => (
              <Reveal key={machine.id} delay={(i % 2) * 90}>
                <article className="as-card-col">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <span className="as-num">{machine.number}</span>
                      <span className="h-px w-10 bg-ink/15" aria-hidden="true" />
                    </div>
                    {machine.badge && <span className="as-badge">{machine.badge}</span>}
                  </div>

                  <p className="as-kicker mt-5">{machine.subtitle}</p>
                  <h3 className="mt-2 font-display text-2xl text-ink sm:text-[1.75rem]">
                    {machine.name}
                  </h3>

                  <div className="mt-4 flex items-baseline gap-4">
                    <span className="font-display text-xl text-ink">{machine.price} zł</span>
                    {machine.originalPrice && (
                      <span className="text-sm text-mocha-400 line-through">
                        {machine.originalPrice} zł
                      </span>
                    )}
                  </div>

                  <p className="as-caption mt-4">{machine.description}</p>

                  <p className="as-kicker mt-8">Cechy kluczowe</p>
                  <ul className="mt-3 space-y-2.5">
                    {machine.features.map((feat) => (
                      <li key={feat} className="flex gap-4">
                        <span aria-hidden="true" className="as-dash" />
                        <span className="as-caption max-w-none">{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex-1">
                    <p className="as-kicker">Specyfikacja</p>
                    <SpecList specs={machine.specs} className="mt-2" />
                  </div>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <CtaButton onClick={() => handleAskAbout(machine)} className="as-btn-solid">
                      Zapytaj o dostępność
                    </CtaButton>
                    {machine.name.includes('PRINCESS') && (
                      <CtaButton onClick={() => openRental(machine)} className="as-btn-ghost">
                        Wynajmij 369 zł / mc
                      </CtaButton>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          {/* — tabela porównawcza parametrów — */}
          <Reveal delay={90}>
            <div className="mt-12">
              <SectionLabel>Zestawienie parametrów</SectionLabel>

              <p className="as-label mt-6 text-ink/45 md:hidden">Przewiń w bok &#8594;</p>

              {/* na wąskim ekranie tabela przewija się w bok; cienki pasek zostaje
                  widoczny, żeby było wiadomo, że jest co przewijać */}
              <div
                className="mt-3 overflow-x-auto pb-3 md:mt-6"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(184,151,104,0.6) transparent' }}
              >
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead>
                    <tr className="border-y border-ink/15">
                      <th scope="col" className="as-label py-4 pr-6 text-ink/55">
                        Model
                      </th>
                      {SPEC_ROWS.map((row) => (
                        <th key={row.key} scope="col" className="as-label py-4 pr-6 text-ink/55">
                          {row.label}
                        </th>
                      ))}
                      <th scope="col" className="as-label py-4 text-right text-ink/55">
                        Cena
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {MACHINES_DATA.map((machine) => (
                      <tr key={machine.id} className="border-b border-ink/10 align-top">
                        <th scope="row" className="py-5 pr-6 font-normal">
                          <span className="block font-display text-lg text-ink">
                            {machine.name}
                          </span>
                          <span className="as-kicker mt-1.5 block">{machine.number}</span>
                        </th>
                        {SPEC_ROWS.map((row) => (
                          <td
                            key={row.key}
                            className="py-5 pr-6 text-[0.8125rem] leading-[1.75] text-mocha"
                          >
                            {machine.specs[row.key]}
                          </td>
                        ))}
                        <td className="whitespace-nowrap py-5 text-right font-display text-xl text-ink">
                          {machine.price} zł
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  04 — EFEKTY (mocha; jedyna sekcja ze zdjęciami efektów)     */}
      {/* ============================================================ */}

      <section className="as-section relative overflow-hidden bg-mocha text-cream-50">
        <GoldArc className="top-0 left-[8%] h-[760px] w-[900px]" opacity={0.25} />

        <div className="as-shell relative">
          <Reveal>
            <SectionLabel number="04" tone="light">
              Efekty
            </SectionLabel>
          </Reveal>

          <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
            <Reveal className="lg:col-span-7">
              <h2 className="as-display-section as-text-balance">
                Sprzęt poznaje się
                <br />
                po <span className="italic text-gold-light">efekcie.</span>
              </h2>
            </Reveal>
            <Reveal delay={90} className="lg:col-span-5 lg:pt-1">
              <p className="as-caption-invert">
                Poniżej efekty zabiegów PMU — włos maszynowy, technika pudrowa i praca na ustach.
              </p>
              <ArrowLink href="/uslugi" tone="light" className="mt-8 w-fit">
                Zobacz wszystkie zabiegi
              </ArrowLink>
            </Reveal>
          </div>

          {/* cztery kadry w jednej złotej ramce — jak trójka w „O nas" na stronie głównej */}
          <Reveal delay={80} className="mt-10">
            <div className="as-photo-frame grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
              {EFFECT_SHOTS.map((shot) => (
                <Figure
                  key={shot.caption}
                  image={shot.image}
                  alt={shot.alt}
                  ratio={shot.ratio}
                  position={shot.position}
                  tone="dark"
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                />
              ))}
            </div>
            {/* podpisy pod ramką — ta sama siatka co kadry */}
            <div className="mt-3 grid gap-x-1 gap-y-1 px-1 sm:grid-cols-2 lg:grid-cols-4">
              {EFFECT_SHOTS.map((shot) => (
                <p key={shot.caption} className="as-caption-invert">
                  {shot.caption}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <p className="mt-6 max-w-xl text-xs leading-relaxed text-cream-200/65">
              To rezultaty, do których prowadzą opisane wyżej prędkości i skok igły. Zdjęcia
              przedstawiają efekty zabiegów makijażu permanentnego, a nie zdjęcia urządzeń.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  05 — WYNAJEM (cream-50)                                     */}
      {/* ============================================================ */}

      <section className="as-section bg-cream-50">
        <div className="as-shell">
          <Reveal>
            <SectionLabel number="05">Wynajem</SectionLabel>
          </Reveal>

          <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6">
              <Reveal>
                <h2 className="as-display-section as-text-balance text-ink">
                  Program wynajmu
                  <br />
                  dla salonów.
                </h2>
                <p className="as-caption mt-6">
                  Rozwijaj swój salon bez zamrażania kapitału. Wynajmij bezprzewodową maszynkę{' '}
                  <span className="text-ink">AS PRINCESS</span> na dogodnych warunkach ze stałą
                  opłatą <span className="text-ink">369 zł miesięcznie</span>.
                </p>
              </Reveal>

              <Reveal delay={90}>
                <ul className="mt-6 space-y-2.5">
                  {RENTAL_POINTS.map((point) => (
                    <li key={point} className="flex gap-4">
                      <span aria-hidden="true" className="as-dash" />
                      <span className="as-caption">{point}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-wrap gap-4">
                  <CtaButton onClick={() => openRental()} className="as-btn-gold">
                    Wyślij zapytanie o wynajem
                  </CtaButton>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-6">
              <Reveal delay={120}>
                <div className="as-card-col">
                  <p className="as-kicker">Model subskrypcyjny B2B</p>
                  <h3 className="mt-3 font-display text-2xl text-ink sm:text-[1.75rem]">
                    Kalkulator korzyści
                  </h3>
                  <div className="mt-6">
                    {RENTAL_MATH.map((row) => (
                      <PriceRow key={row.name} name={row.name} note={row.note} price={row.price} />
                    ))}
                  </div>
                  <p className="mt-6 max-w-lg text-xs leading-relaxed text-mocha-400">
                    Wyliczenie poglądowe dla 10 zabiegów miesięcznie. Szczegóły umowy ustalamy
                    indywidualnie po wysłaniu zapytania.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  06 — KONTAKT (espresso-900; wspólny pas zamykający)         */}
      {/* ============================================================ */}

      <ClosingCta
        number="06"
        label="Kontakt"
        title="Przetestuj maszynę"
        titleAccent="na żywo."
        lead={`Maszynę AS Princess można przetestować na miejscu podczas szkolenia w ${BRAND.academy}. Napisz do nas, jeśli chcesz porównać modele przed zakupem albo zapytać o wynajem.`}
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
              opcji 369 zł / mc.
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
              <button type="submit" className="as-btn-gold">
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
