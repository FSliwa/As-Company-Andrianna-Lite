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
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import {
  ArrowLink,
  FactStrip,
  Figure,
  GoldArc,
  Reveal,
  SectionLabel,
} from '@/components/as/Primitives';
import { BROWS, LIPS } from '@/lib/media';
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


export default function Pigments() {
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
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-cream-50 pb-20 pt-28 lg:pb-28 lg:pt-36">
        <GoldArc className="-top-24 right-[-10%] h-[560px] w-[760px]" opacity={0.3} />

        <div className="as-shell relative">
          <Reveal>
            <SectionLabel number="01">Pigmenty</SectionLabel>
          </Reveal>

          <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-16">
            <div className="lg:col-span-7">
              <Reveal>
                <h1 className="as-display-lg as-text-balance text-ink">
                  Kolor, który
                  <br />
                  <span className="italic text-gold-dark">goi się przewidywalnie.</span>
                </h1>
              </Reveal>
              <Reveal delay={80}>
                <p className="as-body mt-8 max-w-xl">
                  Pigmenty AS OPIUM i Light Minerals dobrane do pracy na brwiach, ustach
                  i powiekach — plus linia medyczna do areoli i trichopigmentacji. Starannie
                  opracowane formuły, intensywne kolory i przewidywalne gojenie.
                </p>
              </Reveal>
              <Reveal delay={140}>
                <div className="mt-10 flex flex-wrap gap-4">
                  <a href="#katalog" className="as-btn-solid">
                    Przejdź do katalogu
                  </a>
                  <Link href="/certyfikaty" className="as-btn-ghost">
                    Dokumentacja produktów
                  </Link>
                </div>
              </Reveal>
            </div>

            <Reveal delay={100} className="lg:col-span-5">
              <Figure
                image={LIPS[2]}
                alt="Efekt pigmentu AS na ustach — rysunek wstępny i wygojony kolor"
                ratio="4 / 5"
                framed
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
            </Reveal>
          </div>

          <Reveal delay={160} className="mt-16 border-t border-ink/10 pt-6">
            <FactStrip items={['Brwi', 'Usta', 'Powieki', 'Linia medyczna']} />
          </Reveal>
        </div>
      </section>

      {/* ============ EFEKTY ============ */}
      <section className="as-section relative overflow-hidden bg-espresso text-cream-50">
        <GoldArc className="-top-32 left-[-6%] h-[720px] w-[900px]" opacity={0.28} />

        <div className="as-shell relative">
          <Reveal>
            <SectionLabel number="02" tone="light">
              Jak się goją
            </SectionLabel>
          </Reveal>

          <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-12">
            <Reveal className="lg:col-span-4">
              <h2 className="as-display-lg as-text-balance">
                Wygojenie
                <br />
                jest dowodem.
              </h2>
              <p className="as-body-invert mt-8 max-w-sm">
                Prace wykonane naszymi pigmentami — zdjęcia po wygojeniu, nie świeżo po
                zabiegu. To moment, w którym widać, czy formuła trzyma kolor.
              </p>
              <ArrowLink href="/uslugi" tone="light" className="mt-10 w-fit">
                Zobacz zabiegi
              </ArrowLink>
            </Reveal>

            <div className="lg:col-span-8">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { image: BROWS[9], alt: 'Brwi przed zabiegiem i po wygojeniu' },
                  { image: LIPS[1], alt: 'Usta przed zabiegiem i po wygojeniu' },
                  { image: BROWS[17], alt: 'Wygojone brwi — technika włosowa' },
                ].map((s, i) => (
                  <Reveal key={i} delay={i * 90}>
                    <Figure
                      image={s.image}
                      alt={s.alt}
                      ratio="3 / 4"
                      sizes="(min-width: 640px) 28vw, 90vw"
                    />
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ KATALOG ============ */}
      <section id="katalog" className="as-section bg-cream-100 scroll-mt-24">
        <div className="as-shell">
          <Reveal>
            <SectionLabel number="03">Katalog</SectionLabel>
          </Reveal>

          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-7">
              <h2 className="as-display-lg as-text-balance text-ink">
                Pełna
                <br />
                paleta.
              </h2>
            </Reveal>
            <Reveal delay={80} className="lg:col-span-5">
              <label className="relative block">
                <span className="sr-only">Szukaj w katalogu</span>
                <Search
                  className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nazwa lub opis produktu…"
                  className="w-full border-0 border-b border-ink/20 bg-transparent py-3 pl-7 text-sm text-ink placeholder:text-ink/35 focus:border-gold focus:outline-none focus:ring-0"
                />
              </label>
            </Reveal>
          </div>

          {/* filtry kategorii */}
          <Reveal delay={120} className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-b border-ink/10 pb-5">
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

          <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product, i) => (
              <Reveal key={product.id} delay={Math.min(i, 5) * 70}>
                <article className="group flex h-full flex-col border-t border-ink/12 pt-7">
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className="h-14 w-14 shrink-0 rounded-full border border-ink/10 shadow-inner"
                      style={{ backgroundColor: product.colorHex }}
                      aria-hidden="true"
                    />
                    {product.badge && (
                      <span className="as-label text-gold-dark">{product.badge}</span>
                    )}
                  </div>

                  <h3 className="as-display-sm mt-6 text-ink">{product.name}</h3>
                  <p className="as-label mt-2 text-ink/45">{product.subtitle}</p>
                  <p className="as-body mt-4 flex-1 text-[0.8125rem]">{product.description}</p>

                  <dl className="mt-6 grid grid-cols-2 gap-y-2 border-t border-ink/10 pt-4 text-xs">
                    <dt className="text-mocha-400">Rodzaj</dt>
                    <dd className="text-right text-ink">{product.type}</dd>
                    <dt className="text-mocha-400">Pojemność</dt>
                    <dd className="text-right text-ink">{product.capacity}</dd>
                  </dl>

                  <div className="mt-5 flex items-end justify-between gap-4">
                    <span className="font-display text-2xl text-ink">{product.price} zł</span>
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

      {/* ============ CTA ============ */}
      <section className="relative overflow-hidden bg-espresso-900 text-cream-50">
        <div className="as-shell py-20 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-7">
              <h2 className="as-display-lg as-text-balance">
                Zamówienie <span className="italic text-gold-light">hurtowe?</span>
              </h2>
              <p className="as-body-invert mt-7 max-w-lg">
                Napisz, czego potrzebujesz do gabinetu — dobierzemy odcienie i odeślemy
                dokumentację produktów razem z wyceną.
              </p>
            </Reveal>
            <Reveal delay={90} className="flex flex-wrap gap-4 lg:col-span-5 lg:justify-end">
              <Link href="/kontakt" className="as-btn-gold">
                Napisz do nas
              </Link>
              <Link href="/maszynki" className="as-btn-ghost-light">
                Zobacz urządzenia
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
