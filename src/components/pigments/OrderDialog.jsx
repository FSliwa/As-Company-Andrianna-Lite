'use client';

/**
 * „Twoje zamówienie” — lista pozycji (ilość 1–50, usuń), suma orientacyjna
 * i formularz zapytania. Bez płatności online: lista idzie przez
 * sendEnquiry() (src/lib/enquiry.js), a komunikat po wysyłce mówi dokładnie
 * to, co się stało (dziś brak adresu e-mail → dane NIGDZIE nie poszły;
 * lista zostaje, można ją skopiować i wysłać na Instagramie).
 * Listę czyścimy tylko po faktycznym przekazaniu (otwarty program pocztowy).
 *
 * Dane kontaktowe żyją wyłącznie w stanie komponentu — nie w localStorage.
 */

import React, { useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLink, Field, FormNotice, RequiredLegend } from '@/components/as/Primitives';
import { ENQUIRY_STATUS, enquiryMessage, sendEnquiry } from '@/lib/enquiry';
import { collectionLabel, formatCapacity, formatPrice, formatSyncedDate } from '@/lib/pigments';
import { CONTACT, LEGAL } from '@/lib/site';
import { NBSP, Swatch } from './parts';
import { QTY_MAX, QTY_MIN } from './useOrder';

/* FormNotice renderuje się sam po uzupełnieniu LEGAL i zawiera już zdanie
   o polach wymaganych — do tego czasu legendę pokazuje RequiredLegend. */
const NOTICE_READY = Boolean(LEGAL.company && LEGAL.privacyPolicy);

const FIELDS = [
  { id: 'name', label: 'Imię i nazwisko', autoComplete: 'name', required: true },
  { id: 'phone', label: 'Telefon', type: 'tel', autoComplete: 'tel', required: true },
  { id: 'email', label: 'E-mail', type: 'email', autoComplete: 'email', required: true },
  { id: 'salon', label: 'Nazwa salonu (opcjonalnie)', autoComplete: 'organization' },
];
const EMPTY_FORM = { name: '', phone: '', email: '', salon: '', notes: '' };

/** Treść listy do wiadomości: „1. Japanese Garden (AS OPIUM), 6 ml × 2 — 298 zł”. */
function orderText(summary) {
  return summary.lines.map((l, i) => `${i + 1}. ${l.text}`).join('\n');
}

function Stepper({ qty, name, onChange }) {
  const btn =
    'grid h-11 w-11 place-items-center text-ink transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:text-ink/30 disabled:hover:bg-transparent focus-visible:outline-ink';
  return (
    <div role="group" aria-label={`Ilość — ${name}`} className="inline-flex items-center border border-ink/25">
      <button
        type="button"
        className={btn}
        disabled={qty <= QTY_MIN}
        onClick={() => onChange(qty - 1)}
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
        disabled={qty >= QTY_MAX}
        onClick={() => onChange(qty + 1)}
        aria-label="Zwiększ ilość"
      >
        <Plus aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}

function Line({ line, onQty, onRemove }) {
  const { product, variant, qty, total } = line;
  const label = variant.label ?? null;
  const what = [product.name, label ? formatCapacity(label) : null].filter(Boolean).join(', ');
  return (
    <li className="grid grid-cols-[0.5rem_minmax(0,1fr)] gap-x-4 border-b border-ink/10 py-5">
      <Swatch color={product.color} className="h-full min-h-[3rem] w-2" />
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-4">
          <p className="min-w-0 text-base leading-snug text-ink">{product.name}</p>
          <p className="whitespace-nowrap font-display text-[1.375rem] leading-none text-ink">{formatPrice(total)}</p>
        </div>
        <p className="mt-1 text-[0.8125rem] leading-relaxed text-mocha">
          {collectionLabel(product.collection)}
          {label ? ` · ${formatCapacity(label)}` : ''} · {formatPrice(variant.price)}
          {NBSP}/{NBSP}szt.
          {!variant.inStock && ' · brak w magazynie'}
        </p>
        <div className="mt-3 flex items-center justify-between gap-4">
          <Stepper qty={qty} name={what} onChange={(q) => onQty(product.id, label, q)} />
          <button
            type="button"
            onClick={() => onRemove(product.id, label)}
            className="as-label h-11 px-1 text-ink/70 underline decoration-ink/30 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
          >
            Usuń<span className="sr-only">: {what}</span>
          </button>
        </div>
      </div>
    </li>
  );
}

export default function OrderDialog({ open, onOpenChange, order, onBrowse, onCloseAutoFocus }) {
  const { summary, setQty, remove, clear } = order;
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState(null); // { status, text }
  const [copy, setCopy] = useState(null); // 'ok' | 'error'
  const contentRef = useRef(null);
  const empty = summary.lines.length === 0;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleOpenChange = (next) => {
    if (!next) {
      /* zamknięcie po wysyłce — następne otwarcie zaczyna od listy */
      if (result) setResult(null);
      setCopy(null);
    }
    onOpenChange(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (empty) return;
    const list = orderText(summary);
    const total = formatPrice(summary.total);
    const { status } = sendEnquiry({
      subject: 'Zamówienie pigmentów',
      fields: [
        ['Imię i nazwisko', form.name],
        ['Telefon', form.phone],
        ['E-mail', form.email],
        ['Salon', form.salon],
        ['Zamówienie', `\n${list}`],
        ['Suma orientacyjna', `${total} (ceny z ${formatSyncedDate()})`],
        ['Uwagi', form.notes],
      ],
    });
    /* do schowka tylko lista i uwagi — bez danych osobowych */
    const text = [`Zamówienie pigmentów:`, list, `Suma orientacyjna: ${total}`, form.notes ? `Uwagi: ${form.notes}` : null]
      .filter(Boolean)
      .join('\n');
    setResult({ status, text });
    setCopy(null);
    if (status === ENQUIRY_STATUS.MAIL_OPENED) {
      clear();
      setForm(EMPTY_FORM);
    }
    requestAnimationFrame(() => contentRef.current?.scrollTo({ top: 0 }));
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(result.text);
      setCopy('ok');
    } catch {
      setCopy('error');
    }
  };

  const message = result ? enquiryMessage(result.status) : null;
  const sentToMail = result?.status === ENQUIRY_STATUS.MAIL_OPENED;

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
            Zapytanie bez płatności online. Potwierdzimy dostępność, łączną kwotę oraz sposób dostawy
            i{NBSP}płatności.
          </DialogDescription>
        </DialogHeader>

        {message ? (
          <div role="status" aria-live="polite" className="mt-8">
            <p className="as-title text-ink">{message.title}</p>
            <p className="as-body mt-4">{message.body}</p>
            {!sentToMail && (
              <>
                <p className="as-body mt-3">
                  Twoja lista czeka tutaj — skopiuj ją i wklej w wiadomości.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <a href={CONTACT.instagram} target="_blank" rel="noreferrer noopener" className="as-btn-solid">
                    {CONTACT.instagramHandle}
                    <span className="sr-only"> (Instagram, otwiera się w nowej karcie)</span>
                  </a>
                  <button type="button" onClick={copyText} className="as-btn-ghost">
                    {copy === 'ok' ? 'Skopiowano' : 'Skopiuj listę'}
                  </button>
                </div>
                {copy === 'error' && (
                  <>
                    <p className="mt-5 text-[0.8125rem] text-mocha">
                      Przeglądarka nie pozwoliła skopiować — zaznacz tekst poniżej.
                    </p>
                    <pre className="mt-3 whitespace-pre-wrap border border-ink/15 bg-cream-100 p-4 font-sans text-[0.8125rem] leading-relaxed text-ink">
                      {result.text}
                    </pre>
                  </>
                )}
                <ArrowLink onClick={() => setResult(null)} className="mt-8 w-fit">
                  Wróć do zamówienia
                </ArrowLink>
              </>
            )}
            {sentToMail && (
              <ArrowLink onClick={() => handleOpenChange(false)} className="mt-8 w-fit">
                Wróć do katalogu
              </ArrowLink>
            )}
          </div>
        ) : empty ? (
          <div className="mt-8 border-t border-ink/10 pt-6">
            <p className="as-body">
              Lista jest pusta. Dodaj odcienie z katalogu — przycisk „Dodaj do zamówienia” jest przy
              każdym pigmencie.
            </p>
            <ArrowLink onClick={onBrowse} className="mt-8 w-fit">
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
                  onQty={setQty}
                  onRemove={remove}
                />
              ))}
            </ul>

            <div className="flex items-baseline justify-between gap-4 pt-5">
              <p className="as-label text-ink/70">
                Suma orientacyjna · {summary.count}
                {NBSP}szt.
              </p>
              <p className="whitespace-nowrap font-display text-[1.75rem] leading-none text-ink">
                {formatPrice(summary.total)}
              </p>
            </div>
            <p className="as-caption mt-3 max-w-none">
              Ceny aktualne na {formatSyncedDate()}. Łączną kwotę potwierdzimy w{NBSP}odpowiedzi.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 border-t border-ink/10 pt-8" aria-label="Dane do zamówienia">
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
              <DialogFooter>
                <button type="submit" className="as-btn-solid">
                  Wyślij zapytanie
                </button>
                <button type="button" onClick={() => handleOpenChange(false)} className="as-btn-ghost">
                  Wróć do katalogu
                </button>
              </DialogFooter>
              <FormNotice className="mt-6" />
              {!NOTICE_READY && <RequiredLegend className="mt-6" />}
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
