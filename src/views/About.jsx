'use client';

/**
 * /o-nas – „Numer 01".
 *
 * Rozkładówki: okładka (studio-01) → Droga zawodowa na cream-90 (od md jeden portret
 * studio-08 + biografia z inicjałem; na telefonie bez portretu, biografia zwinięta
 * pod „Więcej”) → Liczby (cream-50) → Cytat (cream-100) → Salon i akademia
 * (cream-50; kolaż trzech prac – włos maszynowy, technika pudrowa, usta; link do /uslugi)
 * → ClosingCta.
 * Złącza tekst–tekst (Liczby | Cytat | Salon) od lg ciaśniejsze (.as-section-tight*),
 * przed pasem zamykającym pełny odstęp.
 * Portrety wyłącznie przez ROLES (src/lib/roles.js); zdjęcia grupowe są na /szkolenia.
 * D7: biografia i salon z briefu – FOUNDER.facts / FOUNDER.podiums / SALON (src/lib/site.js).
 * Zdjęć salonu i parkingu (brief: „Na tej podstronie dodajemy zdjęcia salonu, parkingu”)
 * nadal brak w /Graphics – sekcja 05 pokazuje do tego czasu kolaż prac (COLLAGE).
 */

import React, { useState } from 'react';
import Link from '@/components/as/LocaleLink';
import {
  ArrowLink,
  ClosingCta,
  Figure,
  MobileMore,
  NumberedItem,
  PageHero,
  PriceRow,
  Reveal,
  SectionLabel,
  Stat,
} from '@/components/as/Primitives';
import { ACHIEVEMENTS, BOOKING_URL, BRAND, FOUNDER, SALON } from '@/lib/site';
import { MACROS, ROLES } from '@/lib/roles';
import { cn } from '@/lib/utils';

/* Wyróżnienia w biografii – marka pisze lekko, więc tylko font-medium. */
const Em = ({ children }) => <strong className="font-medium text-ink">{children}</strong>;

/* Twarda spacja po liczbie („100 kursantek”, „2–2,5 godziny”) i po „ok.” – jak w reszcie
   biografii; teksty z site.js mają zwykłe spacje. */
const nb = (t) => t.replace(/(\d) (?=\S)/g, '$1\u00a0').replace(/\bok\. /g, 'ok.\u00a0');

/* Zdanie z FOUNDER.facts z wyróżnionymi frazami: [fraza, 'em' | 'nowrap' | 'em nowrap'].
   'nowrap' trzyma zakresy („2–2,5 godziny”) w jednej linii. Frazy, której nie ma
   w tekście (np. po zmianie danych), po prostu nie wyróżniamy. */
function rich(text, marks) {
  const out = [];
  let rest = nb(text);
  let key = 0;
  for (;;) {
    let hit = null;
    for (const [raw, kind] of marks) {
      const phrase = nb(raw);
      const i = rest.indexOf(phrase);
      if (i !== -1 && (!hit || i < hit.i)) hit = { i, phrase, kind };
    }
    if (!hit) break;
    if (hit.i > 0) out.push(rest.slice(0, hit.i));
    const inner = hit.kind.includes('nowrap') ? <span className="whitespace-nowrap">{hit.phrase}</span> : hit.phrase;
    out.push(hit.kind.includes('em') ? <Em key={key++}>{inner}</Em> : <React.Fragment key={key++}>{inner}</React.Fragment>);
    rest = rest.slice(hit.i + hit.phrase.length);
  }
  if (rest) out.push(rest);
  return out;
}

/* D7: biografia – wszystkie fakty z briefu („Opis”) w brzmieniu z FOUNDER.facts:
   tysiące pigmentacji, setki kursantek (100+ z włosa w ostatnim roku), ok. 80% wygojenia,
   2–2,5 h u kursantek i 1,5–2 h u Andriany, 7 lat w Katowicach z listą oczekiwania,
   3 lata w Warszawie, 50+ kursantek za granicą, własne szkolenia, Prime Speaker (BIO-07,
   BIO-10, BIO-11, BIO-23). D3: „bez bólu, bez blizn i migracji pigmentu” tylko w ostrożnym
   brzmieniu z site.js; usunięte „wykonany prawidłowo jest bezpieczny dla skóry” –
   deklaracja zdrowotna bez źródła (BIO-01). Podia – akapit z inicjałem niżej (bez zmian). */
const BIO = [
  rich(`${FOUNDER.facts.pigmentations} ${FOUNDER.facts.students}`, [
    ['ponad 100 z samej techniki włosa maszynowego', 'em'],
  ]),
  rich(`${FOUNDER.facts.techniques} ${FOUNDER.facts.snb} ${FOUNDER.facts.treatmentTime}`, [
    ['Super Natural Brows', 'em'],
    ['2–2,5 godziny', 'nowrap'],
    ['1,5–2 godziny', 'em nowrap'],
  ]),
  rich(FOUNDER.facts.katowice, [['Przez 7 lat prowadziła w Katowicach salon makijażu permanentnego', 'em']]),
  rich(`${FOUNDER.facts.warsaw} ${FOUNDER.facts.abroad}`, [
    ['Od 3 lat prowadzi salon i akademię makijażu permanentnego w Warszawie', 'em'],
  ]),
  rich(`${FOUNDER.facts.learning} ${FOUNDER.facts.speaker}`, [['Prime Speaker i prelegentka na scenie', 'em']]),
];

/* D7: specjalizacje salonu wg briefu („Salon”) – włos maszynowy, technika pudrowa lub combo, usta.
   Zastępują dawną „Metodę”: krok „Konsultacja” nie miał źródła (BIO-14), a krok „Architektura
   twarzy” uogólniał zdanie o ustach na wszystkie zabiegi (BIO-22). Przy włosie – bez cytatu
   „Proszę zrobić brwi…”, bo stoi on w sekcji 04. */
const SNB_LINE = SALON.brows.includes('Specjalizujemy')
  ? SALON.brows.slice(SALON.brows.indexOf('Specjalizujemy'))
  : SALON.brows;

const SPECIALTIES = [
  { number: '01', title: 'Włos maszynowy', desc: SNB_LINE },
  { number: '02', title: 'Technika pudrowa lub combo', desc: SALON.powder },
  { number: '03', title: 'Usta', desc: SALON.lips },
];

/* Kolaż w sekcji 05 (klientka 30.09: owal z krzyżem i „Kolaż” pod nagłówkiem) – po jednej
   pracy do każdej specjalizacji: włos maszynowy (work-snb-01, Super Natural Brows), technika
   pudrowa (work-powder-01), usta (lips-02-p2, panel „Healed” – kadr bez napisów).
   Siatka bez nachodzenia i bez obwódek, odstęp 4 px jak w pasie efektów (ResultStrip):
   u góry włos 3:4 (plik 3:4, bez cięcia) i puder 3:5 (od lewej – za x ≈ 596 pliku jest
   rozmazany pas), szerokości kolumn 0,75 : 0,6 = proporcje kadrów, więc oba mają tę samą
   wysokość; pod nimi usta na całą szerokość, 2,1:1.
   Usta (plik 1204 × 729): kontur warg ok. y 152–668, nad nim napis „Healed” (do y ≈ 124),
   pod nim szary pasek (od y ≈ 718). Przy 2,1:1 widać 573 px wysokości pliku; Y 82% = okno
   ok. 128–701 – bez napisu i paska (przy 2,2:1 kontur górnej wargi dotykał krawędzi kadru).
   scale 1,02 od prawej chowa szary pasek 4 px przy lewej krawędzi pliku. zoom={false} jak
   makra. Podpisy: brak – techniki nazywa lista 01–03 tuż pod kolażem; alt – tylko to, co
   wiemy o kadrze. */
const COLLAGE = [
  {
    key: 'snb',
    image: MACROS.snbCollage.image,
    alt: 'Brwi po makijażu permanentnym techniką włosa maszynowego Super Natural Brows – zbliżenie twarzy',
    ratio: '3 / 4',
    position: MACROS.snbCollage.position,
    sizes: '(min-width: 1024px) 290px, (min-width: 640px) 280px, 55vw',
  },
  {
    key: 'powder',
    image: MACROS.powderCollage.image,
    alt: 'Brew po makijażu permanentnym techniką pudrową – zbliżenie łuku brwi nad okiem',
    ratio: '3 / 5',
    position: MACROS.powderCollage.position,
    sizes: '(min-width: 1024px) 235px, (min-width: 640px) 225px, 45vw',
  },
  {
    key: 'lips',
    image: MACROS.lipsCollage.image,
    alt: 'Usta po makijażu permanentnym, wygojone – zbliżenie',
    ratio: '2.1 / 1',
    position: MACROS.lipsCollage.position,
    imgClassName: 'origin-right scale-[1.02]',
    className: 'col-span-2',
    sizes: '(min-width: 1024px) 530px, (min-width: 640px) 510px, 100vw',
  },
];

function SalonCollage() {
  return (
    /* as-feather-group (7.10): zewnętrzna krawędź kolażu rozpływa się w kremie sekcji */
    <div className="as-feather-group grid grid-cols-[0.75fr_0.6fr] gap-1">
      {COLLAGE.map((c) => (
        <Figure
          key={c.key}
          image={c.image}
          alt={c.alt}
          ratio={c.ratio}
          position={c.position}
          imgClassName={c.imgClassName}
          className={c.className}
          zoom={false}
          sizes={c.sizes}
        />
      ))}
    </div>
  );
}

/* ================================================================== */
/*  01 – OKŁADKA                                                       */
/* ================================================================== */

function Hero() {
  return (
    <PageHero
      number="01"
      label="O nas"
      title="Andriana"
      titleAccent="Babushkina"
      lead={`${FOUNDER.rolePl}. ${FOUNDER.signature}.`}
      image={ROLES.heroAbout.image}
      imagePosition={ROLES.heroAbout.position}
      /* bez „założycielki” firmy – brak źródła (BIO-18); brief: prowadzi salon i akademię */
      imageAlt={`${FOUNDER.name} – ${BRAND.academy}, portret z sesji wizerunkowej`}
      tone="cream"
      /* Wszystkie cztery role z briefu (także prelegentka, BIO-11) są w leadzie (FOUNDER.rolePl).
         Pasek zostaje z trzema: od lg stoi w jednej linii z ukośnikami, a czwarta pozycja
         przy 1024–1060 px zawijała się i wiersz zaczynał od „/” (kolumna 433 px, pasek 449 px). */
      facts={['Linergistka', 'Trenerka', 'Sędzia']}
    >
      <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
        <Link href="/szkolenia" className="as-btn-solid">
          Zobacz szkolenia
        </Link>
        <ArrowLink href={BOOKING_URL} className="w-fit">
          Umów wizytę
        </ArrowLink>
      </div>
    </PageHero>
  );
}

/* ================================================================== */
/*  02 – DROGA ZAWODOWA (cream-90)                                     */
/*  Od md: jeden portret 4:5 po lewej (przyklejony przy przewijaniu,   */
/*  tylko na ekranie ≥ 640 px wysokości – w poziomie się nie mieści),  */
/*  po prawej etykieta, H2 i biografia z inicjałem – jedyny taki detal */
/*  w serwisie.                                                        */
/*  Telefon (< md): etykieta → H2 → biografia, bez portretu (ten sam   */
/*  kadr z tej samej sesji stoi tuż wyżej w okładce; ukryta kolumna    */
/*  z loading=lazy nie pobiera obrazu). Z biografii widać akapit o     */
/*  podiach i o technice (H2 obiecuje oba), reszta pod „Więcej”        */
/*  (MobileMore) – nic nie jest usuwane; od md całość jak dotąd.       */
/* ================================================================== */

function StoryBand() {
  const [open, setOpen] = useState(false);
  /* Klasa ukrywająca akapity biografii na telefonie (stan zwinięty). */
  const folded = !open && 'max-md:hidden';
  return (
    <section className="as-section bg-cream-90 text-ink">
      <div className="as-shell">
        <div className="grid gap-10 md:grid-cols-12 md:gap-x-8 md:gap-y-10">
          <Reveal className="md:col-span-7 md:col-start-6 md:row-start-1 lg:col-span-6 lg:col-start-7">
            <SectionLabel number="02">
              Droga zawodowa
            </SectionLabel>
            {/* Łamania wierszy dopiero od 360 px (przy 320 dawały 5 linii i samotne
                „Świata”); spacje obok <br>, żeby po ich ukryciu słowa się nie skleiły. */}
            <h2 className="as-display-section as-text-balance mt-6 text-ink">
              Od podium{' '}
              <br className="max-[359px]:hidden" />
              Mistrzostw Świata{' '}
              <br className="max-[359px]:hidden" />
              do własnej techniki.
            </h2>
          </Reveal>

          <div className="max-md:hidden md:col-span-5 md:col-start-1 md:row-span-2 md:row-start-1">
            <Reveal className="tall:md:sticky md:top-28 short:md:sticky short:md:top-[calc(var(--as-header-h)+1rem)]">
              <figure className="mx-auto max-w-[18rem] sm:max-w-[24rem] md:max-w-none short:md:mx-0 short:md:max-w-[calc((100svh-var(--as-header-h)-4.5rem)*4/5)]">
                {/* bez ramki – prośba klientki „nie w ramce” (jak portret na stronie głównej);
                    lewa krawędź zdjęcia w osi łamu (ramka z paddingiem przesuwała ją o 5 px).
                    Lite: bez tonu „dark” (portrety STUDIO bez filtra) i podpis .as-caption na cream-90. */}
                <div>
                  <Figure
                    image={ROLES.storyAbout.image}
                    alt={`${FOUNDER.name} – portret z przymkniętymi oczami, z sesji wizerunkowej marki`}
                    ratio="4 / 5"
                    position={ROLES.storyAbout.position}
                    zoom={false}
                    sizes="(min-width: 1024px) 36vw, (min-width: 768px) 40vw, 90vw"
                  />
                </div>
                <figcaption className="as-caption mt-3">{FOUNDER.signature}</figcaption>
              </figure>
            </Reveal>
          </div>

          <Reveal delay={60} className="md:col-span-7 md:col-start-6 md:row-start-2 lg:col-span-6 lg:col-start-7">
            {/* Kolejność akapitów bez zmian; na telefonie zwinięte są akapit 2
                (#bio-more-a) i 4–6 (#bio-more-b) – po rozwinięciu wracają na swoje miejsce. */}
            <div className="as-body space-y-5">
              <p className="as-dropcap">
                Kilkakrotnie stanęła na podium Mistrzostw Świata: w kategorii{' '}
                <Em>włos maszynowy (1. i 2. miejsce)</Em>, w kategorii{' '}
                <Em>brwi pudrowe (dwukrotnie 1. miejsce)</Em>, a także w kategorii{' '}
                <Em>usta (1. miejsce)</Em>.
              </p>
              <p id="bio-more-a" className={cn(folded)}>
                {BIO[0]}
              </p>
              <p>{BIO[1]}</p>
              <div id="bio-more-b" className={cn('space-y-5', folded)}>
                {BIO.slice(2).map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
            <MobileMore
              open={open}
              onToggle={() => setOpen((v) => !v)}
              controls="bio-more-a bio-more-b"
              label="Więcej o drodze zawodowej"
              openLabel="Zwiń"
              className="mt-8"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  03 – LICZBY (cream-50)                                             */
/* ================================================================== */

/* Tablet (md): nagłówek | kategorie obok siebie i cztery liczby w jednym rzędzie –
   bez tego sekcja była rozciągniętym telefonem (jedna kolumna, liczby 2 × 2). */
function NumbersBand() {
  return (
    <section className="as-section as-section-tight-bottom bg-cream-50">
      <div className="as-shell">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <Reveal>
              <SectionLabel number="03">Osiągnięcia</SectionLabel>
              <h2 className="as-display-section mt-6 text-ink">
                Liczby, które
                <br />
                stoją za techniką.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              {/* bez „dziesięciu lat” – brief podaje oba okresy osobno (BIO-03, D7) */}
              <p className="as-body mt-6 max-w-[26rem]">
                Podia Mistrzostw Świata, tysiące pigmentacji, setki przeszkolonych kursantek
                i salony: przez 7 lat w Katowicach, a od 3 lat w Warszawie.
              </p>
            </Reveal>
          </div>

          {/* kategorie mistrzowskie jako wiersze cennikowe: kategoria | leader | miejsce */}
          <Reveal delay={60} className="md:col-span-6 md:col-start-7 md:pt-10">
            {/* twarda spacja: „Świata” nie zostaje samo w drugiej linii (320–390 px) */}
            <h3 className="as-kicker">Kategorie mistrzowskie – Mistrzostwa{'\u00a0'}Świata</h3>
            <div className="mt-5">
              {/* D7: kategorie i miejsca dokładnie wg briefu (FOUNDER.podiums) */}
              {FOUNDER.podiums.map((t) => (
                <PriceRow key={t.category} name={t.category} price={t.result} />
              ))}
            </div>
          </Reveal>
        </div>

        {/* gap-x: podpis kolumny nie dochodzi do linii sąsiedniej (jak Home) */}
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 lg:mt-16">
          {ACHIEVEMENTS.map((a, i) => (
            <Reveal key={a.label} delay={Math.min(i * 20, 60)}>
              <Stat value={a.value} label={a.label} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  04 – CYTAT (cream-100) – jedyny wyśrodkowany blok na stronie       */
/* ================================================================== */

function QuoteBand() {
  return (
    <section className="as-section-tight border-y border-ink/10 bg-cream-100">
      <div className="as-shell">
        <Reveal className="mx-auto flex max-w-[40rem] flex-col items-center text-center">
          <SectionLabel number="04" line={false} className="justify-center">
            Filozofia
          </SectionLabel>
          {/* podpis w figcaption, nie w znaczniku footer – ten chowa mobilny pasek CTA */}
          <figure className="mt-8">
            <blockquote>
              <p className="as-pullquote as-text-balance text-ink">
                „Proszę zrobić brwi, aby nikt nie zauważył, że były zrobione”
              </p>
            </blockquote>
            <figcaption className="as-label mt-6 text-ink/70">
              Życzenie, na które odpowiadamy techniką Super Natural Brows
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  05 – SALON I AKADEMIA (cream-50) – tekst „Salon” z briefu (SALON,  */
/*  D7), kolaż trzech prac (włos maszynowy, technika pudrowa, usta),   */
/*  link /uslugi. Zdjęcia salonu i parkingu – do dostarczenia przez    */
/*  klientkę (brak w /Graphics).                                       */
/* ================================================================== */

function SalonBand() {
  return (
    /* #salon: odstęp kotwicy daje html { scroll-padding-top } – bez scroll-mt na celu */
    <section id="salon" className="as-section as-section-tight-top bg-cream-50">
      <div className="as-shell">
        {/* Od lg: nagłówek (wiersz 1) i kolaż (wiersz 2) w lewej kolumnie, tekst po prawej
            przez oba wiersze. Wiersz 2 = 1fr – nadmiar wysokości tekstu trafia pod kolaż,
            nie między nagłówek a kolaż. Poniżej lg kolejność z DOM: nagłówek → tekst →
            kolaż (zdjęcia tuż nad listą 01–03, którą ilustrują). */}
        <div className="grid gap-8 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-8 lg:gap-y-0">
          <Reveal className="lg:col-span-5 lg:row-start-1">
            <SectionLabel number="05">Salon i akademia</SectionLabel>
            <h2 className="as-display-section mt-6 text-ink">
              Subtelnie,
              <br />
              naturalnie,
              <br />
              bez przesady.
            </h2>
          </Reveal>
          {/* studio z parkingiem, podejście (kobiety i mężczyźni), opieka charytatywna – brief
              „Salon” (BIO-05, BIO-08, BIO-23, STR-14); D3: brzmienia ostrożne z SALON */}
          <Reveal
            delay={80}
            className="lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:pt-10"
          >
            <div className="as-body space-y-5">
              <p>{SALON.intro}</p>
              <p>
                {SALON.approach} {SALON.confidence}
              </p>
              <p>{SALON.charity}</p>
            </div>
            <ArrowLink href="/uslugi" className="mt-8 w-fit">
              Zobacz zabiegi
            </ArrowLink>
          </Reveal>
          {/* telefon: pełna szerokość łamu; tablet: najwyżej 32rem (kolaż 5:4 ≈ 410 px wysokości
              zamiast ~560 przy pełnym łamie, portret SNB ≤ 290 px – ostry przy 2× z pliku
              599 px); od lg: kolumna nagłówka (361–535 px) */}
          <Reveal
            delay={120}
            className="mt-4 max-w-[32rem] lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:mt-12 lg:max-w-none short:max-w-[calc((100svh-var(--as-header-h)-2rem)*5/4)]"
          >
            <SalonCollage />
          </Reveal>
        </div>

        {/* trzy specjalizacje (w tym technika combo – BIO-09) – komórki z hairline, bez zdjęć */}
        {/* tablet (md–lg): wiersz „tytuł | opis” jak w indeksie – w 3 kolumnach po ok. 200 px tytuły
            łamały się na 2–3 linie; trzy kolumny od lg */}
        <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-3">
          {SPECIALTIES.map((m, i) => (
            <Reveal key={m.number} delay={i * 60} className="as-cell">
              <NumberedItem
                number={m.number}
                title={m.title}
                className="md:max-lg:grid md:max-lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:max-lg:gap-x-8 md:max-lg:[&>p]:mt-0"
              >
                {m.desc}
              </NumberedItem>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  06 – ZAPROSZENIE (ClosingCta, bez zdjęć)                           */
/* ================================================================== */

function ClosingBand() {
  return (
    <ClosingCta
      number="06"
      label="Zaproszenie"
      title="Zobacz technikę"
      titleAccent="z bliska."
      lead="Salon i akademia w Warszawie. Umów wizytę albo zapytaj o najbliższy termin szkolenia."
      primary={{ href: BOOKING_URL, label: 'Umów wizytę' }}
      secondary={{ href: '/szkolenia', label: 'Zapytaj o termin' }}
    />
  );
}

/* ================================================================== */

export default function About() {
  return (
    <>
      <Hero />
      <StoryBand />
      <NumbersBand />
      <QuoteBand />
      <SalonBand />
      <ClosingBand />
    </>
  );
}
