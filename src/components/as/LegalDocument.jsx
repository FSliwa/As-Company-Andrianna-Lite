/**
 * Strona dokumentu prawnego (polityka prywatności, polityka cookies, regulamin).
 * Komponent serwerowy: treść z src/content/legal/*.json, dane firmy z site.js
 * (src/lib/legal.js). Układ redakcyjny: spis treści w lewej kolumnie (sticky od lg),
 * tekst w wąskiej kolumnie do czytania. Braki danych są widoczne jako oznaczenia,
 * a nad dokumentem stoi pas „Projekt dokumentu” — nie udajemy obowiązującego tekstu.
 */

import LocaleLink from '@/components/as/LocaleLink';
import { SectionLabel } from '@/components/as/Primitives';
import { LOCALE_META } from '@/i18n/config';
import { localizeHref } from '@/i18n/routes';
import { CONTACT, SITE_URL } from '@/lib/site';
import { FIELD_LABELS, LEGAL_COMPLETE, LEGAL_MISSING, tokenize } from '@/lib/legal';

const UI = {
  pl: {
    label: 'Informacje prawne',
    updated: 'Ostatnia aktualizacja',
    toc: 'Spis treści',
    draftTitle: 'Projekt dokumentu',
    draftText: 'Przed publikacją trzeba uzupełnić dane firmy i zatwierdzić treść. Brakuje:',
  },
  en: {
    label: 'Legal information',
    updated: 'Last updated',
    toc: 'Contents',
    draftTitle: 'Draft document',
    draftText: 'Before publication, the company details must be completed and the text approved. Missing:',
  },
  ru: {
    label: 'Правовая информация',
    updated: 'Последнее обновление',
    toc: 'Содержание',
    draftTitle: 'Проект документа',
    draftText: 'Перед публикацией нужно дополнить данные компании и утвердить текст. Не хватает:',
  },
};

function Rich({ text, locale }) {
  const labels = FIELD_LABELS[locale] || FIELD_LABELS.pl;
  return tokenize(text).map((part, i) => {
    if (part.text !== undefined) return part.text;
    if (part.link) {
      const href = localizeHref(part.link, locale);
      return (
        <LocaleLink key={i} href={href} locale={locale} className="underline underline-offset-2 hover:text-ink">
          {SITE_URL.replace(/^https?:\/\//, '')}
          {href}
        </LocaleLink>
      );
    }
    if (part.missing) {
      return (
        <mark key={i} className="bg-gold/15 px-1 text-ink">
          [{labels.missing}: {labels[part.field]}]
        </mark>
      );
    }
    const v = part.value;
    const cls = 'underline underline-offset-2 hover:text-ink';
    if (part.field === 'email' || part.field === 'privacyEmail') {
      return (
        <a key={i} href={`mailto:${v}`} className={cls}>
          {v}
        </a>
      );
    }
    if (part.field === 'phone') {
      return (
        <a key={i} href={`tel:${String(v).replace(/\s/g, '')}`} className={cls}>
          {v}
        </a>
      );
    }
    if (part.field === 'instagram') {
      return (
        <a key={i} href={v} target="_blank" rel="noreferrer noopener" className={cls}>
          {CONTACT.instagramHandle}
        </a>
      );
    }
    if (part.field === 'siteUrl') return v.replace(/^https?:\/\//, '');
    return v;
  });
}

export default function LegalDocument({ doc, locale = 'pl' }) {
  const t = UI[locale] || UI.pl;
  const labels = FIELD_LABELS[locale] || FIELD_LABELS.pl;
  const updated = doc.updated
    ? new Intl.DateTimeFormat((LOCALE_META[locale] || LOCALE_META.pl).intl, { dateStyle: 'long', timeZone: 'Europe/Warsaw' }).format(
        new Date(`${doc.updated}T12:00:00Z`)
      )
    : null;

  return (
    <section className="as-section bg-cream-50">
      <div className="as-shell pt-10 lg:pt-14">
        <SectionLabel>{t.label}</SectionLabel>
        <h1 className="as-display-lg as-text-balance mt-6 max-w-4xl text-ink">{doc.title}</h1>
        {updated && (
          <p className="as-label mt-6 text-ink/65">
            {t.updated}: {updated}
          </p>
        )}

        {!LEGAL_COMPLETE && (
          <div role="note" className="mt-8 max-w-3xl border-l-2 border-gold bg-cream-100 px-5 py-4">
            <p className="as-label text-gold-deep">{t.draftTitle}</p>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink/80">
              {t.draftText} {LEGAL_MISSING.map((f) => labels[f]).join(', ')}.
            </p>
          </div>
        )}

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          <nav aria-label={t.toc} className="lg:col-span-4 xl:col-span-3">
            <div className="lg:sticky lg:top-28">
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
            {doc.intro && (
              <p className="text-[1.0625rem] leading-[1.7] text-ink/85">
                <Rich text={doc.intro} locale={locale} />
              </p>
            )}
            {doc.sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-28 border-t border-ink/10 pt-8 [&:not(:first-child)]:mt-10 first:mt-10">
                <h2 className="as-title text-ink">{s.heading}</h2>
                <div className="mt-4 space-y-4 text-[0.9375rem] leading-[1.75] text-ink/80 sm:text-base">
                  {s.blocks.map((b, i) =>
                    b.list ? (
                      <ul key={i} className="space-y-2">
                        {b.list.map((item, j) => (
                          <li key={j} className="flex gap-4">
                            <span className="as-dash" aria-hidden="true" />
                            <span className="min-w-0">
                              <Rich text={item} locale={locale} />
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p key={i}>
                        <Rich text={b.p} locale={locale} />
                      </p>
                    )
                  )}
                </div>
              </section>
            ))}
          </article>
        </div>
      </div>
    </section>
  );
}
