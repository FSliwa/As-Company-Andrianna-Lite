'use client';

/**
 * Kontakt (/kontakt) — „Numer 01".
 *
 * 01 Kontakt (cream-50)   — hero = formularz w pierwszym ekranie, bez portretu.
 *                           Od md dwie kolumny — lewa 5/12: H1, lead, lokalizacja
 *                           (CONTACT.venueNote), kanały i tryb umawiania (CONTACT.hours);
 *                           prawa: formularz na <Field> (panel cream-100; md 7/12,
 *                           lg 6/12 z pustą kolumną odstępu).
 *                           Na telefonie formularz stoi zaraz pod leadem, a dane
 *                           lokalizacji pod formularzem.
 * 02 Wizyta (cream-100)   — trzy kroki wizyty + portret ROLES.contactSection 4:5 w ramce;
 *                           od md portret obok kroków, na telefonie pod nimi.
 * → stopka. Formularz jest CTA tej strony, więc nie ma pasa zamykającego (ClosingCta);
 *   jasna sekcja 02 oddziela też formularz od ciemnej stopki.
 *
 * Zasady:
 *  • zdjęcia wyłącznie przez ROLES (src/lib/roles.js) — scena absolwentek
 *    (GROUPS.contactVenue) wycofana: nazwiska kursantek na certyfikatach
 *    i zdjęcie szkolenia przy treści o wizycie w salonie,
 *  • dane kontaktowe wyłącznie z CONTACT (src/lib/site.js) — pola null
 *    (ulica, kod, telefon, e-mail) nie są renderowane, nie ma placeholderów,
 *  • CONTACT.venueNote (budynek, parking) występuje w serwisie tylko tutaj,
 *  • formularz nie udaje wysyłki — status i komunikat pochodzą z src/lib/enquiry.js;
 *    dopóki CONTACT.email jest puste, treść strony nie odsyła do formularza,
 *    tylko do Instagramu (kanał, który realnie działa).
 */

import { useEffect, useState } from 'react';
import {
  ArrowLink,
  Field,
  Figure,
  FormNotice,
  NumberedItem,
  RequiredLegend,
  Reveal,
  SectionLabel,
} from '@/components/as/Primitives';
import { BOOKING_URL, CONTACT, FOUNDER, LEGAL } from '@/lib/site';
import { ROLES } from '@/lib/roles';
import { ENQUIRY_STATUS, enquiryMessage, sendEnquiry } from '@/lib/enquiry';

/* Formularz naprawdę dostarcza wiadomość dopiero wtedy, gdy jest adres e-mail
   (mailto w src/lib/enquiry.js). */
const FORM_LIVE = Boolean(CONTACT.email);

/* FormNotice renderuje się sam po uzupełnieniu LEGAL i zawiera już zdanie
   o polach wymaganych — do tego czasu legendę pokazuje RequiredLegend. */
const NOTICE_READY = Boolean(LEGAL.company && LEGAL.privacyPolicy);

/* Adres składamy tylko z pól, które są faktycznie uzupełnione. */
const ADDRESS_LINE = [CONTACT.street, CONTACT.postal, CONTACT.city].filter(Boolean).join(', ');


/* Kanały: Instagram zawsze; telefon i e-mail pojawią się same, gdy
   zostaną uzupełnione w CONTACT (do tego czasu nie ma pola ani placeholdera). */
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

/* Wiersz z hairline u góry: etykieta 11 px caps | wartość 15 px.
   Gdy para nie mieści się w jednej linii (np. „Wizyty i szkolenia” przy 375 px),
   wartość schodzi pod etykietę, wyrównana do lewej — bez łamania etykiety. */
function DetailRow({ label, children }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-ink/15 py-3">
      <dt className="as-label whitespace-nowrap text-ink/65">{label}</dt>
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
          (FORM_LIVE
            ? ' Dokładny adres i wskazówki dojazdu ustalamy indywidualnie — napisz przez formularz albo na Instagramie.'
            : ' Dokładny adres i wskazówki dojazdu ustalamy indywidualnie — napisz do nas na Instagramie.')}
      </p>

      <dl className="mt-8 border-b border-ink/15">
        {CHANNELS.map((c) => (
          <DetailRow key={c.label} label={c.label}>
            {/* ::before powiększa pole dotyku do ≥ 44 px (jak .as-arrow),
                wiersz i podkreślenie zostają bez zmian */}
            <a
              href={c.href}
              target={c.external ? '_blank' : undefined}
              rel={c.external ? 'noreferrer noopener' : undefined}
              className="relative border-b border-ink/25 transition-colors before:absolute before:-inset-x-2 before:-inset-y-3 before:content-[''] hover:border-gold hover:text-gold-deep"
            >
              {c.value}
              {c.external && <span className="sr-only"> (otwiera się w nowej karcie)</span>}
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

  /* ?temat=produkty (np. z /maszynki „Zapytaj o zakup”) — wstępny wybór tematu.
     window.location zamiast useSearchParams: strona zostaje statyczna. */
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('temat');
    if (t && TOPICS.some((x) => x.value === t)) setFormData((f) => ({ ...f, topic: t }));
  }, []);

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
    /* od md: panel wypełnia wysokość obu rzędów siatki; przy wyższej kolumnie
       po lewej rośnie pole wiadomości, nie odstępy. Na tablecie (md–lg) panel
       ma 7/12 szerokości, więc padding i siatka pól są ciaśniejsze. */
    <div className="border border-ink/15 bg-cream-100 p-7 sm:p-10 md:flex md:h-full md:flex-col md:p-8 lg:p-10">
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
          className="space-y-6 md:flex md:flex-1 md:flex-col"
          aria-label="Formularz kontaktowy"
        >
          {/* Pary pól: sm 2 kolumny; md–lg (panel ~400 px na tablecie) jedna, żeby
              e-mail i „Telefon (opcjonalnie)” miały pełną szerokość; lg znowu 2.
              items-end: gdy „Telefon (opcjonalnie)” łamie się w wąskiej kolumnie
              (lg ~1024 px), linie pól i tak stoją na jednej wysokości */}
          <div className="grid gap-6 sm:grid-cols-2 sm:items-end sm:gap-x-8 md:grid-cols-1 lg:grid-cols-2">
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
              label="Telefon (opcjonalnie)"
              type="tel"
              name="phone"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 sm:gap-x-8 md:grid-cols-1 lg:grid-cols-2">
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
            wrapperClassName="md:flex md:flex-1 md:flex-col"
            className="md:flex-1"
            value={formData.message}
            onChange={handleChange}
            placeholder="Napisz, czego dotyczy Twoje pytanie — zabiegu, szkolenia czy produktów."
            required
          />

          <div className="pt-2">
            <button type="submit" className="as-btn-solid">
              Wyślij zapytanie
            </button>
            <FormNotice className="mt-5 max-w-[32rem]" />
            {!NOTICE_READY && <RequiredLegend className="mt-5" />}
          </div>
        </form>
      )}
    </div>
  );
}

function Hero() {
  /* Trzy komórki siatki: wstęp (lewa, rząd 1), formularz (prawa, rzędy 1–2),
     lokalizacja (lewa, rząd 2). Od md drugi rząd = 1fr, więc lokalizacja stoi
     tuż pod leadem niezależnie od wysokości formularza; na telefonie kolejność
     DOM daje: wstęp → formularz → lokalizacja. */
  return (
    <section className="bg-cream-50">
      <div className="as-shell pb-14 pt-24 lg:pb-20 lg:pt-28">
        <div className="grid gap-12 md:grid-cols-12 md:grid-rows-[auto_1fr] md:gap-x-8 md:gap-y-0">
          <Reveal className="md:col-span-5 md:col-start-1 md:row-start-1">
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
            className="scroll-mt-24 md:col-span-7 md:col-start-6 md:row-span-2 md:row-start-1 lg:col-span-6 lg:col-start-7 lg:scroll-mt-32"
          >
            <Reveal delay={80} className="md:h-full">
              <EnquiryForm />
            </Reveal>
          </div>

          <Reveal delay={120} className="md:col-span-5 md:col-start-1 md:row-start-2 md:mt-12">
            <LocationDetails />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  02 — WIZYTA (cream-100): trzy kroki wizyty + portret 4:5           */
/* ================================================================== */

/* Treść kroków złożona z istniejących zdań serwisu (kontakt + zabiegi).
   Krok 01 wskazuje formularz dopiero wtedy, gdy formularz faktycznie wysyła. */
const BOOKING_STEPS = [
  {
    number: '01',
    title: 'Wiadomość',
    desc: FORM_LIVE
      ? 'Napisz przez formularz na tej stronie albo na Instagramie.'
      : `Napisz na Instagramie — ${CONTACT.instagramHandle}.`,
  },
  { number: '02', title: 'Termin', desc: 'Wrócimy z konkretną odpowiedzią i wolnym terminem.' },
  { number: '03', title: 'Konsultacja', desc: 'Architektura twarzy i rysunek wstępny przed zabiegiem.' },
];

function VisitBand() {
  const portrait = ROLES.contactSection;
  return (
    <section className="as-section border-t border-ink/10 bg-cream-100">
      <div className="as-shell">
        <div className="grid gap-12 md:grid-cols-12 md:items-center md:gap-8">
          {/* — etykieta, nagłówek i kroki (w DOM przed kadrem: na telefonie czytamy je pierwsze;
                od md stoją po prawej, obok portretu) — */}
          <div className="md:col-span-6 md:col-start-7 md:row-start-1 lg:col-span-5 lg:col-start-8">
            <Reveal>
              <SectionLabel number="02">Wizyta</SectionLabel>
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
              <ArrowLink href={BOOKING_URL} className="mt-10 w-fit">
                Umów wizytę online
              </ArrowLink>
            </Reveal>
          </div>

          {/* — jeden kadr: portret z sesji marki, w złotej ramce — */}
          <Reveal
            delay={90}
            className="mx-auto w-full max-w-[26rem] md:col-span-5 md:col-start-1 md:row-start-1 md:max-w-none lg:col-start-2"
          >
            <Figure
              image={portrait?.image}
              alt={`${FOUNDER.name} — portret z sesji wizerunkowej marki`}
              ratio="4 / 5"
              position={portrait?.position}
              framed
              zoom={false}
              sizes="(min-width: 1024px) 34vw, (min-width: 768px) 40vw, 92vw"
            />
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
      <VisitBand />
    </>
  );
}
