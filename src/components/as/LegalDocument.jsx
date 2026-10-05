/**
 * Strona dokumentu prawnego (polityka prywatności, polityka cookies, regulamin).
 * Komponent serwerowy: treść z src/content/legal/*.json, dane firmy z site.js
 * (src/lib/legal.js), tekst ze znacznikami renderuje LegalText. Układ redakcyjny: spis
 * treści w lewej kolumnie (sticky od lg), tekst w wąskiej kolumnie do czytania.
 * Dokumenty są publiczne (LEGAL_PUBLIC – decyzja Filipa z 30.09.2026): bez pasa „Projekt
 * dokumentu” i bez oznaczeń braków; do czasu uzupełnienia danych firmy zamiast nazwy stoi
 * marka, zamiast siedziby miasto, a fragmenty z NIP-em, e-mailem czy telefonem znikają.
 * Pas „Projekt dokumentu” i „[do uzupełnienia: …]” wracają tylko w trybie projektu
 * (LEGAL_PUBLIC = false) – nie udajemy wtedy obowiązującego tekstu.
 * Bloki treści: { p } akapit, { list } lista, { h3 } podtytuł w sekcji. Akapit albo pozycja
 * listy, z której po usunięciu segmentów nic nie zostaje (np. „[[NIP: {nip}]]”), nie renderuje się.
 * Pole "effective" (data wejścia w życie, np. nowej wersji Regulaminu) pokazujemy obok
 * daty aktualizacji, gdy jest wpisane.
 * Spis treści: od lg przyklejony w lewej kolumnie, poniżej lg zwinięty w natywnym
 * <details> (bez JS – komponent zostaje serwerowy), żeby 16–17 pozycji nie spychało
 * początku dokumentu pod pierwszy ekran. Tekst w mierze .as-body (36 rem, ok. 80 znaków).
 */

import { LegalParts } from '@/components/as/LegalText';
import { SectionLabel } from '@/components/as/Primitives';
import { LOCALE_META } from '@/i18n/config';
import { FIELD_LABELS, LEGAL_COMPLETE, LEGAL_MISSING, LEGAL_PUBLIC, isBlank, tokenize } from '@/lib/legal';
import { nbspShort } from '@/lib/utils';

const UI = {
  pl: {
    label: 'Informacje prawne',
    updated: 'Ostatnia aktualizacja',
    effective: 'Obowiązuje od',
    toc: 'Spis treści',
    draftTitle: 'Projekt dokumentu',
    draftText: 'Przed publikacją trzeba uzupełnić dane firmy i zatwierdzić treść. Brakuje:',
    draftApproval: 'Dane firmy są uzupełnione, ale treść czeka jeszcze na zatwierdzenie. Do tego czasu dokument nie obowiązuje.',
  },
  en: {
    label: 'Legal information',
    updated: 'Last updated',
    effective: 'In force from',
    toc: 'Contents',
    draftTitle: 'Draft document',
    draftText: 'Before publication, the company details must be completed and the text approved. Missing:',
    draftApproval: 'The company details are complete, but the text has not been approved yet. Until then, this document does not apply.',
  },
  ru: {
    label: 'Правовая информация',
    updated: 'Последнее обновление',
    effective: 'Действует с',
    toc: 'Содержание',
    draftTitle: 'Проект документа',
    draftText: 'Перед публикацией нужно дополнить данные компании и утвердить текст. Не хватает:',
    draftApproval: 'Данные компании дополнены, но текст ещё не утверждён. До утверждения документ не действует.',
  },
};

/** Tekst → kawałki do renderu (null, gdy po usunięciu segmentów nic nie zostaje). */
function partsOf(text, locale) {
  const parts = tokenize(text, { locale });
  return isBlank(parts) ? null : parts;
}

export default function LegalDocument({ doc, locale = 'pl' }) {
  const t = UI[locale] || UI.pl;
  const labels = FIELD_LABELS[locale] || FIELD_LABELS.pl;
  const fmt = new Intl.DateTimeFormat((LOCALE_META[locale] || LOCALE_META.pl).intl, { dateStyle: 'long', timeZone: 'Europe/Warsaw' });
  const formatDate = (iso) => (iso ? fmt.format(new Date(`${iso}T12:00:00Z`)) : null);
  const updated = formatDate(doc.updated);
  const effective = formatDate(doc.effective);
  const intro = doc.intro ? partsOf(doc.intro, locale) : null;

  /* Pozycje spisu – te same w <details> (poniżej lg) i w kolumnie sticky (od lg).
     Poniżej lg py-2 (pole dotyku ok. 35 px zamiast 27); od lg py-1, a na niskich
     laptopach (≤ 820 px wysokości) py-0.5 – spis mieści się w oknie bez przewijania. */
  const tocItems = doc.sections.map((s) => (
    <li key={s.id} className="break-inside-avoid">
      <a
        href={`#${s.id}`}
        className="block py-2 text-[0.875rem] leading-snug text-ink/75 hover:text-ink lg:py-1 lg:[@media(max-height:820px)]:py-0.5"
      >
        {nbspShort(s.heading)}
      </a>
    </li>
  ));

  return (
    <section className="as-section bg-cream-50">
      <div className="as-shell pt-10 lg:pt-14">
        <SectionLabel>{t.label}</SectionLabel>
        {/* hyphens-auto (html lang ustawione): długie słowa, np. RU „конфиденциальности”, nie wychodzą poza ekran telefonu */}
        <h1 className="as-display-lg as-text-balance mt-6 max-w-4xl hyphens-auto break-words text-ink">{nbspShort(doc.title)}</h1>
        {(updated || effective) && (
          <p className="as-label mt-6 flex flex-wrap gap-x-6 gap-y-1 text-ink/65">
            {/* data w nowrap: przy 280–344 px łamała się w środku („30” / „września 2026”) –
                teraz przechodzi do drugiej linii w całości */}
            {updated && (
              <span>
                {t.updated}: <span className="whitespace-nowrap">{updated}</span>
              </span>
            )}
            {effective && (
              <span>
                {t.effective}: <span className="whitespace-nowrap">{effective}</span>
              </span>
            )}
          </p>
        )}

        {!LEGAL_PUBLIC && (
          <div role="note" className="mt-8 max-w-3xl border-l-2 border-gold bg-cream-100 px-5 py-4">
            <p className="as-label text-gold-deep">{t.draftTitle}</p>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink/80">
              {LEGAL_COMPLETE ? t.draftApproval : `${t.draftText} ${LEGAL_MISSING.map((f) => labels[f]).join(', ')}.`}
            </p>
          </div>
        )}

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          <nav aria-label={t.toc} className="lg:col-span-4 xl:col-span-3">
            {/* poniżej lg: spis zwinięty, od md w dwóch kolumnach (tablet w pionie bez
                wąskiego paska przy lewej krawędzi i pustej reszty szerokości) */}
            <details className="group border-y border-ink/10 lg:hidden">
              <summary className="as-label flex min-h-11 cursor-pointer list-none items-center justify-between text-ink/65 [&::-webkit-details-marker]:hidden">
                {t.toc}
                <span aria-hidden="true" className="text-base leading-none transition-transform group-open:rotate-45 motion-reduce:transition-none">
                  +
                </span>
              </summary>
              <ol className="space-y-1 pb-4 md:columns-2 md:gap-x-10">{tocItems}</ol>
            </details>
            {/* od lg: długi spis (RU) nie wychodzi poza okno – przewija się w sobie */}
            <div className="hidden lg:sticky lg:top-28 lg:-ml-2 lg:block lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pb-2 lg:pl-2 lg:pr-2">
              <p className="as-label text-ink/65">{t.toc}</p>
              <ol className="mt-4 space-y-1 border-t border-ink/10 pt-4">{tocItems}</ol>
            </div>
          </nav>

          {/* miara tekstu jak .as-body (36 rem): na tabletach kolumna miała cały łam
              (704–868 px), od xl 755 px – 85–126 znaków w wierszu */}
          <article className="min-w-0 max-w-[36rem] lg:col-span-8 xl:col-span-7">
            {intro && (
              <p className="text-[1.0625rem] leading-[1.7] text-ink/85">
                <LegalParts parts={intro} locale={locale} />
              </p>
            )}
            {doc.sections.map((s) => (
              <section key={s.id} id={s.id} className="border-t border-ink/10 pt-8 [&:not(:first-child)]:mt-10 first:mt-10">
                <h2 className="as-title text-ink">{nbspShort(s.heading)}</h2>
                <div className="mt-4 space-y-4 text-base leading-[1.75] text-ink/80">
                  {s.blocks.map((b, i) => {
                    if (b.list) {
                      const items = b.list.map((item) => partsOf(item, locale)).filter(Boolean);
                      if (!items.length) return null;
                      return (
                        <ul key={i} className="space-y-2">
                          {items.map((parts, j) => (
                            /* poniżej 360 px krótsza kreska i mniejszy odstęp – tekst listy
                               zyskuje 22 px (przy 280 px miał ok. 25 znaków w wierszu) */
                            <li key={j} className="flex gap-4 max-[359px]:gap-2.5">
                              <span className="as-dash max-[359px]:w-3" aria-hidden="true" />
                              <span className="min-w-0">
                                <LegalParts parts={parts} locale={locale} />
                              </span>
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    const parts = partsOf(b.h3 || b.p, locale);
                    if (!parts) return null;
                    return b.h3 ? (
                      <h3 key={i} className="pt-2 text-base font-medium leading-snug text-ink">
                        <LegalParts parts={parts} locale={locale} />
                      </h3>
                    ) : (
                      <p key={i}>
                        <LegalParts parts={parts} locale={locale} />
                      </p>
                    );
                  })}
                </div>
              </section>
            ))}
          </article>
        </div>
      </div>
    </section>
  );
}
