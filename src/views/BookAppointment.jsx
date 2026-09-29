'use client';

/**
 * Umów wizytę (/umow-wizyte) – rezerwacja online zapisywana w Kalendarzu Google salonu.
 *
 * 01 Rezerwacja (cream-50) – nagłówek strony (SectionLabel, H1, lead), a pod nim
 *    przepływ w czterech krokach na jednym ekranie (nie kreator z ukrytymi krokami):
 *      01 Zabieg  · 02 Dzień · 03 Godzina · 04 Dane
 *    Desktop: prawa kolumna sticky „Podsumowanie” z przyciskiem. Telefon: podsumowanie
 *    pod krokiem 04, nad przyciskiem.
 * → stopka (formularz jest CTA tej strony – bez ClosingCta, jak /kontakt).
 *
 * Stany: wyłączona (503 / brak konfiguracji – `initialEnabled` z serwera), ładowanie,
 * brak slotów (+ najbliższy wolny dzień), walidacja, 409 „termin się zajął”, 429,
 * 502/500/sieć, sukces z plikiem .ics.
 *
 * Zasady:
 *  • zabiegi, czasy i ceny wyłącznie z src/lib/booking/config.js (ceny → site.js),
 *  • daty liczone dopiero w przeglądarce (strefa salonu: Europe/Warsaw) – bez
 *    niezgodności hydratacji; przy przestawionym zegarze urządzenia (> 2 min od czasu
 *    serwera) pasek dni liczy się od czasu serwera, a po powrocie do karty / co 5 min
 *    okno jest przeliczane (karta otwarta przez północ); ?zabieg=<id> wybiera zabieg,
 *  • klawiatura: natywne radio (Tab = grupa, strzałki = wybór, Enter = wybór, a na
 *    wybranym – następny krok),
 *  • anty-bot: podpisany znacznik formularza z serwera (nie zegar przeglądarki),
 *    opcjonalnie Cloudflare Turnstile – skrypt Cloudflare ładujemy dopiero, gdy ktoś
 *    zaczyna wypełniać krok 04 (albo wysyła formularz), a nie przy otwarciu strony;
 *    requestId na próbę rezerwacji terminu –
 *    ponowienie po błędzie nie tworzy drugiego wpisu w kalendarzu,
 *  • bez pytań o zdrowie, bez obietnic SMS/e-mail (serwis ich nie wysyła).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLink, RequiredLegend, Reveal, SectionLabel } from '@/components/as/Primitives';
import {
  fetchDaySlots,
  fetchMonthAvailability,
  invalidateAvailability,
  newRequestId,
  postBooking,
} from '@/components/booking/api';
import { BookingDone } from '@/components/booking/BookingDone';
import { BookingNotice } from '@/components/booking/BookingNotice';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { BookingUnavailable } from '@/components/booking/BookingUnavailable';
import { ContactFields } from '@/components/booking/ContactFields';
import { DayStrip, DayStripSkeleton, StripControls, useStripScroll } from '@/components/booking/DayStrip';
import {
  SALON_TIME_NOTE,
  browserTimeZoneDiffers,
  datesBetween,
  formatDateLong,
  monthsBetween,
  plural,
} from '@/components/booking/format';
import { SlotGrid, TakenNotice } from '@/components/booking/SlotGrid';
import { Step } from '@/components/booking/Step';
import { TreatmentPicker } from '@/components/booking/TreatmentPicker';
import { Turnstile } from '@/components/booking/Turnstile';
import { BOOKING_CONFIG, getTreatment, shownDurationMin } from '@/lib/booking/config';
import { bookingSchema } from '@/lib/booking/schema';
import { bookingWindow, workingHoursFor } from '@/lib/booking/slots';
import { CONTACT } from '@/lib/site';
import { LEGAL_PUBLISHED } from '@/lib/legal';
import { cn } from '@/lib/utils';

/* BookingNotice (jak FormNotice, ale z celem „rezerwacja wizyty w Kalendarzu Google”)
   renderuje się sam, gdy dokumenty obowiązują (LEGAL_PUBLISHED), i zawiera zdanie
   o polach wymaganych – do tego czasu legendę pokazuje RequiredLegend (jak /kontakt).
   Bez obowiązujących dokumentów BookingRoute i tak nie włącza rezerwacji. */
const NOTICE_READY = LEGAL_PUBLISHED;
const SUBMIT_LABEL = 'Zarezerwuj wizytę';

const FIELD_ORDER = ['treatment', 'date', 'time', 'name', 'phone', 'email', 'note'];
const CONTACT_FIELDS = ['name', 'phone', 'email', 'note'];

const EMPTY_MESSAGES = {
  treatment: 'Wybierz zabieg.',
  date: 'Wybierz dzień.',
  time: 'Wybierz godzinę.',
  name: 'Podaj imię i nazwisko',
  phone: 'Podaj numer telefonu',
  email: 'Podaj adres e-mail',
};

/* Pole odrzucone przez API mimo walidacji w przeglądarce (np. inna wersja reguł). */
const SERVER_FIELD_MESSAGES = {
  treatment: 'Wybierz zabieg ponownie.',
  date: 'Wybierz dzień ponownie.',
  time: 'Wybierz godzinę ponownie.',
  name: 'Sprawdź imię i nazwisko',
  phone: 'Sprawdź numer telefonu',
  email: 'Sprawdź adres e-mail',
  note: 'Sprawdź uwagi (maks. 500 znaków, bez linków)',
};

const RETRY_SECONDS_FALLBACK = 60;
/** Różnica zegara urządzenia i serwera, od której liczymy okno od czasu serwera. */
const CLOCK_SKEW_TOLERANCE_MS = 2 * 60 * 1000;
const WINDOW_REFRESH_MS = 5 * 60 * 1000;

/** Walidacja tym samym schematem co API (src/lib/booking/schema.js) + czytelne komunikaty pustych pól. */
function validate(v) {
  const errors = {};
  const parsed = bookingSchema.safeParse({
    treatment: v.treatment || undefined,
    date: v.date || undefined,
    time: v.time || undefined,
    name: v.name,
    phone: v.phone,
    email: v.email,
    note: v.note,
    website: '',
    formToken: 'client-check', // znacznik sprawdza wyłącznie serwer
  });
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path.length ? String(issue.path[0]) : '_';
      if (!errors[key]) errors[key] = issue.message;
    }
  }
  for (const key of ['treatment', 'date', 'time']) if (!v[key]) errors[key] = EMPTY_MESSAGES[key];
  for (const key of ['name', 'phone', 'email']) if (!String(v[key]).trim()) errors[key] = EMPTY_MESSAGES[key];
  return errors;
}

function reducedMotion() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

function formErrorMessage(err) {
  switch (err.kind) {
    case 'too_fast':
      return 'Formularz został wysłany zbyt szybko. Odczekaj kilka sekund i spróbuj ponownie.';
    case 'form_expired':
      return 'Formularz był otwarty bardzo długo, więc go odświeżyliśmy. Sprawdź dane i kliknij „Zarezerwuj wizytę” jeszcze raz.';
    case 'limit':
      return `Na ten numer telefonu lub adres e-mail są już zarezerwowane wizyty. Jeśli chcesz umówić kolejną albo zmienić termin, napisz na Instagramie ${CONTACT.instagramHandle}.`;
    case 'captcha':
      return 'Nie udało się potwierdzić, że formularz wysyła człowiek. Spróbuj ponownie za chwilę.';
    case 'captcha_pending':
      return 'Sprawdzamy zabezpieczenie formularza – spróbuj ponownie za kilka sekund.';
    case 'captcha_failed':
      return `Nie udało się załadować zabezpieczenia formularza. Odśwież stronę albo napisz na Instagramie ${CONTACT.instagramHandle}.`;
    case 'rate_limited': {
      const minutes = Math.max(1, Math.ceil((err.retryAfter || RETRY_SECONDS_FALLBACK) / 60));
      return `Za dużo prób w krótkim czasie. Spróbuj ponownie za ${minutes} ${plural(minutes, 'minutę', 'minuty', 'minut')}.`;
    }
    case 'network':
      return 'Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.';
    case 'reload':
      return 'Nie udało się wysłać formularza. Odśwież stronę i spróbuj ponownie.';
    default:
      return `Nie udało się potwierdzić rezerwacji – kalendarz salonu chwilowo nie odpowiada. Spróbuj ponownie za chwilę albo napisz na Instagramie ${CONTACT.instagramHandle}.`;
  }
}

/* ================================================================== */
/*  Przepływ rezerwacji: 01 Zabieg · 02 Dzień · 03 Godzina · 04 Dane    */
/* ================================================================== */

function BookingFlow({ onDone, onDisabled, formToken, serverNow, turnstileSiteKey }) {
  const router = useRouter();
  const formRef = useRef(null);
  const takenRef = useRef(null);
  const turnstileRef = useRef(null);
  const requestRef = useRef({ key: null, id: null });
  const pendingTimeFocus = useRef(false);
  const strip = useStripScroll();

  const [windowDates, setWindowDates] = useState(null); // { firstDate, lastDate } – liczone w przeglądarce
  const [foreignZone, setForeignZone] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaFailed, setCaptchaFailed] = useState(false);
  /* Turnstile (gdy skonfigurowany) ładujemy dopiero przy pierwszej interakcji z krokiem 04
     albo przy próbie wysłania – nie przy otwarciu strony (art. 399 PKE, polityka cookies). */
  const [captchaArmed, setCaptchaArmed] = useState(false);
  const armCaptcha = () => {
    if (turnstileSiteKey) setCaptchaArmed(true);
  };
  const [treatment, setTreatment] = useState(null);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);

  const [counts, setCounts] = useState({});
  const [countsStatus, setCountsStatus] = useState('idle'); // idle | loading | ready | error | rate_limited
  const [countsReload, setCountsReload] = useState(0);

  const [slotsState, setSlotsState] = useState({ key: null, status: 'idle', slots: [] });
  const [slotsReload, setSlotsReload] = useState(0);

  const [values, setValues] = useState({ name: '', phone: '', email: '', note: '', website: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [taken, setTaken] = useState(0); // licznik 409 – zmiana = fokus na komunikat
  const [announcement, setAnnouncement] = useState('');

  /* – montaż: ?zabieg=, strefa przeglądarki – */
  useEffect(() => {
    const preset = new URLSearchParams(window.location.search).get('zabieg');
    if (preset && getTreatment(preset)) setTreatment(preset);
    setForeignZone(browserTimeZoneDiffers());
  }, []);

  /* – okno rezerwacji: zegar przeglądarki skorygowany o czas serwera, przeliczane po
       powrocie do karty i co 5 min (zmiana dnia przy otwartej karcie) – */
  useEffect(() => {
    const skew = serverNow ? serverNow - Date.now() : 0;
    const offset = Math.abs(skew) > CLOCK_SKEW_TOLERANCE_MS ? skew : 0;
    const refresh = () => {
      const w = bookingWindow(Date.now() + offset, BOOKING_CONFIG);
      setWindowDates((cur) =>
        cur && cur.firstDate === w.firstDate && cur.lastDate === w.lastDate ? cur : { firstDate: w.firstDate, lastDate: w.lastDate }
      );
    };
    refresh();
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    const timer = setInterval(refresh, WINDOW_REFRESH_MS);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(timer);
    };
  }, [serverNow]);

  /* Wybrany dzień wypadł z okna (np. minęła północ) – wybór do ponowienia. */
  useEffect(() => {
    if (date && windowDates && (date < windowDates.firstDate || date > windowDates.lastDate)) {
      setDate(null);
      setTime(null);
    }
  }, [windowDates, date]);

  const days = useMemo(
    () =>
      windowDates
        ? datesBetween(windowDates.firstDate, windowDates.lastDate).map((d) => ({
            date: d,
            closed: !workingHoursFor(d, BOOKING_CONFIG),
          }))
        : null,
    [windowDates]
  );
  const months = useMemo(() => (windowDates ? monthsBetween(windowDates.firstDate, windowDates.lastDate) : []), [windowDates]);

  const updateStrip = strip.update;
  useEffect(() => {
    updateStrip();
  }, [days, updateStrip]);

  /* – dostępność dni (jedno zapytanie na miesiąc okna) – */
  useEffect(() => {
    if (!treatment || !months.length) return undefined;
    const ctrl = new AbortController();
    setCounts({});
    setCountsStatus('loading');
    const timer = setTimeout(async () => {
      try {
        const results = await Promise.all(
          months.map((m) => fetchMonthAvailability(treatment, m, { signal: ctrl.signal }))
        );
        if (ctrl.signal.aborted) return;
        const merged = {};
        results.forEach((r) => r.ok && r.data && Object.assign(merged, r.data.days));
        const failed = results.find((r) => !r.ok);
        if (failed && failed.error === 'disabled') {
          onDisabled();
          return;
        }
        setCounts(merged);
        setCountsStatus(failed ? (failed.error === 'rate_limited' ? 'rate_limited' : 'error') : 'ready');
      } catch (err) {
        if (!ctrl.signal.aborted && (!err || err.name !== 'AbortError')) setCountsStatus('error');
      }
    }, 200); // strzałki w grupie zabiegów: nie pytamy o każdy mijany zabieg
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [treatment, months, countsReload, onDisabled]);

  /* – wolne godziny wybranego dnia – */
  const slotsKey = treatment && date ? `${treatment}|${date}` : null;
  useEffect(() => {
    if (!slotsKey) return undefined;
    const [t, d] = slotsKey.split('|');
    const ctrl = new AbortController();
    setSlotsState({ key: slotsKey, status: 'loading', slots: [] });
    (async () => {
      try {
        const r = await fetchDaySlots(t, d, { signal: ctrl.signal });
        if (ctrl.signal.aborted) return;
        if (r.ok) {
          const slots = Array.isArray(r.data.slots) ? r.data.slots : [];
          setSlotsState({ key: slotsKey, status: 'ready', slots });
          setCounts((c) => (c[d] === slots.length ? c : { ...c, [d]: slots.length }));
          setTime((cur) => (cur && !slots.includes(cur) ? null : cur));
        } else if (r.error === 'disabled') {
          onDisabled();
        } else {
          setSlotsState({ key: slotsKey, status: r.error === 'rate_limited' ? 'rate_limited' : 'error', slots: [] });
        }
      } catch (err) {
        if (!ctrl.signal.aborted && (!err || err.name !== 'AbortError')) {
          setSlotsState({ key: slotsKey, status: 'error', slots: [] });
        }
      }
    })();
    return () => ctrl.abort();
  }, [slotsKey, slotsReload, onDisabled]);

  let slotStatus;
  if (!treatment) slotStatus = 'no-treatment';
  else if (!date) slotStatus = 'no-date';
  else if (slotsState.key !== slotsKey || slotsState.status === 'loading' || slotsState.status === 'idle') slotStatus = 'loading';
  else slotStatus = slotsState.status;
  const slots = slotStatus === 'ready' ? slotsState.slots : [];

  /* – najbliższy wolny dzień (po wybranym, a gdy go nie ma – pierwszy wolny) – */
  const nextFree = useMemo(() => {
    if (!days) return null;
    const free = days.filter((d) => !d.closed && counts[d.date] > 0).map((d) => d.date);
    if (!free.length) return null;
    if (!date) return free[0];
    return free.find((d) => d > date) || free.find((d) => d !== date) || null;
  }, [days, counts, date]);

  /* – komunikaty dla czytników ekranu – */
  useEffect(() => {
    if (slotStatus === 'loading') setAnnouncement('Sprawdzamy wolne godziny…');
    else if (slotStatus === 'ready' && date) {
      const n = slotsState.slots.length;
      setAnnouncement(
        n
          ? `${formatDateLong(date)}: ${n} ${plural(n, 'wolna godzina', 'wolne godziny', 'wolnych godzin')}.`
          : `${formatDateLong(date)}: brak wolnych godzin.`
      );
    } else if (slotStatus === 'error' || slotStatus === 'rate_limited') setAnnouncement('Nie udało się pobrać wolnych godzin.');
  }, [slotStatus, slotsState, date]);

  /* – Enter w kroku 02, gdy godziny jeszcze się ładowały: fokus czekał na nagłówku 03;
       po załadowaniu przenosimy go na pierwszą godzinę (jeśli nikt go nie ruszył) – */
  useEffect(() => {
    if (!pendingTimeFocus.current || slotStatus === 'loading') return;
    pendingTimeFocus.current = false;
    const title = document.getElementById('b-step-time-title');
    if (slotStatus === 'ready' && slots.length && title && document.activeElement === title) focusGroup('time');
  });

  /* – 409: fokus na komunikacie nad siatką godzin – */
  useEffect(() => {
    if (!taken || !takenRef.current) return;
    takenRef.current.focus({ preventScroll: true });
    document.getElementById('b-step-time')?.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
  }, [taken]);

  /* ---------------- akcje ---------------- */

  const clearErrors = useCallback((...keys) => {
    setErrors((e) => {
      if (!keys.some((k) => e[k])) return e;
      const next = { ...e };
      keys.forEach((k) => delete next[k]);
      return next;
    });
  }, []);

  const focusGroup = (name) => {
    const root = formRef.current;
    if (!root) return false;
    const el =
      root.querySelector(`input[name="${name}"]:checked:not(:disabled)`) ||
      root.querySelector(`input[name="${name}"]:not(:disabled)`);
    if (el) {
      el.focus();
      if (name === 'date') strip.centerOn(el.value);
      return true;
    }
    return false;
  };

  const focusStepTitle = (id) => document.getElementById(`${id}-title`)?.focus();

  /* Krok 03: pierwsza godzina, a gdy jeszcze się ładują – nagłówek (fokus przejdzie na godzinę po załadowaniu). */
  const focusTimeStep = () => {
    if (focusGroup('time')) return;
    pendingTimeFocus.current = true;
    focusStepTitle('b-step-time');
  };

  const focusField = (key) => {
    if (key === 'treatment') focusGroup('treatment');
    else if (key === 'date') focusGroup('date') || focusStepTitle('b-step-date');
    else if (key === 'time') focusTimeStep();
    else document.getElementById(`b-${key}`)?.focus();
  };

  const chooseTreatment = (id) => {
    setTreatment(id);
    setTime(null);
    setTaken(0);
    setFormError(null);
    clearErrors('treatment', 'time');
  };

  const chooseDate = (d) => {
    setDate(d);
    setTime(null);
    setTaken(0);
    setFormError(null);
    clearErrors('date', 'time');
    strip.centerOn(d);
  };

  const chooseTime = (t) => {
    setTime(t);
    setTaken(0);
    setFormError(null);
    clearErrors('time');
  };

  const pickNextFree = (d) => {
    chooseDate(d);
    requestAnimationFrame(() => {
      pendingTimeFocus.current = true;
      document.getElementById('b-step-time-title')?.focus({ preventScroll: true });
    });
  };

  const onFieldChange = (name, value) => {
    armCaptcha();
    const next = { ...values, [name]: value };
    setValues(next);
    if (name === 'website') return;
    if (attempted || touched[name]) {
      const all = validate({ ...next, treatment, date, time });
      setErrors((e) => ({ ...e, [name]: all[name] }));
    }
  };

  const onFieldBlur = (name) => {
    const filled = String(values[name]).trim() !== '';
    if (!filled && !attempted) return; // puste pole przed wysłaniem – bez upominania
    setTouched((t) => ({ ...t, [name]: true }));
    const all = validate({ ...values, treatment, date, time });
    setErrors((e) => ({ ...e, [name]: all[name] }));
  };

  const handleTaken = () => {
    // Termin przepadł (także gdy nasz wpis przegrał wyścig i został usunięty) – kolejna
    // próba, nawet tej samej godziny, to nowa rezerwacja z nowym identyfikatorem.
    requestRef.current = { key: null, id: null };
    invalidateAvailability(treatment);
    setTime(null);
    setSlotsReload((n) => n + 1);
    setCountsReload((n) => n + 1);
    setTaken((n) => n + 1);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setAttempted(true);
    setFormError(null);

    const all = validate({ ...values, treatment, date, time });
    setErrors(all);
    const invalid = FIELD_ORDER.filter((k) => all[k]);
    if (invalid.length) {
      setAnnouncement(`Formularz wymaga poprawek: ${invalid.length} ${plural(invalid.length, 'pole', 'pola', 'pól')}.`);
      focusField(invalid[0]);
      return;
    }
    if (turnstileSiteKey && !captchaToken) {
      armCaptcha();
      setFormError({ kind: captchaFailed ? 'captcha_failed' : 'captcha_pending' });
      return;
    }

    // Jeden identyfikator na próbę rezerwacji tego terminu: ponowienie po błędzie (502,
    // brak sieci) wysyła ten sam – serwer rozpozna wpis, który mimo błędu się zapisał.
    const slotKey = `${treatment}|${date}|${time}`;
    if (requestRef.current.key !== slotKey) requestRef.current = { key: slotKey, id: newRequestId() };

    setSubmitting(true);
    setAnnouncement('Zapisujemy wizytę…');
    const res = await postBooking({
      treatment,
      date,
      time,
      name: values.name,
      phone: values.phone,
      email: values.email,
      note: values.note,
      website: values.website,
      formToken: formToken || '',
      requestId: requestRef.current.id,
      ...(turnstileSiteKey ? { turnstileToken: captchaToken } : {}),
    }).catch(() => ({ ok: false, status: 0, error: 'network' }));
    setSubmitting(false);
    // Token Turnstile jest jednorazowy – po każdej odpowiedzi pobieramy nowy.
    if (turnstileSiteKey) turnstileRef.current?.reset();

    if (res.ok && res.data && res.data.bookingId && res.data.start) {
      onDone(res.data);
      return;
    }

    switch (res.error) {
      case 'disabled':
      case 'paused':
        onDisabled();
        return;
      case 'taken':
        handleTaken();
        return;
      case 'limit':
        setFormError({ kind: 'limit' });
        return;
      case 'form_expired':
        router.refresh(); // nowy znacznik formularza z serwera; stan formularza zostaje
        setFormError({ kind: 'form_expired' });
        return;
      case 'captcha':
        setFormError({ kind: 'captcha' });
        return;
      case 'invalid': {
        const known = (res.fields || []).filter((f) => FIELD_ORDER.includes(f));
        if (known.length) {
          setErrors((prev) => {
            const next = { ...prev };
            known.forEach((f) => (next[f] = SERVER_FIELD_MESSAGES[f]));
            return next;
          });
          if (known.some((f) => ['treatment', 'date', 'time'].includes(f))) {
            invalidateAvailability(treatment);
            setSlotsReload((n) => n + 1);
          }
          const first = FIELD_ORDER.find((f) => known.includes(f));
          if (first === 'time') {
            // Godziny zaraz się przeładują (radia znikną) – fokus na nagłówek kroku 03,
            // a po załadowaniu na pierwszą godzinę.
            pendingTimeFocus.current = true;
            focusStepTitle('b-step-time');
          } else {
            focusField(first);
          }
          setAnnouncement('Formularz wymaga poprawek.');
        } else {
          setFormError({ kind: 'reload' });
        }
        return;
      }
      case 'too_fast':
        setFormError({ kind: 'too_fast' });
        return;
      case 'rate_limited':
        setFormError({ kind: 'rate_limited', retryAfter: res.retryAfter });
        return;
      case 'network':
        setFormError({ kind: 'network' });
        return;
      case 'forbidden':
      case 'too_large':
      case 'unsupported_media_type':
        setFormError({ kind: 'reload' });
        return;
      default:
        setFormError({ kind: 'calendar' });
    }
  };

  /* ---------------- widok ---------------- */

  const t = getTreatment(treatment);
  const { minLeadHours, maxDaysAhead } = BOOKING_CONFIG;
  /* Zdanie o wyszarzeniu tylko, gdy dostępność dni naprawdę jest znana – przy błędzie
     lub limicie nic nie jest wyszarzone, a komunikat o błędzie stoi osobno pod podpisem. */
  const countsNote =
    countsStatus === 'loading' ? ' Sprawdzamy, które dni są wolne…' : countsStatus === 'ready' ? ' Dni bez wolnych godzin są wyszarzone.' : '';
  const dateCaption = !treatment
    ? 'Najpierw wybierz zabieg – pokażemy dni z wolnymi godzinami.'
    : `Rezerwacja najpóźniej ${minLeadHours} ${plural(minLeadHours, 'godzinę', 'godziny', 'godzin')} przed wizytą, do ${maxDaysAhead} dni naprzód.${countsNote}`;
  const timeCaption =
    /* D6: czas zabiegu tylko, gdy ma źródło (shownDurationMin) – robocze czasy nie są faktem dla klientki. */
    [
      t ? `Godzina rozpoczęcia wizyty.${shownDurationMin(t) ? ` ${t.name} trwa do ${shownDurationMin(t)} min.` : ''}` : null,
      foreignZone ? SALON_TIME_NOTE : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      aria-label="Rezerwacja wizyty"
      className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16"
    >
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>

      <div className="space-y-14 lg:col-span-8 lg:space-y-16">
        <Step id="b-step-treatment" number="01" title="Zabieg" error={errors.treatment}>
          <TreatmentPicker
            value={treatment}
            onChange={chooseTreatment}
            onEnter={() => focusGroup('date') || focusStepTitle('b-step-date')}
            invalid={Boolean(errors.treatment)}
          />
        </Step>

        <Step
          id="b-step-date"
          number="02"
          title="Dzień"
          caption={dateCaption}
          error={errors.date}
          disabled={!treatment}
          aside={days ? <StripControls strip={strip} controls="b-days" /> : null}
        >
          {(countsStatus === 'error' || countsStatus === 'rate_limited') && (
            <div className="mb-5 flex flex-wrap items-baseline gap-x-6 gap-y-3">
              <p className="text-[0.875rem] leading-relaxed text-ink/80">
                {countsStatus === 'rate_limited'
                  ? 'Za dużo zapytań w krótkim czasie – dostępność dni pokażemy za chwilę.'
                  : 'Nie udało się sprawdzić, które dni są wolne. Wybierz dzień, a sprawdzimy godziny.'}
              </p>
              <ArrowLink onClick={() => setCountsReload((n) => n + 1)} className="w-fit">
                Spróbuj ponownie
              </ArrowLink>
            </div>
          )}
          <div className={cn('transition-opacity', !treatment && 'opacity-40')}>
            {days ? (
              <DayStrip
                id="b-days"
                days={days}
                counts={counts}
                value={date}
                onChange={chooseDate}
                onEnter={focusTimeStep}
                strip={strip}
                busy={countsStatus === 'loading'}
                invalid={Boolean(errors.date)}
              />
            ) : (
              <DayStripSkeleton />
            )}
          </div>
        </Step>

        <Step
          id="b-step-time"
          number="03"
          title="Godzina"
          caption={timeCaption}
          error={errors.time}
        >
          {taken > 0 && <TakenNotice ref={takenRef} />}
          <SlotGrid
            status={slotStatus}
            slots={slots}
            value={time}
            onChange={chooseTime}
            onEnter={() => document.getElementById('b-name')?.focus()}
            onRetry={() => {
              if (slotStatus === 'rate_limited' || slotStatus === 'error') setSlotsReload((n) => n + 1);
            }}
            nextFree={nextFree}
            windowChecked={countsStatus === 'ready'}
            onPickNextFree={pickNextFree}
            invalid={Boolean(errors.time)}
          />
        </Step>

        <Step id="b-step-contact" number="04" title="Twoje dane" caption="Potrzebujemy ich, by zapisać wizytę i skontaktować się z Tobą w jej sprawie.">
          {/* onFocus (w React bąbelkuje): pierwsze wejście w pole kroku 04 ładuje Turnstile */}
          <div onFocus={armCaptcha}>
            <ContactFields
              values={values}
              errors={Object.fromEntries(CONTACT_FIELDS.map((k) => [k, errors[k]]))}
              onChange={onFieldChange}
              onBlur={onFieldBlur}
            />
          </div>
        </Step>
      </div>

      <div className="mt-14 lg:sticky lg:top-32 lg:col-span-4 lg:mt-0 lg:self-start">
        <BookingSummary treatment={treatment} date={date} time={time}>
          {formError && (
            <p role="alert" className="mt-6 border-l-2 border-destructive bg-cream-50 px-4 py-3 text-[0.875rem] leading-relaxed text-ink">
              {formErrorMessage(formError)}
            </p>
          )}
          {turnstileSiteKey && captchaArmed && (
            <Turnstile
              ref={turnstileRef}
              siteKey={turnstileSiteKey}
              onToken={(token) => {
                setCaptchaToken(token);
                if (token) {
                  setCaptchaFailed(false);
                  setFormError((e) => (e && (e.kind === 'captcha_pending' || e.kind === 'captcha_failed') ? null : e));
                }
              }}
              onError={() => setCaptchaFailed(true)}
            />
          )}
          <button
            type="submit"
            aria-disabled={submitting || undefined}
            className={cn('as-btn-solid mt-6 w-full focus-visible:outline-ink', submitting && 'cursor-progress opacity-70')}
          >
            {submitting ? 'Zapisujemy wizytę…' : SUBMIT_LABEL}
          </button>
          <BookingNotice className="mt-5" submitLabel={SUBMIT_LABEL} turnstile={Boolean(turnstileSiteKey)} />
          {!NOTICE_READY && <RequiredLegend className="mt-5" />}
        </BookingSummary>
      </div>
    </form>
  );
}

/* ================================================================== */

export default function BookAppointment({ initialEnabled = true, formToken = null, serverNow = null, turnstileSiteKey = null }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [booking, setBooking] = useState(null);
  const [panelFocus, setPanelFocus] = useState(0);
  const flowTopRef = useRef(null);
  const panelRef = useRef(null);

  const onDisabled = useCallback(() => {
    setEnabled(false);
    setPanelFocus((n) => n + 1);
  }, []);

  const onDone = useCallback((data) => {
    setBooking(data);
    setPanelFocus((n) => n + 1);
  }, []);

  /* Po zmianie stanu (sukces / wyłączenie) – przewiń do panelu i przenieś fokus na jego nagłówek. */
  useEffect(() => {
    if (!panelFocus) return;
    flowTopRef.current?.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
    panelRef.current?.focus({ preventScroll: true });
  }, [panelFocus]);

  /* D6 (Z15): „konsultacja” bez źródła – zostaje to, co podaje brief (FAQ: rysunek wstępny
     dopasowany do architektury twarzy; usuwanie go nie wymaga, stąd „przed każdą pigmentacją”). */
  const lead =
    'Przed każdą pigmentacją robimy rysunek wstępny dopasowany do architektury twarzy.' +
    (enabled && !booking ? ' Wybierz zabieg, dzień i godzinę – wizyta trafi od razu do kalendarza salonu.' : '');

  return (
    <section className="bg-cream-50">
      <div className="as-shell pb-16 pt-24 sm:pt-28 lg:pb-24">
        <Reveal className="max-w-3xl">
          <SectionLabel number="01">Rezerwacja</SectionLabel>
          <h1 className="as-display-lg as-text-balance mt-6 text-ink">
            Umów <span className="italic text-gold-dark">wizytę.</span>
          </h1>
          <p className="as-body mt-6">{lead}</p>
        </Reveal>

        <div ref={flowTopRef} className="mt-12 scroll-mt-28 lg:mt-16 lg:scroll-mt-32">
          {!enabled ? (
            <BookingUnavailable ref={panelRef} />
          ) : booking ? (
            <BookingDone ref={panelRef} booking={booking} />
          ) : (
            <BookingFlow
              onDone={onDone}
              onDisabled={onDisabled}
              formToken={formToken}
              serverNow={serverNow}
              turnstileSiteKey={turnstileSiteKey}
            />
          )}
        </div>
      </div>
    </section>
  );
}
