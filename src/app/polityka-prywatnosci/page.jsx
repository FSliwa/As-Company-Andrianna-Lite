import { notFound } from 'next/navigation';
import { LEGAL } from '@/lib/site';
import { pageMeta } from '@/lib/seo';

/*
 * Polityka prywatności — treść dostarcza i zatwierdza klient (LEGAL.privacyPolicy
 * w src/lib/site.js: [{ heading, body }]). Dopóki jej nie ma, trasa zwraca 404,
 * stopka nie pokazuje linku, a sitemap jej nie zawiera — nie publikujemy szablonu.
 */
export const metadata = pageMeta({
  title: 'Polityka prywatności',
  description: 'Zasady przetwarzania danych osobowych w serwisie AS COMPANY LOVELINESS i Babushkina Academy.',
  path: '/polityka-prywatnosci',
});

export default function PrivacyPolicy() {
  if (!LEGAL.privacyPolicy) notFound();
  return (
    <section className="as-section bg-cream-50">
      <div className="as-shell">
        <p className="as-label text-ink/70">
          <span className="text-gold-deep">§</span> <span className="text-ink/30">/</span> Dokumenty
        </p>
        <h1 className="as-display-lg mt-6 text-ink">Polityka prywatności</h1>
        {LEGAL.company && <p className="as-body mt-6">Administrator danych: {LEGAL.company}.</p>}
        <div className="mt-12 max-w-3xl space-y-10">
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
