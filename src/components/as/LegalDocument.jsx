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
 */

import { LegalParts } from '@/components/as/LegalText';
import { SectionLabel } from '@/components/as/Primitives';
import { LOCALE_META } from '@/i18n/config';
import { FIELD_LABELS, LEGAL_COMPLETE, LEGAL_MISSING, LEGAL_PUBLIC, isBlank, tokenize } from '@/lib/legal';

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

  return (
    <section className="as-section bg-cream-50">
      <div className="as-shell pt-10 lg:pt-14">
        <SectionLabel>{t.label}</SectionLabel>
        {/* hyphens-auto (html lang ustawione): długie słowa, np. RU „конфиденциальности”, nie wychodzą poza ekran telefonu */}
        <h1 className="as-display-lg as-text-balance mt-6 max-w-4xl hyphens-auto break-words text-ink">{doc.title}</h1>
        {(updated || effective) && (
          <p className="as-label mt-6 flex flex-wrap gap-x-6 gap-y-1 text-ink/65">
            {updated && (
              <span>
                {t.updated}: {updated}
              </span>
            )}
            {effective && (
              <span>
                {t.effective}: {effective}
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
            {/* długi spis (RU) nie wychodzi poza okno – przewija się w sobie */}
            <div className="lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-2">
              <p className="as-label text-ink/65">{t.toc}</p>
              <ol className="mt-4 space-y-1 border-t border-ink/10 pt-4">
                {doc.sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="block py-1 text-[0.875rem] leading-snug text-ink/75 hover:text-ink">
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <article className="min-w-0 lg:col-span-8 xl:col-span-7">
            {intro && (
              <p className="text-[1.0625rem] leading-[1.7] text-ink/85">
                <LegalParts parts={intro} locale={locale} />
              </p>
            )}
            {doc.sections.map((s) => (
              <section key={s.id} id={s.id} className="border-t border-ink/10 pt-8 [&:not(:first-child)]:mt-10 first:mt-10">
                <h2 className="as-title text-ink">{s.heading}</h2>
                <div className="mt-4 space-y-4 text-[0.9375rem] leading-[1.75] text-ink/80 sm:text-base">
                  {s.blocks.map((b, i) => {
                    if (b.list) {
                      const items = b.list.map((item) => partsOf(item, locale)).filter(Boolean);
                      if (!items.length) return null;
                      return (
                        <ul key={i} className="space-y-2">
                          {items.map((parts, j) => (
                            <li key={j} className="flex gap-4">
                              <span className="as-dash" aria-hidden="true" />
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
                      <h3 key={i} className="pt-2 text-[0.9375rem] font-medium leading-snug text-ink sm:text-base">
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
