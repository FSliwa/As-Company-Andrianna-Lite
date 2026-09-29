/**
 * Własne klasy błędów rezerwacji. Komunikaty NIE zawierają danych osobowych,
 * identyfikatora kalendarza ani fragmentów odpowiedzi Google – tylko kod,
 * status HTTP i ewentualny `reason` z API (np. 'notFound', 'rateLimitExceeded').
 */

export class BookingError extends Error {
  constructor(message, { code = 'server', cause } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = 'BookingError';
    this.code = code;
  }
}

/** Błąd komunikacji z kalendarzem (→ HTTP 502 { error: 'calendar' }). */
export class CalendarError extends BookingError {
  constructor(message, { kind = 'api', status = null, reason = null, cause } = {}) {
    super(message, { code: 'calendar', cause });
    this.name = 'CalendarError';
    this.kind = kind;
    this.status = status;
    this.reason = reason;
  }
}

/** Zła konfiguracja (brak/uszkodzony klucz, e-mail konta usługi, ID kalendarza). */
export class CalendarConfigError extends CalendarError {
  constructor(message, opts = {}) {
    super(message, { ...opts, kind: 'config' });
    this.name = 'CalendarConfigError';
  }
}

/** Google odrzucił uwierzytelnienie (token/JWT). */
export class CalendarAuthError extends CalendarError {
  constructor(message, opts = {}) {
    super(message, { ...opts, kind: 'auth' });
    this.name = 'CalendarAuthError';
  }
}

/** Przekroczony czas odpowiedzi (AbortSignal.timeout). */
export class CalendarTimeoutError extends CalendarError {
  constructor(message, opts = {}) {
    super(message, { ...opts, kind: 'timeout' });
    this.name = 'CalendarTimeoutError';
  }
}

/** Błąd sieci (DNS, reset połączenia). */
export class CalendarNetworkError extends CalendarError {
  constructor(message, opts = {}) {
    super(message, { ...opts, kind: 'network' });
    this.name = 'CalendarNetworkError';
  }
}

/** Odpowiedź API ≠ 2xx. */
export class CalendarApiError extends CalendarError {
  constructor(message, opts = {}) {
    super(message, { ...opts, kind: 'api' });
    this.name = 'CalendarApiError';
  }
}

/** Termin zajęty (→ HTTP 409 { error: 'taken' }). */
export class SlotTakenError extends BookingError {
  constructor(reason = 'busy') {
    super('Slot is no longer available', { code: 'taken' });
    this.name = 'SlotTakenError';
    this.reason = reason;
  }
}

/** Limit wizyt na ten sam telefon / e-mail (→ HTTP 409 { error: 'limit' }). */
export class BookingLimitError extends BookingError {
  constructor() {
    super('Too many active bookings for this contact', { code: 'limit' });
    this.name = 'BookingLimitError';
  }
}

/** Bezpiecznik: za dużo rezerwacji z www w krótkim czasie (→ HTTP 503 { error: 'paused' }). */
export class BookingPausedError extends BookingError {
  constructor(window = 'hour') {
    super('Online booking paused by the volume fuse', { code: 'paused' });
    this.name = 'BookingPausedError';
    this.window = window;
  }
}

/** Bezpieczny opis błędu do logów – bez danych osobowych i treści odpowiedzi. */
export function describeError(err) {
  if (!err || typeof err !== 'object') return { name: 'Unknown' };
  const out = { name: err.name || 'Error' };
  if (err.kind) out.kind = err.kind;
  if (err.status) out.status = err.status;
  if (err.reason) out.reason = err.reason;
  return out;
}
