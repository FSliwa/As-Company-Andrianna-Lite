'use client';

/**
 * Szkolenia (/szkolenia) — „Numer 01".
 *
 * Każda sekcja to rozkładówka: SectionLabel → H2 .as-display-section → treść
 * → jedno wezwanie. Rytm tła: cream-50 (hero) → cream-100 → cream-50 →
 * espresso (jedyny ciemny pas) → cream-50 → cream-100 → espresso-900
 * (ClosingCta + stopka). Sąsiednie jasne sekcje dzieli hairline.
 *
 * Zdjęcia: portret wyłącznie przez ROLES, grupy wyłącznie przez GROUPS
 * (src/lib/roles.js). Makra na tej trasie: 0. Plakaty COURSE tylko jako
 * miniatury ≤ 120 px w „Programie do pobrania" z linkiem do pliku.
 *
 * Dane programów, korzyści i harmonogramu: COURSES / COURSE_BENEFITS /
 * COURSE_SCHEDULE z '@/lib/site' (1:1 z grafik marki). Programy dodatkowe
 * (EXTRA_COURSES) pochodzą z wcześniejszej wersji strony — do potwierdzenia.
 *
 * Formularz zgłoszenia NIE realizuje płatności — zbiera dane i informuje, że
 * termin i rozliczenie potwierdzamy w rozmowie.
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
import {
  ArrowLink,
  ClosingCta,
  CtaButton,
  Faq,
  Field,
  Figure,
  PageHero,
  Reveal,
  SectionLabel,
} from '@/components/as/Primitives';
import {
  ACHIEVEMENTS,
  BRAND,
  CONTACT,
  COURSES,
  COURSE_BENEFITS,
  COURSE_SCHEDULE,
  FOUNDER,
} from '@/lib/site';
import { GROUPS, ROLES } from '@/lib/roles';
import { COURSE } from '@/lib/media';
import { enquiryMessage, sendEnquiry } from '@/lib/enquiry';

/* ------------------------------------------------------------------ */
/*  Dane pomocnicze                                                    */
/* ------------------------------------------------------------------ */

const byId = (id) => COURSES.find((c) => c.id === id);

/* Kolejność ścieżek: od zera → technika → dalszy rozwój */
const MAIN_PATHS = [
  { number: '01', name: 'Kurs podstawowy', course: byId('kurs-podstawowy') },
  { number: '02', name: 'Super Natural Brows', course: byId('super-natural-brows') },
];

/* Programy spoza dwóch głównych ścieżek — treść z dotychczasowej wersji strony. */
const EXTRA_COURSES = [
  {
    id: 'snb-expert',
    title: 'Master Class „SNB Expert”',
    price: '5 000 zł',
    format: '7 dni online + 1 dzień stacjonarny',
  },
  {
    id: 'online-perfect-lips',
    title: 'Kurs online „Perfect Lips”',
    price: '1 500 zł',
    format: 'Ponad 20 filmów szkoleniowych',
  },
  {
    id: 'szyty-na-miare',
    title: 'Kurs „Szyty na miarę”',
    price: 'Wycena indywidualna',
    format: 'Szkolenie 1 na 1 z Andrianą',
  },
];

/* Fakty w hero — dwa krótkie, wyłącznie z ACHIEVEMENTS. Pasek jest zawsze w jednej
   linii i musi zmieścić się w łamie telefonu (≈ 270 px): dłuższy rozpycha kolumnę hero. */
const HERO_FACTS = [`${ACHIEVEMENTS[0].value} podium MŚ`, `${ACHIEVEMENTS[1].value} kursantek`];

/* Oryginalne karty programów — wyłącznie miniatury z linkiem do pliku. */
const DOWNLOADS = [
  {
    group: 'Super Natural Brows',
    items: [
      { image: COURSE[1], caption: 'Plakat', alt: 'Plakat szkolenia Super Natural Brows — maszynowy włos, Babushkina Academy' },
      { image: COURSE[0], caption: 'Program', alt: 'Karta programu szkolenia Super Natural Brows — 14 dni online i 2 dni stacjonarne' },
      { image: COURSE[2], caption: 'Zakres i cena', alt: 'Karta z zakresem szkolenia Super Natural Brows i ceną 7 000 zł netto' },
    ],
  },
  {
    group: 'Kurs podstawowy',
    items: [
      { image: COURSE[6], caption: 'Plakat', alt: 'Plakat kursu podstawowego Super Natural Brows — Babushkina Academy' },
      { image: COURSE[3], caption: 'Program', alt: 'Karta programu kursu podstawowego — 16 dni online i 4 dni stacjonarne' },
      { image: COURSE[4], caption: 'Zakres i cena', alt: 'Karta z zakresem kursu podstawowego i ceną 15 000 zł netto' },
      { image: COURSE[5], caption: 'Harmonogram', alt: 'Karta z harmonogramem czterech dni stacjonarnych kursu podstawowego' },
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: 'Czy po szkoleniu zacznę pracę z klientkami?',
    a: 'Tak, właśnie po to stworzyliśmy unikatowy system szkolenia online + offline, aby na kursie głównie skupić się na praktyce i pokonać lęk przed pracą z klientami. Przy pierwszej modelce zrobisz pracę z moją delikatną pomocą, przy ostatniej wykonasz ją zupełnie samodzielnie!',
  },
  {
    q: 'Czy podczas szkolenia można zakupić produkty, potrzebne do wykonywania zabiegu?',
    a: 'Tak, oczywiście! Otrzymasz kod rabatowy na zakupy online, ale także można będzie zaopatrzyć się w niezbędne akcesoria od razu na miejscu. Jako nasza kursantka będziesz mieć znacznie atrakcyjniejsze ceny i moje rekomendacje, aby nie przepłacać.',
  },
  {
    q: 'Czy mogę skorzystać z dofinansowania na te szkolenia?',
    a: 'Tak, jesteśmy zarejestrowani w RIS (Rejestr Instytucji Szkoleniowych), KFS (Krajowy Fundusz Szkoleniowy) oraz BUR (Baza Usług Rozwojowych). Wybierz dogodną dla Ciebie placówkę, udaj się po wiedzę i wymagania dla akceptacji Twojego wniosku do Urzędu Miasta/Pracy i niech Twój operator się z nami skontaktuje - udzielimy mu wszystkich niezbędnych informacji i dokumentów!',
  },
  {
    q: 'Czy jest opieka po szkoleniu?',
    a: 'Tak, będziemy w ciągłym kontakcie, bez ograniczeń i ramek czasowych! Nawet po kilku latach możesz nadal liczyć na moją pomoc, konsultacje prac i wsparcie w rozwoju.',
  },
  {
    q: 'Czy na szkoleniu będą inne osoby?',
    a: 'Zdecydowanie tak, zawsze polecamy kursy grupowe (kameralne 2-4 osoby), ponieważ istnieje na nich zdrowa konkurencja, wesoły klimat, nowe znajomości, pomoc od innych kursantek i możliwość podzielenia się oraz pochwalenia swoimi postępami – a czasami nawet znalezienie wiernej koleżanki w branży PMU na długie lata!',
  },
];

const pad = (n) => String(n).padStart(2, '0');

/* ================================================================== */
/*  01 — HERO                                                          */
/* ================================================================== */

function Hero({ onBook }) {
  return (
    <PageHero
      variant="cover"
      number="01"
      label="Szkolenia"
      title="Szkolenia oparte na"
      titleAccent="realnej praktyce."
      lead="Dużo praktyki, zero lęku przed pierwszą klientką. Uczymy, jak wykonać zabieg jakościowo — a przy tym szybko, komfortowo i bezpiecznie."
      image={ROLES.heroTraining.image}
      imagePosition={ROLES.heroTraining.position}
      imageAlt={`${FOUNDER.name} — ${FOUNDER.role}, prowadząca szkolenia ${BRAND.academy}`}
      facts={HERO_FACTS}
    >
      <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
        <CtaButton onClick={() => onBook(null)} className="as-btn-solid">
          Zapytaj o termin
        </CtaButton>
        <ArrowLink href="#kursy" className="w-fit">
          Zobacz kursy
        </ArrowLink>
      </div>
    </PageHero>
  );
}

/* ================================================================== */
/*  02 — TRZY ŚCIEŻKI + DOFINANSOWANIE (cream-100)                     */
/* ================================================================== */

function PathsBand() {
  return (
    <section id="kursy" className="as-section scroll-mt-28 border-t border-ink/10 bg-cream-100">
      <div className="as-shell">
        <Reveal>
          <SectionLabel number="02">Ścieżki</SectionLabel>
          <h2 className="as-display-section as-text-balance mt-6 text-ink">Trzy ścieżki, jedna metoda.</h2>
        </Reveal>

        <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
          {MAIN_PATHS.map(({ number, name, course }, i) => (
            <Reveal key={course.id} delay={i * 80} className="as-cell">
              <p className="as-kicker">
                {number} · {course.kicker}
              </p>
              <h3 className="as-title mt-3 text-ink">{name}</h3>
              <p className="mt-4 font-display text-[1.375rem] leading-none text-ink">
                {course.price}
                <span className="as-label ml-2 align-middle text-mocha">{course.priceNote}</span>
              </p>
              <p className="as-kicker mt-3">{course.format}</p>
              <p className="mt-4 max-w-[30rem] text-[0.9375rem] leading-[1.65] text-ink/75">{course.lead}</p>
            </Reveal>
          ))}

          <Reveal delay={160} className="as-cell">
            <p className="as-kicker">03 · Dalszy rozwój</p>
            <h3 className="as-title mt-3 text-ink">Dla absolwentek</h3>
            <ul className="mt-4">
              {EXTRA_COURSES.map((c) => (
                <li
                  key={c.id}
                  className="grid grid-cols-[1fr_auto] items-baseline gap-4 border-b border-ink/10 py-3 first:border-t"
                >
                  <span className="min-w-0">
                    <span className="block text-[0.9375rem] leading-snug text-ink">{c.title}</span>
                    <span className="mt-0.5 block text-[0.8125rem] leading-snug text-mocha">{c.format}</span>
                  </span>
                  <span className="max-w-[8.5rem] text-right font-display text-[1.375rem] leading-none text-ink lg:max-w-none">
                    {c.price}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Dofinansowanie — jedno zdanie; szczegóły w pytaniach (#pytania) */}
        <Reveal className="mt-12 flex flex-col gap-4 border-t border-ink/15 pt-6 md:flex-row md:items-baseline md:justify-between md:gap-8">
          <p className="as-body">Szkolenia można sfinansować przez RIS, KFS lub BUR.</p>
          <ArrowLink href="#pytania" className="w-fit shrink-0">
            Jak skorzystać z dofinansowania
          </ArrowLink>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  03 — PROGRAM (cream-50)                                            */
/* ================================================================== */

function ProgramBand({ onBook }) {
  return (
    <section id="program" className="as-section scroll-mt-28 border-t border-ink/10 bg-cream-50">
      <div className="as-shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <Reveal className="lg:col-span-7">
            <SectionLabel number="03">Program</SectionLabel>
            <h2 className="as-display-section as-text-balance mt-6 text-ink">Program krok po kroku.</h2>
          </Reveal>
          <Reveal delay={80} className="lg:col-span-5 lg:col-start-8">
            <p className="as-body">
              Teorię przerabiasz online, we własnym tempie. Dni stacjonarne to skórki i żywe
              modelki. Terminy zjazdów ustalamy indywidualnie.
            </p>
          </Reveal>
        </div>

        {MAIN_PATHS.map(({ number, name, course }) => (
          <article
            key={course.id}
            id={`program-${course.id}`}
            className="mt-12 scroll-mt-28 border-t border-ink/15 pt-6 lg:mt-14"
          >
            <Reveal className="flex flex-col gap-5 md:flex-row md:items-baseline md:justify-between md:gap-8">
              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
                <span className="as-kicker">{number}</span>
                <h3 className="as-title text-ink">{name}</h3>
                <p className="as-kicker">
                  {course.price} {course.priceNote} · {course.format}
                </p>
              </div>
              <ArrowLink
                onClick={() => onBook({ id: course.id, title: course.title })}
                className="w-fit shrink-0"
              >
                Zgłoś się
              </ArrowLink>
            </Reveal>

            <Reveal delay={80}>
              <dl className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {course.program.map((item) => (
                  <div key={item.label} className="border-t border-ink/10 pt-4">
                    <dt className="as-numbered-title text-ink">{item.label}</dt>
                    {item.detail && <dd className="as-numbered-desc text-mocha">{item.detail}</dd>}
                  </div>
                ))}
              </dl>
            </Reveal>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ================================================================== */
/*  04 — ABSOLWENTKI (espresso, jedyny ciemny pas)                     */
/* ================================================================== */

/* Stykówka: trzy równe kadry 4:5 w jednej złotej ramce (bez mieszania proporcji).
   < sm: pierwszy kadr na całą szerokość + dwa pod nim — wszystkie nadal 4:5. */
const GRADUATE_TILES = [
  {
    group: GROUPS.graduatesMain,
    alt: 'Trzy absolwentki z certyfikatami Super Natural Brows pod logo Babushkina Academy',
  },
  {
    group: GROUPS.graduatesA,
    alt: 'Pięć absolwentek z certyfikatami Super Natural Brows w holu Babushkina Academy',
  },
  {
    group: GROUPS.graduatesB,
    alt: 'Trzy absolwentki w czerni z certyfikatami Super Natural Brows na tle logo Babushkina Academy',
  },
];

function GraduatesBand() {
  return (
    <section className="as-section relative overflow-hidden bg-espresso text-cream-50">
      <div className="as-shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-5">
            <Reveal>
              <SectionLabel number="04" tone="light">
                Absolwentki
              </SectionLabel>
              <h2 className="as-display-section as-text-balance mt-6 text-cream-100">
                Każdy kurs kończy się certyfikatem.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="as-body-invert mt-6">
                Kameralne grupy 2–4 osób, a po kursie grupa wsparcia i stały kontakt z prowadzącą.
              </p>
              <ArrowLink
                href={CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
                tone="light"
                className="mt-8 w-fit"
              >
                Relacje kursantek na Instagramie
              </ArrowLink>
            </Reveal>
          </div>

          <Reveal delay={80} className="lg:col-span-7">
            <figure>
              <div className="as-photo-frame grid grid-cols-2 gap-1 sm:grid-cols-3">
                {GRADUATE_TILES.map(({ group, alt }, i) => (
                  <Figure
                    key={group.image.src}
                    image={group.image}
                    alt={alt}
                    ratio="4 / 5"
                    position={group.position}
                    tone="dark"
                    zoom={false}
                    className={i === 0 ? 'col-span-2 sm:col-span-1' : undefined}
                    sizes={
                      i === 0
                        ? '(min-width: 1024px) 18vw, (min-width: 640px) 31vw, 92vw'
                        : '(min-width: 1024px) 18vw, (min-width: 640px) 31vw, 46vw'
                    }
                  />
                ))}
              </div>
              <figcaption className="as-caption-invert mt-3 max-w-none">
                Absolwentki Super Natural Brows, {BRAND.academy}, {CONTACT.city}
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  05 — W CENIE + HARMONOGRAM (cream-50)                              */
/* ================================================================== */

const SCHEDULE_ITEMS = COURSE_SCHEDULE.map((day) => ({
  q: day.day,
  a: (
    <ul>
      {day.rows.map(([time, text]) => (
        <li key={`${day.day}-${time}-${text}`} className="flex gap-4 border-t border-ink/10 py-2.5 first:border-t-0">
          <span className="w-12 shrink-0 text-[0.9375rem] font-medium tabular-nums leading-[1.6] text-gold-dark">{time}</span>
          <span className="text-[0.9375rem] leading-[1.6] text-ink/80">{text}</span>
        </li>
      ))}
    </ul>
  ),
}));

function IncludedBand() {
  return (
    <section className="as-section bg-cream-50">
      <div className="as-shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal>
              <SectionLabel number="05">W cenie</SectionLabel>
              <h2 className="as-display-section as-text-balance mt-6 text-ink">W cenie kursu.</h2>
            </Reveal>
            <Reveal delay={80}>
              {/* jedna kolumna < sm, dwie od sm */}
              <ol className="mt-8 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                {COURSE_BENEFITS.map((benefit, i) => (
                  <li
                    key={benefit}
                    className="flex items-baseline gap-4 border-t border-ink/10 py-3.5"
                  >
                    <span className="as-num w-8 shrink-0 text-lg sm:text-xl">{pad(i + 1)}</span>
                    <span className="text-[0.9375rem] leading-[1.65] text-ink/80">{benefit}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <Reveal delay={120}>
              <p className="as-kicker">Harmonogram · kurs podstawowy</p>
              <p className="mt-3 text-[0.9375rem] leading-[1.65] text-ink/75">
                Cztery dni stacjonarne, godzina po godzinie. W programie Super Natural Brows część
                stacjonarna trwa dwa dni i przebiega w tym samym rytmie: egzamin, skórki, modelki.
              </p>
              <Faq items={SCHEDULE_ITEMS} className="mt-6" />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  06 — PYTANIA + PROGRAM DO POBRANIA (cream-100)                     */
/* ================================================================== */

function QuestionsBand() {
  return (
    <section id="pytania" className="as-section scroll-mt-28 border-t border-ink/10 bg-cream-100">
      <div className="as-shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal>
              <SectionLabel number="06">Pytania</SectionLabel>
              <h2 className="as-display-section as-text-balance mt-6 text-ink">Zanim się zapiszesz.</h2>
            </Reveal>
            <Reveal delay={80}>
              <Faq items={FAQ_ITEMS} className="mt-8" />
            </Reveal>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <Reveal delay={120}>
              <p className="as-kicker">Program do pobrania</p>
              <p className="as-caption mt-3 max-w-none">
                Oryginalne karty programów {BRAND.academy} — otwierają się w nowej karcie.
              </p>
              <div className="mt-6 space-y-6">
                {DOWNLOADS.map((d) => (
                  <div key={d.group} className="border-t border-ink/15 pt-4">
                    <p className="as-label text-ink/70">{d.group}</p>
                    <ul className="mt-3 flex flex-wrap gap-3">
                      {d.items.map((it) => (
                        <li key={it.image.src} className="w-16">
                          <a
                            href={it.image.src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block"
                            aria-label={`${it.alt} — otwórz w nowej karcie`}
                          >
                            <Figure
                              image={it.image}
                              alt=""
                              ratio="9 / 16"
                              zoom={false}
                              sizes="64px"
                              className="border border-ink/15 transition-colors group-hover:border-gold"
                            />
                            <span className="as-caption mt-1.5 block leading-snug group-hover:text-ink">
                              {it.caption}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  07 — KONTAKT (pas zamykający)                                      */
/* ================================================================== */

function ClosingBand({ onBook }) {
  return (
    <ClosingCta
      number="07"
      label="Zapisy"
      title="Zarezerwuj miejsce"
      titleAccent="w grupie."
      lead={`Napisz, na jakim jesteś etapie — dobierzemy program i ustalimy najbliższy możliwy termin części stacjonarnej. Szkolenia prowadzi ${FOUNDER.name}, ${FOUNDER.role}.`}
      primary={{ label: 'Zapytaj o termin', onClick: () => onBook(null) }}
      secondary={{ href: '/kontakt', label: 'Napisz do nas' }}
    />
  );
}

/* ================================================================== */
/*  ZGŁOSZENIE NA SZKOLENIE                                            */
/*  (bez płatności — formularz zbiera dane i informuje o kontakcie)    */
/* ================================================================== */

const ALL_COURSE_TITLES = [...COURSES.map((c) => c.title), ...EXTRA_COURSES.map((c) => c.title)];

function BookingDialog({ course, onClose }) {
  const [form, setForm] = useState({
    course: course?.title || ALL_COURSE_TITLES[0],
    name: '',
    phone: '',
    email: '',
    city: '',
    term: '',
    experience: '',
  });
  const [sent, setSent] = useState(null); // null | ENQUIRY_STATUS

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const { status } = sendEnquiry({
      subject: `Zgłoszenie na szkolenie — ${form.course}`,
      fields: [
        ['Szkolenie', form.course],
        ['Imię i nazwisko', form.name],
        ['Telefon', form.phone],
        ['E-mail', form.email],
        ['Miasto', form.city],
        ['Preferowany termin', form.term],
        ['Doświadczenie', form.experience],
      ],
    });
    setSent(status);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      {/* formularz ma dwie kolumny pól — stąd szerszy panel */}
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <span className="as-kicker">Zgłoszenie na szkolenie</span>
          <DialogTitle>{sent ? enquiryMessage(sent).title : form.course}</DialogTitle>
          <DialogDescription>
            {sent
              ? enquiryMessage(sent).body
              : 'Zostaw kontakt i kilka słów o swoim doświadczeniu. Ten formularz nie realizuje płatności — potwierdzenie terminu i rozliczenie ustalamy osobno.'}
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="mt-8">
            <div className="border border-ink/15 bg-cream-100/70 p-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="as-kicker">Szkolenie</dt>
                  <dd className="mt-2 text-[0.9375rem] text-ink">{form.course}</dd>
                </div>
                {form.term && (
                  <div>
                    <dt className="as-kicker">Preferowany termin</dt>
                    <dd className="mt-2 text-[0.9375rem] text-ink">{form.term}</dd>
                  </div>
                )}
                <div>
                  <dt className="as-kicker">Kontakt</dt>
                  <dd className="mt-2 text-[0.9375rem] text-ink">
                    {form.name}
                    {form.phone ? ` · ${form.phone}` : ''}
                  </dd>
                </div>
              </dl>
            </div>

            <p className="as-caption mt-6 max-w-none">
              Miejsce w grupie rezerwujemy dopiero po rozmowie — zgłoszenie nie jest jeszcze
              opłacone ani potwierdzone. Najszybciej odpowiadamy na Instagramie.
            </p>

            <DialogFooter>
              <a href={CONTACT.instagram} target="_blank" rel="noreferrer noopener" className="as-btn-solid">
                {CONTACT.instagramHandle}
              </a>
              <button type="button" onClick={onClose} className="as-btn-ghost">
                Zamknij
              </button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <Field as="select" id="e-course" name="course" label="Szkolenie" value={form.course} onChange={handleChange}>
              {ALL_COURSE_TITLES.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </Field>

            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <Field
                id="e-name"
                name="name"
                type="text"
                label="Imię i nazwisko"
                value={form.name}
                onChange={handleChange}
                required
              />
              <Field
                id="e-phone"
                name="phone"
                type="tel"
                label="Telefon"
                value={form.phone}
                onChange={handleChange}
                required
              />
              <Field
                id="e-email"
                name="email"
                type="email"
                label="E-mail"
                value={form.email}
                onChange={handleChange}
                required
              />
              <Field id="e-city" name="city" type="text" label="Miasto" value={form.city} onChange={handleChange} />
            </div>

            <Field
              id="e-term"
              name="term"
              type="text"
              label="Preferowany termin części stacjonarnej"
              value={form.term}
              onChange={handleChange}
              placeholder="np. listopad, dowolny weekend"
            />

            <Field
              as="textarea"
              id="e-experience"
              name="experience"
              rows={4}
              label="Twoje doświadczenie w PMU"
              value={form.experience}
              onChange={handleChange}
              placeholder="Od kiedy pracujesz, jakie techniki wykonujesz, czego chcesz się nauczyć."
            />

            <p className="as-caption max-w-none border-l border-gold/35 pl-5">
              Wysłanie formularza nie jest płatnością ani rezerwacją miejsca. Termin, dostępność i
              sposób rozliczenia potwierdzamy w rozmowie.
            </p>

            <DialogFooter>
              <button type="submit" className="as-btn-solid">
                Wyślij zgłoszenie
              </button>
              <button type="button" onClick={onClose} className="as-btn-ghost">
                Anuluj
              </button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ================================================================== */

export default function Education() {
  const [booking, setBooking] = useState(null); // { course } | null

  const openBooking = (course) => setBooking({ course });
  const closeBooking = () => setBooking(null);

  return (
    <>
      <Hero onBook={openBooking} />
      <PathsBand />
      <ProgramBand onBook={openBooking} />
      <GraduatesBand />
      <IncludedBand />
      <QuestionsBand />
      <ClosingBand onBook={openBooking} />

      {booking && (
        <BookingDialog key={booking.course?.id || 'ogolne'} course={booking.course} onClose={closeBooking} />
      )}
    </>
  );
}
