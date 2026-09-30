'use client';

/**
 * /o-nas – „Numer 01".
 *
 * Rozkładówki: okładka (studio-11) → Droga zawodowa na cream-90 (od md jeden portret
 * studio-08 + biografia z inicjałem; na telefonie bez portretu, biografia zwinięta
 * pod „Więcej”) → Liczby (cream-50) → Cytat (cream-100) → Salon i akademia
 * (cream-50, typograficznie; link do /uslugi) → ClosingCta.
 * Złącza tekst–tekst (Liczby | Cytat | Salon) od lg ciaśniejsze (.as-section-tight*),
 * przed pasem zamykającym pełny odstęp.
 * Portrety wyłącznie przez ROLES (src/lib/roles.js); zdjęcia grupowe są na /szkolenia.
 * D7: biografia i salon z briefu – FOUNDER.facts / FOUNDER.podiums / SALON (src/lib/site.js).
 * Zdjęć salonu i parkingu (brief: „Na tej podstronie dodajemy zdjęcia salonu, parkingu”)
 * brak w /Graphics – sekcja 05 jest typograficzna do czasu dostarczenia materiału.
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
import { ROLES } from '@/lib/roles';
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
      /* bez „założycielki AS COMPANY” – brak źródła (BIO-18); brief: prowadzi salon i akademię */
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
            <Reveal className="tall:md:sticky md:top-28">
              <figure className="mx-auto max-w-[18rem] sm:max-w-[24rem] md:max-w-none">
                {/* ciasna ramka jak portret w sekcji „O nas” na stronie głównej */}
                <div className="as-photo-frame">
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
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
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
/*  D7), typograficznie; link /uslugi. Zdjęcia salonu i parkingu –     */
/*  do dostarczenia przez klientkę (brak w /Graphics).                 */
/* ================================================================== */

function SalonBand() {
  return (
    /* #salon: odstęp kotwicy daje html { scroll-padding-top } – bez scroll-mt na celu */
    <section id="salon" className="as-section as-section-tight-top bg-cream-50">
      <div className="as-shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-5">
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
          <Reveal delay={80} className="lg:col-span-6 lg:col-start-7 lg:pt-10">
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
        </div>

        {/* trzy specjalizacje (w tym technika combo – BIO-09) – komórki z hairline, bez zdjęć */}
        <div className="mt-12 grid gap-8 md:grid-cols-3 lg:mt-16">
          {SPECIALTIES.map((m, i) => (
            <Reveal key={m.number} delay={i * 60} className="as-cell">
              <NumberedItem number={m.number} title={m.title}>
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
