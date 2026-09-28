'use client';

/**
 * ZABIEGI — /uslugi
 *
 * Zasady:
 *  • Wszystkie zdjęcia pochodzą wyłącznie z firmowego folderu (import z '@/lib/media').
 *  • Ze sklejek „przed/po" używamy WYŁĄCZNIE wyciętych paneli (BY_NAME['…-pN']),
 *    nigdy plików zbiorczych — panele są poziome, więc dostają poziome ramki.
 *    Makra skóry (BROWS[n]) najwyżej dwa na stronę, tylko w dużych kadrach.
 *  • W ciemnych sekcjach kadry dostają tone="dark", portrety — position u góry.
 *  • Nie podpisujemy zdjęcia jako czegoś, czym nie jest — sekcje, dla których nie ma
 *    realnego materiału (kreska permanentna, korekta, odświeżenie, usuwanie),
 *    zbudowane są typograficznie, bez „podstawionych” kadrów.
 *  • Ceny pochodzą z cennika marki (PRICING_PMU / PRICING_REFRESH / PRICING_REMOVAL
 *    w '@/lib/site'), żeby karty zabiegów i cennik nie mogły się rozjechać.
 *  • Opisy, cytaty, czasy trwania i FAQ zostały zachowane z poprzedniej wersji strony.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
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
import { CONTACT, PRICING_PMU, PRICING_REFRESH, PRICING_REMOVAL } from '@/lib/site';
import { BROWS, BY_NAME, STUDIO } from '@/lib/media';
import { cn } from '@/lib/utils';
import { enquiryMessage, sendEnquiry } from '@/lib/enquiry';

/* ------------------------------------------------------------------ */
/*  Ceny — zawsze z cennika marki                                      */
/* ------------------------------------------------------------------ */

const priceOf = (table, name) => {
  const row = table.items.find((item) => item.name === name);
  return row ? row.price : '';
};

/* ------------------------------------------------------------------ */
/*  Zabiegi ze zdjęciami efektów (brwi + usta)                         */
/* ------------------------------------------------------------------ */

const MAIN_TREATMENTS = [
  {
    id: 'supernatural-brows',
    number: '01',
    name: 'Włos Maszynowy „SuperNatural brows”',
    tag: 'Autorska Technika Andriany',
    duration: '1,5 - 2 godziny',
    price: priceOf(PRICING_PMU, 'Super Natural Brows'),
    description:
      'Efekt zadbanych, gęstych, dopasowanych brwi z delikatnym pogrubieniem oraz wyrównaniem kształtu.',
    quote:
      'Idealnie nadaje się dla klientek z życzeniem: „Nie chcę aby ktoś wiedział że mam zrobione brwi, mają wyglądać jak moje”',
    shots: [
      {
        image: BROWS[8],
        alt: 'Zbliżenie na oko i brew po makijażu permanentnym — pojedyncze, naturalnie ułożone włoski',
        ratio: '4 / 5',
        position: '50% 40%',
      },
      {
        image: BY_NAME['brows-13-p1'],
        alt: 'Pojedynczy łuk brwi po makijażu permanentnym — zbliżenie na włoski',
        ratio: '5 / 2',
        position: '50% 50%',
      },
    ],
  },
  {
    id: 'perfect-brows',
    number: '02',
    name: 'Pudrowa Technika „Perfect brows”',
    tag: 'Efekt Cienia',
    duration: '1,5 - 2 godziny',
    price: priceOf(PRICING_PMU, 'Perfect Powder Brows'),
    description:
      'Efekt delikatnie podmalowanych brwi cieniem, z podkreślonym kształtem, ale nadal w delikatnej, transparentnej wersji bez przesady.',
    quote: 'Idealne przejścia tonalne (Ombre/Powder) dopasowane do karnacji.',
    shots: [
      {
        image: BROWS[14],
        alt: 'Oko i brew klientki po makijażu permanentnym — miękko wycieniowany, wyrazisty łuk',
        ratio: '4 / 5',
        position: '50% 50%',
      },
      {
        image: BY_NAME['brows-12-p2'],
        alt: 'Para oczu z wycieniowanymi, podkreślonymi brwiami po makijażu permanentnym',
        ratio: '2 / 1',
        position: '50% 50%',
      },
    ],
  },
  {
    id: 'perfect-lips',
    number: '03',
    name: 'Usta Permanentne „Perfect lips”',
    tag: 'Subtelność i Świeżość',
    duration: '2 godziny',
    price: priceOf(PRICING_PMU, 'Perfect Lips'),
    description:
      'Efekt zdrowych, równomiernych, naturalnych ust, bez wyraźnych odcieni, bez przerysowanych konturów oraz bez „sztucznego efektu”.',
    quote: 'Dobieramy kolory do natury, wyrównujemy koloryt i nadajemy świeżości.',
    shots: [
      {
        image: BY_NAME['lips-01-p2'],
        alt: 'Wygojone usta po makijażu permanentnym — równomierny, ciepły czerwony kolor',
        ratio: '2 / 1',
        position: '50% 55%',
      },
      {
        image: BY_NAME['lips-01-p1'],
        alt: 'Usta po makijażu permanentnym w jasnym, naturalnym odcieniu',
        ratio: '2 / 1',
        position: '50% 45%',
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Zabiegi bez materiału zdjęciowego — układ typograficzny            */
/* ------------------------------------------------------------------ */

const SUPPORT_TREATMENTS = [
  {
    id: 'perfect-eyes',
    number: '04',
    name: 'Pigmentacja Linii „Perfect eyes”',
    tag: 'Zagęszczenie Rzęs',
    duration: '1 - 1,5 godziny',
    price: priceOf(PRICING_PMU, 'Perfect Eyeliners'),
    description:
      'Efekt zagęszczania rzęs, pogrubienia górnej wodnej linii oka, uwydatnienie koloru tęczówki, bez kreski, bez ogonka i bez cienia na powiece.',
    quote: 'Niewidoczny akcent, który otwiera spojrzenie i uwypukla kolor tęczówki.',
  },
  {
    id: 'korekta',
    number: '05',
    name: 'Korekta Makijażu Permanentnego',
    tag: 'Dopracowanie Efektu (1-3 msc)',
    duration: '1 godzina',
    price: priceOf(PRICING_PMU, 'Korekta do 3 miesięcy'),
    priceNote: 'Niezależnie od strefy pigmentacji.',
    description:
      'Zabieg, na którym uzupełnimy ubytki, które mogą wynikać z różnych przyczyn, najczęściej zależnych od samej skóry, procesu jej indywidualnej regeneracji lub stanu hormonalnego. A także wykonujemy ten zabieg najczęściej w celu wzmocnienia efektu, pogrubienia brwi lub dodatkowego zagęszczenia włosków.',
    quote: 'Robi się po miesiącu do 3 od pierwotnego zabiegu.',
  },
  {
    id: 'odswiezenie',
    number: '06',
    name: 'Odświeżenie Makijażu Permanentnego',
    tag: 'Po 1-3 Latach',
    duration: '1,5 godziny',
    price: 'od ' + PRICING_REFRESH.items[0].price,
    priceNote: 'Stawka zależy od czasu, jaki minął od ostatniego zabiegu — pełne widełki w cenniku.',
    description:
      'Zabieg, który wykonujemy raz na 1-3 lata, dla odnowienia efektu, uzupełnienia koloru, dodania gęstości, grubości i intensywności koloru.',
    quote: 'Utrzymuje efekt idealnej świeżości przez kolejne lata.',
  },
  {
    id: 'usuwanie',
    number: '07',
    name: 'Usuwanie Laserowe / Removerem',
    tag: 'Bezpieczne Oczyszczanie',
    duration: '30 - 45 minut',
    price: priceOf(PRICING_REMOVAL, 'Usuwanie PMU brwi'),
    priceNote: 'Brwi lub usta. Kreski, tatuaże i stawki dla stałych klientek — w cenniku.',
    description:
      'Zabieg polegający na usuwaniu starego, nieudanego PMU przed nową pigmentacją. Usuwamy jak laserem, tak i removerem, dobierając metodę indywidualnie według przypadku, zawsze staramy się zrobić tak, aby jak najszybciej i najbezpieczniej dla klienta pozbyć się niechcianego pigmentu.',
    quote: 'Usuwanie bez blizn i bez poparzeń - przygotowanie skóry pod nowy PMU.',
  },
];

/* ------------------------------------------------------------------ */
/*  Galeria efektów — wyłącznie czyste panele „po" (bez szwów/napisów)  */
/*  Panele są poziome (2:1–3:1), więc rząd górny ma ramkę 2/1,          */
/*  a rząd szeroki 3/1; position dosuwa kadr od wypalonych napisów.     */
/* ------------------------------------------------------------------ */

const GALLERY_PORTRAIT = [
  {
    image: BY_NAME['brows-01-p2'],
    alt: 'Para oczu z naturalnie zagęszczonymi brwiami po makijażu permanentnym',
    position: '50% 50%',
  },
  {
    image: BY_NAME['brows-02-p1'],
    alt: 'Oczy klientki z opaską na włosach — brwi po makijażu permanentnym',
    position: '50% 70%',
  },
  {
    image: BY_NAME['brows-01-p1'],
    alt: 'Para oczu z brwiami po makijażu permanentnym — zbliżenie',
    position: '50% 50%',
  },
  {
    image: BY_NAME['brows-02-p3'],
    alt: 'Oczy klientki z opaską na włosach, twarz prosto — brwi po makijażu permanentnym',
    position: '50% 70%',
  },
];

const GALLERY_WIDE = [
  {
    image: BY_NAME['brows-12-p1'],
    alt: 'Para oczu z brwiami po makijażu permanentnym — szeroki kadr',
    position: '50% 50%',
  },
  {
    image: BY_NAME['lips-03-p3'],
    alt: 'Usta po makijażu permanentnym — kadr po zabiegu',
    position: '50% 100%',
  },
];

/* ------------------------------------------------------------------ */
/*  FAQ — treść zachowana bez zmian                                    */
/* ------------------------------------------------------------------ */

const FAQ_ITEMS = [
  {
    q: 'Czy włos maszynowy się nie rozpływa?',
    a: 'Włos maszynowy to tak samo płytka, delikatna i nietraumatyczna technika jak i puder, nie jest to piórkowa metoda, nie nacinamy skóry, nie wbijamy głęboko pigmentu. Pigmentujemy włoski precyzyjnie nasycając je warstwami pudru, delikatnie, z umiarem i wyczuciem. Dlatego włos maszynowy nie rozpływa się z czasem.',
  },
  {
    q: 'Czy kolor z czasem nie zrobi się czerwony lub szary?',
    a: 'Pigmenty oraz techniki, które wykorzystujemy są najwyższej jakości, spotykanej na rynku PMU. Stąd pewność w ich przewidywalnym zachowaniu się z czasem, co potwierdzają zdjęcia i filmy na naszym IG. Oczywiście skóra i hormony każdego człowieka rządzą się swoimi prawami, na to nie mamy wpływu i rzadko ale zdarza się że kolor pigmentu może się wychłodzić, ale mamy rozwiązanie dla takich klientek - bezpłatna inwersja koloru w cieplejszy odcień.',
  },
  {
    q: 'Czy będzie rysunek wstępny przed pigmentacją?',
    a: 'Oczywiście że tak! Bez niego nie ruszymy. Rysunek wstępny zostanie dopasowany do Twojej architektury twarzy, a w momencie jak będziesz go sprawdzać możemy wprowadzić zmiany, uwzględniając Twoje uwagi i życzenia.',
  },
  {
    q: 'Czy zabieg jest bolesny?',
    a: 'W 90% przypadków zabieg jest bezbolesny, a większość klientek przysypia podczas pigmentacji. Wrażliwe klientki będą odczuwać podczas pierwszego przejścia maszynką drapanie skóry, a już od razu po nim nałożymy żel chłodzący, który zniweluje nieprzyjemne odczucia i większą część zabiegu też można się relaksować.',
  },
  {
    q: 'Czy korekta jest obowiązkowa?',
    a: 'Najczęściej nie, ale wiele zależy od Twojej skóry, procesu regeneracji, stanu hormonalnego oraz życzenia po wygojeniu. Gdy będziemy potrzebować uzupełnić ubytki, poprawić kształt, pogrubić lub zagęścić brwi, dodać intensywności czy delikatnie zmienić kolor - wykonanie korekty będzie najlepszym rozwiązaniem.',
  },
  {
    q: 'Czy można robić nowy zabieg na starym makijażu permanentnym?',
    a: 'Zależy od tego, jak wygląda Twój obecny makijaż permanentny, jak dawno był zrobiony, czy był usuwany oraz czy jest możliwy do poprawy. Poprosimy Cię o wysłanie zdjęcia brwi/ust, abyśmy mogły ocenić jego wygląd. Gdy resztki będą delikatne, żółte, pomarańczowe czy lekko widoczne - zrobimy cover. W przypadku jak PMU będzie miał szary, ciemny, wyraźny zarys - zaprosimy na usuwanie.',
  },
  {
    q: 'Czy usuwanie uszkodzi moje włoski na brwiach?',
    a: 'W żadnym przypadku. Często widzimy odwrotną reakcję: włoski po usuwaniu zaczynają aktywniej odrastać, ponieważ skóra pozbywa się nadmiaru pigmentu i włoski mają miejsce na porost. Czasami po zabiegu zauważysz zbielenie włosków, ale jest to tymczasowa reakcja, wkrótce włoski wracają do swojego koloru, a jak nie będziesz chciała czekać - można zrobić hennę lub farbkę już 2-3 dni po zabiegu usuwania.',
  },
  {
    q: 'Czy usuwanie jest bardzo bolesne?',
    a: 'Na pewno nie zaliczymy tego zabiegu do przyjemnych, ale samo usuwanie trwa około minuty, po zabiegu od razu wychłodzimy Twoją skórę i zadbamy abyś czuła się komfortowo. Każdy ma inny próg bólu, ktoś odczuwa mocniej, a ktoś wcale nie przeżywa bólu.',
  },
  {
    q: 'Czy po usuwaniu będą blizny?',
    a: 'Usuwamy bardzo bezpiecznie oraz skutecznie. Zależy nam na tym, aby Twoja skóra była dobrze przygotowana do nowej pigmentacji, jej stan jest dla nas najważniejszy. Dlatego po usuwaniu laserem oraz removerem u nas nie ma żadnych blizn czy poparzeń. Jedynie należy rozumieć, że jak Twój PMU był zrobiony bardzo głęboko i traumatycznie przed zabiegiem u nas, co powoduje że te blizny są jeszcze przed usuwaniem, to po pozbyciu się koloru z brwi te blizny nie znikną. Będziemy łączyć techniki usuwania, aby jednocześnie usuwać pigment i działać na dobro Twojej skóry.',
  },
];

/* ================================================================== */
/*  02 — ZABIEGI ZE ZDJĘCIAMI EFEKTÓW                                  */
/* ================================================================== */

function TreatmentsBand({ onBook }) {
  return (
    <section
      id="zabiegi"
      className="as-section relative overflow-hidden scroll-mt-24 bg-espresso text-cream-50"
    >
      <GoldArc className="-top-32 left-[-6%] h-[720px] w-[900px]" opacity={0.28} />

      <div className="as-shell relative">
        <Reveal>
          <SectionLabel number="02" tone="light">
            Zabiegi
          </SectionLabel>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
          <Reveal className="lg:col-span-7">
            <h2 className="as-display-lg as-text-balance">
              Realne efekty,
              <br />
              <span className="italic text-gold-light">nie renderowane.</span>
            </h2>
          </Reveal>
          <Reveal delay={90} className="lg:col-span-5 lg:pb-3">
            <p className="as-body-invert max-w-md">
              Każdy zabieg zaczynamy od konsultacji, architektury twarzy i rysunku wstępnego. Kolor
              dobieramy do karnacji, a kształt do Twoich rysów — dopiero potem sięgamy po maszynkę.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 space-y-20 lg:mt-20 lg:space-y-28">
          {MAIN_TREATMENTS.map((t, idx) => (
            <Reveal key={t.id}>
              <article
                id={t.id}
                className="grid scroll-mt-24 gap-12 border-t border-cream-200/15 pt-12 lg:grid-cols-12 lg:gap-16 lg:pt-16"
              >
                {/* — kadry — */}
                <div className={cn('lg:col-span-5', idx % 2 === 1 && 'lg:order-2')}>
                  <Figure
                    image={t.shots[0].image}
                    alt={t.shots[0].alt}
                    ratio={t.shots[0].ratio}
                    position={t.shots[0].position}
                    tone="dark"
                    framed
                    sizes="(min-width: 1024px) 38vw, 90vw"
                  />
                  {t.shots[1] && (
                    <div className="mt-10 w-[72%] sm:w-[62%] lg:ml-auto lg:mt-12">
                      <Figure
                        image={t.shots[1].image}
                        alt={t.shots[1].alt}
                        ratio={t.shots[1].ratio}
                        position={t.shots[1].position}
                        tone="dark"
                        sizes="(min-width: 1024px) 24vw, 60vw"
                      />
                    </div>
                  )}
                </div>

                {/* — opis — */}
                <div className={cn('lg:col-span-7', idx % 2 === 1 && 'lg:order-1')}>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="as-num text-gold-light">{t.number}</span>
                    <span className="h-px w-10 bg-cream-200/25" aria-hidden="true" />
                    <span className="as-label text-cream-200/60">{t.tag}</span>
                  </div>

                  <h3 className="as-display-md as-text-balance mt-6">{t.name}</h3>
                  <p className="as-body-invert mt-6 max-w-xl">{t.description}</p>

                  <blockquote className="mt-8 border-l border-gold/50 pl-6 font-display text-base italic leading-[1.8] text-cream-100 sm:text-lg">
                    {t.quote}
                  </blockquote>

                  <dl className="mt-10 flex flex-wrap gap-x-14 gap-y-6 border-t border-cream-200/15 pt-8">
                    <div>
                      <dt className="as-label text-cream-200/45">Czas zabiegu</dt>
                      <dd className="mt-2.5 font-display text-lg text-cream-50">{t.duration}</dd>
                    </div>
                    <div>
                      <dt className="as-label text-cream-200/45">Cena</dt>
                      <dd className="mt-2.5 font-display text-2xl text-gold-light">{t.price}</dd>
                    </div>
                  </dl>

                  <div className="mt-9 flex flex-wrap items-center gap-8">
                    <button type="button" onClick={() => onBook(t)} className="as-btn-gold">
                      Zarezerwuj wizytę
                    </button>
                    <ArrowLink href="#cennik" tone="light">
                      Pełny cennik
                    </ArrowLink>
                  </div>
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
/*  03 — LINIA, KOREKTY I USUWANIE (bez zdjęć — układ typograficzny)   */
/* ================================================================== */

function SupportBand({ onBook }) {
  return (
    <section className="as-section bg-cream-100">
      <div className="as-shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
          <Reveal className="lg:col-span-6">
            <SectionLabel number="03">Linia, korekty i usuwanie</SectionLabel>
            <h2 className="as-display-md as-text-balance mt-7 text-ink">
              Wszystko, co dzieje się wokół pigmentacji.
            </h2>
          </Reveal>
          <Reveal delay={80} className="lg:col-span-6">
            <p className="as-body max-w-lg">
              Zabiegi uzupełniające prowadzimy tym samym standardem co pigmentację: ocena skóry,
              dobór metody, bezpieczne gojenie. Część z nich wykonujemy dopiero po obejrzeniu zdjęć
              obecnego makijażu permanentnego.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2">
          {SUPPORT_TREATMENTS.map((t, i) => (
            <Reveal key={t.id} delay={(i % 2) * 80}>
              <div
                id={t.id}
                className="flex h-full scroll-mt-24 flex-col bg-cream-100 p-8 lg:p-10"
              >
                <div className="flex flex-wrap items-center gap-4">
                  <span className="as-num">{t.number}</span>
                  <span className="h-px w-8 bg-ink/15" aria-hidden="true" />
                  <span className="as-label text-ink/45">{t.tag}</span>
                </div>

                <h3 className="as-display-sm as-text-balance mt-5 text-ink">{t.name}</h3>
                <p className="as-body mt-4 flex-1 text-[0.875rem]">{t.description}</p>

                <p className="mt-6 font-display text-base italic leading-[1.7] text-mocha-600">
                  {t.quote}
                </p>

                <div className="mt-7 flex flex-wrap items-end justify-between gap-6 border-t border-ink/10 pt-6">
                  <div>
                    <span className="as-label text-ink/45">Czas / cena</span>
                    <p className="mt-2.5 font-display text-xl text-ink">
                      {t.duration} <span className="text-ink/30">·</span>{' '}
                      <span className="text-gold-dark">{t.price}</span>
                    </p>
                    {t.priceNote && (
                      <p className="mt-2 max-w-xs text-xs leading-relaxed text-mocha-400">
                        {t.priceNote}
                      </p>
                    )}
                  </div>
                  <button type="button" onClick={() => onBook(t)} className="as-btn-ghost">
                    Zarezerwuj
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  04 — GALERIA EFEKTÓW                                               */
/* ================================================================== */

function GalleryBand() {
  return (
    <section className="as-section relative overflow-hidden border-t border-ink/10 bg-cream-50">
      <GoldArc className="-top-16 right-[-8%] h-[600px] w-[820px]" flip opacity={0.35} />

      <div className="as-shell relative">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
          <Reveal className="lg:col-span-7">
            <SectionLabel number="04">Efekty</SectionLabel>
            <h2 className="as-display-lg as-text-balance mt-8 text-ink">
              Prace z naszego
              <br />
              gabinetu.
            </h2>
          </Reveal>
          <Reveal delay={90} className="lg:col-span-5 lg:pb-4">
            <p className="as-body max-w-md">
              Zdjęcia pochodzą z prac wykonanych w naszym studiu. Najwięcej
              bieżących wygojeń publikujemy na Instagramie.
            </p>
            <ArrowLink
              href={CONTACT.instagram}
              className="mt-8 w-fit"
              target="_blank"
              rel="noreferrer"
            >
              {CONTACT.instagramHandle}
            </ArrowLink>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {GALLERY_PORTRAIT.map((g, i) => (
            <Reveal key={g.image.src} delay={i * 70}>
              <Figure
                image={g.image}
                alt={g.alt}
                ratio="2 / 1"
                position={g.position}
                sizes="(min-width: 1024px) 22vw, 45vw"
              />
            </Reveal>
          ))}
        </div>

        <div className="mt-3 grid gap-3 sm:gap-4 lg:mt-4 lg:grid-cols-2">
          {GALLERY_WIDE.map((g, i) => (
            <Reveal key={g.image.src} delay={i * 70}>
              <Figure
                image={g.image}
                alt={g.alt}
                ratio="3 / 1"
                position={g.position}
                sizes="(min-width: 1024px) 46vw, 92vw"
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  05 — CENNIK                                                        */
/* ================================================================== */

function PriceBlock({ table }) {
  return (
    <div>
      <h3 className="as-display-sm text-cream-50">{table.title}</h3>
      <p className="as-label mt-3 text-gold-light">{table.subtitle}</p>
      <div className="mt-7">
        {table.items.map((item) => (
          <PriceRow
            key={item.name}
            name={item.name}
            note={item.note}
            price={item.price}
            tone="light"
          />
        ))}
      </div>
      {table.footnote && (
        <p className="mt-6 max-w-xl text-xs leading-relaxed text-cream-200/55">{table.footnote}</p>
      )}
    </div>
  );
}

function PricingBand() {
  return (
    <section
      id="cennik"
      className="as-section relative scroll-mt-24 overflow-hidden bg-espresso-900 text-cream-50"
    >
      <GoldArc className="top-0 left-[6%] h-[760px] w-[900px]" opacity={0.22} />

      <div className="as-shell relative">
        <Reveal>
          <SectionLabel number="05" tone="light">
            Cennik
          </SectionLabel>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
          <Reveal className="lg:col-span-7">
            <h2 className="as-display-lg as-text-balance">
              Jasne stawki,
              <br />
              bez gwiazdek.
            </h2>
          </Reveal>
          <Reveal delay={90} className="lg:col-span-5 lg:pb-3">
            <p className="as-body-invert max-w-md">
              Wszystkie zabiegi zawierają konsultację, architekturę twarzy oraz rysunek wstępny.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-16 lg:grid-cols-2 lg:gap-20">
          <Reveal className="space-y-16">
            <PriceBlock table={PRICING_PMU} />
            <PriceBlock table={PRICING_REFRESH} />
          </Reveal>
          <Reveal delay={90} className="space-y-10">
            <PriceBlock table={PRICING_REMOVAL} />
            <div className="border-t border-cream-200/15 pt-8">
              <FactStrip
                tone="light"
                items={['Konsultacja', 'Architektura twarzy', 'Rysunek wstępny', 'Dobór koloru']}
              />
              <p className="mt-7 max-w-md text-xs leading-relaxed text-cream-200/55">
                Charytatywna rekonstrukcja dla osób po chorobach onkologicznych — darmowa
                konsultacja.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  06 — FAQ                                                           */
/* ================================================================== */

function FaqBand() {
  return (
    <section className="as-section bg-cream-100">
      <div className="as-shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Reveal>
              <SectionLabel number="06">Pytania</SectionLabel>
              <h2 className="as-display-lg as-text-balance mt-8 text-ink">
                Zanim
                <br />
                usiądziesz
                <br />
                w fotelu.
              </h2>
              <p className="as-body mt-7 max-w-sm">
                Szczegółowe odpowiedzi na wątpliwości, które najczęściej słyszymy przed zabiegiem —
                o technikę, kolor, ból i usuwanie.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-8">
            <Reveal delay={90}>
              <Accordion type="single" collapsible className="w-full border-t border-ink/10">
                {FAQ_ITEMS.map((item, idx) => (
                  <AccordionItem
                    key={idx}
                    value={'faq-' + idx}
                    className="border-b border-ink/10 px-0"
                  >
                    <AccordionTrigger className="gap-8 py-6 text-left font-display text-lg font-normal leading-snug text-ink hover:no-underline sm:text-xl">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="as-body max-w-2xl pb-7 pr-8">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  07 — WIZYTA                                                        */
/* ================================================================== */

function ClosingBand() {
  return (
    <section className="relative overflow-hidden bg-mocha text-cream-50">
      <div className="as-shell py-20 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-6">
            <Reveal>
              <SectionLabel number="07" tone="light">
                Wizyta
              </SectionLabel>
              <h2 className="as-display-lg as-text-balance mt-8">
                Zacznijmy od <span className="italic text-gold-light">konsultacji.</span>
              </h2>
              <p className="as-body-invert mt-7 max-w-lg">
                {CONTACT.venue} — {CONTACT.city}. {CONTACT.venueNote}. Napisz, co chcesz
                zmienić, a dobierzemy technikę i termin.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/kontakt" className="as-btn-gold">
                  Umów wizytę
                </Link>
                <a href="#cennik" className="as-btn-ghost-light">
                  Zobacz cennik
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={90} className="lg:col-span-6">
            <Figure
              image={STUDIO[1]}
              alt="Andriana Babushkina — portret z sesji wizerunkowej AS Company"
              ratio="4 / 3"
              position="50% 20%"
              tone="dark"
              framed
              sizes="(min-width: 1024px) 46vw, 92vw"
            />
            <p className="as-label mt-8 text-cream-200/55">
              {CONTACT.venue} · {CONTACT.city}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */

export default function Treatments() {
  const { toast } = useToast();
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [bookingForm, setBookingForm] = useState({ name: '', phone: '', date: '', notes: '' });

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const { status } = sendEnquiry({
      subject: `Zapytanie o termin${selectedTreatment ? ` — ${selectedTreatment.name}` : ''}`,
      fields: [
        ['Imię i nazwisko', bookingForm.name],
        ['Telefon', bookingForm.phone],
        ['Preferowany termin', bookingForm.date],
        ['Zabieg', selectedTreatment ? selectedTreatment.name : ''],
        ['Uwagi', bookingForm.notes],
      ],
    });
    const msg = enquiryMessage(status);
    toast({ title: msg.title, description: msg.body });
    setSelectedTreatment(null);
    setBookingForm({ name: '', phone: '', date: '', notes: '' });
  };

  const inputClass =
    'mt-2.5 h-12 rounded-none border-ink/15 bg-transparent text-ink placeholder:text-mocha-400/70 focus-visible:ring-0';

  return (
    <>
      <PageHero
        label="Zabiegi"
        number="01"
        title="Zabiegi makijażu"
        titleAccent="permanentnego."
        lead="Specjalizujemy się w uzyskaniu najbardziej realistycznego, subtelnego efektu. Bez przerysowanych konturów, bez bólu i bez kompromisów."
        image={STUDIO[6]}
        imageAlt="Portret z sesji wizerunkowej AS Company"
        tone="cream"
      >
        <div className="flex flex-wrap items-center gap-4">
          <a href="#zabiegi" className="as-btn-solid">
            Zobacz zabiegi
          </a>
          <a href="#cennik" className="as-btn-ghost">
            Cennik
          </a>
        </div>
        <FactStrip
          className="mt-10"
          items={['Konsultacja', 'Architektura twarzy', 'Rysunek wstępny']}
        />
      </PageHero>

      <TreatmentsBand onBook={setSelectedTreatment} />
      <SupportBand onBook={setSelectedTreatment} />
      <GalleryBand />
      <PricingBand />
      <FaqBand />
      <ClosingBand />

      {/* ——— Rezerwacja ——— */}
      <Dialog open={!!selectedTreatment} onOpenChange={(open) => !open && setSelectedTreatment(null)}>
        <DialogContent className="rounded-none border-ink/10 bg-cream-50 text-ink sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="as-display-sm text-left text-ink">
              Rezerwacja zabiegu
            </DialogTitle>
            <DialogDescription className="as-body text-left">
              {selectedTreatment ? selectedTreatment.name : ''}
              {selectedTreatment && selectedTreatment.price ? ' · ' + selectedTreatment.price : ''}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBookingSubmit} className="space-y-5 pt-2">
            <div>
              <Label htmlFor="bname" className="as-label text-ink/55">
                Imię i nazwisko
              </Label>
              <Input
                id="bname"
                required
                placeholder="np. Anna Kowalska"
                className={inputClass}
                value={bookingForm.name}
                onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bphone" className="as-label text-ink/55">
                Numer telefonu
              </Label>
              <Input
                id="bphone"
                required
                type="tel"
                placeholder="+48 500 000 000"
                className={inputClass}
                value={bookingForm.phone}
                onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bdate" className="as-label text-ink/55">
                Preferowana data i godzina
              </Label>
              <Input
                id="bdate"
                required
                type="text"
                placeholder="np. Przyszły wtorek po 15:00"
                className={inputClass}
                value={bookingForm.date}
                onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bnotes" className="as-label text-ink/55">
                Uwagi (np. czy posiadasz stary PMU / uczulenia)
              </Label>
              <Textarea
                id="bnotes"
                placeholder="Napisz czy brwi/usta były wcześniej pigmentowane..."
                className="mt-2.5 rounded-none border-ink/15 bg-transparent text-ink placeholder:text-mocha-400/70 focus-visible:ring-0"
                value={bookingForm.notes}
                onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
              />
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-3">
              <button
                type="button"
                className="as-btn-ghost"
                onClick={() => setSelectedTreatment(null)}
              >
                Anuluj
              </button>
              <button type="submit" className="as-btn-solid">
                Wyślij zapytanie
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
