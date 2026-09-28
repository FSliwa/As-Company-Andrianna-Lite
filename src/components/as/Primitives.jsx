'use client';

/**
 * Wspólne elementy systemu wizualnego AS COMPANY.
 * Wszystkie podstrony budujemy z tych klocków, żeby styl był spójny.
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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
 *  - tone      "dark" w sekcjach espresso/mocha (ciemniejszy, mniej nasycony),
 *              "light" w sekcjach kremowych (odsycony, jaśniejszy, z kremową
 *              mgłą) — w obu przypadkach po to, żeby zdjęcie siedziało w tle
 *              zamiast na nim świecić (jak w makiecie); domyślnie bez korekty
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
  tone = 'none',
}) {
  if (!image) return null;
  const srcSet = buildSrcSet(image.webp);
  return (
    <div className={cn(framed && 'as-frame', className)}>
      <div
        className={cn(
          'as-media',
          zoom && 'as-media-zoom',
          tone === 'dark' && 'as-media-dark',
          tone === 'light' && 'as-media-light'
        )}
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
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-baseline gap-3">
        <span className="as-num text-lg sm:text-xl">{number}</span>
        <h3 className={cn('as-numbered-title', isLight ? 'text-cream-50' : 'text-ink')}>{title}</h3>
      </div>
      <p className={cn('as-numbered-desc', isLight ? 'text-cream-200/75' : 'text-mocha')}>{children}</p>
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
  imageTone,
  imagePosition,
  facts,
  tone = 'cream',
  children,
}) {
  const isDark = tone !== 'cream';
  return (
    <section
      className={cn(
        'relative overflow-hidden pb-12 pt-24 sm:pt-28 lg:pb-16 lg:pt-32',
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
                  <span className={cn('italic', isDark ? 'text-gold-light' : 'text-gold-dark')}>
                    {titleAccent}
                  </span>
                </>
              )}
            </h1>
            {lead && (
              <p className={cn('mt-6 max-w-xl', isDark ? 'as-body-invert' : 'as-body')}>{lead}</p>
            )}
            {children && <div className="mt-8">{children}</div>}
            {/* pasek faktów — jedno miejsce i jeden odstęp na każdej podstronie */}
            {facts && facts.length > 0 && (
              <FactStrip
                items={facts}
                tone={isDark ? 'light' : 'dark'}
                className={cn('mt-10 border-t pt-6', isDark ? 'border-cream-200/15' : 'border-ink/10')}
              />
            )}
          </div>

          {image && (
            <div className="lg:col-span-5">
              <Figure
                image={image}
                alt={imageAlt || title}
                ratio="4 / 5"
                position={imagePosition}
                tone={imageTone}
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
        'flex items-baseline gap-4 border-b py-5 first:border-t',
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
          <span className={cn('as-label', isLight ? 'text-cream-200/70' : 'text-ink/55')}>
            {item}
          </span>
          {i < items.length - 1 && (
            <span className={cn('as-label', isLight ? 'text-cream-200/30' : 'text-ink/25')}>/</span>
          )}
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

export function Stat({ value, label, tone = 'dark', className }) {
  const isLight = tone === 'light';
  return (
    <div className={cn('as-card-col', className)}>
      <p className={cn('as-display-md', isLight ? 'text-gold-light' : 'text-gold-dark')}>{value}</p>
      <p className={cn('mt-2', isLight ? 'as-caption-invert' : 'as-caption')}>{label}</p>
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
  label = 'Kontakt',
  title,
  titleAccent,
  lead,
  primary,
  secondary,
  photos,
  aside,
  children,
  className,
}) {
  const side = photos && photos.length > 0 ? <ClosingPhotos photos={photos} /> : aside;
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
    <section className={cn('as-section relative overflow-hidden bg-espresso-900 text-cream-50', className)}>
      <GoldArc className="-bottom-52 right-[-8%] h-[640px] w-[820px]" opacity={0.22} />
      <div className="as-shell relative">
        {/* etykieta siedzi w kolumnie tekstu — przy wysokim kadrze obok
            zawsze zostaje 24 px nad tytułem, a kolumna centruje się do kadru */}
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <Reveal className={side ? 'lg:col-span-7' : 'lg:col-span-8'}>
            <SectionLabel number={number} tone="light">
              {label}
            </SectionLabel>
            <h2 className="as-display-section as-text-balance mt-6">
              {title}
              {titleAccent && (
                <>
                  {' '}
                  <span className="italic text-gold-light">{titleAccent}</span>
                </>
              )}
            </h2>
            {lead && <p className="as-body-invert mt-6 max-w-lg">{lead}</p>}
            {(primary || secondary) && (
              <div className="mt-8 flex flex-wrap gap-4">
                {button(primary, 'as-btn-gold')}
                {button(secondary, 'as-btn-ghost-light')}
              </div>
            )}
          </Reveal>

          {side && (
            <Reveal delay={90} className="lg:col-span-5">
              {side}
            </Reveal>
          )}
        </div>

        {children}
      </div>
    </section>
  );
}

/* Jedna forma kadrów w pasie zamykającym: para 3/4, druga przesunięta w dół. */
function ClosingPhotos({ photos }) {
  if (photos.length === 1) {
    const ph = photos[0];
    return (
      <Figure
        image={ph.image}
        alt={ph.alt}
        ratio="4 / 5"
        position={ph.position}
        tone="dark"
        framed
        sizes="(min-width: 1024px) 36vw, 100vw"
      />
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      {photos.slice(0, 2).map((ph, i) => (
        <Figure
          key={ph.alt || i}
          image={ph.image}
          alt={ph.alt}
          ratio="3 / 4"
          position={ph.position}
          tone="dark"
          className={i === 1 ? 'mt-10' : undefined}
          sizes="(min-width: 1024px) 20vw, 45vw"
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pole formularza: etykieta w kapitalikach + linia pod polem         */
/*  (input / textarea / select). Jedna klasa dla całego serwisu.       */
/* ------------------------------------------------------------------ */

export const FIELD_CLASS =
  'block h-12 w-full rounded-none border-0 border-b border-ink/15 bg-transparent px-0 text-[0.9375rem] text-ink shadow-none outline-none transition-colors placeholder:text-mocha-400/70 focus:border-gold-dark focus-visible:ring-0';

export function Field({ as = 'input', label, id, hint, className, wrapperClassName, children, ...rest }) {
  const Tag = as;
  const control = (
    <Tag
      id={id}
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
        <label htmlFor={id} className="as-label mb-1 block text-ink/55">
          {label}
        </label>
      )}
      {as === 'select' ? (
        <div className="relative">
          {control}
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/50"
          />
        </div>
      ) : (
        control
      )}
      {hint && <p className="mt-2 text-xs leading-relaxed text-mocha-400">{hint}</p>}
    </div>
  );
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
