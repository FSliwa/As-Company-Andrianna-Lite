'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLink,
  FactStrip,
  Figure,
  GoldArc,
  PageHero,
  Reveal,
  SectionLabel,
} from '@/components/as/Primitives';
import { BRAND, CONTACT, FOUNDER } from '@/lib/site';
import { ACADEMY, STUDIO } from '@/lib/media';
import { ENQUIRY_STATUS, enquiryMessage, sendEnquiry } from '@/lib/enquiry';

/**
 * Kontakt (/kontakt)
 *
 * Zasady:
 *  • zdjęcia wyłącznie z '@/lib/media' (folder /Graphics),
 *  • dane kontaktowe wyłącznie z CONTACT w '@/lib/site' — pola null
 *    (ulica, kod, telefon, e-mail) nie są renderowane,
 *  • nie ma zdjęć budynku, parkingu ani recepcji, więc sekcja „Lokalizacja”
 *    jest zbudowana typograficznie, a jedyne zdjęcie to realne ujęcie
 *    z wnętrza akademii (grupa kursantek z certyfikatami).
 */

/* Adres składamy tylko z pól, które są faktycznie uzupełnione. */
const ADDRESS_LINE = [CONTACT.street, CONTACT.postal, CONTACT.city].filter(Boolean).join(', ');

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
    >
      <div className="flex flex-wrap items-center gap-4">
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
      <FactStrip
        className="mt-10 border-t border-ink/10 pt-6"
        items={[CONTACT.city, CONTACT.venue, 'Zabiegi', 'Szkolenia']}
      />
    </PageHero>
  );
}

/* ================================================================== */
/*  02 — LOKALIZACJA I GODZINY                                         */
/* ================================================================== */

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

        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* — kolumna faktów — */}
          <div className="lg:col-span-5">
            <Reveal>
              <h2 className="as-display-lg as-text-balance">
                {CONTACT.venue}
                <br />
                <span className="italic text-gold-light">{CONTACT.city}.</span>
              </h2>
            </Reveal>

            <Reveal delay={80}>
              <p className="as-body-invert mt-8 max-w-sm">{CONTACT.venueNote}.</p>
            </Reveal>

            <Reveal delay={120}>
              <dl className="mt-10 border-t border-cream-200/15">
                <div className="flex items-baseline gap-6 border-b border-cream-200/15 py-5">
                  <dt className="as-label w-28 shrink-0 text-cream-200/50">Miasto</dt>
                  <dd className="text-base text-cream-50">{ADDRESS_LINE}</dd>
                </div>

                {CONTACT.phone && (
                  <div className="flex items-baseline gap-6 border-b border-cream-200/15 py-5">
                    <dt className="as-label w-28 shrink-0 text-cream-200/50">Telefon</dt>
                    <dd>
                      <a
                        href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}
                        className="text-base text-cream-50 transition-colors hover:text-gold-light"
                      >
                        {CONTACT.phone}
                      </a>
                    </dd>
                  </div>
                )}

                {CONTACT.email && (
                  <div className="flex items-baseline gap-6 border-b border-cream-200/15 py-5">
                    <dt className="as-label w-28 shrink-0 text-cream-200/50">E-mail</dt>
                    <dd>
                      <a
                        href={`mailto:${CONTACT.email}`}
                        className="text-base text-cream-50 transition-colors hover:text-gold-light"
                      >
                        {CONTACT.email}
                      </a>
                    </dd>
                  </div>
                )}

                <div className="flex items-baseline gap-6 border-b border-cream-200/15 py-5">
                  <dt className="as-label w-28 shrink-0 text-cream-200/50">Instagram</dt>
                  <dd>
                    <a
                      href={CONTACT.instagram}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-base text-cream-50 transition-colors hover:text-gold-light"
                    >
                      {CONTACT.instagramHandle}
                    </a>
                  </dd>
                </div>

                <div className="flex items-baseline gap-6 border-b border-cream-200/15 py-5">
                  <dt className="as-label w-28 shrink-0 text-cream-200/50">Godziny</dt>
                  <dd className="space-y-1.5">
                    {CONTACT.hours.map((h) => (
                      <p key={h.day} className="text-sm text-cream-100">
                        <span className="text-cream-200/60">{h.day}</span> — {h.value}
                      </p>
                    ))}
                  </dd>
                </div>
              </dl>
            </Reveal>

            <Reveal delay={160}>
              <p className="as-body-invert mt-8 max-w-sm text-[0.8125rem]">
                Dokładny adres i wskazówki dojazdu ustalamy indywidualnie — napisz przez formularz
                poniżej albo na Instagramie.
              </p>
              <ArrowLink href="#formularz" tone="light" className="mt-8 w-fit">
                Przejdź do formularza
              </ArrowLink>
            </Reveal>
          </div>

          {/* — realne ujęcia z wnętrza akademii — */}
          <div className="lg:col-span-7">
            <Reveal delay={90}>
              <Figure
                image={ACADEMY[1]}
                alt={`Grupa kursantek z certyfikatami BROWS na tle ścianki ${BRAND.academy}`}
                ratio="16 / 10"
                position="50% 20%"
                tone="dark"
                sizes="(min-width: 1024px) 55vw, 90vw"
              />
            </Reveal>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <Reveal delay={150}>
                <Figure
                  image={ACADEMY[0]}
                  alt={`Trzy kobiety, dwie z certyfikatami BROWS, pod logo ${BRAND.academy}`}
                  ratio="4 / 5"
                  position="50% 20%"
                  tone="dark"
                  sizes="(min-width: 1024px) 27vw, 45vw"
                />
              </Reveal>
              <Reveal delay={200}>
                <Figure
                  image={ACADEMY[6]}
                  alt={`Cztery kursantki z certyfikatami Supernatural Brows pod logo ${BRAND.academy}`}
                  ratio="4 / 5"
                  position="50% 20%"
                  tone="dark"
                  sizes="(min-width: 1024px) 27vw, 45vw"
                />
              </Reveal>
            </div>

            <Reveal delay={240}>
              <p className="as-body-invert mt-5 text-[0.8125rem]">
                Zdjęcia z dni szkoleniowych w akademii — to samo miejsce, w którym odbywają się
                zabiegi.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  03 — FORMULARZ                                                     */
/* ================================================================== */

const FIELD_CLASS =
  'w-full border border-ink/15 bg-cream-50 px-4 py-3 text-[0.9375rem] text-ink transition-colors placeholder:text-mocha-400/70 focus:border-gold focus:outline-none';

const LABEL_CLASS = 'as-label mb-2.5 block text-ink/55';

const TOPICS = [
  { value: 'zabieg', label: 'Zabieg PMU' },
  { value: 'szkolenie', label: 'Szkolenie' },
  { value: 'produkty', label: 'Produkty i pigmenty' },
  { value: 'inne', label: 'Inne pytanie' },
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

        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* — wprowadzenie — */}
          <div className="lg:col-span-5">
            <Reveal>
              <h2 className="as-display-lg as-text-balance text-ink">
                Napisz do nas.
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="as-body mt-8 max-w-sm">
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

            <Reveal delay={140}>
              <div className="mt-12 grid gap-8 border-t border-ink/10 pt-8 sm:grid-cols-2 lg:grid-cols-1">
                <div>
                  <span className="as-num">01</span>
                  <h3 className="as-display-sm mt-3 italic text-ink">Zabiegi</h3>
                  <p className="as-body mt-2 text-[0.8125rem]">
                    Brwi, usta, kreski, korekty i usuwanie — pełen zakres wraz z cennikiem.
                  </p>
                  <ArrowLink href="/uslugi" className="mt-4 w-fit">
                    Zobacz zabiegi
                  </ArrowLink>
                </div>
                <div>
                  <span className="as-num">02</span>
                  <h3 className="as-display-sm mt-3 italic text-ink">Szkolenia</h3>
                  <p className="as-body mt-2 text-[0.8125rem]">
                    Programy {BRAND.academy} wraz z harmonogramem części stacjonarnej.
                  </p>
                  <ArrowLink href="/szkolenia" className="mt-4 w-fit">
                    Zobacz szkolenia
                  </ArrowLink>
                </div>
              </div>
            </Reveal>
          </div>

          {/* — formularz — */}
          <div className="lg:col-span-7">
            <Reveal delay={90}>
              <div className="as-frame border border-ink/10 bg-cream-50/70 p-7 sm:p-10">
                {sent ? (
                  <div className="py-10 text-center">
                    <span className="as-num">&#10003;</span>
                    <h3 className="as-display-md mt-5 text-ink">Dziękujemy.</h3>
                    <p className="as-body mx-auto mt-5 max-w-sm">
                      {enquiryMessage(sent).body}
                      Jeśli sprawa jest pilna, napisz bezpośrednio na Instagramie.
                    </p>
                    <div className="mt-9 flex flex-wrap justify-center gap-4">
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
                  <form onSubmit={handleSubmit} className="space-y-7">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="c-name" className={LABEL_CLASS}>
                          Imię i nazwisko
                        </label>
                        <input
                          id="c-name"
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={FIELD_CLASS}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="c-phone" className={LABEL_CLASS}>
                          Telefon
                        </label>
                        <input
                          id="c-phone"
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={FIELD_CLASS}
                        />
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="c-email" className={LABEL_CLASS}>
                          Adres e-mail
                        </label>
                        <input
                          id="c-email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={FIELD_CLASS}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="c-topic" className={LABEL_CLASS}>
                          Temat
                        </label>
                        <select
                          id="c-topic"
                          name="topic"
                          value={formData.topic}
                          onChange={handleChange}
                          className={FIELD_CLASS}
                        >
                          {TOPICS.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="c-message" className={LABEL_CLASS}>
                        Wiadomość
                      </label>
                      <textarea
                        id="c-message"
                        name="message"
                        rows={7}
                        value={formData.message}
                        onChange={handleChange}
                        className={FIELD_CLASS}
                        placeholder="Napisz, czego dotyczy Twoje pytanie — zabiegu, szkolenia czy produktów."
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-5 border-t border-ink/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
                      <p className="max-w-xs text-xs leading-relaxed text-mocha-400">
                        Dane z formularza wykorzystujemy wyłącznie do odpowiedzi na Twoje zapytanie.
                      </p>
                      <button type="submit" className="as-btn-solid">
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
    <section className="relative overflow-hidden bg-espresso-900 text-cream-50">
      <div className="as-shell py-20 lg:py-28">
        <Reveal>
          <SectionLabel number="04" tone="light">
            Zapraszamy
          </SectionLabel>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <h2 className="as-display-lg as-text-balance">
              {BRAND.tagline.replace('.', '')} —{' '}
              <span className="italic text-gold-light">zacznijmy od rozmowy.</span>
            </h2>
            <p className="as-body-invert mt-7 max-w-lg">
              {CONTACT.venue} w {CONTACT.city}. {CONTACT.venueNote}.
            </p>
          </Reveal>

          <Reveal delay={90} className="flex flex-wrap gap-4 lg:col-span-5 lg:justify-end">
            <a
              href={CONTACT.instagram}
              target="_blank"
              rel="noreferrer noopener"
              className="as-btn-gold"
            >
              Napisz na Instagramie
            </a>
            <Link href="/szkolenia" className="as-btn-ghost-light">
              Terminy szkoleń
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
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
