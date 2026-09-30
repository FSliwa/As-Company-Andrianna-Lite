'use client';

/**
 * 04 Dane – imię i nazwisko*, telefon*, e-mail*, uwagi (bez pytań o zdrowie)
 * + niewidoczne pole-pułapka „website” (honeypot; API odrzuca wypełnione).
 * Błędy: tekst pod polem, powiązany przez aria-describedby, aria-invalid.
 * Klawiatura ekranowa: „Dalej” (enterKeyHint) w polach jednowierszowych,
 * imię i nazwisko z wielkiej litery (autoCapitalize).
 */

import { Field } from '@/components/as/Primitives';
import { FIELD_LIMITS } from '@/lib/booking/schema';
import { cn } from '@/lib/utils';

function ErrorText({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-2 text-[0.8125rem] leading-relaxed text-destructive">
      {children}
    </p>
  );
}

function BookingField({ name, error, describedBy, className, ...rest }) {
  const errorId = `b-${name}-error`;
  const ids = [describedBy, error && errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={className}>
      <Field
        id={`b-${name}`}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids}
        className={cn(error && 'border-destructive')}
        {...rest}
      />
      <ErrorText id={errorId}>{error}</ErrorText>
    </div>
  );
}

export function ContactFields({ values, errors, onChange, onBlur }) {
  const bind = (name) => ({
    name,
    value: values[name],
    error: errors[name],
    onChange: (e) => onChange(name, e.target.value),
    onBlur: () => onBlur(name),
  });

  return (
    <div className="grid gap-7 sm:grid-cols-2 sm:gap-x-8">
      <BookingField
        {...bind('name')}
        label="Imię i nazwisko"
        type="text"
        autoComplete="name"
        autoCapitalize="words"
        enterKeyHint="next"
        maxLength={FIELD_LIMITS.nameMax}
        required
      />
      <BookingField
        {...bind('phone')}
        label="Telefon"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        enterKeyHint="next"
        maxLength={24}
        required
      />
      <BookingField
        {...bind('email')}
        label="Adres e-mail"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        enterKeyHint="next"
        spellCheck={false}
        maxLength={FIELD_LIMITS.emailMax}
        required
        className="sm:col-span-2"
      />
      <div className="sm:col-span-2">
        <BookingField
          {...bind('note')}
          as="textarea"
          label="Uwagi (opcjonalnie)"
          rows={3}
          maxLength={FIELD_LIMITS.noteMax}
          describedBy="b-note-hint"
        />
        <p id="b-note-hint" className="mt-2 text-[0.8125rem] leading-relaxed text-mocha">
          {/* D6 (Z15): bez „konsultacji” jako osobnej usługi (brak źródła) */}
          Np. czy to pierwszy zabieg, czy odświeżenie. Nie wpisuj informacji o zdrowiu – omówimy je w salonie.
        </p>
      </div>

      {/* Pułapka na boty: poza ekranem, poza kolejnością Tab, ukryta przed czytnikami. */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-[10000px] top-0 h-px w-px overflow-hidden">
        <label htmlFor="b-website">Strona internetowa (zostaw puste)</label>
        <input
          id="b-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => onChange('website', e.target.value)}
        />
      </div>
    </div>
  );
}
