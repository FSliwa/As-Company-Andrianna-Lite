'use client';

import React, { useState } from 'react';
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
import { BRAND, CONTACT, FOUNDER } from '@/lib/site';
import { ACADEMY, STUDIO } from '@/lib/media';
import { enquiryMessage, sendEnquiry } from '@/lib/enquiry';

/**
 * Kontakt (/kontakt)
 *
 * Zasady:
 *  • zdjęcia wyłącznie z '@/lib/media' (folder /Graphics),
 *  • dane kontaktowe wyłącznie z CONTACT w '@/lib/site' — pola null
 *    (ulica, kod, telefon, e-mail) nie są renderowane,
 *  • nie ma zdjęć budynku, parkingu ani recepcji, więc sekcja „Lokalizacja”
 *    jest zbudowana typograficznie, a jedyne zdjęcia to realne ujęcia
 *    z wnętrza akademii (grupy kursantek z certyfikatami).
 *
 * Rytm i skala jak na stronie głównej: .as-section, SectionLabel → h2
 * (.as-display-section) → zajawka (.as-caption) → CTA; kolaż w .as-photo-frame,
 * pozycje 01/02 z .as-numbered-title, fakty w rzędzie pod kolażem.
 * Pola formularza to <Field>, pas zamykający to <ClosingCta>.
 * Rytm tła: cream-50 → espresso → cream-100 → espresso-900.
 */

/* Adres składamy tylko z pól, które są faktycznie uzupełnione. */
const ADDRESS_LINE = [CONTACT.street, CONTACT.postal, CONTACT.city].filter(Boolean).join(', ');

/* Nazwa akademii łamana słowo po słowie — nagłówek trzywierszowy w wąskiej
   kolumnie, jak „Szkolenia / oparte na / realnej praktyce” na stronie głównej. */
const VENUE_WORDS = CONTACT.venue.split(' ');

/* ================================================================== */
/*  01 — HERO                                                          */
/* ================================================================== */

function Hero() {
  return (
    <PageHero
      number="01"
      label="Kontakt"
      title="Porozmawiajmy o"
      titleAccent="Twoich brwiach."
      lead={`Zabiegi, szkolenia, pytania o produkty — napisz, a wrócimy do Ciebie z konkretną odpowiedzią i wolnym terminem. ${CONTACT.venue}, ${CONTACT.city}.`}
      image={STUDIO[9]}
      imageAlt={`${FOUNDER.name} — ${FOUNDER.role}`}
      tone="cream"
      facts={[CONTACT.city, CONTACT.venue, 'Zabiegi', 'Szkolenia']}
    >
      <div className="flex flex-wrap gap-4">
        <a href="#formularz" className="as-btn-solid">
          Napisz wiadomość
        </a>
        <a
          href={CONTACT.instagram}
          target="_blank"
          rel="noreferrer noopener"
          className="as-btn-ghost"
        >
          {CONTACT.instagramHandle}
        </a>
      </div>
    </PageHero>
  );
}

/* ================================================================== */
/*  02 — LOKALIZACJA I GODZINY                                         */
/* ================================================================== */

/* Fakty kontaktowe w jednym rzędzie pod kolażem (jak pozycje 01/02/03
   pod kolażem „Szkolenia” na stronie głównej). Telefon i e-mail pojawią
   się same, gdy zostaną uzupełnione w CONTACT. */
function ContactFacts() {
  const facts = [
    { label: 'Miasto', value: ADDRESS_LINE },
    CONTACT.phone && {
      label: 'Telefon',
      value: CONTACT.phone,
      href: `tel:${CONTACT.phone.replace(/\s/g, '')}`,
    },
    CONTACT.email && {
      label: 'E-mail',
      value: CONTACT.email,
      href: `mailto:${CONTACT.email}`,
    },
    {
      label: 'Instagram',
      value: CONTACT.instagramHandle,
      href: CONTACT.instagram,
      external: true,
    },
  ].filter(Boolean);

  return (
    <dl className="flex flex-wrap gap-x-14 gap-y-8">
      {facts.map((f) => (
        <div key={f.label} className="min-w-[9rem]">
          <dt className="as-kicker-invert">{f.label}</dt>
          <dd className="mt-3 text-[0.9375rem] text-cream-50">
            {f.href ? (
              <a
                href={f.href}
                target={f.external ? '_blank' : undefined}
                rel={f.external ? 'noreferrer noopener' : undefined}
                className="transition-colors hover:text-gold-light"
              >
                {f.value}
              </a>
            ) : (
              f.value
            )}
          </dd>
        </div>
      ))}

      <div className="min-w-[14rem]">
        <dt className="as-kicker-invert">Godziny</dt>
        <dd className="mt-3 space-y-1.5">
          {CONTACT.hours.map((h) => (
            <p key={h.day} className="text-[0.8125rem] leading-[1.6] text-cream-100">
              <span className="text-cream-200/60">{h.day}</span> — {h.value}
            </p>
          ))}
        </dd>
      </div>
    </dl>
  );
}

function LocationBand() {
  return (
    <section className="as-section relative overflow-hidden bg-espresso text-cream-50">
      <GoldArc className="-top-28 left-[-6%] h-[700px] w-[880px]" opacity={0.28} />

      <div className="as-shell relative">
        <Reveal>
          <SectionLabel number="02" tone="light">
            Lokalizacja
          </SectionLabel>
        </Reveal>

        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-8">
          {/* — nagłówek i zajawka — */}
          <div className="lg:col-span-4">
            <Reveal>
              <h2 className="as-display-section-sm">
                {VENUE_WORDS.map((word) => (
                  <React.Fragment key={word}>
                    {word}
                    <br />
                  </React.Fragment>
                ))}
                <span className="italic text-gold-light">{CONTACT.city}.</span>
              </h2>
            </Reveal>

            <Reveal delay={80}>
              <p className="as-caption-invert mt-6">{CONTACT.venueNote}.</p>
              <p className="as-caption-invert mt-4">
                Dokładny adres i wskazówki dojazdu ustalamy indywidualnie — napisz przez formularz
                poniżej albo na Instagramie.
              </p>
            </Reveal>

            <Reveal delay={140}>
              <ArrowLink href="#formularz" tone="light" className="mt-8 w-fit">
                Przejdź do formularza
              </ArrowLink>
            </Reveal>
          </div>

          {/* — realne ujęcia z wnętrza akademii: kolaż w złotej linii — */}
          <div className="lg:col-span-8">
            <Reveal delay={90}>
              <div className="as-photo-frame grid gap-1">
                <Figure
                  image={ACADEMY[1]}
                  alt={`Grupa kursantek z certyfikatami BROWS na tle ścianki ${BRAND.academy}`}
                  ratio="5 / 2"
                  position="50% 20%"
                  tone="dark"
                  sizes="(min-width: 1024px) 60vw, 90vw"
                />
                <div className="grid grid-cols-2 gap-1">
                  <Figure
                    image={ACADEMY[0]}
                    alt={`Trzy kobiety, dwie z certyfikatami BROWS, pod logo ${BRAND.academy}`}
                    ratio="2 / 1"
                    position="50% 20%"
                    tone="dark"
                    sizes="(min-width: 1024px) 30vw, 45vw"
                  />
                  <Figure
                    image={ACADEMY[6]}
                    alt={`Cztery kursantki z certyfikatami Supernatural Brows pod logo ${BRAND.academy}`}
                    ratio="2 / 1"
                    position="50% 20%"
                    tone="dark"
                    sizes="(min-width: 1024px) 30vw, 45vw"
                  />
                </div>
              </div>
              <p className="as-caption-invert mt-3">
                Zdjęcia z dni szkoleniowych w akademii — to samo miejsce, w którym odbywają się
                zabiegi.
              </p>
            </Reveal>
          </div>
        </div>

        {/* — fakty: miasto / instagram / godziny (telefon i e-mail, gdy uzupełnione) — */}
        <Reveal delay={120} className="mt-10 border-t border-cream-200/12 pt-8">
          <ContactFacts />
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  03 — FORMULARZ                                                     */
/* ================================================================== */

const TOPICS = [
  { value: 'zabieg', label: 'Zabieg PMU' },
  { value: 'szkolenie', label: 'Szkolenie' },
  { value: 'produkty', label: 'Produkty i pigmenty' },
  { value: 'inne', label: 'Inne pytanie' },
];

const QUICK_LINKS = [
  {
    number: '01',
    title: 'Zabiegi',
    desc: 'Brwi, usta, kreski, korekty i usuwanie — pełen zakres wraz z cennikiem.',
    cta: 'Zobacz zabiegi',
    href: '/uslugi',
  },
  {
    number: '02',
    title: 'Szkolenia',
    desc: `Programy ${BRAND.academy} wraz z harmonogramem części stacjonarnej.`,
    cta: 'Zobacz szkolenia',
    href: '/szkolenia',
  },
];

function FormBand() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    topic: 'zabieg',
    message: '',
  });
  const [sent, setSent] = useState(null); // null | ENQUIRY_STATUS

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { status } = sendEnquiry({
      subject: `Zapytanie ze strony — ${formData.topic}`,
      fields: [
        ['Imię i nazwisko', formData.name],
        ['E-mail', formData.email],
        ['Telefon', formData.phone],
        ['Temat', formData.topic],
        ['Wiadomość', formData.message],
      ],
    });
    setSent(status);
  };

  return (
    <section id="formularz" className="as-section relative overflow-hidden bg-cream-100">
      <GoldArc className="-top-12 right-[-8%] h-[620px] w-[840px]" flip opacity={0.35} />

      <div className="as-shell relative">
        <Reveal>
          <SectionLabel number="03">Formularz</SectionLabel>
        </Reveal>

        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* — wprowadzenie — */}
          <div className="lg:col-span-5">
            <Reveal>
              <h2 className="as-display-section as-text-balance text-ink">Napisz do nas.</h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="as-caption mt-6">
                Zostaw wiadomość, a odezwiemy się na podany kontakt. Najszybciej odpowiadamy na
                Instagramie — tam też znajdziesz aktualne prace i wolne terminy.
              </p>
              <ArrowLink
                href={CONTACT.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-8 w-fit"
              >
                {CONTACT.instagramHandle}
              </ArrowLink>
            </Reveal>

            {/* pozycje 01 / 02 — numer i tytuł w jednej linii, drobny opis, link */}
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
              {QUICK_LINKS.map((item, i) => (
                <Reveal key={item.number} delay={140 + i * 70}>
                  <div className="flex items-baseline gap-3">
                    <span className="as-num text-lg sm:text-xl">{item.number}</span>
                    <h3 className="as-numbered-title text-ink">{item.title}</h3>
                  </div>
                  <p className="as-numbered-desc text-mocha">{item.desc}</p>
                  <ArrowLink href={item.href} className="mt-3 w-fit">
                    {item.cta}
                  </ArrowLink>
                </Reveal>
              ))}
            </div>
          </div>

          {/* — formularz — */}
          <div className="lg:col-span-7">
            <Reveal delay={90}>
              <div className="border border-ink/15 bg-cream-50 p-7 sm:p-10">
                {sent ? (
                  <div className="py-10 text-center">
                    <span className="as-num">&#10003;</span>
                    <h3 className="mt-5 font-display text-2xl text-ink sm:text-[1.75rem]">
                      Dziękujemy.
                    </h3>
                    <p className="as-caption mx-auto mt-4">
                      {enquiryMessage(sent).body} Jeśli sprawa jest pilna, napisz bezpośrednio na
                      Instagramie.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                      <a
                        href={CONTACT.instagram}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="as-btn-gold"
                      >
                        {CONTACT.instagramHandle}
                      </a>
                      <button
                        type="button"
                        onClick={() => setSent(null)}
                        className="as-btn-ghost"
                      >
                        Nowa wiadomość
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2 sm:gap-x-8">
                      <Field
                        id="c-name"
                        label="Imię i nazwisko"
                        type="text"
                        name="name"
                        autoComplete="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                      <Field
                        id="c-phone"
                        label="Telefon"
                        type="tel"
                        name="phone"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 sm:gap-x-8">
                      <Field
                        id="c-email"
                        label="Adres e-mail"
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                      <Field
                        as="select"
                        id="c-topic"
                        label="Temat"
                        name="topic"
                        value={formData.topic}
                        onChange={handleChange}
                      >
                        {TOPICS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </Field>
                    </div>

                    <Field
                      as="textarea"
                      id="c-message"
                      label="Wiadomość"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Napisz, czego dotyczy Twoje pytanie — zabiegu, szkolenia czy produktów."
                      required
                    />

                    <div className="flex flex-col gap-5 pt-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="max-w-xs text-xs leading-relaxed text-mocha-400">
                        Dane z formularza wykorzystujemy wyłącznie do odpowiedzi na Twoje zapytanie.
                      </p>
                      <button type="submit" className="as-btn-gold">
                        Wyślij zapytanie
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  04 — DOMKNIĘCIE                                                    */
/* ================================================================== */

function ClosingBand() {
  return (
    <ClosingCta
      number="04"
      label="Zapraszamy"
      title={`${BRAND.tagline.replace('.', '')} —`}
      titleAccent="zacznijmy od rozmowy."
      lead={`${CONTACT.venue}, ${CONTACT.city}. ${CONTACT.venueNote}.`}
      primary={{ href: CONTACT.instagram, label: 'Napisz na Instagramie', target: '_blank', rel: 'noreferrer noopener' }}
      secondary={{ href: '/szkolenia', label: 'Terminy szkoleń' }}
    />
  );
}

/* ================================================================== */

export default function Contact() {
  return (
    <>
      <Hero />
      <LocationBand />
      <FormBand />
      <ClosingBand />
    </>
  );
}
