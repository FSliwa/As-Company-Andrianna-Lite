'use client';

/**
 * Wspólne elementy systemu wizualnego AS COMPANY.
 * Wszystkie podstrony budujemy z tych klocków, żeby styl był spójny.
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Etykieta sekcji:  „02  /  O NAS  ———————”                          */
/* ------------------------------------------------------------------ */

export function SectionLabel({ number, children, tone = 'dark', className }) {
  const isLight = tone === 'light';
  return (
    <div className={cn('flex items-center gap-4', className)}>
      {number && (
        <span className={cn('as-label', isLight ? 'text-gold-light' : 'text-gold-dark')}>
          {number}
        </span>
      )}
      {number && (
        <span className={cn('as-label', isLight ? 'text-cream-200/40' : 'text-ink/30')}>/</span>
      )}
      <span className={cn('as-label', isLight ? 'text-cream-100' : 'text-ink/75')}>{children}</span>
      <span
        className={cn(
          'hidden h-px w-16 sm:block lg:w-28',
          isLight ? 'bg-cream-200/25' : 'bg-ink/15'
        )}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Link ze strzałką                                                    */
/* ------------------------------------------------------------------ */

export function ArrowLink({ href = '#', children, tone = 'dark', className, ...rest }) {
  const classes = cn('group', tone === 'light' ? 'as-arrow-light' : 'as-arrow-dark', className);
  const inner = (
    <>
      <span>{children}</span>
      <span className="as-arrow-glyph" aria-hidden="true">
        &#8594;
      </span>
    </>
  );

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
 *  - tone      "light" (domyślnie) albo "dark" — w ciemnych sekcjach zdjęcie
 *              dostaje przez CSS ciemniejszy, mniej nasycony ton, żeby siedziało
 *              w tle zamiast na nim świecić (jak w makiecie)
 *  - sizes     atrybut sizes; bez niego przeglądarka zakłada 100vw i pobiera
 *              największy wariant
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
  tone = 'light',
}) {
  if (!image) return null;
  const srcSet = buildSrcSet(image.webp);
  return (
    <div className={cn(framed && 'as-frame', className)}>
      <div
        className={cn('as-media', zoom && 'as-media-zoom', tone === 'dark' && 'as-media-dark')}
        style={{ aspectRatio: ratio }}
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
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center gap-4">
        <span className="as-num">{number}</span>
        <span className={cn('h-px w-10', isLight ? 'bg-cream-200/25' : 'bg-ink/15')} />
      </div>
      <h3
        className={cn(
          'as-display-sm italic',
          isLight ? 'text-cream-50' : 'text-ink'
        )}
      >
        {title}
      </h3>
      <p className={cn('max-w-xs', isLight ? 'as-body-invert' : 'as-body')}>{children}</p>
      {href && (
        <ArrowLink href={href} tone={tone} className="mt-1 self-start border-b-0 pb-0">
          <span className="sr-only">Przejdź: {title}</span>
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
      return r.top < window.innerHeight * 1.05 && r.bottom > -window.innerHeight * 0.25;
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
      { rootMargin: '0px 0px -8% 0px', threshold: 0.01 }
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
        'transition-[opacity,transform] duration-900 ease-as motion-reduce:transition-none',
        hidden ? 'translate-y-6 opacity-0' : 'translate-y-0 opacity-100',
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
  tone = 'cream',
  children,
}) {
  const isDark = tone !== 'cream';
  return (
    <section
      className={cn(
        'relative overflow-hidden pb-16 pt-28 sm:pb-24 sm:pt-36 lg:pb-32 lg:pt-44',
        isDark ? 'bg-espresso text-cream-50' : 'bg-cream-50 text-ink'
      )}
    >
      <GoldArc
        className="-top-24 right-[-10%] h-[560px] w-[760px]"
        opacity={isDark ? 0.28 : 0.3}
      />
      <div className="as-shell relative">
        <SectionLabel number={number} tone={isDark ? 'light' : 'dark'}>
          {label}
        </SectionLabel>

        <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-7">
            <h1 className="as-display-lg as-text-balance">
              {title}
              {titleAccent && (
                <>
                  {' '}
                  <span className="italic text-gold-dark">{titleAccent}</span>
                </>
              )}
            </h1>
            {lead && (
              <p className={cn('mt-8 max-w-xl', isDark ? 'as-body-invert' : 'as-body')}>{lead}</p>
            )}
            {children && <div className="mt-10">{children}</div>}
          </div>

          {image && (
            <div className="lg:col-span-5">
              <Figure
                image={image}
                alt={imageAlt || title}
                ratio="4 / 5"
                framed
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
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
        'flex items-baseline gap-4 border-b py-5',
        isLight ? 'border-cream-200/15' : 'border-ink/10'
      )}
    >
      <div className="min-w-0 flex-1">
        <span className={cn('block text-base', isLight ? 'text-cream-50' : 'text-ink')}>{name}</span>
        {note && (
          <span
            className={cn(
              'mt-1 block text-xs leading-relaxed',
              isLight ? 'text-cream-200/55' : 'text-mocha-400'
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
          'whitespace-nowrap font-display text-lg sm:text-xl',
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
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-5 gap-y-3', className)}>
      {items.map((item, i) => (
        <li key={item} className="flex items-center gap-5">
          {i > 0 && (
            <span className={cn('as-label', isLight ? 'text-cream-200/30' : 'text-ink/25')}>/</span>
          )}
          <span className={cn('as-label', isLight ? 'text-cream-200/70' : 'text-ink/55')}>
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}
