'use client';

/**
 * Pigmenty — „Numer 01".
 *
 * ⚠️ DANE DO POTWIERDZENIA: nazwy, ceny i pojemności poniżej pochodzą
 * z pierwotnej wersji serwisu (wygenerowanej z szablonu) i nie zostały przez
 * nikogo zweryfikowane. Przed publikacją sprawdź je z aktualnym cennikiem
 * hurtowym — to jedyne miejsce w kodzie, w którym trzeba je poprawić.
 *
 * W folderze /Graphics nie ma packshotów pigmentów, dlatego karty produktów
 * pokazują próbnik koloru (colorHex) jako pasek 8 px nad nazwą, a nie zdjęcie
 * butelki. Gdy pojawią się zdjęcia produktowe, dodaj je do manifestu
 * w src/lib/media.js, nadaj rolę w src/lib/roles.js i podepnij tutaj.
 *
 * Koszyk nie istnieje — poprzednia wersja udawała dodawanie do koszyka
 * komunikatem „Dodano do koszyka". Zastąpione zapytaniem o produkt.
 *
 * Układ (kierunek „Numer 01", trasa bez packshotów = strona typograficzna):
 *   01 PageHero band (espresso, bez zdjęcia, 3 Stat liczone z PRODUCTS)
 *   02 Paleta #katalog (cream-50) — filtr kategorii w jednej linii, komórki .as-cell
 *      (na telefonie karta = próbnik + nazwa + cena; opis i podtytuł od md)
 *   03 Efekt (cream-100) — JEDYNE makro na trasie: MACROS.brows12p3 1:1 ≤ 320 px
 *   04 Dokumentacja w skrócie (cream-50) — 3 × .as-cell jak /certyfikaty 02 → /certyfikaty
 *   05 ClosingCta (espresso-900, jeden blok ze stopką)
 * Jasne sekcje obok siebie dzieli hairline (border-t ink/10).
 */

import React, { useState } from 'react';
import {
  ArrowLink,
  ClosingCta,
  CtaButton,
  Figure,
  PageHero,
  Reveal,
  SectionLabel,
} from '@/components/as/Primitives';
import { MACROS } from '@/lib/roles';
import { cn } from '@/lib/utils';

/* Krótkie polskie etykiety — filtr mieści się w jednej linii (id bez zmian). */
const PIGMENT_CATEGORIES = [
  { id: 'all', name: 'Wszystkie' },
  { id: 'lips', name: 'Usta' },
  { id: 'brows', name: 'Brwi' },
  { id: 'eyelids', name: 'Powieki' },
  { id: 'medical', name: 'Medyczne' },
  { id: 'special', name: 'Edycje autorskie' },
  { id: 'accessories', name: 'Kartridże i remover' },
];

/* Na karcie pokazujemy tylko wyróżnienia handlowe — pozostałe „badge"
   w danych powtarzały nazwę linii albo kategorii. */
const SHOWN_BADGES = ['Bestseller', 'Promocja'];

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

/* Fakty do paska liczb w hero — policzone z danych powyżej, nie wpisane
   ręcznie: zmiana katalogu zmienia liczby. */
const PIGMENTS_ONLY = PRODUCTS.filter((p) => p.category !== 'accessories');
const PIGMENT_CAPACITIES = [...new Set(PIGMENTS_ONLY.map((p) => p.capacity))];

const HERO_STATS = [
  {
    value: String(PIGMENTS_ONLY.length),
    label: 'Pigmentów w katalogu',
  },
  {
    value: PIGMENT_CAPACITIES.join(' / '),
    label: PIGMENT_CAPACITIES.length === 1 ? 'Pojemność każdego pigmentu' : 'Pojemności pigmentów',
  },
  { value: 'REACH', label: 'Zgodność z REACH EU — dokumentacja do zamówień' },
];

/* Dokumentacja w skrócie — treść z /certyfikaty (rodzaje dokumentów bez
   numerów, bo tych nie mamy potwierdzonych). */
const DOCS = [
  {
    number: '01',
    title: 'Zgodność REACH',
    desc: 'Deklaracja zgodności z unijnym rozporządzeniem dla tuszy do tatuażu i makijażu permanentnego — pigmenty AS OPIUM i Light Minerals.',
  },
  {
    number: '02',
    title: 'Karta charakterystyki',
    desc: 'Skład, zagrożenia i sposób postępowania z produktem. To dokument, o który pyta Sanepid podczas kontroli gabinetu.',
  },
  {
    number: '03',
    title: 'W zamówieniu',
    desc: 'Każde zamówienie hurtowe zawiera dokumentację w wersji cyfrowej. Na żądanie wysyłamy ją także przed zakupem, do wglądu.',
  },
];

/* ================================================================== */
/*  01 — HERO (pas typograficzny, espresso)                            */
/* ================================================================== */

function Hero() {
  return (
    <PageHero
      variant="band"
      label="Pigmenty"
      number="01"
      title="Pigmenty"
      titleAccent="AS OPIUM."
      lead="Pigmenty AS OPIUM i Light Minerals do brwi, ust i powiek oraz linia medyczna. Starannie opracowane formuły, intensywne kolory i przewidywalne gojenie."
      stats={HERO_STATS}
    >
      {/* jeden prostokątny przycisk + ArrowLink jako druga akcja */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
        <CtaButton href="#katalog" className="as-btn-invert">
          Zobacz paletę
        </CtaButton>
        <ArrowLink href="/certyfikaty" tone="light" className="w-fit">
          Dokumentacja produktów
        </ArrowLink>
      </div>
    </PageHero>
  );
}

/* ================================================================== */
/*  02 — PALETA (katalog)                                              */
/* ================================================================== */

function ProductCell({ product }) {
  const badge = SHOWN_BADGES.includes(product.badge) ? product.badge : null;
  const price = <span className="font-display text-xl leading-none text-ink">{product.price} zł</span>;
  return (
    /* na telefonie próbnik sam jest górną linią komórki (hairline od md) */
    <article className="as-cell border-t-0 pt-0 md:border-t">
      {/* od md: pasek specyfikacji między hairline a próbnikiem —
          typ · pojemność (+ wyróżnienie) po lewej, cena po prawej */}
      <div className="hidden items-baseline justify-between gap-4 py-1.5 md:flex">
        <p className="flex min-w-0 flex-wrap items-baseline gap-x-3">
          <span className="as-kicker">
            {product.type} · {product.capacity}
          </span>
          {badge && <span className="as-badge">{badge}</span>}
        </p>
        <span className="shrink-0">{price}</span>
      </div>

      {/* próbnik koloru zamiast packshotu (brak zdjęć produktowych) —
          pasek 8 px na pełną szerokość komórki; ring dla jasnych odcieni */}
      <span
        className="block h-2 w-full ring-1 ring-inset ring-ink/10"
        style={{ backgroundColor: product.colorHex }}
        aria-hidden="true"
      />

      <h3 className="as-title mt-3 text-ink">{product.name}</h3>
      <p className="as-kicker mt-2 hidden md:block">{product.subtitle}</p>
      <p className="mt-2 hidden max-w-[26rem] text-[0.9375rem] leading-[1.65] text-ink/75 md:block">
        {product.description}
      </p>

      {/* telefon: karta = próbnik + nazwa + cena (z pojemnością i wyróżnieniem) */}
      <div className="mt-3 flex items-baseline justify-between gap-4 md:hidden">
        <span>
          {price}
          <span className="as-label ml-3 align-middle text-ink/55">{product.capacity}</span>
        </span>
        {badge && <span className="as-badge text-right">{badge}</span>}
      </div>
    </article>
  );
}

function Palette() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = PRODUCTS.filter(
    (product) => selectedCategory === 'all' || product.category === selectedCategory
  );

  return (
    <section id="katalog" className="as-section scroll-mt-24 bg-cream-50">
      <div className="as-shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <Reveal className="lg:col-span-8">
            <SectionLabel number="02">Paleta</SectionLabel>
            <h2 className="as-display-section as-text-balance mt-6 text-ink">Pełna paleta.</h2>
          </Reveal>
          {/* jedyne CTA sekcji (koszyka nie ma — zapytanie) */}
          <Reveal delay={80} className="lg:col-span-4 lg:justify-self-end">
            <ArrowLink href="/kontakt" className="w-fit">
              Zapytaj o produkt
            </ArrowLink>
          </Reveal>
        </div>

        {/* filtr kategorii — zawsze jedna linia; na wąskim ekranie przewija się
            w bok od krawędzi do krawędzi (-mx = padding .as-shell). Od xl licznik
            wyników stoi w tej samej linii, po prawej. */}
        <Reveal delay={120} className="mt-8 xl:flex xl:items-baseline xl:justify-between xl:gap-8">
          <div
            role="group"
            aria-label="Kategoria"
            className="as-noscrollbar -mx-5 flex min-w-0 items-center gap-x-7 overflow-x-auto whitespace-nowrap px-5 pb-2 sm:-mx-8 sm:px-8 lg:mx-0 lg:gap-x-8 lg:px-0"
          >
            <span className="as-label hidden shrink-0 text-ink/55 md:inline">Kategoria</span>
            {PIGMENT_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  aria-pressed={active}
                  className={cn(
                    'as-label relative shrink-0 py-1 transition-colors',
                    active ? 'text-ink' : 'text-ink/55 hover:text-ink'
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
          </div>

          <p className="as-label mt-4 shrink-0 text-ink/55 xl:mt-0" aria-live="polite">
            {filteredProducts.length === 0
              ? 'Brak produktów w tej kategorii'
              : `Produktów: ${filteredProducts.length}`}
          </p>
        </Reveal>

        {/* komórki redakcyjne: hairline u góry, bez tła, bez kart */}
        <div className="mt-6 grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product, i) => (
            <Reveal key={product.id} delay={(i % 3) * 70}>
              <ProductCell product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  03 — EFEKT (jedyne makro na trasie)                                */
/* ================================================================== */

function Effect() {
  /* brows-12-p3 (1638 × 820) w kadrze 1:1 — ostre przy 320 px;
     lips-03-p3 (1206 × 494) w 4:5 było powiększone ~2× i miękkie */
  const macro = MACROS.brows12p3;
  return (
    <section className="as-section border-t border-ink/10 bg-cream-100">
      <div className="as-shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-8">
          <div className="lg:col-span-6">
            <Reveal>
              <SectionLabel number="03">Efekt</SectionLabel>
              <h2 className="as-display-section as-text-balance mt-6 text-ink">
                Kolor, który goi się przewidywalnie.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="as-body mt-6">
                Wygojenie jest dowodem — to moment, w którym widać, czy formuła trzyma kolor.
                Light Minerals to barwniki w 100% mineralne: #01 Blonde wychodzi ze skóry czysto
                i przewidywalnie, bez czerwonych podtonów, a #05 Dark Espresso ma stabilną formułę
                chroniącą przed szarzeniem.
              </p>
              <ArrowLink href="/uslugi" className="mt-8 w-fit">
                Zobacz zabiegi
              </ArrowLink>
            </Reveal>
          </div>

          <Reveal delay={90} className="lg:col-span-4 lg:col-start-9">
            <figure className="max-w-[20rem]">
              <Figure
                image={macro.image}
                alt="Brwi po makijażu permanentnym metodą Super Natural Brows — zbliżenie"
                ratio={macro.ratio}
                position={macro.position}
                tone="light"
                zoom={false}
                sizes="640px"
              />
              <figcaption className="as-caption mt-3">{macro.caption}</figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  04 — DOKUMENTACJA W SKRÓCIE (układ jak /certyfikaty 02)            */
/* ================================================================== */

function Documentation() {
  return (
    <section className="as-section border-t border-ink/10 bg-cream-50">
      <div className="as-shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Reveal>
              <SectionLabel number="04">Dokumentacja</SectionLabel>
              <h2 className="as-display-section as-text-balance mt-6 text-ink">
                Dokumenty w komplecie.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <ArrowLink href="/certyfikaty" className="mt-8 w-fit">
                Zobacz dokumentację
              </ArrowLink>
            </Reveal>
          </div>

          {/* komórki dokumentów: hairline → numer (.as-kicker) → tytuł (.as-title) → opis 15 px */}
          <ol className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:col-span-8 lg:col-start-5 xl:grid-cols-3">
            {DOCS.map((d, i) => (
              <Reveal as="li" key={d.number} delay={i * 80} className="as-cell">
                <p className="as-kicker">{d.number}</p>
                <h3 className="as-title as-text-balance mt-3 text-ink">{d.title}</h3>
                <p className="mt-4 max-w-[30rem] text-[0.9375rem] leading-[1.65] text-ink/75">{d.desc}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  05 — ZAMÓWIENIA HURTOWE (pas zamykający)                           */
/* ================================================================== */

function ClosingBand() {
  return (
    <ClosingCta
      number="05"
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
      <Palette />
      <Effect />
      <Documentation />
      <ClosingBand />
    </>
  );
}
