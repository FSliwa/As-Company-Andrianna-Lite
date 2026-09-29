'use client';

/**
 * „Twoje zamówienie” — lista pozycji (ilość 1–50, usuń), suma orientacyjna
 * i wysłanie listy jako ZAPYTANIA (nie zakupu — na tym etapie nic się nie
 * kupuje ani nie płaci).
 *
 * Dwa tryby, zawsze zgodne z tym, co naprawdę działa:
 *  - FORM_LIVE (jest CONTACT.email i klauzula RODO z LEGAL): formularz
 *    (imię + telefon LUB e-mail) → sendEnquiry() (src/lib/enquiry.js, mailto).
 *    Listy nie czyścimy sami — program pocztowy mógł się nie otworzyć;
 *    po wysyłce jest „Skopiuj listę” i „Wyczyść listę”.
 *  - bez tego: żadnych pól danych osobowych — uczciwa informacja, „Skopiuj
 *    listę” i Instagram (jak na /kontakt, gdy formularz nie wysyła).
 *
 * Dane kontaktowe żyją wyłącznie w stanie komponentu — nie w localStorage
 * i nie w tekście do schowka.
 *
 * Dostępność: „−”/„+” na granicy zakresu zostają fokusowalne (aria-disabled),
 * po „Usuń” fokus przechodzi na „Usuń” następnej pozycji (albo poprzedniej,
 * albo „Przejdź do katalogu”), a czytnik słyszy „Usunięto: …”.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLink, Field, FormNotice } from '@/components/as/Primitives';
import { ENQUIRY_STATUS, enquiryMessage, sendEnquiry } from '@/lib/enquiry';
import { collectionLabel, formatCapacity, formatPrice, formatSyncedDate } from '@/lib/pigments';
import { CONTACT, LEGAL } from '@/lib/site';
import { LEGAL_COMPLETE } from '@/lib/legal';
import { NBSP, PRICE_TBC, Swatch, usePricesStale } from './parts';
import { QTY_MAX, QTY_MIN } from './useOrder';

/* Formularz zbiera dane osobowe tylko wtedy, gdy naprawdę je dostarczy
   (adres e-mail do mailto) i gdy nad przyciskiem stoi klauzula RODO. */
const NOTICE_READY = LEGAL_COMPLETE;
export const FORM_LIVE = Boolean(CONTACT.email) && NOTICE_READY;

const SYNCED = formatSyncedDate();

const FIELDS = [
  { id: 'name', label: 'Imię', autoComplete: 'given-name', required: true },
  { id: 'phone', label: 'Telefon', type: 'tel', autoComplete: 'tel' },
  {
    id: 'email',
    label: 'E-mail',
    type: 'email',
    autoComplete: 'email',
    hint: 'Podaj telefon lub e-mail — wystarczy jedno.',
  },
  { id: 'salon', label: 'Nazwa salonu (opcjonalnie)', autoComplete: 'organization' },
];
const EMPTY_FORM = { name: '', phone: '', email: '', salon: '', notes: '' };
const CONTACT_MISSING = 'Podaj telefon lub e-mail — wystarczy jedno.';

/** „1. Japanese Garden (AS OPIUM), 6 ml × 2 — 298 zł” (bez kwot, gdy ceny są do potwierdzenia). */
function linesText(summary, stale) {
  return summary.lines.map((l, i) => `${i + 1}. ${stale ? l.item : l.text}`).join('\n');
}

function totalText(summary, stale) {
  return stale
    ? `do potwierdzenia (ceny z ${SYNCED} mogą być nieaktualne)`
    : `${formatPrice(summary.total)} (ceny z ${SYNCED}, bez kosztów dostawy)`;
}

/** Tekst do schowka — tylko lista, suma i uwagi, bez danych osobowych. */
function clipboardText(summary, stale, notes = '') {
  return [
    'Zapytanie o pigmenty — lista odcieni:',
    linesText(summary, stale),
    `Suma orientacyjna: ${totalText(summary, stale)}`,
    notes.trim() ? `Uwagi: ${notes.trim()}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

function Stepper({ qty, name, onChange }) {
  const atMin = qty <= QTY_MIN;
  const atMax = qty >= QTY_MAX;
  /* aria-disabled zamiast disabled: przycisk z fokusem nie może zniknąć
     z kolejności Tab (fokus spadłby na <body>, poza okno dialogu) */
  const btn =
    'grid h-11 w-11 place-items-center text-ink transition-colors hover:bg-ink/5 focus-visible:outline-ink aria-disabled:cursor-not-allowed aria-disabled:text-ink/30 aria-disabled:hover:bg-transparent';
  return (
    <div role="group" aria-label={`Ilość — ${name}`} className="inline-flex items-center border border-ink/25">
      <button
        type="button"
        className={btn}
        aria-disabled={atMin || undefined}
        onClick={() => !atMin && onChange(qty - 1)}
        aria-label="Zmniejsz ilość"
      >
        <Minus aria-hidden="true" className="h-4 w-4" />
      </button>
      <span aria-live="polite" className="min-w-[2.25rem] text-center text-[0.9375rem] tabular-nums text-ink">
        {qty}
      </span>
      <button
        type="button"
        className={btn}
        aria-disabled={atMax || undefined}
        onClick={() => !atMax && onChange(qty + 1)}
        aria-label="Zwiększ ilość"
      >
        <Plus aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}

const lineName = (line) =>
  [line.product.name, line.variant.label ? formatCapacity(line.variant.label) : null].filter(Boolean).join(', ');

function Line({ line, stale, onQty, onRemove }) {
  const { product, variant, qty, total } = line;
  const label = variant.label ?? null;
  const what = lineName(line);
  return (
    <li className="grid grid-cols-[0.5rem_minmax(0,1fr)] gap-x-4 border-b border-ink/10 py-5">
      <Swatch color={product.color} className="h-full min-h-[3rem] w-2" />
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-4">
          <p className="min-w-0 text-base leading-snug text-ink">{product.name}</p>
          {!stale && (
            <p className="whitespace-nowrap font-display text-[1.375rem] leading-none text-ink">{formatPrice(total)}</p>
          )}
        </div>
        <p className="mt-1 text-[0.8125rem] leading-relaxed text-mocha">
          {collectionLabel(product.collection)}
          {label ? ` · ${formatCapacity(label)}` : ''}
          {stale ? ` · ${PRICE_TBC}` : ` · ${formatPrice(variant.price)}${NBSP}/${NBSP}szt.`}
          {!variant.inStock && ' · brak w magazynie'}
        </p>
        <div className="mt-3 flex items-center justify-between gap-4">
          <Stepper qty={qty} name={what} onChange={(q) => onQty(product.id, label, q)} />
          <button
            type="button"
            data-remove=""
            onClick={() => onRemove(line)}
            className="as-label h-11 px-1 text-ink/70 underline decoration-ink/30 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
          >
            Usuń<span className="sr-only">: {what}</span>
          </button>
        </div>
      </div>
    </li>
  );
}

/* Skopiuj listę: stan „Skopiowano” + awaryjnie tekst do zaznaczenia. */
function CopyFeedback({ copy, text }) {
  return (
    <div role="status" aria-live="polite">
      {copy === 'ok' && <p className="sr-only">Lista skopiowana do schowka.</p>}
      {copy === 'error' && (
        <>
          <p className="mt-5 text-[0.8125rem] text-mocha">
            Przeglądarka nie pozwoliła skopiować — zaznacz tekst poniżej.
          </p>
          <pre className="mt-3 whitespace-pre-wrap border border-ink/15 bg-cream-100 p-4 font-sans text-[0.8125rem] leading-relaxed text-ink">
            {text}
          </pre>
        </>
      )}
    </div>
  );
}

const TEXT_BTN =
  'as-label h-11 px-1 text-ink/70 underline decoration-ink/30 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink';

export default function OrderDialog({ open, onOpenChange, order, onBrowse, onCloseAutoFocus }) {
  const { summary, setQty, remove, clear } = order;
  const stale = usePricesStale();
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState(null); // { status }
  const [copy, setCopy] = useState(null); // 'ok' | 'error'
  const [announce, setAnnounce] = useState('');
  const contentRef = useRef(null);
  /* indeks usuniętej pozycji — po przerenderowaniu listy fokus idzie obok */
  const pendingFocus = useRef(null);
  const empty = summary.lines.length === 0;
  const count = summary.lines.length;

  useEffect(() => {
    if (pendingFocus.current === null) return;
    const i = pendingFocus.current;
    pendingFocus.current = null;
    const root = contentRef.current;
    const buttons = root?.querySelectorAll('[data-remove]');
    if (buttons?.length) buttons[Math.min(i, buttons.length - 1)].focus();
    else root?.querySelector('[data-empty-action]')?.focus();
  }, [count]);

  /* lista zmieniona po skopiowaniu → „Skopiowano” już nie dotyczy tej listy */
  useEffect(() => setCopy(null), [summary]);

  const say = (text) => setAnnounce((prev) => (prev === text ? `${text}${NBSP}` : text));

  const set = (key) => (e) => {
    if (key === 'phone' || key === 'email') e.target.form?.elements.phone?.setCustomValidity('');
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleOpenChange = (next) => {
    if (!next) {
      /* zamknięcie po wysyłce — następne otwarcie zaczyna od listy */
      if (result) setResult(null);
      setCopy(null);
    }
    onOpenChange(next);
  };

  const handleRemove = (line) => {
    pendingFocus.current = summary.lines.indexOf(line);
    say(`Usunięto: ${lineName(line)}.`);
    remove(line.product.id, line.variant.label ?? null);
  };

  const handleClear = () => {
    pendingFocus.current = 0;
    setResult(null);
    setCopy(null);
    setForm(EMPTY_FORM);
    say('Lista wyczyszczona.');
    clear();
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(clipboardText(summary, stale, form.notes));
      setCopy('ok');
    } catch {
      setCopy('error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (empty) return;
    const phone = e.currentTarget.elements.phone;
    if (!form.phone.trim() && !form.email.trim()) {
      phone.setCustomValidity(CONTACT_MISSING);
      phone.reportValidity();
      return;
    }
    const { status } = sendEnquiry({
      subject: 'Zapytanie o pigmenty',
      fields: [
        ['Imię', form.name],
        ['Telefon', form.phone],
        ['E-mail', form.email],
        ['Salon', form.salon],
        ['Lista odcieni', `\n${linesText(summary, stale)}`],
        ['Suma orientacyjna', totalText(summary, stale)],
        ['Uwagi', form.notes],
      ],
    });
    /* listy NIE czyścimy — program pocztowy mógł się nie otworzyć */
    setResult({ status });
    setCopy(null);
    const msg = enquiryMessage(status);
    say(`${msg.title}. ${msg.body}`);
    requestAnimationFrame(() => contentRef.current?.scrollTo({ top: 0 }));
  };

  const message = result ? enquiryMessage(result.status) : null;
  const sentToMail = result?.status === ENQUIRY_STATUS.MAIL_OPENED;

  const instagramButton = (
    <a href={CONTACT.instagram} target="_blank" rel="noreferrer noopener" className="as-btn-ghost">
      {CONTACT.instagramHandle}
      <span className="sr-only"> (Instagram, otwiera się w nowej karcie)</span>
    </a>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        ref={contentRef}
        data-sticky-hide
        onOpenAutoFocus={(e) => {
          /* fokus na panelu (czytnik zaczyna od tytułu), nie na pierwszym „−” */
          e.preventDefault();
          contentRef.current?.focus();
        }}
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <DialogHeader>
          <DialogTitle>Twoje zamówienie</DialogTitle>
          <DialogDescription>
            To zapytanie — na tym etapie nic nie kupujesz ani nie płacisz. Odpowiemy z dostępnością,
            łączną kwotą oraz sposobem dostawy i{NBSP}płatności.
          </DialogDescription>
        </DialogHeader>

        <p className="sr-only" role="status" aria-live="polite">
          {announce}
        </p>

        {message ? (
          /* po wysyłce (tylko FORM_LIVE); komunikat ogłasza region `announce` */
          <div className="mt-8">
            <p className="as-title text-ink">{message.title}</p>
            <p className="as-body mt-4">{message.body}</p>
            <p className="as-body mt-3">
              {sentToMail
                ? `Jeśli program pocztowy się nie otworzył — skopiuj listę i wyślij ją na Instagramie (${CONTACT.instagramHandle}).`
                : 'Twoja lista czeka tutaj — skopiuj ją i wklej w wiadomości.'}
            </p>
            <DialogFooter>
              <button type="button" onClick={copyText} className="as-btn-solid">
                {copy === 'ok' ? 'Skopiowano' : 'Skopiuj listę'}
              </button>
              {sentToMail ? (
                <button type="button" onClick={handleClear} className="as-btn-ghost">
                  Wyczyść listę
                </button>
              ) : (
                instagramButton
              )}
            </DialogFooter>
            <CopyFeedback copy={copy} text={clipboardText(summary, stale, form.notes)} />
            <ArrowLink
              onClick={() => (sentToMail ? handleOpenChange(false) : setResult(null))}
              className="mt-8 w-fit"
            >
              {sentToMail ? 'Wróć do katalogu' : 'Wróć do zamówienia'}
            </ArrowLink>
          </div>
        ) : empty ? (
          <div className="mt-8 border-t border-ink/10 pt-6">
            <p className="as-body">
              Lista jest pusta. Dodaj odcienie z katalogu — przycisk „Dodaj” jest przy każdym pigmencie.
            </p>
            <ArrowLink onClick={onBrowse} data-empty-action="" className="mt-8 w-fit">
              Przejdź do katalogu
            </ArrowLink>
          </div>
        ) : (
          <>
            <ul className="mt-8 border-t border-ink/10" aria-label="Pozycje zamówienia">
              {summary.lines.map((line) => (
                <Line
                  key={`${line.product.id}-${line.variant.label ?? ''}`}
                  line={line}
                  stale={stale}
                  onQty={setQty}
                  onRemove={handleRemove}
                />
              ))}
            </ul>

            <div className="flex items-baseline justify-between gap-4 pt-5">
              <p className="as-label text-ink/70">
                {stale ? 'Razem' : 'Suma orientacyjna'} · {summary.count}
                {NBSP}szt.
              </p>
              {!stale && (
                <p className="whitespace-nowrap font-display text-[1.75rem] leading-none text-ink">
                  {formatPrice(summary.total)}
                </p>
              )}
            </div>
            <p className="as-caption mt-3 max-w-none">
              {stale
                ? `Ceny z ${SYNCED} mogą być nieaktualne — kwotę potwierdzimy w odpowiedzi.`
                : `Ceny z ${SYNCED}. Suma nie obejmuje kosztów dostawy — łączną kwotę potwierdzimy w${NBSP}odpowiedzi.`}
            </p>

            {FORM_LIVE ? (
              <form
                onSubmit={handleSubmit}
                className="mt-10 border-t border-ink/10 pt-8"
                aria-label="Dane do zapytania"
              >
                <div className="space-y-6">
                  {FIELDS.map((f) => (
                    <Field
                      key={f.id}
                      id={`ord-${f.id}`}
                      name={f.id}
                      label={f.label}
                      type={f.type || 'text'}
                      autoComplete={f.autoComplete}
                      required={f.required}
                      hint={f.hint}
                      value={form[f.id]}
                      onChange={set(f.id)}
                    />
                  ))}
                  <Field
                    as="textarea"
                    id="ord-notes"
                    name="notes"
                    label="Uwagi (opcjonalnie)"
                    rows={3}
                    value={form.notes}
                    onChange={set('notes')}
                    placeholder="np. sposób dostawy, pytanie o odcień"
                  />
                </div>
                {/* klauzula przed przyciskiem wysyłki */}
                <FormNotice className="mt-8" />
                <DialogFooter>
                  <button type="submit" className="as-btn-solid">
                    Wyślij zapytanie
                  </button>
                  <button type="button" onClick={() => handleOpenChange(false)} className="as-btn-ghost">
                    Wróć do katalogu
                  </button>
                </DialogFooter>
              </form>
            ) : (
              /* bez działającej wysyłki: bez pól danych osobowych */
              <div className="mt-10 border-t border-ink/10 pt-8">
                <h3 className="as-title text-ink">Wyślij listę na Instagramie</h3>
                <p className="as-body mt-4">
                  Wysyłka zapytania z tej strony nie jest jeszcze uruchomiona. Skopiuj listę i wklej ją
                  w{NBSP}wiadomości do {CONTACT.instagramHandle} — odpowiemy z dostępnością i łączną kwotą.
                </p>
                <DialogFooter>
                  <button type="button" onClick={copyText} className="as-btn-solid">
                    {copy === 'ok' ? 'Skopiowano' : 'Skopiuj listę'}
                  </button>
                  {instagramButton}
                </DialogFooter>
                <CopyFeedback copy={copy} text={clipboardText(summary, stale)} />
                <div className="mt-8 flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
                  <ArrowLink onClick={() => handleOpenChange(false)} className="w-fit">
                    Wróć do katalogu
                  </ArrowLink>
                  {/* po skopiowaniu (lista poszła dalej) — można zacząć od nowa */}
                  {copy === 'ok' && (
                    <button type="button" onClick={handleClear} className={TEXT_BTN}>
                      Wyczyść listę
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
