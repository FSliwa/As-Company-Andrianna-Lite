'use client';

/**
 * Przełącznik języka „PL · EN · RU” (I18N_SPEC §7): nagłówek od lg, menu mobilne, stopka.
 * Każdy link prowadzi do TEJ SAMEJ strony w innym języku (nieznany adres / 404 →
 * strona główna języka). Kotwica i parametry (#cennik, ?temat=…) są wspólne dla
 * języków, ale znane dopiero w przeglądarce i zmieniają się bez nawigacji (filtry
 * katalogu) — doklejamy je w chwili kliknięcia. Zwykłe <a>, nie next/link: każdy
 * język ma własny root layout, więc przejście i tak jest pełnym przeładowaniem.
 * Pole dotyku 44 × 44 px; aktywny język podkreślony 1 px, aria-current="page".
 */

import { usePathname } from 'next/navigation';
import { LOCALES, LOCALE_META } from '@/i18n/config';
import { parsePath, switchLocalePath } from '@/i18n/routes';
import { useContent } from '@/i18n/client';
import common from '@/content/common';
import { cn } from '@/lib/utils';

function withCurrentQuery(event) {
  const link = event.currentTarget;
  link.href = `${link.dataset.base}${window.location.search}${window.location.hash}`;
}

export default function LanguageSwitcher({ tone = 'dark', className }) {
  const pathname = usePathname() || '/';
  const { locale } = parsePath(pathname);
  const t = useContent(common);
  const light = tone === 'light';
  return (
    <div role="group" aria-label={t.languageAria} className={cn('flex items-center', className)}>
      {LOCALES.map((l, i) => {
        const base = switchLocalePath(pathname, l);
        const active = l === locale;
        return (
          <span key={l} className="flex items-center">
            {i > 0 && (
              <span aria-hidden="true" className={cn('as-label', light ? 'text-cream-200/40' : 'text-ink/30')}>
                ·
              </span>
            )}
            <a
              href={base}
              data-base={base}
              hrefLang={l}
              lang={l}
              title={LOCALE_META[l].name}
              aria-current={active ? 'page' : undefined}
              onClick={withCurrentQuery}
              onAuxClick={withCurrentQuery}
              className={cn(
                'as-label inline-flex h-11 min-w-[2.75rem] items-center justify-center transition-colors',
                light
                  ? active
                    ? 'text-cream-50'
                    : 'text-cream-200/70 hover:text-cream-50'
                  : active
                    ? 'text-ink'
                    : 'text-ink/65 hover:text-ink'
              )}
            >
              <span
                className={cn(
                  active && 'underline decoration-1 underline-offset-[5px]',
                  active && (light ? 'decoration-gold-light' : 'decoration-gold')
                )}
              >
                {LOCALE_META[l].label}
              </span>
            </a>
          </span>
        );
      })}
    </div>
  );
}
