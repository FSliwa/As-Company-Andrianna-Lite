/*
 * Polityka prywatności — komponent SERWEROWY wspólny dla /polityka-prywatnosci,
 * /en/privacy-policy i /ru/privacy-policy. Treść dostarcza i zatwierdza klient
 * (LEGAL.privacyPolicy w src/lib/site.js: [{ heading, body }]). Dopóki jej nie ma,
 * trasy zwracają 404, stopka nie pokazuje linku, a sitemap ich nie zawiera —
 * nie publikujemy szablonu. Wersja EN/RU pokazuje tłumaczenie z
 * src/content/site/{en,ru}.js (LEGAL.privacyPolicy), a bez niego tekst polski
 * z lang="pl" i jednozdaniową informacją w języku strony.
 */
import { notFound } from 'next/navigation';
import common from '@/content/common';
import { pick } from '@/i18n/merge';
import { getSite } from '@/i18n/site';

export default function PrivacyPolicy({ locale = 'pl' }) {
  const { LEGAL } = getSite(locale);
  if (!LEGAL.privacyPolicy) notFound();
  const t = pick(common, locale);
  const untranslated =
    locale !== 'pl' && JSON.stringify(LEGAL.privacyPolicy) === JSON.stringify(getSite('pl').LEGAL.privacyPolicy);
  return (
    <section className="as-section bg-cream-50">
      <div className="as-shell">
        <p className="as-label text-ink/70">
          <span className="text-gold-deep">§</span> <span className="text-ink/30">/</span> {t.documents}
        </p>
        <h1 className="as-display-lg mt-6 text-ink">{t.privacy}</h1>
        {LEGAL.company && (
          <p className="as-body mt-6">
            {t.dataController} {LEGAL.company}.
          </p>
        )}
        {untranslated && <p className="as-body mt-6">{t.privacyInPolish}</p>}
        <div className="mt-12 max-w-3xl space-y-10" lang={untranslated ? 'pl' : undefined}>
          {LEGAL.privacyPolicy.map((s) => (
            <section key={s.heading} className="as-cell">
              <h2 className="as-title text-ink">{s.heading}</h2>
              <p className="as-body mt-4 whitespace-pre-line">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
