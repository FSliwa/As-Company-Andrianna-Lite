'use client';

/**
 * ZABIEGI — /uslugi
 *
 * Zasady:
 *  • Wszystkie zdjęcia pochodzą wyłącznie z firmowego folderu (import z '@/lib/media').
 *  • Ze sklejek „przed/po" używamy WYŁĄCZNIE wyciętych paneli (BY_NAME['…-pN']),
 *    nigdy plików zbiorczych — panele są poziome, więc dostają poziome ramki.
 *    Makra skóry (BROWS[n]) najwyżej dwa na stronę, tylko w dużych kadrach.
 *  • W ciemnych sekcjach kadry dostają tone="dark", w kremowych tone="light";
 *    portrety STUDIO na kremie — bez korekty.
 *  • Nie podpisujemy zdjęcia jako czegoś, czym nie jest — sekcje, dla których nie ma
 *    realnego materiału (kreska permanentna, korekta, odświeżenie, usuwanie),
 *    zbudowane są typograficznie, bez „podstawionych” kadrów.
 *  • Ceny pochodzą z cennika marki (PRICING_PMU / PRICING_REFRESH / PRICING_REMOVAL
 *    w '@/lib/site'), żeby karty zabiegów i cennik nie mogły się rozjechać.
 *  • Opisy, cytaty, czasy trwania i FAQ zostały zachowane z poprzedniej wersji strony.
 *
 * Rytm i skala: jak na stronie głównej — .as-section, SectionLabel → h2 (mt-6,
 * .as-display-section) → zajawka (.as-caption) → treść (mt-10) → CTA (mt-8).
 * Rytm tła: hero (cream-50) → 02 zabiegi + efekty (espresso) → 03 linia/korekty (cream-100)
 * → 04 cennik (espresso-900) → 05 pytania (cream-100) → 06 wizyta (ClosingCta, espresso-900).
 * Numeracja sekcji ciągła: 01 hero … 06 wizyta.
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowLink,
  ClosingCta,
  CtaButton,
  FactStrip,
  Faq,
  Field,
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
/*  Kadry: makro skóry w kwadracie (brew i oko zostają w kadrze),      */
/*  pod nim poziomy panel ze sklejki — razem w jednej złotej ramce.    */
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
        ratio: '1 / 1',
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
        ratio: '1 / 1',
        position: '50% 45%',
      },
      {
        image: BY_NAME['brows-12-p2'],
        alt: 'Para oczu z wycieniowanymi, podkreślonymi brwiami po makijażu permanentnym',
        ratio: '5 / 2',
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
/*  Kolaż stoi na końcu sekcji „Zabiegi" (espresso) — stąd tone="dark". */
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
/*  02 — ZABIEGI ZE ZDJĘCIAMI EFEKTÓW + KOLAŻ WYGOJEŃ                  */
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

        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
          <Reveal className="lg:col-span-7">
            <h2 className="as-display-section as-text-balance">
              Realne efekty,
              <br />
              <span className="italic text-gold-light">nie renderowane.</span>
            </h2>
          </Reveal>
          <Reveal delay={90} className="lg:col-span-5 lg:pt-1">
            <p className="as-caption-invert">
              Każdy zabieg zaczynamy od konsultacji, architektury twarzy i rysunku wstępnego. Kolor
              dobieramy do karnacji, a kształt do Twoich rysów — dopiero potem sięgamy po maszynkę.
            </p>
          </Reveal>
        </div>

        <div className="mt-10 space-y-12">
          {MAIN_TREATMENTS.map((t, idx) => (
            <Reveal key={t.id}>
              <article
                id={t.id}
                className="grid scroll-mt-24 gap-8 lg:grid-cols-12 lg:items-center lg:gap-16"
              >
                {/* — kadry: makro + panel w jednej złotej ramce — */}
                <div className={cn('lg:col-span-4', idx % 2 === 1 && 'lg:order-2')}>
                  <div className="as-photo-frame grid gap-1">
                    <Figure
                      image={t.shots[0].image}
                      alt={t.shots[0].alt}
                      ratio={t.shots[0].ratio}
                      position={t.shots[0].position}
                      tone="dark"
                      sizes="(min-width: 1024px) 30vw, 90vw"
                    />
                    {t.shots[1] && (
                      <Figure
                        image={t.shots[1].image}
                        alt={t.shots[1].alt}
                        ratio={t.shots[1].ratio}
                        position={t.shots[1].position}
                        tone="dark"
                        sizes="(min-width: 1024px) 30vw, 90vw"
                      />
                    )}
                  </div>
                </div>

                {/* — opis — */}
                <div className={cn('lg:col-span-8', idx % 2 === 1 && 'lg:order-1')}>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="as-num">{t.number}</span>
                    <span className="h-px w-10 bg-cream-200/25" aria-hidden="true" />
                    <span className="as-kicker-invert">{t.tag}</span>
                  </div>

                  <h3 className="mt-5 font-display text-2xl text-cream-50 sm:text-[1.75rem]">
                    {t.name}
                  </h3>
                  <p className="as-caption-invert mt-3">{t.description}</p>

                  <blockquote className="as-quote-invert mt-6 max-w-md border-l border-gold/35 pl-5">
                    {t.quote}
                  </blockquote>

                  <dl className="mt-6 flex flex-wrap gap-x-12 gap-y-4 border-t border-cream-200/15 pt-6">
                    <div>
                      <dt className="as-kicker-invert">Czas zabiegu</dt>
                      <dd className="mt-2 font-display text-xl text-cream-50">{t.duration}</dd>
                    </div>
                    <div>
                      <dt className="as-kicker-invert">Cena</dt>
                      <dd className="mt-2 font-display text-xl text-gold-light">{t.price}</dd>
                    </div>
                  </dl>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <CtaButton onClick={() => onBook(t)} className="as-btn-gold">
                      Zarezerwuj wizytę
                    </CtaButton>
                    <ArrowLink href="#cennik" tone="light">
                      Pełny cennik
                    </ArrowLink>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* — efekty: kolaż wygojeń pod artykułami, jedna złota ramka (jak trójka
            w „O nas" i kolaż w „Szkoleniach"); ciemna sekcja → tone="dark" — */}
        <div className="mt-12 border-t border-cream-200/15 pt-10">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-start lg:gap-12">
            <Reveal className="lg:col-span-7">
              <h3 className="font-display text-2xl text-cream-50 sm:text-[1.75rem]">
                Prace z naszego gabinetu.
              </h3>
            </Reveal>
            <Reveal delay={90} className="lg:col-span-5">
              <p className="as-caption-invert">
                Zdjęcia pochodzą z prac wykonanych w naszym studiu. Najwięcej bieżących wygojeń
                publikujemy na Instagramie.
              </p>
              <ArrowLink
                href={CONTACT.instagram}
                tone="light"
                className="mt-5 w-fit"
                target="_blank"
                rel="noreferrer"
              >
                {CONTACT.instagramHandle}
              </ArrowLink>
            </Reveal>
          </div>

          <Reveal className="mt-8">
            <div className="as-photo-frame grid gap-1">
              <div className="grid grid-cols-2 gap-1 lg:grid-cols-4">
                {GALLERY_PORTRAIT.map((g) => (
                  <Figure
                    key={g.image.src}
                    image={g.image}
                    alt={g.alt}
                    ratio="2 / 1"
                    position={g.position}
                    tone="dark"
                    sizes="(min-width: 1024px) 22vw, 45vw"
                  />
                ))}
              </div>
              <div className="grid gap-1 sm:grid-cols-2">
                {GALLERY_WIDE.map((g) => (
                  <Figure
                    key={g.image.src}
                    image={g.image}
                    alt={g.alt}
                    ratio="3 / 1"
                    position={g.position}
                    tone="dark"
                    sizes="(min-width: 640px) 46vw, 92vw"
                  />
                ))}
              </div>
            </div>
          </Reveal>
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
        <Reveal>
          <SectionLabel number="03">Linia, korekty i usuwanie</SectionLabel>
        </Reveal>

        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
          <Reveal className="lg:col-span-7">
            {/* „dzieje się" nierozdzielne; jawne łamanie tylko od lg — na telefonie
                łamałoby „się" do osobnego wiersza */}
            <h2 className="as-display-section text-ink">
              Wszystko, co dzieje&nbsp;się <br className="hidden lg:block" />
              wokół pigmentacji.
            </h2>
          </Reveal>
          <Reveal delay={80} className="lg:col-span-5 lg:pt-1">
            <p className="as-caption">
              Zabiegi uzupełniające prowadzimy tym samym standardem co pigmentację: ocena skóry,
              dobór metody, bezpieczne gojenie. Część z nich wykonujemy dopiero po obejrzeniu zdjęć
              obecnego makijażu permanentnego.
            </p>
          </Reveal>
        </div>

        {/* karty jak w „Efektach" na stronie głównej: pionowa złota linia z lewej, bez ramek */}
        <div className="mt-10 grid gap-y-10 sm:grid-cols-2 sm:gap-x-0 xl:grid-cols-4">
          {SUPPORT_TREATMENTS.map((t, i) => (
            <Reveal key={t.id} delay={(i % 4) * 80}>
              <article id={t.id} className="as-card-col group scroll-mt-24 sm:pr-7">
                <div className="mb-4 flex items-center gap-4">
                  <span className="as-num">{t.number}</span>
                  <span className="h-px w-10 bg-ink/15 transition-all duration-300 group-hover:w-16 group-hover:bg-gold" />
                </div>
                <span className="as-kicker">{t.tag}</span>

                <h3 className="mt-3 font-display text-2xl text-ink sm:text-[1.75rem]">{t.name}</h3>
                <p className="as-caption mt-3">{t.description}</p>

                <p className="as-quote mt-5 max-w-[19rem] border-l border-gold/35 pl-5 text-mocha-600">
                  {t.quote}
                </p>

                <div className="mt-auto pt-7">
                  <span className="as-kicker">Czas / cena</span>
                  <p className="mt-2 font-display text-xl text-ink">
                    {t.duration} <span className="text-ink/30">·</span> {t.price}
                  </p>
                  {t.priceNote && (
                    <p className="as-numbered-desc text-mocha-400">{t.priceNote}</p>
                  )}
                  <CtaButton
                    onClick={() => onBook(t)}
                    className="group as-arrow-dark mt-5"
                  >
                    <span>Zarezerwuj</span>
                    <span className="as-arrow-glyph" aria-hidden="true">
                      &#8594;
                    </span>
                  </CtaButton>
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
/*  04 — CENNIK                                                        */
/* ================================================================== */

/* Tabela: PriceRow rysuje górną linię przy pierwszym wierszu (first:border-t),
   więc wrapper nie dostaje własnego border-t — inaczej byłaby podwójna linia. */
function PriceBlock({ table }) {
  return (
    <div>
      <h3 className="font-display text-2xl text-cream-50 sm:text-[1.75rem]">{table.title}</h3>
      <p className="as-kicker-invert mt-2">{table.subtitle}</p>
      <div className="mt-5">
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
        <p className="mt-5 max-w-md text-xs leading-relaxed text-cream-200/55">{table.footnote}</p>
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
          <SectionLabel number="04" tone="light">
            Cennik
          </SectionLabel>
        </Reveal>

        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
          <Reveal className="lg:col-span-7">
            <h2 className="as-display-section">
              Jasne stawki,
              <br />
              bez gwiazdek.
            </h2>
          </Reveal>
          <Reveal delay={90} className="lg:col-span-5 lg:pt-1">
            <p className="as-caption-invert">
              Wszystkie zabiegi zawierają konsultację, architekturę twarzy oraz rysunek wstępny.
            </p>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="space-y-12">
            <PriceBlock table={PRICING_PMU} />
            <PriceBlock table={PRICING_REFRESH} />
          </Reveal>
          <Reveal delay={90}>
            <PriceBlock table={PRICING_REMOVAL} />
            <div className="mt-10">
              <FactStrip
                tone="light"
                items={['Konsultacja', 'Architektura twarzy', 'Rysunek wstępny', 'Dobór koloru']}
              />
              <p className="mt-5 max-w-md text-xs leading-relaxed text-cream-200/55">
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
/*  05 — FAQ                                                           */
/* ================================================================== */

function FaqBand() {
  return (
    <section className="as-section bg-cream-100">
      <div className="as-shell">
        <Reveal>
          <SectionLabel number="05">Pytania</SectionLabel>
        </Reveal>

        {/* nagłówek jak w pozostałych sekcjach strony: h2 (7/12) + zajawka (5/12);
            dwa wiersze w .as-display-section — w kolumnie 4/12 „Zanim usiądziesz"
            (459 px przy 60 px) łamało się na trzy */}
        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
          <Reveal className="lg:col-span-7">
            <h2 className="as-display-section text-ink">
              Zanim usiądziesz
              <br />
              w fotelu.
            </h2>
          </Reveal>
          <Reveal delay={80} className="lg:col-span-5 lg:pt-1">
            <p className="as-caption">
              Szczegółowe odpowiedzi na wątpliwości, które najczęściej słyszymy przed zabiegiem —
              o technikę, kolor, ból i usuwanie.
            </p>
          </Reveal>
        </div>

        <div className="mt-10 grid lg:grid-cols-12 lg:gap-12">
          <Reveal delay={90} className="lg:col-span-8">
            <Faq items={FAQ_ITEMS} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  06 — WIZYTA (pas zamykający)                                       */
/* ================================================================== */

function ClosingBand() {
  return (
    <ClosingCta
      number="06"
      label="Wizyta"
      title="Zacznijmy od"
      titleAccent="konsultacji."
      lead={`${CONTACT.venue} — ${CONTACT.city}. ${CONTACT.venueNote}. Napisz, co chcesz zmienić, a dobierzemy technikę i termin.`}
      primary={{ href: '/kontakt', label: 'Umów wizytę' }}
      secondary={{ href: '#cennik', label: 'Zobacz cennik' }}
      photos={[
        { image: STUDIO[1], alt: 'Andriana Babushkina — portret z sesji wizerunkowej AS Company', position: '50% 20%' },
        { image: STUDIO[2], alt: 'Andriana Babushkina — sesja wizerunkowa AS Company', position: '50% 15%' },
      ]}
    />
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
        facts={['Konsultacja', 'Architektura twarzy', 'Rysunek wstępny']}
      >
        <div className="flex flex-wrap gap-4">
          <a href="#zabiegi" className="as-btn-solid">
            Zobacz zabiegi
          </a>
          <a href="#cennik" className="as-btn-ghost">
            Cennik
          </a>
        </div>
      </PageHero>

      <TreatmentsBand onBook={setSelectedTreatment} />
      <SupportBand onBook={setSelectedTreatment} />
      <PricingBand />
      <FaqBand />
      <ClosingBand />

      {/* ——— Rezerwacja — dialog na brandowych klasach z ui/dialog, pola <Field> ——— */}
      <Dialog open={!!selectedTreatment} onOpenChange={(open) => !open && setSelectedTreatment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rezerwacja zabiegu</DialogTitle>
            <DialogDescription>
              {selectedTreatment ? selectedTreatment.name : ''}
              {selectedTreatment && selectedTreatment.price ? ' · ' + selectedTreatment.price : ''}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBookingSubmit} className="mt-8 space-y-6">
            <Field
              id="bname"
              label="Imię i nazwisko"
              required
              placeholder="np. Anna Kowalska"
              value={bookingForm.name}
              onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
            />
            <Field
              id="bphone"
              label="Numer telefonu"
              type="tel"
              required
              placeholder="+48 500 000 000"
              value={bookingForm.phone}
              onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
            />
            <Field
              id="bdate"
              label="Preferowana data i godzina"
              type="text"
              required
              placeholder="np. Przyszły wtorek po 15:00"
              value={bookingForm.date}
              onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
            />
            <Field
              as="textarea"
              id="bnotes"
              label="Uwagi (np. czy posiadasz stary PMU / uczulenia)"
              placeholder="Napisz czy brwi/usta były wcześniej pigmentowane..."
              value={bookingForm.notes}
              onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
            />

            <DialogFooter>
              <button type="submit" className="as-btn-gold">
                Wyślij zapytanie
              </button>
              <button
                type="button"
                className="as-btn-ghost"
                onClick={() => setSelectedTreatment(null)}
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
