'use client';

/**
 * Katalog pigmentów i akcesoriów.
 *
 * ⚠️ DANE DO POTWIERDZENIA: nazwy, ceny i pojemności poniżej pochodzą
 * z pierwotnej wersji serwisu (wygenerowanej z szablonu) i nie zostały przez
 * nikogo zweryfikowane. Przed publikacją sprawdź je z aktualnym cennikiem
 * hurtowym — to jedyne miejsce w kodzie, w którym trzeba je poprawić.
 *
 * W folderze /Graphics nie ma packshotów pigmentów, dlatego karty produktów
 * pokazują próbnik koloru (colorHex), a nie zdjęcie butelki. Gdy pojawią się
 * zdjęcia produktowe, dodaj je do manifestu w src/lib/media.js i podepnij tutaj.
 *
 * Koszyk nie istnieje — poprzednia wersja udawała dodawanie do koszyka
 * komunikatem „Dodano do koszyka". Zastąpione zapytaniem o produkt.
 *
 * Układ: ten sam system co strona główna (src/views/Home.jsx) — PageHero
 * z paskiem faktów, rytm tła jasna/ciemna (cream-50 → espresso → cream-100 →
 * espresso-900), nagłówki .as-display-section, kolaż w .as-photo-frame,
 * karty .as-card-col, pole szukajki <Field>, pas zamykający <ClosingCta>,
 * numeracja etykiet ciągła 01–04.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLink,
  ClosingCta,
  Field,
  Figure,
  GoldArc,
  PageHero,
  Reveal,
  SectionLabel,
} from '@/components/as/Primitives';
import { BROWS, BY_NAME } from '@/lib/media';
import { cn } from '@/lib/utils';

const PIGMENT_CATEGORIES = [
  { id: "all", name: "Wszystkie Produkty" },
  { id: "lips", name: "Pigmenty do Ust (Opium & Classic)" },
  { id: "brows", name: "Pigmenty do Brwi (Light Minerals)" },
  { id: "eyelids", name: "Pigmenty do Powiek (Eyelids)" },
  { id: "medical", name: "Medyczne (Areola & Trichopigmentation)" },
  { id: "special", name: "Kolekcje Autorskie (Special Edition)" },
  { id: "accessories", name: "Kartridże & Chemia (Remover / Care)" },
];

const PRODUCTS = [
  // Lips
  {
    id: "pig-lip-1",
    category: "lips",
    name: "AS OPIUM #01 Velvet Nude",
    subtitle: "Pigment do ust – ciepły naturalny nude",
    price: 189,
    capacity: "10 ml",
    colorHex: "#C47B74",
    badge: "Bestseller",
    description: "Kremowy, aksamitny odcień nude z delikatnymi różowymi podtonami. Dedykowany do technik pudrowego wypełnienia ust.",
    type: "Hybryda mineralna"
  },
  {
    id: "pig-lip-2",
    category: "lips",
    name: "AS OPIUM #05 Royal Berry",
    subtitle: "Pigment do ust – głęboka malinowa czerwień",
    price: 189,
    capacity: "10 ml",
    colorHex: "#9E384D",
    badge: null,
    description: "Intensywna, wyrazista barwa dla klientek poszukujących efektu szminki (Lipstick Effect). Doskonała trwałość po wygojeniu.",
    type: "Hybryda mineralna"
  },
  {
    id: "pig-lip-3",
    category: "lips",
    name: "AS Classic Coral Bliss",
    subtitle: "Pigment do ust – soczysty koral",
    price: 169,
    capacity: "10 ml",
    colorHex: "#D96B58",
    badge: "Promocja",
    description: "Ciepły, odmładzający odcień koralowy. Przeznaczony do korekty chłodnych ust oraz do nadawania świeżości.",
    type: "Kolekcja Classic"
  },

  // Brows - Mineral
  {
    id: "pig-brow-1",
    category: "brows",
    name: "AS OPIUM Light Minerals #01 Blonde",
    subtitle: "Pigment do brwi – jasny neutralny blond",
    price: 199,
    capacity: "10 ml",
    colorHex: "#A0866A",
    badge: "Light Minerals",
    description: "Dystrybuowany barwnik 100% mineralny. Wyłuszcza się ze skóry w sposób całkowicie czysty i przewidywalny bez czerwonych podtonów.",
    type: "100% Mineralny"
  },
  {
    id: "pig-brow-2",
    category: "brows",
    name: "AS OPIUM Light Minerals #03 Cold Brown",
    subtitle: "Pigment do brwi – chłodny średni brąz",
    price: 199,
    capacity: "10 ml",
    colorHex: "#5E4B3C",
    badge: "Light Minerals",
    description: "Czysty, chłodny brąz z delikatną nutką popielu. Równomierne osadzanie się w naskórku przy technice Ombre Powder.",
    type: "100% Mineralny"
  },
  {
    id: "pig-brow-3",
    category: "brows",
    name: "AS OPIUM Light Minerals #05 Dark Espresso",
    subtitle: "Pigment do brwi – głęboki ciemny brąz",
    price: 199,
    capacity: "10 ml",
    colorHex: "#3A2E28",
    badge: "Light Minerals",
    description: "Wyrazisty, głęboki odcień dla szatynek i brunetek. Stabilna formuła chroniąca przed szarzeniem koloru.",
    type: "100% Mineralny"
  },

  // Eyelids
  {
    id: "pig-eye-1",
    category: "eyelids",
    name: "AS OPIUM Eyelids Deep Black",
    subtitle: "Pigment do powiek – aksamitna głęboka czerń",
    price: 199,
    capacity: "10 ml",
    colorHex: "#1A1A1A",
    badge: "Eyeliner Spec",
    description: "Niezwykle gęsty, nasycony pigment do kresek zagęszczających i dekoracyjnych. Bez ryzyka migracji podskórnej.",
    type: "Special Eyelids"
  },

  // Medical PMU
  {
    id: "pig-med-1",
    category: "medical",
    name: "AS Areola #02 Natural Areola",
    subtitle: "Pigment medyczny – rekonstrukcja otoczki brodawki",
    price: 220,
    capacity: "10 ml",
    colorHex: "#B87A6F",
    badge: "Medyczny PMU",
    description: "Specjalistyczny barwnik medyczny stosowany po zabiegach mastektomii oraz w zabiegach rekonstrukcji piersi.",
    type: "Medical Grade"
  },
  {
    id: "pig-med-2",
    category: "medical",
    name: "AS Trichopigmentation Scalp Dark",
    subtitle: "Pigment do mikropigmentacji skóry głowy",
    price: 240,
    capacity: "10 ml",
    colorHex: "#2E2D2B",
    badge: "Trichopigmentation",
    description: "Specjalnie zbalansowany pigment imitujący mieszek włosowy do optycznego zagęszczania fryzury.",
    type: "Medical Grade"
  },

  // Special Editions
  {
    id: "pig-spec-1",
    category: "special",
    name: "Special Edition: Hairstrokes #02 Hyper-Realism",
    subtitle: "Edycja Autorska – metoda włoskowa hyper-realizm",
    price: 210,
    capacity: "10 ml",
    colorHex: "#4A3B32",
    badge: "Special Edition",
    description: "Płynny barwnik ułatwiający tworzenie niezwykle cienkich rysunków włosków maszynką lub piórkiem.",
    type: "Autorska Linia"
  },
  {
    id: "pig-spec-2",
    category: "special",
    name: "Special Edition: The One Ring Gold",
    subtitle: "Kolekcja Autorska – Modyfikator ocieplający",
    price: 179,
    capacity: "10 ml",
    colorHex: "#E39E42",
    badge: "Modyfikator",
    description: "Modyfikator w kroplach dodawany do barwników brwiowych w celu wyeliminowania chłodnych tonów.",
    type: "Modyfikator"
  },

  // Accessories & Care
  {
    id: "acc-1",
    category: "accessories",
    name: "Kartridże PMU Satellite (Box 20 szt.)",
    subtitle: "Sterylne kartridże z membraną ochronną 0.25 1RL",
    price: 140,
    capacity: "20 szt.",
    colorHex: "#D4DEC8",
    badge: "Akcesoria",
    description: "Japońska stal chirurgiczna, obudowa z plastycznego medycznego tworzywa. Kompatybilne z maszynami AS HERO.",
    type: "Kartridże"
  },
  {
    id: "acc-2",
    category: "accessories",
    name: "AS Chemical Remover PMU / Tattoo",
    subtitle: "Bezpieczny preparat chemiczny do usuwania PMU",
    price: 250,
    capacity: "15 ml",
    colorHex: "#E5E5E5",
    badge: "Remover",
    description: "Nieorganiczy płyn usuwający pigmenty każdego typu (w tym zielenie i błękity niewidoczne dla lasera).",
    type: "Remover"
  }
];

/* ================================================================== */
/*  01 — HERO                                                          */
/* ================================================================== */

function Hero() {
  return (
    <PageHero
      label="Pigmenty"
      number="01"
      title="Kolor, który"
      titleAccent="goi się przewidywalnie."
      lead="Pigmenty AS OPIUM i Light Minerals dobrane do pracy na brwiach, ustach i powiekach — plus linia medyczna do areoli i trichopigmentacji. Starannie opracowane formuły, intensywne kolory i przewidywalne gojenie."
      /* brows-15 ma dokładnie proporcję 4:5 — w kadrze PageHero mieści się
         w całości, bez przycinania. Makro skóry na kremie → ton „light". */
      image={BROWS[14]}
      imageAlt="Zbliżenie brwi po pigmentacji — rysunek pojedynczych włosków nad ciemnym okiem"
      imageTone="light"
      tone="cream"
      facts={['Brwi', 'Usta', 'Powieki', 'Linia medyczna']}
    >
      <div className="flex flex-wrap gap-4">
        <a href="#katalog" className="as-btn-solid">
          Przejdź do katalogu
        </a>
        <Link href="/certyfikaty" className="as-btn-ghost">
          Dokumentacja produktów
        </Link>
      </div>
    </PageHero>
  );
}

/* ================================================================== */
/*  02 — JAK SIĘ GOJĄ                                                  */
/* ================================================================== */

function HealedBand() {
  return (
    <section className="as-section relative overflow-hidden bg-espresso text-cream-50">
      <GoldArc className="-top-32 left-[-6%] h-[720px] w-[900px]" opacity={0.28} />

      <div className="as-shell relative">
        <Reveal>
          <SectionLabel number="02" tone="light">
            Jak się goją
          </SectionLabel>
        </Reveal>

        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Reveal>
              <h2 className="as-display-section as-text-balance">
                Wygojenie
                <br />
                jest dowodem.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="as-caption-invert mt-6">
                Prace wykonane naszymi pigmentami — zdjęcia po wygojeniu, nie świeżo po
                zabiegu. To moment, w którym widać, czy formuła trzyma kolor.
              </p>
            </Reveal>
            <Reveal delay={140}>
              <ArrowLink href="/uslugi" tone="light" className="mt-8 w-fit">
                Zobacz zabiegi
              </ArrowLink>
            </Reveal>
          </div>

          {/* Kolaż jak w „Szkoleniach" na stronie głównej: jeden szeroki kadr
              5:2 i dwa 2:1 pod nim, całość w złotej linii. Panele wycięte ze
              sklejek (bez szwu) są poziome (1,6–2,9:1), więc w tych ramkach
              tracą najmniej. lips-01-p2 ma wtopiony napis przy górnej krawędzi
              — position 60% wycina go z kadru; brows-12-p2 kotwiczony do lewej,
              żeby nie pokazywać skrawka drugiego oka przy prawej krawędzi. */}
          <div className="lg:col-span-8">
            <Reveal>
              <div className="as-photo-frame grid gap-1">
                <Figure
                  image={BY_NAME['brows-13-p1']}
                  alt="Pojedynczy łuk brwi po pigmentacji — zbliżenie"
                  ratio="5 / 2"
                  position="50% 50%"
                  tone="dark"
                  sizes="(min-width: 1024px) 60vw, 90vw"
                />
                <div className="grid grid-cols-2 gap-1">
                  <Figure
                    image={BY_NAME['lips-01-p2']}
                    alt="Usta po pigmentacji — wygojony, czerwony kolor"
                    ratio="2 / 1"
                    position="50% 60%"
                    tone="dark"
                    sizes="(min-width: 1024px) 30vw, 45vw"
                  />
                  <Figure
                    image={BY_NAME['brows-12-p2']}
                    alt="Oko z kreską na powiece i wypigmentowaną brwią"
                    ratio="2 / 1"
                    position="0% 50%"
                    tone="dark"
                    sizes="(min-width: 1024px) 30vw, 45vw"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  03 — KATALOG                                                       */
/* ================================================================== */

function Catalog() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const q = searchQuery.trim().toLowerCase();
  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch =
      !q ||
      product.name.toLowerCase().includes(q) ||
      product.description.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="katalog" className="as-section scroll-mt-24 bg-cream-100">
      <div className="as-shell">
        <Reveal>
          <SectionLabel number="03">Katalog</SectionLabel>
        </Reveal>

        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <Reveal className="lg:col-span-7">
            <h2 className="as-display-section as-text-balance text-ink">
              Pełna
              <br />
              paleta.
            </h2>
          </Reveal>

          <Reveal delay={80} className="lg:col-span-5">
            {/* szukajka na wspólnym polu formularza — ta sama linia pod polem
                co w kontakcie i dialogach */}
            <Field
              as="input"
              id="szukaj"
              label="Szukaj"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nazwa lub opis produktu…"
              autoComplete="off"
            />
          </Reveal>
        </div>

        {/* filtry kategorii — rząd etykiet jak „Produkty AS" na stronie głównej */}
        <Reveal delay={120} className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
          <span className="as-label text-ink/45">Kategoria</span>
          {PIGMENT_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                aria-pressed={active}
                className={cn(
                  'as-label relative py-1 transition-colors',
                  active ? 'text-ink' : 'text-ink/45 hover:text-ink'
                )}
              >
                {cat.name}
                <span
                  className={cn(
                    'absolute -bottom-0.5 left-0 h-px bg-gold transition-all duration-300',
                    active ? 'w-full' : 'w-0'
                  )}
                />
              </button>
            );
          })}
        </Reveal>

        <p className="as-label mt-6 text-ink/45" aria-live="polite">
          {filteredProducts.length === 0
            ? 'Brak produktów dla tych kryteriów'
            : `Produktów: ${filteredProducts.length}`}
        </p>

        {/* karty jak „Efekty" na stronie głównej: kolumny rozdzielone pionową
            złotą linią, bez border-top, bez zaokrągleń i cieni */}
        <div className="mt-8 grid gap-y-10 md:grid-cols-2 md:gap-x-0 lg:grid-cols-3">
          {filteredProducts.map((product, i) => (
            <Reveal key={product.id} delay={Math.min(i, 5) * 70}>
              <article className="as-card-col group">
                <div className="mb-5 flex items-center justify-between gap-4">
                  {/* próbnik koloru zamiast packshotu (brak zdjęć produktowych) */}
                  <span
                    className="h-12 w-12 shrink-0 rounded-full border border-ink/10"
                    style={{ backgroundColor: product.colorHex }}
                    aria-hidden="true"
                  />
                  {product.badge && <span className="as-badge">{product.badge}</span>}
                </div>

                {/* kicker (linia / przeznaczenie) nad tytułem karty */}
                <p className="as-kicker mb-2">{product.subtitle}</p>
                <h3 className="font-display text-2xl leading-[1.1] text-ink sm:text-[1.75rem]">
                  {product.name}
                </h3>
                <p className="as-caption mt-3 flex-1">{product.description}</p>

                <dl className="mt-5 grid grid-cols-2 gap-y-2 border-t border-ink/10 pt-4 text-xs">
                  <dt className="text-mocha-400">Rodzaj</dt>
                  <dd className="text-right text-ink">{product.type}</dd>
                  <dt className="text-mocha-400">Pojemność</dt>
                  <dd className="text-right text-ink">{product.capacity}</dd>
                </dl>

                <div className="mt-5 flex items-end justify-between gap-4">
                  <span className="font-display text-xl text-ink">{product.price} zł</span>
                  <ArrowLink href="/kontakt" className="w-fit">
                    Zapytaj
                  </ArrowLink>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  04 — ZAMÓWIENIA HURTOWE (CTA)                                      */
/* ================================================================== */

function ClosingBand() {
  return (
    <ClosingCta
      number="04"
      label="Zamówienia"
      title="Zamówienie"
      titleAccent="hurtowe?"
      lead="Napisz, czego potrzebujesz do gabinetu — dobierzemy odcienie i odeślemy dokumentację produktów razem z wyceną."
      primary={{ href: '/kontakt', label: 'Napisz do nas' }}
      secondary={{ href: '/maszynki', label: 'Zobacz urządzenia' }}
    />
  );
}

/* ================================================================== */

export default function Pigments() {
  return (
    <>
      <Hero />
      <HealedBand />
      <Catalog />
      <ClosingBand />
    </>
  );
}
