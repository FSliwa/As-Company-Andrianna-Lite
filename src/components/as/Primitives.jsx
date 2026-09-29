'use client';

/**
 * Wspólne elementy systemu wizualnego AS COMPANY.
 * Wszystkie podstrony budujemy z tych klocków, żeby styl był spójny.
 * Wersje językowe: linki wewnętrzne przez LocaleLink (polska ścieżka → adres
 * bieżącego języka), napisy własne prymitywów z src/content/common.
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from '@/components/as/LocaleLink';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContent, useLocale, useSite } from '@/i18n/client';
import common from '@/content/common';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/* ------------------------------------------------------------------ */
/*  Etykieta sekcji:  „02  /  O NAS  ———————”                          */
/* ------------------------------------------------------------------ */

export function SectionLabel({ number, children, tone = 'dark', line = true, className }) {
  const isLight = tone === 'light';
  return (
    <div className={cn('flex items-center gap-4', className)}>
      {number && (
        <span className={cn('as-label', isLight ? 'text-gold-light' : 'text-gold-deep')}>
          {number}
        </span>
      )}
      {number && (
        <span className={cn('as-label', isLight ? 'text-cream-200/40' : 'text-ink/30')}>/</span>
      )}
      <span className={cn('as-label', isLight ? 'text-cream-100/85' : 'text-ink/70')}>{children}</span>
      {line && (
        <span
          className={cn(
            'hidden h-px w-16 sm:block lg:w-28',
            isLight ? 'bg-cream-200/25' : 'bg-ink/15'
          )}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Link ze strzałką                                                    */
/* ------------------------------------------------------------------ */

export function ArrowLink({ href = '#', children, tone = 'dark', className, onClick, ...rest }) {
  const classes = cn('group', tone === 'light' ? 'as-arrow-light' : 'as-arrow-dark', className);
  const inner = (
    <>
      <span>{children}</span>
      <span className="as-arrow-glyph" aria-hidden="true">
        &#8594;
      </span>
    </>
  );

  /* akcja (np. otwarcie dialogu) — ten sam wygląd, semantyka przycisku */
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes} {...rest}>
        {inner}
      </button>
    );
  }

  if (typeof href === 'string' && (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:'))) {
    return (
      <a href={href} className={classes} {...rest}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {inner}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Kadr ze zdjęciem — zawsze z /graphics, zawsze z wymiarami          */
/* ------------------------------------------------------------------ */

const DEFAULT_SIZES = '(min-width: 1024px) 33vw, 100vw';

/** Z mapy { szerokość: ścieżka } buduje srcSet dla <source type="image/webp">. */
function buildSrcSet(webp) {
  if (!webp) return undefined;
  const entries = Object.entries(webp);
  if (!entries.length) return undefined;
  return entries.map(([w, src]) => `${src} ${w}w`).join(', ');
}

/**
 * Props:
 *  - image     wpis z src/lib/media.js ({ src, w, h, webp })
 *  - ratio     proporcja kadru, np. "3 / 4"; nadmiar jest przycinany (object-cover)
 *  - position  object-position, np. "50% 30%" — gdzie ma być środek ciężkości
 *              przy przycinaniu; domyślnie środek
 *  - tone      "dark" w sekcjach espresso/mocha (ciemniejszy, mniej nasycony),
 *              "light" w sekcjach kremowych (odsycony, jaśniejszy, z kremową
 *              mgłą) — w obu przypadkach po to, żeby zdjęcie siedziało w tle
 *              zamiast na nim świecić (jak w makiecie); domyślnie bez korekty
 *  - sizes     atrybut sizes; bez niego przeglądarka zakłada 100vw i pobiera
 *              największy wariant
 *  - fill      kadr wypełnia rodzica (absolute inset-0, bez aspect-ratio) —
 *              dla pasów pełnej szerokości (Statement)
 */
export function Figure({
  image,
  alt,
  ratio = '3 / 4',
  className,
  imgClassName,
  framed = false,
  zoom = true,
  priority = false,
  sizes = DEFAULT_SIZES,
  position,
  tone = 'none',
  fill = false,
}) {
  if (!image) return null;
  const srcSet = buildSrcSet(image.webp);
  return (
    <div className={cn(framed && 'as-frame', fill && 'absolute inset-0', className)}>
      <div
        className={cn(
          'as-media',
          fill && 'h-full w-full',
          zoom && 'as-media-zoom',
          tone === 'dark' && 'as-media-dark',
          tone === 'light' && 'as-media-light'
        )}
        style={fill ? undefined : { aspectRatio: ratio }}
      >
        <picture>
          {srcSet && <source type="image/webp" srcSet={srcSet} sizes={sizes} />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt={alt}
            width={image.w}
            height={image.h}
            sizes={sizes}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            fetchPriority={priority ? 'high' : undefined}
            className={imgClassName}
            style={position ? { objectPosition: position } : undefined}
          />
        </picture>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Numerowana pozycja pod kadrem (01 · Produkty · opis · →)           */
/* ------------------------------------------------------------------ */

export function NumberedItem({ number, title, children, href, tone = 'dark', className }) {
  const isLight = tone === 'light';
  const t = useContent(common);
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-baseline gap-3">
        <span className="as-num text-lg sm:text-xl">{number}</span>
        <h3 className={cn('as-numbered-title', isLight ? 'text-cream-50' : 'text-ink')}>{title}</h3>
      </div>
      <p className={cn('as-numbered-desc', isLight ? 'text-cream-200/75' : 'text-mocha')}>{children}</p>
      {href && (
        <ArrowLink href={href} tone={tone} className="mt-1 self-start border-b-0 pb-0">
          <span className="sr-only">
            {t.goTo} {title}
          </span>
        </ArrowLink>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dekoracyjny złoty łuk (jak cienkie krzywe w makiecie)              */
/* ------------------------------------------------------------------ */

export function GoldArc({ className, flip = false, opacity = 0.35 }) {
  return (
    <svg
      viewBox="0 0 800 600"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
      className={cn('pointer-events-none absolute', flip && 'scale-x-[-1]', className)}
    >
      <path
        d="M-40 600C-40 600 40 210 300 90C520 -12 760 40 840 150"
        stroke="#B89768"
        strokeOpacity={opacity}
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Krzyżyki narożne — subtelna „siatka konstrukcyjna” z makiety       */
/* ------------------------------------------------------------------ */

export function CrossMarks({ className, tone = 'dark' }) {
  const color = tone === 'light' ? 'rgba(232,219,196,0.35)' : 'rgba(184,151,104,0.5)';
  const Mark = ({ style }) => (
    <span className="absolute h-3 w-3" style={style} aria-hidden="true">
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2" style={{ background: color }} />
      <span className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2" style={{ background: color }} />
    </span>
  );
  return (
    <div className={cn('pointer-events-none absolute inset-0', className)}>
      <Mark style={{ top: -6, left: -6 }} />
      <Mark style={{ top: -6, right: -6 }} />
      <Mark style={{ bottom: -6, left: -6 }} />
      <Mark style={{ bottom: -6, right: -6 }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pojawianie się przy przewijaniu                                     */
/* ------------------------------------------------------------------ */

/* Na serwerze nie ma useLayoutEffect — podmieniamy, żeby nie sypać ostrzeżeniami. */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Pojawianie się przy przewijaniu.
 *
 * WAŻNE: treść startuje WIDOCZNA. Ukrywamy ją dopiero w useLayoutEffect,
 * czyli już po stronie przeglądarki i jeszcze przed pierwszym malowaniem —
 * dzięki temu nie ma mignięcia, a jednocześnie:
 *   • HTML z serwera zawiera treść bez opacity:0 (czytelny dla wyszukiwarek
 *     i dla kogoś z wyłączonym JS),
 *   • przy błędzie JS strona nie zostaje pusta.
 * Wcześniejsza wersja startowała z opacity-0 i całe sekcje bywały niewidoczne
 * do czasu hydracji.
 */
export function Reveal({ children, delay = 0, className, as: Tag = 'div' }) {
  const ref = useRef(null);
  const [hidden, setHidden] = useState(false);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const isNear = () => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 1.3 && r.bottom > -window.innerHeight * 0.25;
    };

    // Element jest już w kadrze — zostaw widoczny, nie ma czego animować.
    if (isNear()) return;

    setHidden(true);

    const reveal = () => {
      setHidden(false);
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) reveal();
      },
      { rootMargin: '0px 0px 5% 0px', threshold: 0.01 }
    );
    io.observe(el);

    // Siatka bezpieczeństwa: przy bardzo szybkim przewijaniu obserwator
    // potrafi pominąć wywołanie.
    const onScroll = () => {
      if (isNear()) reveal();
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={cn(
        'transition-[opacity,transform] duration-500 ease-as motion-reduce:transition-none',
        hidden ? 'translate-y-3 opacity-0' : 'translate-y-0 opacity-100',
        className
      )}
      style={{ transitionDelay: hidden ? '0ms' : `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/*  Nagłówek podstrony — wspólny dla wszystkich stron poza główną      */
/* ------------------------------------------------------------------ */

export function PageHero({
  label,
  number,
  title,
  titleAccent,
  lead,
  image,
  imageAlt,
  imageTone,
  imagePosition,
  facts,
  stats,
  variant,
  imageSide = 'right',
  tone = 'cream',
  children,
}) {
  /* variant: 'cover' (domyślny, gdy jest zdjęcie) — portret 2:3 po prawej, tekst
     wyśrodkowany w pionie; 'band' — pas espresso bez zdjęcia, H1 na całą szerokość
     łamu + rząd Stat (trasy bez packshotów: /maszynki, /pigmenty, /certyfikaty). */
  const kind = variant || (image ? 'cover' : 'band');
  const isDark = kind === 'band' || tone !== 'cream';

  const heading = (
    <>
      <SectionLabel number={number} tone={isDark ? 'light' : 'dark'}>
        {label}
      </SectionLabel>
      <h1 className={cn('as-display-lg as-text-balance mt-6', isDark ? 'text-cream-100' : 'text-ink')}>
        {title}
        {titleAccent && (
          <>
            {' '}
            <span className={cn('italic', isDark ? 'text-gold-light' : 'text-gold-dark')}>{titleAccent}</span>
          </>
        )}
      </h1>
      {lead && <p className={cn('mt-6', isDark ? 'as-body-invert' : 'as-body')}>{lead}</p>}
      {children && <div className="mt-8">{children}</div>}
    </>
  );

  const factStrip =
    facts && facts.length > 0 ? (
      <FactStrip
        items={facts}
        tone={isDark ? 'light' : 'dark'}
        className={cn('mt-10 border-t pt-6', isDark ? 'border-cream-200/15' : 'border-ink/10')}
      />
    ) : null;

  if (kind === 'band') {
    return (
      <section className="relative overflow-hidden bg-espresso text-cream-50">
        <GoldArc className="-top-24 right-[-10%] h-[560px] w-[760px]" opacity={0.28} />
        <div className="as-shell relative pb-14 pt-28 sm:pt-32 lg:pb-20 lg:pt-40">
          <Reveal className="min-w-0 max-w-4xl">{heading}</Reveal>
          {stats && stats.length > 0 && (
            <div className="mt-10 grid grid-cols-3 gap-3 max-[359px]:grid-cols-1 max-[359px]:gap-5 sm:gap-8 lg:mt-16">
              {stats.map((st) => (
                <Stat key={st.label} value={st.value} label={st.label} tone="light" compact />
              ))}
            </div>
          )}
          {factStrip}
        </div>
      </section>
    );
  }

  return (
    <section className={cn('relative overflow-hidden', isDark ? 'bg-espresso text-cream-50' : 'bg-cream-50 text-ink')}>
      <div className="as-shell relative pb-14 pt-24 sm:pt-28 lg:pb-16 lg:pt-24">
        <div className="grid gap-12 md:grid-cols-12 md:items-center md:gap-8">
          <Reveal
            className={cn(
              'min-w-0 md:row-start-1',
              imageSide === 'left' ? 'md:col-span-7 md:col-start-6 lg:col-span-6 lg:col-start-7' : 'md:col-span-7 md:col-start-1 lg:col-span-6'
            )}
          >
            {heading}
            {factStrip}
          </Reveal>
          {image && (
            <div
              className={cn(
                'min-w-0 md:row-start-1',
                imageSide === 'left' ? 'md:col-span-5 md:col-start-1 lg:col-span-4 lg:col-start-2' : 'md:col-span-5 md:col-start-8 lg:col-span-4 lg:col-start-8'
              )}
            >
              <div className="mx-auto max-w-[17rem] sm:max-w-[22rem] md:max-w-none">
                <Figure
                  image={image}
                  alt={imageAlt || title}
                  ratio="2 / 3"
                  position={imagePosition || '50% 20%'}
                  tone={imageTone}
                  framed
                  priority
                  sizes="(min-width: 1440px) 432px, (min-width: 1024px) 30vw, (min-width: 768px) 36vw, 90vw"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Wiersz cennika                                                      */
/* ------------------------------------------------------------------ */

export function PriceRow({ name, note, price, tone = 'dark' }) {
  const isLight = tone === 'light';
  return (
    <div
      className={cn(
        'flex items-baseline gap-4 border-b py-5 first:border-t',
        isLight ? 'border-cream-200/15' : 'border-ink/10'
      )}
    >
      <div className="min-w-0 flex-1">
        <span className={cn('block text-base', isLight ? 'text-cream-50' : 'text-ink')}>{name}</span>
        {note && (
          <span
            className={cn(
              'mt-1 block text-[0.8125rem] leading-relaxed',
              isLight ? 'text-cream-100/85' : 'text-mocha'
            )}
          >
            {note}
          </span>
        )}
      </div>
      <span
        className={cn(
          'hidden flex-1 translate-y-[-3px] border-b border-dotted sm:block',
          isLight ? 'border-cream-200/20' : 'border-ink/15'
        )}
        aria-hidden="true"
      />
      <span
        className={cn(
          'whitespace-nowrap font-display text-xl sm:text-[1.375rem]',
          isLight ? 'text-gold-light' : 'text-ink'
        )}
      >
        {price}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pasek zaufania — drobne fakty rozdzielone ukośnikiem               */
/* ------------------------------------------------------------------ */

export function FactStrip({ items, tone = 'dark', className }) {
  const isLight = tone === 'light';
  /* Do lg: siatka 2 kolumn bez ukośników (nic nie jest ucięte w pół słowa
     i żaden wiersz nie zaczyna się od „/”). Od lg: jedna linia z ukośnikami. */
  return (
    <ul className={cn('grid grid-cols-2 gap-x-6 gap-y-3 lg:flex lg:flex-wrap lg:items-center lg:gap-x-5', className)}>
      {items.map((item, i) => (
        <li key={item} className="flex items-center gap-5">
          {i > 0 && (
            <span aria-hidden="true" className={cn('as-label hidden lg:inline', isLight ? 'text-cream-200/40' : 'text-ink/30')}>
              /
            </span>
          )}
          <span className={cn('as-label', isLight ? 'text-cream-100/85' : 'text-ink/65')}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/*  Przycisk CTA — link wewnętrzny, zewnętrzny/kotwica albo <button>   */
/* ------------------------------------------------------------------ */

export function CtaButton({ href, onClick, children, className = 'as-btn-solid', ...rest }) {
  if (onClick || !href) {
    return (
      <button type="button" onClick={onClick} className={className} {...rest}>
        {children}
      </button>
    );
  }
  const plain = /^(https?:|mailto:|tel:|#)/.test(href);
  if (plain) {
    return (
      <a href={href} className={className} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Liczba osiągnięcia: „5 000+” + podpis                              */
/* ------------------------------------------------------------------ */

export function Stat({ value, label, tone = 'dark', compact = false, className }) {
  const isLight = tone === 'light';
  const locale = useLocale();
  return (
    <div className={cn(compact ? 'border-l border-gold/35 pl-3 sm:pl-5' : 'as-card-col', className)}>
      <p
        className={cn(
          compact
            ? 'as-display text-[clamp(1.25rem,5.4vw,1.625rem)] leading-none [overflow-wrap:anywhere] sm:text-[2.25rem] lg:text-[clamp(2.5rem,4.4vw,4rem)]'
            : 'as-display-md leading-none',
          isLight ? 'text-cream-100' : 'text-ink'
        )}
      >
        {value}
      </p>
      <p className={cn('mt-3 hyphens-auto break-words', isLight ? 'as-caption-invert' : 'as-caption')} lang={locale}>
        {label}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pas zamykający stronę — jeden na każdej trasie, ten sam układ      */
/*  tło espresso-900, etykieta z numerem, h2 w skali sekcji,           */
/*  lead as-body-invert, para gold + ghost-light, opcjonalnie kadr(y). */
/* ------------------------------------------------------------------ */

export function ClosingCta({
  number,
  label,
  title,
  titleAccent,
  lead,
  primary,
  secondary,
  aside,
  children,
  className,
}) {
  /* Pas zamykający = jeden blok ze stopką (espresso-900). Bez portretów —
     założycielka nie może występować w każdym zakończeniu strony.
     Etykieta domyślna („Kontakt”) — w języku strony. */
  const t = useContent(common);
  const button = (btn, cls) => {
    if (!btn) return null;
    const { label: text, ...rest } = btn;
    return (
      <CtaButton {...rest} className={cls}>
        {text}
      </CtaButton>
    );
  };
  return (
    <section data-sticky-hide className={cn('relative overflow-hidden bg-espresso text-cream-50', className)}>
      <div className="as-shell relative py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
          <Reveal className={aside ? 'lg:col-span-7' : 'lg:col-span-8'}>
            <SectionLabel number={number} tone="light">
              {label === undefined ? t.closingLabel : label}
            </SectionLabel>
            <h2 className="as-display-section as-text-balance mt-6 text-cream-100">
              {title}
              {titleAccent && (
                <>
                  {' '}
                  <span className="italic text-gold-light">{titleAccent}</span>
                </>
              )}
            </h2>
            {lead && <p className="as-body-invert mt-6">{lead}</p>}
            {(primary || secondary) && (
              <div className="mt-8 flex flex-wrap gap-4">
                {button(primary, 'as-btn-invert')}
                {button(secondary, 'as-btn-ghost-light')}
              </div>
            )}
          </Reveal>
          {aside && (
            <Reveal delay={90} className="lg:col-span-4 lg:col-start-9">
              {aside}
            </Reveal>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Wiersz indeksu: numerał 64 | tytuł 28 + opis | meta/cena | link    */
/*  (produkty na home, zabiegi na /uslugi, modele na /maszynki)        */
/* ------------------------------------------------------------------ */

export function IndexRow({ number, title, desc, meta, href, cta, tone = 'dark', className, children }) {
  const onDark = tone === 'light';
  return (
    <div
      className={cn(
        'grid gap-4 border-t py-8 sm:grid-cols-[5rem_1fr] lg:grid-cols-[6rem_1fr_auto] lg:items-baseline lg:gap-8',
        onDark ? 'border-cream-200/15' : 'border-ink/15',
        className
      )}
    >
      <span className={cn('as-display-md leading-none', onDark ? 'text-gold-light' : 'text-gold-dark')}>{number}</span>
      <div>
        <h3 className={cn('as-title', onDark ? 'text-cream-100' : 'text-ink')}>{title}</h3>
        {desc && <p className={cn('mt-3 max-w-[34rem] text-[0.9375rem] leading-[1.65]', onDark ? 'text-cream-200/85' : 'text-ink/75')}>{desc}</p>}
        {children}
      </div>
      <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3 sm:col-start-2 lg:col-start-auto lg:justify-end">
        {meta && <span className={cn('whitespace-nowrap font-display text-[1.375rem]', onDark ? 'text-cream-100' : 'text-ink')}>{meta}</span>}
        {href && cta && (
          <ArrowLink href={href} tone={onDark ? 'light' : 'dark'} className="w-fit">
            {cta}
          </ArrowLink>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pole formularza: etykieta w kapitalikach + linia pod polem         */
/*  (input / textarea / select). Jedna klasa dla całego serwisu.       */
/* ------------------------------------------------------------------ */

/* 16 px na telefonie (mniejsze pola iOS Safari powiększa przy fokusie),
   linia pola ink/40 (≥ 3:1), fokus = linia 2 px w ink, placeholder w mocha. */
export const FIELD_CLASS =
  'block h-12 w-full rounded-none border-0 border-b border-ink/40 bg-transparent px-0 text-base text-ink shadow-none outline-none transition-[border-color,box-shadow] placeholder:text-mocha focus:border-ink focus:shadow-[0_1px_0_0_#241B14] focus-visible:ring-0 sm:text-[0.9375rem]';

export function Field({ as = 'input', label, id, hint, required, className, wrapperClassName, children, ...rest }) {
  const Tag = as;
  const control = (
    <Tag
      id={id}
      required={required}
      aria-required={required || undefined}
      className={cn(
        FIELD_CLASS,
        as === 'textarea' && 'h-auto min-h-[7.5rem] resize-y py-3',
        as === 'select' && 'cursor-pointer appearance-none pr-8',
        className
      )}
      {...rest}
    >
      {as === 'select' ? children : undefined}
    </Tag>
  );
  return (
    <div className={wrapperClassName}>
      {label && (
        <label htmlFor={id} className="as-label mb-1 block text-ink/70">
          {label}
          {required && (
            <span className="text-gold-deep" aria-hidden="true">
              {' '}*
            </span>
          )}
        </label>
      )}
      {as === 'select' ? (
        <div className="relative">
          {control}
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/60"
          />
        </div>
      ) : (
        control
      )}
      {hint && <p className="mt-2 text-[0.8125rem] leading-relaxed text-mocha">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Klauzula informacyjna RODO pod formularzem (art. 13).              */
/*  Renderuje się dopiero, gdy klient uzupełni LEGAL w site.js —       */
/*  bez danych administratora nie udajemy klauzuli.                    */
/* ------------------------------------------------------------------ */

export function FormNotice({ tone = 'dark', className }) {
  const t = useContent(common);
  const { LEGAL } = useSite();
  if (!LEGAL.company || !LEGAL.privacyPolicy) return null;
  const onDark = tone === 'light';
  return (
    <p className={cn('text-[0.8125rem] leading-relaxed', onDark ? 'text-cream-100/80' : 'text-mocha', className)}>
      {t.noticeController} {LEGAL.company}. {t.noticePurpose}{' '}
      <Link href="/polityka-prywatnosci" className="underline underline-offset-2 hover:text-ink">
        {t.privacy}
      </Link>
      . {t.requiredLegend}
    </p>
  );
}

/* Legenda pól wymaganych — gdy klauzula jeszcze się nie renderuje. */
export function RequiredLegend({ className }) {
  const t = useContent(common);
  return <p className={cn('text-[0.8125rem] text-mocha', className)}>{t.requiredLegend}</p>;
}

/* ------------------------------------------------------------------ */
/*  FAQ — jeden akordeon dla całego serwisu                            */
/* ------------------------------------------------------------------ */

export function Faq({ items, className }) {
  return (
    <Accordion type="single" collapsible className={cn('w-full border-t border-ink/10', className)}>
      {items.map((item, i) => (
        <AccordionItem key={item.q || i} value={`faq-${i}`}>
          <AccordionTrigger>{item.q}</AccordionTrigger>
          <AccordionContent>{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

/* ------------------------------------------------------------------ */
/*  Pas „statement" — jeden wielki portret na całą szerokość i jedno   */
/*  zdanie. Moment strony; jeden na trasę.                             */
/* ------------------------------------------------------------------ */

export function Statement({
  image,
  alt,
  position = '50% 20%',
  number,
  label,
  title,
  titleAccent,
  lead,
  cta,
  align = 'left',
  className,
}) {
  const right = align === 'right';
  return (
    <section
      className={cn(
        'relative flex min-h-[80svh] items-end overflow-hidden bg-espresso-900 text-cream-50 lg:min-h-[70svh]',
        className
      )}
    >
      {/* od lg portret zajmuje połowę pasa (kadr ≈ 1:1 — cała głowa i dłonie, bez powiększania
          pliku 2:3 do pasa 2:1), a lewą krawędź wygasza maska; poniżej lg pełny spad */}
      <Figure
        image={image}
        alt={alt}
        position={position}
        tone="dark"
        zoom={false}
        fill
        className={cn(
          right
            ? 'lg:right-auto lg:w-[52%] lg:max-w-[50rem] lg:[-webkit-mask-image:linear-gradient(to_left,transparent,#000_28%)] lg:[mask-image:linear-gradient(to_left,transparent,#000_28%)]'
            : 'lg:left-auto lg:w-[52%] lg:max-w-[50rem] lg:[-webkit-mask-image:linear-gradient(to_right,transparent,#000_28%)] lg:[mask-image:linear-gradient(to_right,transparent,#000_28%)]'
        )}
        sizes="(min-width: 1540px) 800px, (min-width: 1024px) 52vw, 100vw"
      />
      {/* gradient: czytelny tekst po stronie treści, portret oddycha po drugiej */}
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 hidden lg:block',
          right
            ? 'bg-gradient-to-l from-espresso-900/85 via-espresso-900/40 to-transparent'
            : 'bg-gradient-to-r from-espresso-900/85 via-espresso-900/40 to-transparent'
        )}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-espresso-900/90 via-espresso-900/55 to-transparent lg:h-40 lg:from-espresso-900/70 lg:via-transparent"
      />
      <div className="as-shell relative w-full pb-16 pt-40 lg:pb-24 lg:pt-56">
        <Reveal className={cn('max-w-xl lg:max-w-[44%]', right && 'ml-auto')}>
          {label && (
            <SectionLabel number={number} tone="light">
              {label}
            </SectionLabel>
          )}
          <h2 className="as-display-lg as-text-balance mt-6">
            {title}
            {titleAccent && (
              <>
                {' '}
                <span className="italic text-gold-light">{titleAccent}</span>
              </>
            )}
          </h2>
          {lead && <p className="as-body-invert mt-6 max-w-md">{lead}</p>}
          {cta && (
            <ArrowLink href={cta.href} tone="light" className="mt-8 w-fit">
              {cta.label}
            </ArrowLink>
          )}
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Pasek efektów — makra brwi/ust w kontrolowanej formie: małe,       */
/*  jednolite kadry, hairline, bez mgiełki. Jedyne miejsce dla makr.   */
/* ------------------------------------------------------------------ */

export function ResultStrip({ items, tone = 'dark', ratio = '1 / 1', cols = 6, caption, className }) {
  /* tone = ton SEKCJI, w której stoi pasek: 'dark' (espresso/mocha) albo 'light' (krem) */
  const onDark = tone === 'dark';
  const grid = { 3: 'grid-cols-3', 4: 'grid-cols-2 sm:grid-cols-4', 5: 'grid-cols-3 md:grid-cols-5', 6: 'grid-cols-3 md:grid-cols-6' }[cols] || 'grid-cols-3 md:grid-cols-6';
  return (
    <div className={className}>
      <ul className={cn('as-photo-frame grid gap-1', grid)}>
        {items.map((it, i) => (
          <li key={(it.image && it.image.src) || i}>
            <Figure
              image={it.image}
              alt={it.alt}
              ratio={ratio}
              position={it.position || '50% 45%'}
              tone={onDark ? 'dark' : 'light'}
              zoom={false}
              sizes="(min-width: 768px) 22vw, 45vw"
            />
            {it.caption && (
              <p className={cn('mt-2 px-1 pb-1', onDark ? 'as-caption-invert' : 'as-caption')}>{it.caption}</p>
            )}
          </li>
        ))}
      </ul>
      {caption && <p className={cn('mt-3', onDark ? 'as-caption-invert' : 'as-caption')}>{caption}</p>}
    </div>
  );
}
