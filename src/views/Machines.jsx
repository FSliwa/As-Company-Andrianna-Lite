// TODO: brak packshotów maszynek w /Graphics.
//
// W firmowym folderze nie ma ANI JEDNEGO zdjęcia produktowego maszynek
// (AS HERO / AS HERO 2 / AS PRINCESS), kartridży ani akcesoriów.
// Dlatego cała strona jest zbudowana typograficznie: duże nagłówki,
// numerowane karty specyfikacji, tabele parametrów i złote linie.
//
// Zdjęcia z /graphics (panele PANELS/BY_NAME + pojedyncze makra BROWS/LIPS)
// pojawiają się WYŁĄCZNIE w sekcji „Efekty” i są podpisane jako efekt
// zabiegu — nigdy jako zdjęcie sprzętu. Sekcja jest ciemna (bg-mocha),
// więc każdy kadr dostaje tone="dark"; pliki zbiorcze sklejek są zakazane.
// Gdy pojawią się prawdziwe packshoty, można je wpiąć w sekcję 04 (katalog).

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLink,
  FactStrip,
  Figure,
  GoldArc,
  PageHero,
  PriceRow,
  Reveal,
  SectionLabel,
} from '@/components/as/Primitives';
import { BRAND } from '@/lib/site';
import { BROWS, BY_NAME, LIPS } from '@/lib/media';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

/* Numerowane karty specyfikacji — zamiast ikonek i kafelków z cieniem. */
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
   Cztery kadry w jednym rzędzie → jedna proporcja 16/10 dla wszystkich.
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

/* ================================================================== */

export default function Machines() {
  const { toast } = useToast();
  const [selectedSpeed, setSelectedSpeed] = useState(SPEED_LEVELS[0]);
  const [selectedMachineForRental, setSelectedMachineForRental] = useState(null);
  const [rentalForm, setRentalForm] = useState({ name: '', phone: '', email: '', salonName: '' });

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
    setRentalForm({ name: '', phone: '', email: '', salonName: '' });
  };

  return (
    <>
      {/* ============================================================ */}
      {/*  01 — HERO (typograficzny, bez zdjęcia — brak packshotów)    */}
      {/* ============================================================ */}

      <PageHero
        label="Urządzenia"
        number="01"
        title="Maszynki PMU"
        titleAccent="AS HERO & AS PRINCESS"
        lead="Zaprojektowane z myślą o najwyższym komforcie pracy linergistek. Lekka konstrukcja ze stopu lotniczego aluminium, 7 trybów prędkości, zmienny skok i wymienne akumulatory zapewniają bezkompromisową precyzję."
        tone="cream"
      >
        <div className="flex flex-wrap gap-4">
          <a href="#katalog" className="as-btn-solid">
            Przeglądaj modele
          </a>
          <button
            type="button"
            onClick={() => setSelectedMachineForRental(MACHINES_DATA[2])}
            className="as-btn-ghost"
          >
            Wynajem 369 zł / mc
          </button>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-gold/35 pt-6 sm:flex-row sm:items-baseline sm:gap-6">
          <span className="as-label shrink-0 text-gold-dark">Oferta specjalna</span>
          <p className="as-body text-[0.8125rem]">
            Zamów maszynkę AS PRINCESS lub skorzystaj z modelu wynajmu za 369 zł miesięcznie.
          </p>
        </div>

        <FactStrip
          className="mt-10"
          items={['7 prędkości', 'Skok 2.1 – 3.0 mm', '107 g', '24 miesiące gwarancji']}
        />
      </PageHero>

      {/* ============================================================ */}
      {/*  02 — PARAMETRY (numerowane karty specyfikacji)              */}
      {/* ============================================================ */}

      <section className="as-section relative overflow-hidden bg-espresso text-cream-50">
        <GoldArc className="-top-32 left-[-6%] h-[720px] w-[900px]" opacity={0.28} />

        <div className="as-shell relative">
          <Reveal>
            <SectionLabel number="02" tone="light">
              Parametry
            </SectionLabel>
          </Reveal>

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
            <Reveal className="lg:col-span-7">
              <h2 className="as-display-lg as-text-balance">
                Zaawansowane
                <br />
                parametry techniczne.
              </h2>
            </Reveal>
            <Reveal delay={90} className="lg:col-span-5 lg:pb-3">
              <p className="as-body-invert max-w-md">
                Przełom w dziedzinie makijażu permanentnego — zoptymalizowane pod kątem pigmentów
                mineralnych i hybrydowych.
              </p>
            </Reveal>
          </div>

          <div className="mt-16 grid border-t border-cream-200/15 md:grid-cols-2 lg:grid-cols-4">
            {SPEC_PILLARS.map((pillar, i) => (
              <Reveal key={pillar.number} delay={i * 90}>
                <div className="flex h-full flex-col border-b border-cream-200/15 py-10 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0">
                  <div className="flex items-center gap-4">
                    <span className="as-num text-gold-light">{pillar.number}</span>
                    <span className="h-px w-8 bg-cream-200/25" />
                  </div>
                  <h3 className="as-display-sm mt-5 italic text-cream-50">{pillar.title}</h3>
                  <p className="as-body-invert mt-3 text-[0.8125rem]">{pillar.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  03 — PRĘDKOŚCI (interaktywny przewodnik)                    */}
      {/* ============================================================ */}

      <section className="as-section relative overflow-hidden bg-cream-100">
        <GoldArc className="-top-10 right-[-8%] h-[600px] w-[820px]" flip opacity={0.35} />

        <div className="as-shell relative">
          <Reveal>
            <SectionLabel number="03">Prędkości</SectionLabel>
          </Reveal>

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-16">
            <Reveal className="lg:col-span-7">
              <h2 className="as-display-lg as-text-balance text-ink">
                Wybierz prędkość
                <br />i technikę pracy.
              </h2>
            </Reveal>
            <Reveal delay={90} className="lg:col-span-5 lg:pt-6">
              <p className="as-body max-w-md">
                Kliknij poszczególne poziomy obrotów RPM, aby poznać dedykowane zastosowanie i
                zalecaną technikę pigmentacji.
              </p>
            </Reveal>
          </div>

          <Reveal delay={80}>
            <div className="mt-14 grid grid-cols-2 gap-px border border-ink/12 bg-ink/12 sm:grid-cols-4 lg:grid-cols-7">
              {SPEED_LEVELS.map((speed) => {
                const active = selectedSpeed.level === speed.level;
                return (
                  <button
                    key={speed.level}
                    type="button"
                    onClick={() => setSelectedSpeed(speed)}
                    aria-pressed={active}
                    className={cn(
                      'flex flex-col items-start gap-3 px-5 py-6 text-left transition-colors duration-300',
                      active
                        ? 'bg-espresso text-cream-50'
                        : 'bg-cream-50 text-ink hover:bg-cream-200/60'
                    )}
                  >
                    <span className={cn('as-num', active ? 'text-gold-light' : 'text-gold')}>
                      {String(speed.level).padStart(2, '0')}
                    </span>
                    <span
                      className={cn(
                        'as-label',
                        active ? 'text-cream-200/75' : 'text-ink/55'
                      )}
                    >
                      {speed.rpm}
                    </span>
                  </button>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-10 grid gap-10 border-t border-ink/12 pt-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-7">
                <div className="flex items-center gap-4">
                  <span className="as-label text-gold-dark">{selectedSpeed.rpm}</span>
                  <span className="h-px w-12 bg-ink/15" />
                  <span className="as-label text-ink/45">
                    Poziom {String(selectedSpeed.level).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="as-display-md mt-5 text-ink">{selectedSpeed.name}</h3>
                <p className="as-body mt-4 max-w-xl">{selectedSpeed.desc}</p>
              </div>

              <div className="lg:col-span-5">
                <p className="as-label mb-2 text-ink/45">Parametry poziomu</p>
                <PriceRow name="Obroty" price={selectedSpeed.rpm} />
                <PriceRow name="Technika" price={selectedSpeed.name} />
                <PriceRow
                  name="Rekomendowana igła"
                  note="Dobór zależny od skóry i techniki"
                  price="1RL 0.25 / 3RL 0.18"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  04 — KATALOG (karty typograficzne + tabela parametrów)      */}
      {/* ============================================================ */}

      <section id="katalog" className="as-section scroll-mt-28 bg-cream-50">
        <div className="as-shell">
          <Reveal>
            <SectionLabel number="04">Katalog</SectionLabel>
          </Reveal>

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
            <Reveal className="lg:col-span-7">
              <h2 className="as-display-lg as-text-balance text-ink">Katalog urządzeń PMU</h2>
            </Reveal>
            <Reveal delay={90} className="lg:col-span-5 lg:pb-3">
              <p className="as-body max-w-md">
                Wszystkie maszynki objęte są 24-miesięczną gwarancją producenta oraz wsparciem
                technicznym.
              </p>
            </Reveal>
          </div>

          <div className="mt-16 grid gap-x-16 gap-y-px border-t border-ink/12 md:grid-cols-2">
            {MACHINES_DATA.map((machine, i) => (
              <Reveal key={machine.id} delay={(i % 2) * 90}>
                <article className="flex h-full flex-col border-b border-ink/12 py-12">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <span className="as-num">{machine.number}</span>
                      <span className="h-px w-10 bg-ink/15" />
                    </div>
                    {machine.badge && (
                      <span className="as-label border border-gold/45 px-3 py-1.5 text-gold-dark">
                        {machine.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="as-display-md mt-6 text-ink">{machine.name}</h3>
                  <p className="as-label mt-3 text-ink/45">{machine.subtitle}</p>

                  <div className="mt-6 flex items-baseline gap-4">
                    <span className="font-display text-3xl text-ink">{machine.price} zł</span>
                    {machine.originalPrice && (
                      <span className="text-sm text-mocha-400 line-through">
                        {machine.originalPrice} zł
                      </span>
                    )}
                  </div>

                  <p className="as-body mt-6">{machine.description}</p>

                  <p className="as-label mt-9 text-ink/45">Cechy kluczowe</p>
                  <ul className="mt-4 space-y-3">
                    {machine.features.map((feat) => (
                      <li key={feat} className="flex gap-4">
                        <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-gold" />
                        <span className="as-body text-[0.8125rem]">{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-9 flex-1">
                    <p className="as-label mb-2 text-ink/45">Specyfikacja</p>
                    {SPEC_ROWS.map((row) => (
                      <PriceRow key={row.key} name={row.label} price={machine.specs[row.key]} />
                    ))}
                  </div>

                  <div className="mt-9 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleAskAbout(machine)}
                      className="as-btn-solid"
                    >
                      Zapytaj o dostępność
                    </button>
                    {machine.name.includes('PRINCESS') && (
                      <button
                        type="button"
                        onClick={() => setSelectedMachineForRental(machine)}
                        className="as-btn-ghost"
                      >
                        Wynajmij 369 zł / mc
                      </button>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          {/* — tabela porównawcza parametrów — */}
          <Reveal delay={90}>
            <div className="mt-20">
              <SectionLabel>Zestawienie parametrów</SectionLabel>

              <div className="as-noscrollbar mt-8 overflow-x-auto">
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
                          <span className="as-label mt-1.5 block text-ink/40">
                            {machine.number}
                          </span>
                        </th>
                        {SPEC_ROWS.map((row) => (
                          <td key={row.key} className="py-5 pr-6 text-[0.8125rem] leading-relaxed text-mocha">
                            {machine.specs[row.key]}
                          </td>
                        ))}
                        <td className="whitespace-nowrap py-5 text-right font-display text-lg text-ink">
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
      {/*  05 — EFEKTY (jedyna sekcja ze zdjęciami — efekt, nie sprzęt)*/}
      {/* ============================================================ */}

      <section className="as-section relative overflow-hidden bg-mocha text-cream-50">
        <GoldArc className="top-0 left-[8%] h-[760px] w-[900px]" opacity={0.25} />

        <div className="as-shell relative">
          <Reveal>
            <SectionLabel number="05" tone="light">
              Efekty
            </SectionLabel>
          </Reveal>

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
            <Reveal className="lg:col-span-7">
              <h2 className="as-display-lg as-text-balance">
                Sprzęt poznaje się
                <br />
                po <span className="italic text-gold-light">efekcie.</span>
              </h2>
            </Reveal>
            <Reveal delay={90} className="lg:col-span-5 lg:pb-3">
              <p className="as-body-invert max-w-md">
                Poniżej efekty zabiegów PMU — włos maszynowy, technika pudrowa i praca na ustach.
                To rezultaty, do których prowadzą opisane wyżej prędkości i skok igły.
              </p>
              <ArrowLink href="/uslugi" tone="light" className="mt-8 w-fit">
                Zobacz wszystkie zabiegi
              </ArrowLink>
            </Reveal>
          </div>

          <div className="mt-16 grid gap-6 border-t border-cream-200/15 pt-12 sm:grid-cols-2 lg:grid-cols-4">
            {EFFECT_SHOTS.map((shot, i) => (
              <Reveal key={shot.caption} delay={i * 90}>
                <figure>
                  <Figure
                    image={shot.image}
                    alt={shot.alt}
                    ratio={shot.ratio}
                    position={shot.position}
                    tone="dark"
                    sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                  />
                  <figcaption className="as-label mt-4 text-cream-200/70">
                    {shot.caption}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <p className="mt-10 max-w-2xl text-xs leading-relaxed text-cream-200/50">
              Zdjęcia przedstawiają efekty zabiegów makijażu permanentnego, a nie zdjęcia
              urządzeń.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  06 — WYNAJEM                                                */}
      {/* ============================================================ */}

      <section className="as-section bg-cream-50">
        <div className="as-shell">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <Reveal>
                <SectionLabel number="06">Wynajem</SectionLabel>
                <h2 className="as-display-lg as-text-balance mt-8 text-ink">
                  Program wynajmu
                  <br />
                  dla salonów.
                </h2>
                <p className="as-body mt-7 max-w-md">
                  Rozwijaj swój salon bez zamrażania kapitału. Wynajmij bezprzewodową maszynkę{' '}
                  <span className="text-ink">AS PRINCESS</span> na dogodnych warunkach ze stałą
                  opłatą <span className="text-ink">369 zł miesięcznie</span>.
                </p>
              </Reveal>

              <Reveal delay={90}>
                <ul className="mt-9 space-y-4">
                  {RENTAL_POINTS.map((point) => (
                    <li key={point} className="flex gap-4">
                      <span aria-hidden="true" className="mt-2.5 h-px w-5 shrink-0 bg-gold" />
                      <span className="as-body text-[0.8125rem]">{point}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => setSelectedMachineForRental(MACHINES_DATA[2])}
                  className="as-btn-gold mt-10"
                >
                  Wyślij zapytanie o wynajem
                </button>
              </Reveal>
            </div>

            <div className="lg:col-span-6">
              <Reveal delay={120}>
                <p className="as-label text-ink/45">Model subskrypcyjny B2B</p>
                <p className="as-display-sm mt-4 text-ink">Kalkulator korzyści</p>
                <div className="mt-8">
                  {RENTAL_MATH.map((row) => (
                    <PriceRow key={row.name} name={row.name} note={row.note} price={row.price} />
                  ))}
                </div>
                <p className="mt-6 max-w-lg text-xs leading-relaxed text-mocha-400">
                  Wyliczenie poglądowe dla 10 zabiegów miesięcznie. Szczegóły umowy ustalamy
                  indywidualnie po wysłaniu zapytania.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  07 — CTA                                                    */}
      {/* ============================================================ */}

      <section className="relative overflow-hidden bg-espresso-900 text-cream-50">
        <div className="as-shell py-20 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-7">
              <SectionLabel number="07" tone="light">
                Kontakt
              </SectionLabel>
              <h2 className="as-display-lg as-text-balance mt-8">
                Przetestuj maszynę <span className="italic text-gold-light">na żywo.</span>
              </h2>
              <p className="as-body-invert mt-7 max-w-lg">
                Maszynę AS Princess można przetestować na miejscu podczas szkolenia w{' '}
                {BRAND.academy}. Napisz do nas, jeśli chcesz porównać modele przed zakupem albo zapytać o
                wynajem.
              </p>
            </Reveal>

            <Reveal delay={90} className="flex flex-wrap gap-4 lg:col-span-5 lg:justify-end">
              <Link href="/kontakt" className="as-btn-gold">
                Zapytaj o maszynkę
              </Link>
              <Link href="/szkolenia" className="as-btn-ghost-light">
                Terminy szkoleń
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Formularz wynajmu                                           */}
      {/* ============================================================ */}

      <Dialog
        open={!!selectedMachineForRental}
        onOpenChange={() => setSelectedMachineForRental(null)}
      >
        <DialogContent className="border-ink/12 bg-cream-50 sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="as-display-sm text-left text-ink">
              Wniosek o wynajem maszynki PMU
            </DialogTitle>
            <DialogDescription className="as-body text-left text-[0.8125rem]">
              Wypełnij krótki formularz, aby zarezerwować model {selectedMachineForRental?.name} w
              opcji 369 zł / mc.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRentalSubmit} className="space-y-5 py-2">
            <div>
              <Label htmlFor="name" className="as-label text-ink/55">
                Imię i nazwisko
              </Label>
              <Input
                id="name"
                required
                placeholder="np. Anna Kowalska"
                value={rentalForm.name}
                onChange={(e) => setRentalForm({ ...rentalForm, name: e.target.value })}
                className="mt-2 border-ink/15 bg-cream"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="as-label text-ink/55">
                Numer telefonu
              </Label>
              <Input
                id="phone"
                required
                type="tel"
                placeholder="+48 600 000 000"
                value={rentalForm.phone}
                onChange={(e) => setRentalForm({ ...rentalForm, phone: e.target.value })}
                className="mt-2 border-ink/15 bg-cream"
              />
            </div>
            <div>
              <Label htmlFor="email" className="as-label text-ink/55">
                Adres e-mail
              </Label>
              <Input
                id="email"
                required
                type="email"
                placeholder="salon@example.com"
                value={rentalForm.email}
                onChange={(e) => setRentalForm({ ...rentalForm, email: e.target.value })}
                className="mt-2 border-ink/15 bg-cream"
              />
            </div>
            <div>
              <Label htmlFor="salonName" className="as-label text-ink/55">
                Nazwa salonu / działalności
              </Label>
              <Input
                id="salonName"
                placeholder="np. Studio Beauty Katowice"
                value={rentalForm.salonName}
                onChange={(e) => setRentalForm({ ...rentalForm, salonName: e.target.value })}
                className="mt-2 border-ink/15 bg-cream"
              />
            </div>

            <DialogFooter className="gap-3 pt-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setSelectedMachineForRental(null)}
                className="as-btn-ghost"
              >
                Anuluj
              </button>
              <button type="submit" className="as-btn-solid">
                Wyślij wniosek
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
