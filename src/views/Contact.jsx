'use client';

/**
 * Kontakt (/kontakt) — „Numer 01".
 *
 * 01 Kontakt (cream-50)   — hero = formularz w pierwszym ekranie, bez portretu:
 *                           lewa 5/12: H1, lead, lokalizacja (CONTACT.venueNote), godziny;
 *                           prawa 6/12: formularz na <Field> (panel cream-100).
 *                           Na telefonie formularz stoi zaraz pod leadem, a dane
 *                           lokalizacji pod formularzem.
 * 02 Miejsce (cream-100)  — GROUPS.contactVenue 3:2 w ramce + trzy kroki wizyty.
 * → stopka. Formularz jest CTA tej strony, więc nie ma pasa zamykającego (ClosingCta);
 *   jasna sekcja 02 oddziela też formularz od ciemnej stopki.
 *
 * Zasady:
 *  • zdjęcia wyłącznie przez GROUPS (src/lib/roles.js) — ROLES.heroContact wycofane,
 *  • dane kontaktowe wyłącznie z CONTACT (src/lib/site.js) — pola null
 *    (ulica, kod, telefon, e-mail) nie są renderowane, nie ma placeholderów,
 *  • CONTACT.venueNote (budynek, parking) występuje w serwisie tylko tutaj,
 *  • formularz nie udaje wysyłki — status i komunikat pochodzą z src/lib/enquiry.js.
 */

import { useState } from 'react';
import {
  ArrowLink,
  Field,
  Figure,
  NumberedItem,
  Reveal,
  SectionLabel,
} from '@/components/as/Primitives';
import { BRAND, CONTACT } from '@/lib/site';
import { GROUPS } from '@/lib/roles';
import { ENQUIRY_STATUS, enquiryMessage, sendEnquiry } from '@/lib/enquiry';

/* Adres składamy tylko z pól, które są faktycznie uzupełnione. */
const ADDRESS_LINE = [CONTACT.street, CONTACT.postal, CONTACT.city].filter(Boolean).join(', ');

/* Kanały: Instagram zawsze; telefon i e-mail pojawią się same, gdy zostaną
   uzupełnione w CONTACT (do tego czasu nie ma pola ani placeholdera). */
const CHANNELS = [
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

const TOPICS = [
  { value: 'zabieg', label: 'Zabieg PMU' },
  { value: 'szkolenie', label: 'Szkolenie' },
  { value: 'produkty', label: 'Produkty i pigmenty' },
  { value: 'inne', label: 'Inne pytanie' },
];

/* ================================================================== */
/*  01 — KONTAKT: H1 + lokalizacja | formularz                          */
/* ================================================================== */

/* Wiersz z hairline u góry: etykieta 11 px caps | wartość 15 px. */
function DetailRow({ label, children }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-t border-ink/15 py-3">
      <dt className="as-label text-ink/65">{label}</dt>
      <dd className="text-right text-[0.9375rem] text-ink">{children}</dd>
    </div>
  );
}

function LocationDetails() {
  return (
    <div className="max-w-[28rem]">
      <p className="as-title text-ink">{CONTACT.venue}</p>
      <p className="mt-1 text-[0.9375rem] text-ink/80">{ADDRESS_LINE}</p>
      <p className="mt-3 text-[0.9375rem] leading-[1.65] text-ink/70">
        {CONTACT.venueNote}.
        {!CONTACT.street &&
          ' Dokładny adres i wskazówki dojazdu ustalamy indywidualnie — napisz przez formularz albo na Instagramie.'}
      </p>

      <dl className="mt-8 border-b border-ink/15">
        {CHANNELS.map((c) => (
          <DetailRow key={c.label} label={c.label}>
            <a
              href={c.href}
              target={c.external ? '_blank' : undefined}
              rel={c.external ? 'noreferrer noopener' : undefined}
              className="border-b border-ink/25 transition-colors hover:border-gold hover:text-gold-dark"
            >
              {c.value}
            </a>
          </DetailRow>
        ))}
        {CONTACT.hours.map((h) => (
          <DetailRow key={h.day} label={h.day}>
            {h.value}
          </DetailRow>
        ))}
      </dl>
    </div>
  );
}

function EnquiryForm() {
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

  const message = sent ? enquiryMessage(sent) : null;

  return (
    /* lg: panel wypełnia wysokość obu rzędów siatki (dół panelu = dolna linia
       godzin po lewej); rośnie pole wiadomości, nie odstępy. */
    <div className="border border-ink/15 bg-cream-100 p-7 sm:p-10 lg:flex lg:h-full lg:flex-col">
      {message ? (
        <div role="status" aria-live="polite">
          <h2 className="as-title text-ink">{message.title}</h2>
          <p className="as-body mt-4">
            {message.body}
            {sent === ENQUIRY_STATUS.MAIL_OPENED &&
              ' Jeśli sprawa jest pilna, napisz bezpośrednio na Instagramie.'}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
            <a
              href={CONTACT.instagram}
              target="_blank"
              rel="noreferrer noopener"
              className="as-btn-solid"
            >
              {CONTACT.instagramHandle}
            </a>
            <ArrowLink onClick={() => setSent(null)} className="w-fit">
              Wróć do formularza
            </ArrowLink>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 lg:flex lg:flex-1 lg:flex-col"
          aria-label="Formularz kontaktowy"
        >
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
            rows={4}
            wrapperClassName="lg:flex lg:flex-1 lg:flex-col"
            className="lg:flex-1"
            value={formData.message}
            onChange={handleChange}
            placeholder="Napisz, czego dotyczy Twoje pytanie — zabiegu, szkolenia czy produktów."
            required
          />

          <div className="flex flex-col gap-5 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="as-caption max-w-[17rem]">
              Dane z formularza wykorzystujemy wyłącznie do odpowiedzi na Twoje zapytanie.
            </p>
            <button type="submit" className="as-btn-solid">
              Wyślij zapytanie
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Hero() {
  /* Trzy komórki siatki: wstęp (lewa, rząd 1), formularz (prawa, rzędy 1–2),
     lokalizacja (lewa, rząd 2). Na lg drugi rząd = 1fr, więc lokalizacja stoi
     tuż pod leadem niezależnie od wysokości formularza; na telefonie kolejność
     DOM daje: wstęp → formularz → lokalizacja. */
  return (
    <section className="bg-cream-50">
      <div className="as-shell pb-14 pt-24 lg:pb-20 lg:pt-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-8 lg:gap-y-0">
          <Reveal className="lg:col-span-5 lg:col-start-1 lg:row-start-1">
            <SectionLabel number="01">Kontakt</SectionLabel>
            <h1 className="as-display-lg as-text-balance mt-6 text-ink">
              Zacznijmy od <span className="italic text-gold-dark">rozmowy.</span>
            </h1>
            <p className="as-body mt-6">
              Zabiegi, szkolenia, pytania o produkty — napisz, a wrócimy do Ciebie z konkretną
              odpowiedzią i wolnym terminem.
            </p>
          </Reveal>

          <div
            id="formularz"
            className="scroll-mt-24 lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:scroll-mt-32"
          >
            <Reveal delay={80} className="lg:h-full">
              <EnquiryForm />
            </Reveal>
          </div>

          <Reveal delay={120} className="lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:mt-12">
            <LocationDetails />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  02 — MIEJSCE (cream-100): kadr akademii + trzy kroki wizyty        */
/* ================================================================== */

/* Treść kroków złożona z istniejących zdań serwisu (kontakt + zabiegi). */
const BOOKING_STEPS = [
  { number: '01', title: 'Wiadomość', desc: 'Formularz albo Instagram — tam odpowiadamy najszybciej.' },
  { number: '02', title: 'Termin', desc: 'Wrócimy z konkretną odpowiedzią i wolnym terminem.' },
  { number: '03', title: 'Konsultacja', desc: 'Architektura twarzy i rysunek wstępny przed zabiegiem.' },
];

/* Kadr 3:2 z pionowego pliku (1206×1506): 18% trzyma w kadrze szyld akademii
   i certyfikaty (30% z GROUPS.contactVenue ucina szyld). */
const VENUE_POSITION = '50% 18%';

function VenueBand() {
  const venue = GROUPS.contactVenue;
  return (
    <section className="as-section border-t border-ink/10 bg-cream-100">
      <div className="as-shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-8">
          {/* — etykieta, nagłówek i kroki (w DOM przed kadrem: na telefonie czytamy je pierwsze) — */}
          <div className="lg:col-span-4 lg:col-start-9 lg:row-start-1">
            <Reveal>
              <SectionLabel number="02">Miejsce</SectionLabel>
              <h2 className="as-display-section as-text-balance mt-6 text-ink">Jak umówić wizytę.</h2>
            </Reveal>

            <ol className="mt-10 space-y-7">
              {BOOKING_STEPS.map((step, i) => (
                <Reveal as="li" key={step.number} delay={i * 70}>
                  <NumberedItem number={step.number} title={step.title}>
                    {step.desc}
                  </NumberedItem>
                </Reveal>
              ))}
            </ol>

            <Reveal delay={200}>
              <ArrowLink href="#formularz" className="mt-10 w-fit">
                Umów wizytę
              </ArrowLink>
            </Reveal>
          </div>

          {/* — jeden kadr: szyld akademii i absolwentki, w złotej ramce — */}
          <Reveal delay={90} className="lg:col-span-7 lg:col-start-1 lg:row-start-1">
            <div className="as-photo-frame">
              <Figure
                image={venue.image}
                alt={`Cztery kursantki z certyfikatami Super Natural Brows pod szyldem ${BRAND.academy} — ${CONTACT.city}`}
                ratio="3 / 2"
                position={VENUE_POSITION}
                tone="light"
                zoom={false}
                sizes="(min-width: 1024px) 54vw, 92vw"
              />
            </div>
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
      <VenueBand />
    </>
  );
}
