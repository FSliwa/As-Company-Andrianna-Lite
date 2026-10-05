'use client';

/**
 * Wspólne elementy systemu wizualnego serwisu (Babushkina Academy).
 * Wszystkie podstrony budujemy z tych klocków, żeby styl był spójny.
 * Wersje językowe: linki wewnętrzne przez LocaleLink (polska ścieżka → adres
 * bieżącego języka), napisy własne prymitywów z src/content/common.
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from '@/components/as/LocaleLink';
import { ChevronDown } from 'lucide-react';
import { cn, groupPrice, nbspShort } from '@/lib/utils';
import { useContent, useLocale } from '@/i18n/client';
import common from '@/content/common';
import { LEGAL_PUBLIC } from '@/lib/legal';
import LegalText from '@/components/as/LegalText';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/* ------------------------------------------------------------------ */
/*  Etykieta sekcji:  „02  /  O NAS  –––––––”                          */
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
        <span aria-hidden="true" className={cn('as-label', isLight ? 'text-cream-200/40' : 'text-ink/30')}>
          /
        </span>
      )}
      <span className={cn('as-label', isLight ? 'text-cream-100/85' : 'text-ink/70')}>{children}</span>
      {/* linia ozdobna wypełnia tylko wolne miejsce (podstawa 0, maks. 64/112 px): w wąskiej
          kolumnie ustępuje etykiecie – przy stałej szerokości kurczyła się razem z tekstem,
          a etykieta łamała się na 2 linie („03 / JAK / OTRZYMAĆ” w kolumnie 4/12 przy 1024 px) */}
      {/* Propozycja T5: linia w złocie, rysowana przy wejściu sekcji w kadr (as-label-rule,
          index.css: CSS scroll-driven animation, bez JS); przy prefers-reduced-motion
          i w przeglądarkach bez animation-timeline pełna od razu. */}
      {line && (
        <span
          aria-hidden="true"
          className={cn(
            'as-label-rule hidden h-px min-w-0 flex-1 sm:block max-w-16 lg:max-w-28',
            isLight ? 'bg-gold-light/45' : 'bg-gold-dark/45'
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

  /* akcja (np. otwarcie dialogu) – ten sam wygląd, semantyka przycisku */
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
/*  Kadr ze zdjęciem – zawsze z /graphics, zawsze z wymiarami          */
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
 *  - position  object-position, np. "50% 30%" – gdzie ma być środek ciężkości
 *              przy przycinaniu; domyślnie środek
 *  - tone      "dark" w sekcjach espresso/mocha (lekko przygaszony),
 *              "light" w sekcjach kremowych (lekko odsycony, bez mgiełki) –
 *              makra, panele, akademia; portrety STUDIO bez tonu (domyślnie)
 *  - sizes     atrybut sizes; bez niego przeglądarka zakłada 100vw i pobiera
 *              największy wariant
 *  - fill      kadr wypełnia rodzica (absolute inset-0, bez aspect-ratio) –
 *              dla pasów pełnej szerokości (Statement)
 *  - bleed     'start' | 'end' – jak fill (wysokość z rodzica z aspect-ratio), ale kadr
 *              wychodzi poza łam do krawędzi ekranu: na telefonie w obie strony, od md
 *              po swojej stronie (.as-bleed-start / .as-bleed-end w index.css); sekcja
 *              potrzebuje overflow-hidden
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
  bleed,
}) {
  if (!image) return null;
  const srcSet = buildSrcSet(image.webp);
  const filled = fill || Boolean(bleed);
  return (
    <div
      className={cn(
        framed && 'as-frame',
        fill && !bleed && 'absolute inset-0',
        bleed && cn('absolute inset-y-0', bleed === 'end' ? 'as-bleed-end' : 'as-bleed-start'),
        className
      )}
    >
      <div
        className={cn(
          'as-media',
          filled && 'h-full w-full',
          zoom && 'as-media-zoom',
          tone === 'dark' && 'as-media-dark',
          tone === 'light' && 'as-media-light',
          tone === 'academy' && 'as-media-academy'
        )}
        style={filled ? undefined : { aspectRatio: ratio }}
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

/* tone = ton TEKSTU jak w całym pliku: 'dark' na kremie (numer gold-deep),
   'light' na ciemnym tle (numer gold-light). Numer 24 px (.as-num), tytuł 22/24 px. */
export function NumberedItem({ number, title, children, href, tone = 'dark', className }) {
  const isLight = tone === 'light';
  const t = useContent(common);
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-baseline gap-3">
        <span className={isLight ? 'as-num-invert' : 'as-num'}>{number}</span>
        <h3 className={cn('as-numbered-title', isLight ? 'text-cream-50' : 'text-ink')}>{nbspShort(title)}</h3>
      </div>
      <p className={cn('as-numbered-desc', isLight ? 'text-cream-200/75' : 'text-mocha')}>{nbspShort(children)}</p>
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

/* variant:
 *  - 'arc' (domyślny) – dawna krzywa z makiety; kończy się na krawędziach
 *    viewBox, więc pudełko SVG musi sięgać poza sekcję, inaczej łuk urywa się
 *    w powietrzu.
 *  - 'corner' – łuk narożny: wchodzi prawą krawędzią pudełka, wychodzi górną
 *    (oba końce poza viewBox, overflow widoczny – tnie go dopiero krawędź sekcji
 *    z overflow-hidden). Stawiać w prawym górnym rogu sekcji, w pustym polu obok
 *    tekstu: right-0 top-0 i szerokość = wolne miejsce na prawo od nagłówka.
 *    Łuk nigdy nie przecina tekstu – poniżej szerokości, na której jest na to
 *    miejsce, ukrywać go (np. hidden xl:block). */
const ARC_PATHS = {
  arc: 'M-40 600C-40 600 40 210 300 90C520 -12 760 40 840 150',
  corner: 'M860 560C760 300 560 60 120 -60',
};

export function GoldArc({ className, flip = false, opacity = 0.35, variant = 'arc' }) {
  return (
    <svg
      viewBox="0 0 800 600"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
      overflow={variant === 'corner' ? 'visible' : undefined}
      className={cn('pointer-events-none absolute', flip && 'scale-x-[-1]', className)}
    >
      <path
        d={ARC_PATHS[variant] || ARC_PATHS.arc}
        stroke="#B89768"
        strokeOpacity={opacity}
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Krzyżyki narożne – subtelna „siatka konstrukcyjna” z makiety       */
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

/* Na serwerze nie ma useLayoutEffect – podmieniamy, żeby nie sypać ostrzeżeniami. */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Pojawianie się przy przewijaniu.
 *
 * Bez wygaszania do zera: element „w drodze” ma krycie 0,6 i jest przesunięty
 * o 12 px, więc po skoku (wstecz, pasek przewijania, Ctrl+F, kotwica) kadr nie
 * jest pusty. Czas 400 ms, opóźnienie najwyżej 60 ms.
 *
 * WAŻNE: treść startuje WIDOCZNA. Ukrywamy ją dopiero w useLayoutEffect,
 * czyli już po stronie przeglądarki i jeszcze przed pierwszym malowaniem –
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

    // Element jest już w kadrze – zostaw widoczny, nie ma czego animować.
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
        'transition-[opacity,transform] [transition-duration:400ms] ease-as motion-reduce:transition-none',
        hidden ? 'translate-y-3 opacity-60' : 'translate-y-0 opacity-100',
        className
      )}
      style={{ transitionDelay: hidden ? '0ms' : `${Math.min(delay, 60)}ms` }}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/*  Nagłówek podstrony – wspólny dla wszystkich stron poza główną      */
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
  statsLayout = 'row',
  variant,
  imageSide = 'right',
  children,
}) {
  /* variant: 'cover' (domyślny, gdy jest zdjęcie) – zdjęcie na tle jak hero strony
     głównej (opis przy wariancie niżej); 'band' – pas espresso bez zdjęcia, H1 na całą
     szerokość łamu + rząd Stat (trasy bez packshotów: /maszynki, /pigmenty, /certyfikaty,
     /pakiety).
     Odstępy pasa rosną z wysokością ekranu (clamp, svh) – ok. 100/70 px na telefonie,
     do 128/80 px na wysokim ekranie, 40–48 px w telefonie w poziomie (przycisk w pierwszym
     ekranie) – bez progów short:/short:sm:, których kolejność w CSS była krucha.
     statsLayout: 'row' – 3 liczby w rzędzie; 'list' – poniżej sm liczby jako lista
     „wartość | podpis” (długie podpisy, np. /maszynki), od sm rząd jak 'row'. */
  const kind = variant || (image ? 'cover' : 'band');
  /* pas – zawsze espresso; okładka ze zdjęciem – zawsze jasna (krem + ink) */
  const isDark = kind === 'band';

  /* Telefon w poziomie (short:): lead stoi POD przyciskami (short:order-last) – w niskim
     oknie długi lead w wąskiej kolumnie spychał główny przycisk pod pierwszy ekran. Okładka
     ze zdjęciem na niskim telefonie w pionie (low:, < 720 px) – to samo: treść zaczyna się
     niżej (pod twarzą), więc lead schodzi pod przyciski. */
  const heading = (
    <div className="flex flex-col [container-type:inline-size]">
      <SectionLabel number={number} tone={isDark ? 'light' : 'dark'}>
        {label}
      </SectionLabel>
      {/* okładka od 1440 px w poziomie: H1 maks. 94 px (nie 104) – kolumna ma stałe 717 px,
          a przy 104 px tytuły łamały się o linię więcej („Zabiegi / makijażu / permanentnego.”,
          samotne „oparte” na /szkolenia); do ok. 1540 px rozmiar bez zmian (6,1vw) */}
      <h1
        className={cn(
          'as-display-lg as-display-fit as-text-balance mt-6 short:mt-4 short:text-[2.75rem]',
          isDark ? 'text-cream-100' : 'text-ink'
        )}
      >
        {nbspShort(title)}
        {titleAccent && (
          <>
            {' '}
            <span className={cn('italic', isDark ? 'text-gold-light' : 'text-gold-dark')}>{nbspShort(titleAccent)}</span>
          </>
        )}
      </h1>
      {lead && (
        <p className={cn('mt-6 short:order-last short:mt-4', !isDark && 'low:order-last low:mt-5', isDark ? 'as-body-invert' : 'as-body')}>
          {lead}
        </p>
      )}
      {children && <div className="mt-8 short:mt-5">{children}</div>}
    </div>
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
    const list = statsLayout === 'list';
    return (
      <section className="relative overflow-hidden bg-espresso text-cream-50">
        {/* Łuk narożny tylko w wolnym polu na prawo od H1 (max-w-4xl = 56 rem od
            lewego marginesu łamu): szerokość = to pole minus 2 rem. Od xl – węższe
            ekrany nie mają obok H1 miejsca i łuk przecinałby tytuł. Od 1440 px kolumna
            H1 ma 64 rem (przy H1 do 104 px w 56 rem „Karty / charakterystyki / pigmentów.”
            miało samotne „Karty”, a /pigmenty 5 linii), więc pole liczy się od 67,5 rem
            (poza łamem 1440 px: od połowy ekranu + 22,5 rem). */}
        <GoldArc
          variant="corner"
          className="right-0 top-0 hidden h-[70%] w-[calc(min(100%-59.5rem,50%-14.5rem)-2rem)] xl:block min-[1440px]:w-[calc(min(100%-67.5rem,50%-22.5rem)-2rem)]"
          opacity={0.28}
        />
        <div className="as-shell relative pb-[clamp(2.5rem,8svh,5rem)] pt-[clamp(2.5rem,12svh,8rem)]">
          <Reveal className="min-w-0 max-w-4xl min-[1440px]:max-w-[64rem]">{heading}</Reveal>
          {stats && stats.length > 0 && (
            <div
              className={cn(
                'mt-10 grid gap-3 sm:grid-cols-3 sm:gap-8 lg:mt-16 short:mt-8',
                list ? 'grid-cols-1' : 'grid-cols-3 max-[359px]:grid-cols-1 max-[359px]:gap-5'
              )}
            >
              {stats.map((st) => (
                <Stat key={st.label} value={st.value} label={st.label} tone="light" compact inline={list} />
              ))}
            </div>
          )}
          {factStrip}
        </div>
      </section>
    );
  }

  /* Wariant 'cover' – zdjęcie na tle, jak hero strony głównej (prośba klientki: „nie
     w ramce”); układ zależy od orientacji ekranu:
     · pion (telefon, tablet w pionie): zdjęcie na cały pierwszy ekran, także pod
       przezroczystym nagłówkiem (Layout: PHOTO_HERO_ROUTES), treść na dole – na kremowym
       wygaszeniu, które zaczyna się pod twarzą (42svh), więc twarz zostaje odsłonięta;
     · poziom: zdjęcie spadem od krawędzi po stronie imageSide (52%, maks. 68rem), jego
       wewnętrzna część przechodzi w krem, tekst w drugiej połowie; wysokość
       min(92svh, 60rem) – spod pierwszego ekranu wystaje już następna sekcja.
     Zawsze jasny (krem + ink); `tone` dotyczy tylko pasa. */
  const left = imageSide === 'left';
  return (
    <section className="relative mt-[calc(var(--as-header-h)*-1)] overflow-hidden bg-cream-50 text-ink">
      <div className="relative flex min-h-[100svh] flex-col justify-end land:min-h-[min(92svh,60rem)] land:justify-center">
        {image && (
          /* pion: zdjęcie dokładnie na pierwszy ekran (100svh) – nie rośnie z wyższą treścią,
             więc twarz nie zjeżdża pod etykietę i H1 (280–375 px); niżej krem sekcji.
             Od 2100 px w poziomie: zdjęcie przy krawędzi łamu (90rem), nie ekranu – na ultrawide
             między tekstem a postacią zostawało 700–1000 px pustego kremu. */
          <div
            className={cn(
              'absolute inset-0 overflow-hidden port:bottom-auto port:h-[100svh] land:w-[min(52%,68rem)] min-[2100px]:land:w-[52rem]',
              left
                ? 'land:right-auto min-[2100px]:land:left-[calc((100%-90rem)/2)]'
                : 'land:left-auto min-[2100px]:land:right-[calc((100%-90rem)/2)]'
            )}
          >
            <Figure
              fill
              image={image}
              alt={imageAlt || title}
              position={imagePosition || '50% 20%'}
              tone={imageTone}
              zoom={false}
              priority
              className="as-enter-breathe"
              sizes={PAGE_HERO_SIZES}
            />
            {/* pion: krem od dołu (pod treścią pełny), u góry pas pod nagłówkiem.
                low: (telefon < 720 px) treść zaczyna się na 36svh + 1rem, czyli ok. 38,5% od
                góry – tam było ok. 45% kremu i etykieta leżała na włosach i ramieniu; teraz
                krem 85% od 38%, pełny od 50% (od góry), podbródek (do ok. 28%) bez zmian.
                Tablet w pionie (od 600 px): treść stoi niżej (60–67% od góry), więc zdjęcie
                schodzi do etykiety – zamiast 120–300 px pustego kremu nad nią. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-cream-50 from-[44%] via-cream-50/70 via-[56%] to-transparent to-[72%] low:from-[50%] low:via-cream-50/85 low:via-[62%] min-[600px]:port:from-[34%] min-[600px]:port:via-[46%] min-[600px]:port:to-[64%] land:hidden"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-cream-50/90 via-cream-50/50 to-transparent land:hidden"
            />
            {/* poziom: wewnętrzna krawędź zdjęcia w krem, pas pod nagłówkiem, dół łagodnie */}
            <div
              aria-hidden="true"
              className={cn(
                'absolute inset-0 hidden from-cream-50 via-cream-50/55 via-[24%] to-transparent to-[52%] land:block',
                left ? 'bg-gradient-to-l' : 'bg-gradient-to-r'
              )}
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 hidden h-32 bg-gradient-to-b from-cream-50/80 to-transparent land:block"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 hidden h-1/4 bg-gradient-to-t from-cream-50/70 to-transparent land:block"
            />
            {/* od 2100 px: zewnętrzna krawędź zdjęcia (w łamie) też przechodzi w krem */}
            <div
              aria-hidden="true"
              className={cn(
                'absolute inset-0 hidden from-cream-50 via-cream-50/55 via-[12%] to-transparent to-[26%] min-[2100px]:land:block',
                left ? 'bg-gradient-to-r' : 'bg-gradient-to-l'
              )}
            />
          </div>
        )}

        {/* odstęp górny: pion – pod twarzą (42svh), ale na niskich telefonach (Safari
            ≈ 550 px) mniej: treść do przycisków ≈ 360 px (tytuł w 3 liniach przy 320 px)
            + dół = 25,5rem, więc główny przycisk zostaje w pierwszym ekranie; poziom –
            wysokość nagłówka + zapas zależny od wysokości ekranu (w telefonie w poziomie
            ok. 8 px – tam liczy się każdy piksel) */}
        <div className="as-shell relative z-10 pb-[clamp(2.5rem,7svh,4rem)] pt-[min(42svh,calc(100svh-25.5rem))] low:pt-[calc(36svh+1rem)] land:pt-[calc(var(--as-header-h)+clamp(0.5rem,6svh-1rem,4rem))]">
          {/* kolumna tekstu w poziomie: 46% (maks. 38rem); w telefonie w poziomie 60% – w niskim
              oknie tytuł w wąskiej kolumnie łamał się na 4 linie i spychał przycisk */}
          <Reveal
            className={cn(
              /* od lg w poziomie szerzej (54%, maks. 46rem): przy 46% H1 łamał się na 4 linie
                 z samotnym „oparte” (1024–1536 px) */
              'min-w-0 land:max-w-[min(46%,38rem)] short:land:max-w-[60%] lg:land:max-w-[min(54%,46rem)]',
              left && 'land:ml-auto'
            )}
          >
            {heading}
            {factStrip}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* Szerokość RYSOWANEGO zdjęcia w PageHero 'cover' (object-fit: cover), nie kadru:
   pion – cały ekran (węższy niż 2:3 → 2/3 wysokości); poziom – kadr min(52vw, 68rem)
   × min(92vh, 60rem), przy proporcji ekranu < 6:5 rysunek wyznacza wysokość. */
const PAGE_HERO_SIZES =
  '(orientation: portrait) and (max-aspect-ratio: 2/3) 67vh, (orientation: portrait) 100vw, ' +
  '(max-aspect-ratio: 6/5) 62vh, (min-width: 2100px) 832px, 52vw';

/* ------------------------------------------------------------------ */
/*  Wiersz cennika                                                      */
/* ------------------------------------------------------------------ */

/* Wiersz: nazwa · kropki od końca nazwy do ceny · cena (Bodoni 22 px, kolor
   tekstu – złoto tylko w liniach). Nota pod wierszem na całą szerokość, więc
   nie ściska nazwy i nie odsuwa kropek. priceNote – dopisek pod ceną
   (np. „netto”), w kapitalikach. tone = ton TEKSTU ('light' na ciemnym tle). */
export function PriceRow({ name, note, price, priceNote, tone = 'dark' }) {
  const isLight = tone === 'light';
  return (
    <div className={cn('border-b py-4 first:border-t sm:py-5', isLight ? 'border-cream-200/15' : 'border-ink/10')}>
      {/* poniżej 360 px wiersz może się złamać, ale tylko gdy się nie mieści: długa nazwa
          sama w pierwszej linii, kropki i cena (do prawej) w drugiej; krótkie wiersze zostają
          w jednej linii (obok ceny i kropek długa nazwa dostawała 80–110 px i 3–4 linie).
          Wariant z sesji Lite – ten sam komponent w obu wersjach. */}
      <div className="flex items-baseline gap-4 max-[359px]:flex-wrap max-[359px]:gap-y-1">
        <span className={cn('min-w-0 text-[0.9375rem] leading-[1.5] max-sm:text-[1rem] short:text-[1rem]', isLight ? 'text-cream-50' : 'text-ink')}>{name}</span>
        <span
          className={cn(
            'min-w-[1.5rem] flex-1 translate-y-[-3px] border-b border-dotted',
            isLight ? 'border-cream-200/25' : 'border-ink/20'
          )}
          aria-hidden="true"
        />
        <span className="ml-auto shrink-0 text-right">
          <span className={cn('block whitespace-nowrap font-display text-[1.375rem]/7', isLight ? 'text-cream-50' : 'text-ink')}>
            {groupPrice(price)}
          </span>
          {priceNote && (
            <span className={cn('as-label mt-1 block', isLight ? 'text-cream-100/85' : 'text-ink/65')}>{priceNote}</span>
          )}
        </span>
      </div>
      {note && (
        <p className={cn('mt-1 text-[0.8125rem] leading-relaxed', isLight ? 'text-cream-100/85' : 'text-mocha')}>{note}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pasek zaufania – drobne fakty rozdzielone ukośnikiem               */
/* ------------------------------------------------------------------ */

export function FactStrip({ items, tone = 'dark', className }) {
  const isLight = tone === 'light';
  /* Do lg bez ukośników (żaden wiersz nie zaczyna się od „/”): parzysta liczba
     faktów – siatka 2 kolumn (poniżej 360 px jedna); nieparzysta – wiersz
     z zawijaniem, żeby ostatni fakt nie został sam. Fakty wyrównane do góry.
     Od lg: jedna linia z ukośnikami. */
  const even = items.length % 2 === 0;
  return (
    <ul
      className={cn(
        even
          ? 'grid grid-cols-2 gap-x-6 gap-y-3 max-[359px]:grid-cols-1'
          : 'flex flex-wrap gap-x-4 gap-y-3 sm:gap-x-6',
        'lg:flex lg:flex-wrap lg:items-center lg:gap-x-5',
        className
      )}
    >
      {items.map((item, i) => (
        <li key={item} className="flex items-start gap-5 lg:items-center">
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
/*  Przycisk CTA – link wewnętrzny, zewnętrzny/kotwica albo <button>   */
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

/* Liczba + podpis w komórce z linią 1 px u góry (jak .as-cell) – bez pionowej
   złotej kreski. compact = rząd w pasie nagłówka (liczby ≥ 22 px na telefonie).
   inline = poniżej sm układ listy „wartość | podpis” (PageHero statsLayout="list").
   Podpisy bez automatycznego dzielenia wyrazów (dzieliło nazwy, np. „PRIN-CESS”);
   break-words zostaje, żeby długie słowo nie wyszło poza kolumnę. */
/* Znaki „×” i „+” w wartościach (5×, 100+) mają w Bodoni Moda przy automatycznym rozmiarze
   optycznym (opsz = rozmiar pisma, 46–64 px) same włoskowe kreski – przy dpr 1 prawie znikały
   na espresso i „5×” czytało się jak „5”. Sam znak dostaje opsz 18 (grubsza kreska); cyfry bez
   zmian. Tekst i kolejność czytania bez zmian (zwykły <span>). */
function statValue(value) {
  if (typeof value !== 'string' || !/[+×]/.test(value)) return value;
  return value.split(/([+×])/).map((part, i) =>
    part === '+' || part === '×' ? (
      <span key={i} className="[font-variation-settings:'opsz'_18]">
        {part}
      </span>
    ) : (
      part
    )
  );
}

export function Stat({ value, label, tone = 'dark', compact = false, inline = false, className }) {
  const isLight = tone === 'light';
  const locale = useLocale();
  return (
    <div
      className={cn(
        'border-t',
        isLight ? 'border-cream-200/15' : 'border-ink/15',
        compact ? 'pt-4' : 'h-full pr-5 pt-6',
        /* poniżej 360 px węższa kolumna wartości (5,5 rem): przy 7,5 rem podpis dostawał
           104 px i 6 linii (280 px) */
        inline &&
          'max-sm:grid max-sm:grid-cols-[minmax(7.5rem,auto)_1fr] max-sm:items-baseline max-sm:gap-x-4 max-sm:py-3 max-[359px]:grid-cols-[minmax(5.5rem,auto)_1fr] max-[359px]:gap-x-3',
        className
      )}
    >
      <p
        className={cn(
          compact
            ? 'as-display text-[clamp(1.375rem,5.8vw,1.625rem)] leading-none [overflow-wrap:anywhere] sm:text-[2.25rem] lg:text-[clamp(2.5rem,4.4vw,4rem)]'
            : 'as-display-md leading-none',
          inline && 'max-sm:whitespace-nowrap max-sm:[overflow-wrap:normal]',
          isLight ? 'text-cream-100' : 'text-ink'
        )}
      >
        {statValue(value)}
      </p>
      <p
        className={cn('mt-3 hyphens-manual break-words', inline && 'max-sm:mt-0', isLight ? 'as-caption-invert' : 'as-caption')}
        lang={locale}
      >
        {/* twarde spacje po jednoliterowych spójnikach („odcienie w / katalogu”) */}
        {nbspShort(label)}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pas zamykający stronę – jeden na każdej trasie, ten sam układ:     */
/*  tło espresso, etykieta z numerem i h2 w skali sekcji po lewej,     */
/*  lead + para przycisków (kremowy + ghost-light) po prawej (od lg).  */
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
  /* Pas zamykający + stopka = jeden ciemny blok (espresso → espresso-900). Bez
     portretów – założycielka nie może występować w każdym zakończeniu strony.
     Od lg rozkładówka 6 | 5 kolumn: nagłówek po lewej, lead i przyciski po
     prawej, wyrównane do dołu – bez pustej prawej połowy pasa. Z `aside`
     prawa kolumna to aside (lead i przyciski zostają pod nagłówkiem).
     Telefon: przyciski jeden pod drugim na całą szerokość (równa krawędź).
     Odstępy 56/80 px jak sekcje. Etykieta domyślna („Kontakt”) – w języku strony. */
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
  const head = (
    <>
      <SectionLabel number={number} tone="light">
        {label === undefined ? t.closingLabel : label}
      </SectionLabel>
      <h2 className="as-display-section as-text-balance mt-6 text-cream-100">
        {nbspShort(title)}
        {titleAccent && (
          <>
            {' '}
            <span className="italic text-gold-light">{nbspShort(titleAccent)}</span>
          </>
        )}
      </h2>
    </>
  );
  const body = (
    <>
      {lead && <p className="as-body-invert">{nbspShort(lead)}</p>}
      {/* przyciski na całą szerokość tylko na telefonie w pionie (< 480 px) – przy 568–639 px
          robiły się z nich dwa paski po 530 px jeden pod drugim */}
      {/* poniżej 480 px (przyciski na całą szerokość) napis może się złamać, a odstęp boczny
          jest mniejszy: „ZOBACZ MASZYNKĘ AS PRINCESS” bez łamania miał 283 px przy łamie
          240 px (280 px) i wychodził poza ekran */}
      {(primary || secondary) && (
        <div className={cn('grid gap-3 min-[480px]:flex min-[480px]:flex-wrap min-[480px]:gap-4', lead && 'mt-8')}>
          {button(primary, 'as-btn-invert max-[479px]:whitespace-normal max-[479px]:px-5 max-[479px]:text-center')}
          {button(secondary, 'as-btn-ghost-light max-[479px]:whitespace-normal max-[479px]:px-5 max-[479px]:text-center')}
        </div>
      )}
    </>
  );
  const hasBody = Boolean(lead || primary || secondary);
  return (
    <section data-sticky-hide className={cn('relative overflow-hidden bg-espresso text-cream-50', className)}>
      <div className="as-shell relative py-14 lg:py-20">
        {/* do lg jedna kolumna minmax(0,1fr) – niejawna kolumna auto rosła do szerokości
            najdłuższego przycisku (nowrap) i wypychała H2 i lead poza łam przy 280–320 px;
            od lg odstęp 40 px, od xl 64 px – przy 1024 px w kolumnie 5/12 (342 px) przyciski
            nie mieściły się w jednym rzędzie */}
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-12 lg:items-end lg:gap-10 xl:gap-16">
          {aside ? (
            <>
              <Reveal className="lg:col-span-7">
                {head}
                {hasBody && <div className="mt-6">{body}</div>}
              </Reveal>
              <Reveal delay={60} className="lg:col-span-4 lg:col-start-9">
                {aside}
              </Reveal>
            </>
          ) : (
            <>
              <Reveal className="lg:col-span-6">{head}</Reveal>
              {hasBody && (
                <Reveal delay={60} className="lg:col-span-5 lg:col-start-8">
                  {body}
                </Reveal>
              )}
            </>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Wiersz indeksu: numerał 64 | tytuł 28 + opis | meta/cena | link    */
/*  (produkty na home, zabiegi na /uslugi)                             */
/* ------------------------------------------------------------------ */

export function IndexRow({ number, title, desc, meta, href, cta, tone = 'dark', className, children }) {
  const onDark = tone === 'light';
  return (
    <div
      className={cn(
        /* telefon: numerał | tytuł w jednym rzędzie (bez osobnego wiersza na numer); trzy kolumny
           (z linkiem po prawej) od xl – przy 1024–1279 px w kolumnie 7/12 na tytuł i opis zostawało
           ok. 200 px („Certyfikaty i / jakość”), więc link schodzi pod opis jak na tablecie */
        'grid grid-cols-[3.5rem_1fr] gap-4 border-t py-8 sm:grid-cols-[5rem_1fr] xl:grid-cols-[6rem_1fr_auto] xl:items-baseline xl:gap-8',
        onDark ? 'border-cream-200/15' : 'border-ink/15',
        className
      )}
    >
      <span className={cn('as-display-md leading-none', onDark ? 'text-gold-light' : 'text-gold-dark')}>{number}</span>
      <div>
        <h3 className={cn('as-title', onDark ? 'text-cream-100' : 'text-ink')}>{title}</h3>
        {desc && <p className={cn('mt-3 max-w-[34rem] text-[0.9375rem] leading-[1.65] max-sm:text-[1rem] short:text-[1rem]', onDark ? 'text-cream-200/85' : 'text-ink/75')}>{nbspShort(desc)}</p>}
        {children}
      </div>
      <div className="col-start-2 flex flex-wrap items-baseline gap-x-8 gap-y-3 xl:col-start-auto xl:justify-end">
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

/* 16 px na każdej szerokości (mniejsze pola iOS Safari powiększa przy fokusie –
   także telefon w poziomie i tablet), linia pola ink/55 (3,8:1 na cream-50,
   3,6:1 na cream-100 – próg 3:1 dla granicy kontrolki), fokus = linia 2 px
   w ink, placeholder w mocha. Tej samej klasy używają pola spoza <Field>
   (wyszukiwarka katalogu, rezerwacja) – import { FIELD_CLASS }. */
export const FIELD_CLASS =
  'scroll-mt-8 block h-12 w-full rounded-none border-0 border-b border-ink/55 bg-transparent px-0 text-base text-ink shadow-none outline-none transition-[border-color,box-shadow] placeholder:text-mocha focus:border-ink focus:shadow-[0_1px_0_0_#241B14] focus-visible:ring-0';

/* Błąd walidacji: formularze zapytań (kontakt, szkolenia, wynajem, zamówienie) korzystają
   z walidacji przeglądarki – po nieudanej wysyłce pod KAŻDYM błędnym polem stoi jej komunikat
   (validationMessage – bez nowych tekstów), pole ma aria-invalid i opis przez aria-describedby,
   a linia pola zmienia kolor (wzorzec ErrorText z formularza rezerwacji). Komunikat znika,
   gdy pole jest już poprawne. Pola z własną obsługą błędów (rezerwacja) przekazują
   aria-invalid/aria-describedby same – mają pierwszeństwo. Podpowiedź (hint) jest opisem pola. */
export function Field({ as = 'input', label, id, hint, required, className, wrapperClassName, children, ...rest }) {
  const Tag = as;
  const [nativeError, setNativeError] = useState('');
  const { onInvalid, onInput, onChange, 'aria-invalid': ariaInvalid, 'aria-describedby': describedBy, ...other } = rest;
  const hintId = hint && id ? `${id}-hint` : undefined;
  const errorId = nativeError && id ? `${id}-error` : undefined;
  const ids = [describedBy, hintId, errorId].filter(Boolean).join(' ') || undefined;
  const clearIfValid = (e) => {
    if (nativeError && e.target.validity && e.target.validity.valid) setNativeError('');
  };
  const control = (
    <Tag
      id={id}
      required={required}
      aria-required={required || undefined}
      aria-invalid={ariaInvalid ?? (nativeError ? true : undefined)}
      aria-describedby={ids}
      onInvalid={(e) => {
        setNativeError(e.target.validationMessage || '');
        onInvalid?.(e);
      }}
      onInput={(e) => {
        clearIfValid(e);
        onInput?.(e);
      }}
      onChange={(e) => {
        clearIfValid(e);
        onChange?.(e);
      }}
      className={cn(
        FIELD_CLASS,
        as === 'textarea' && 'h-auto min-h-[7.5rem] resize-y py-3',
        as === 'select' && 'cursor-pointer appearance-none pr-8',
        nativeError && 'border-destructive',
        className
      )}
      {...other}
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
      {hint && (
        <p id={hintId} className="mt-2 text-[0.8125rem] leading-relaxed text-mocha">
          {hint}
        </p>
      )}
      {nativeError && (
        <p id={errorId} className="mt-2 text-[0.8125rem] leading-relaxed text-destructive">
          {nativeError}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Klauzula informacyjna RODO pod formularzem (art. 13) + Regulamin.  */
/*  Renderuje się, gdy dokumenty prawne są publiczne (LEGAL_PUBLIC –  */
/*  decyzja Filipa z 30.09.2026). Administrator z noticeController     */
/*  (src/content/common): do czasu uzupełnienia danych firmy marka,    */
/*  miasto i Instagram, potem pełna nazwa, adres i e-mail – same.      */
/* ------------------------------------------------------------------ */

export function FormNotice({ tone = 'dark', className }) {
  const t = useContent(common);
  const locale = useLocale();
  if (!LEGAL_PUBLIC) return null;
  const onDark = tone === 'light';
  const linkCls = cn('underline underline-offset-2', onDark ? 'hover:text-cream-50' : 'hover:text-ink');
  return (
    <p className={cn('text-[0.8125rem] leading-relaxed', onDark ? 'text-cream-100/80' : 'text-mocha', className)}>
      <LegalText text={t.noticeController} locale={locale} linkClassName={linkCls} /> {nbspShort(t.noticePurpose)}{' '}
      {t.noticePrivacy.pre}
      <Link href="/polityka-prywatnosci" className={linkCls}>
        {t.noticePrivacy.link}
      </Link>
      {t.noticePrivacy.post} {nbspShort(t.noticeTerms.pre)}
      <Link href="/regulamin" className={linkCls}>
        {t.noticeTerms.link}
      </Link>
      {t.noticeTerms.post} {t.requiredLegend}
    </p>
  );
}

/* Legenda pól wymaganych – gdy klauzula jeszcze się nie renderuje. */
export function RequiredLegend({ className }) {
  const t = useContent(common);
  return <p className={cn('text-[0.8125rem] text-mocha', className)}>{t.requiredLegend}</p>;
}

/* ------------------------------------------------------------------ */
/*  FAQ – jeden akordeon dla całego serwisu                            */
/* ------------------------------------------------------------------ */

/* contentClassName – klasy treści rozwinięcia (np. 'max-w-none pr-0' dla
   akordeonu z cennikiem, żeby ceny stały w jednej osi z cennikiem nad nim).
   item.kicker (opcjonalnie) – podtytuł w kapitalikach pod pytaniem, jak w PriceBlock:
   długi tytuł cennika w Bodoni miał 4–6 linii. Kicker jest inline-block w osobnym
   wierszu (leading-none), bo podkreślenie z hover:underline przycisku nie przechodzi
   do wnętrza elementów inline-block – podkreśla się tylko pytanie. */
export function Faq({ items, className, contentClassName }) {
  return (
    <Accordion type="single" collapsible className={cn('w-full border-t border-ink/10', className)}>
      {items.map((item, i) => (
        <AccordionItem key={item.q || i} value={`faq-${i}`}>
          <AccordionTrigger>
            {item.kicker ? (
              <span className="min-w-0">
                <span className="block">{nbspShort(item.q)}</span>
                <span className="mt-1.5 block text-[0.6875rem] leading-none">
                  <span className="as-kicker inline-block leading-snug">{item.kicker}</span>
                </span>
              </span>
            ) : (
              nbspShort(item.q)
            )}
          </AccordionTrigger>
          <AccordionContent className={contentClassName}>{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

/* ------------------------------------------------------------------ */
/*  „Więcej” – rozwinięcie treści tylko na telefonie                   */
/* ------------------------------------------------------------------ */

/**
 * Przycisk rozwijania treści na telefonie (jeden wzorzec „Więcej” w serwisie).
 * Stan trzyma widok: treść do schowania w JEDNYM kontenerze z id (aria-controls),
 * np. <div id="bio-more" className={cn(!open && 'max-md:hidden')}>…</div>.
 * Od progu `until` (domyślnie md) przycisk znika, a treść stoi zawsze – o tym
 * decydują same klasy, więc SSR i desktop są identyczne, bez skoku po hydratacji.
 *
 * Props: open, onToggle, controls (id kontenera), label („Więcej o …”),
 * openLabel („Zwiń”), tone ('dark' na kremie | 'light' na ciemnym tle),
 * until ('md' | 'sm' | 'lg'), className.
 * Hover bez złotego tekstu – zmienia się tylko linia.
 */
const MORE_UNTIL = { sm: 'sm:hidden', md: 'md:hidden', lg: 'lg:hidden' };

export function MobileMore({ open, onToggle, controls, label, openLabel, tone = 'dark', until = 'md', className }) {
  const isLight = tone === 'light';
  const t = useContent(common);
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      onClick={onToggle}
      className={cn(
        'flex min-h-[48px] w-full items-center justify-between gap-6 border-y py-3 text-left transition-colors',
        isLight ? 'border-cream-200/15 hover:border-cream-200/40' : 'border-ink/15 hover:border-ink/40',
        MORE_UNTIL[until] || MORE_UNTIL.md,
        className
      )}
    >
      <span className={cn('as-label', isLight ? 'text-cream-100' : 'text-ink')}>
        {open ? openLabel || t.less : label || t.more}
      </span>
      <ChevronDown
        aria-hidden="true"
        className={cn(
          'h-4 w-4 shrink-0 transition-transform duration-300 motion-reduce:transition-none',
          isLight ? 'text-gold-light' : 'text-gold-deep',
          open && 'rotate-180'
        )}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Pas „statement" – jeden wielki portret na całą szerokość i jedno   */
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
        /* wysokość od md: 70svh, ale maks. 46rem (na 1440 px wysokości pas miał 1008 px);
           tablet w pionie: maks. 60svh / 40rem – przy 70svh (717–956 px) kadr połowy pasa
           był wąski (ok. 0,55:1) i pokazywał tors, a połowa z tekstem była pusta */
        'relative flex flex-col overflow-hidden bg-espresso-900 text-cream-50 md:min-h-[min(70svh,46rem)] md:flex-row md:items-end md:port:min-h-[min(60svh,40rem)] short:min-h-0',
        className
      )}
    >
      {/* Od md portret zajmuje połowę pasa (kadr ≈ 1:1 – cała głowa i dłonie, bez
          powiększania pliku 2:3 do pasa 2:1), a krawędź od strony tekstu wygasza maska.
          Poniżej md portret 4:5 NAD tekstem – tekst nigdy nie leży na twarzy ani dłoniach.
          Tablet w pionie 480–767 px: kadr kwadratowy (4:5 na całą szerokość miał 750–930 px,
          78–82% ekranu, i pokazywał cały tors; kwadrat przy Y 8% obejmuje głowę i dłonie).
          Telefon w poziomie (short:, 640–767 px) – kadr 4:5 nie wyższy niż 80% ekranu,
          wyśrodkowany (jak portrety na stronie głównej), zamiast 2 ekranów zdjęcia.
          Od 2100 px portret stoi przy krawędzi łamu (90rem), nie ekranu, i wygasza się z obu
          stron – jak zdjęcie PageHero 'cover': na 2560–3440 px leżał w całości poza łamem,
          a między nagłówkiem a postacią zostawało ok. 1200 px pustego espresso. */}
      <Figure
        image={image}
        alt={alt}
        position={position}
        tone="dark"
        zoom={false}
        fill
        className={cn(
          'max-md:relative max-md:inset-auto max-md:aspect-[4/5] max-md:w-full min-[480px]:max-md:port:aspect-square short:max-md:mx-auto short:max-md:max-w-[calc(80svh*4/5)]',
          right
            ? 'md:right-auto md:w-[52%] md:max-w-[50rem] md:[-webkit-mask-image:linear-gradient(to_left,transparent,#000_28%)] md:[mask-image:linear-gradient(to_left,transparent,#000_28%)] min-[2100px]:left-[calc((100%-90rem)/2)] min-[2100px]:[-webkit-mask-image:linear-gradient(to_left,transparent,#000_28%,#000_80%,transparent)] min-[2100px]:[mask-image:linear-gradient(to_left,transparent,#000_28%,#000_80%,transparent)]'
            : 'md:left-auto md:w-[52%] md:max-w-[50rem] md:[-webkit-mask-image:linear-gradient(to_right,transparent,#000_28%)] md:[mask-image:linear-gradient(to_right,transparent,#000_28%)] min-[2100px]:right-[calc((100%-90rem)/2)] min-[2100px]:[-webkit-mask-image:linear-gradient(to_right,transparent,#000_28%,#000_80%,transparent)] min-[2100px]:[mask-image:linear-gradient(to_right,transparent,#000_28%,#000_80%,transparent)]'
        )}
        sizes="(min-width: 1540px) 800px, (min-width: 768px) 52vw, 100vw"
      />
      {/* gradient: czytelny tekst po stronie treści, portret oddycha po drugiej (od md);
          od 2100 px tylko w łamie – tak samo względem portretu i tekstu jak przy 1440 px */}
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 hidden md:block min-[2100px]:inset-x-[calc((100%-90rem)/2)]',
          right
            ? 'bg-gradient-to-l from-espresso-900/85 via-espresso-900/40 to-transparent'
            : 'bg-gradient-to-r from-espresso-900/85 via-espresso-900/40 to-transparent'
        )}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 hidden h-40 bg-gradient-to-t from-espresso-900/70 via-transparent to-transparent md:block"
      />
      <div className="as-shell relative w-full pb-14 pt-8 md:pb-16 md:pt-40 lg:pb-24 lg:pt-56 short:pt-16">
        <Reveal className={cn('max-w-xl md:max-w-[44%]', right && 'md:ml-auto')}>
          {label && (
            <SectionLabel number={number} tone="light">
              {label}
            </SectionLabel>
          )}
          {/* H2 w skali sekcji (jeden rozmiar H2 w serwisie), nie H1 */}
          <h2 className="as-display-section as-text-balance mt-6">
            {nbspShort(title)}
            {titleAccent && (
              <>
                {' '}
                <span className="italic text-gold-light">{nbspShort(titleAccent)}</span>
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
/*  Pasek efektów – makra brwi/ust w kontrolowanej formie: małe,       */
/*  jednolite kadry, hairline, bez mgiełki (poza nim makra tylko      */
/*  przy technikach na /uslugi – TechniquePhoto w Treatments.jsx).     */
/* ------------------------------------------------------------------ */

/* Szerokość kafelka paska dla `sizes`, od największego progu: [próg, szerokość]. Progi
   odpowiadają klasom siatki w ResultStrip; od 1440 px łam ma stałe 1328 px treści, więc
   kafelek ma stałą szerokość w px (wcześniej 22vw = 563–757 px przy kafelku ok. 330 px
   na 2560–3440). 'short' = telefon w poziomie (4 kolumny także poniżej 640 px). */
const RESULT_STRIP_TILE = {
  3: [[1440, '440px'], [0, '34vw']],
  4: [[1440, '330px'], [640, '25vw'], ['short', '25vw'], [0, '50vw']],
  5: [[1440, '263px'], [768, '20vw'], [0, '34vw']],
  6: [[1440, '219px'], [768, '17vw'], [0, '34vw']],
};

/* `sizes` = szerokość RYSOWANEGO obrazu, nie kafelka (jak coverWidth w Treatments.jsx):
   plik szerszy niż kadr (lips-05 4:3 w kwadracie) wypełnia wysokość i wystaje w poziomie,
   więc szerokość mnożymy przez nadmiar proporcji – inaczej przeglądarka brała za mały plik
   (480 px przy potrzebnych ok. 600 px na 1024 px i DPR 2). */
function resultStripSizes(cols, image, ratio) {
  const [rw, rh] = String(ratio).split('/').map(Number);
  const cover = image && rw && rh ? Math.max(1, image.w / image.h / (rw / rh)) : 1;
  const tiles = RESULT_STRIP_TILE[cols] || RESULT_STRIP_TILE[6];
  return tiles
    .map(([min, width]) => {
      const [, n, unit] = /^([\d.]+)(px|vw)$/.exec(width);
      const value = `${Math.ceil(Number(n) * cover)}${unit}`;
      if (min === 'short') return `(max-width: 1023px) and (max-height: 500px) ${value}`;
      return min ? `(min-width: ${min}px) ${value}` : value;
    })
    .join(', ');
}

export function ResultStrip({ items, tone = 'dark', ratio = '1 / 1', cols = 6, caption, className }) {
  /* tone = ton SEKCJI, w której stoi pasek: 'dark' (espresso/mocha) albo 'light' (krem).
     Cztery kafelki: telefon w pionie 2×2, telefon w poziomie (short:) od razu 4 w rzędzie –
     przy 568×320 układ 2×2 miał 528 px wysokości (1,65 ekranu), a rząd ma ok. 130 px. */
  const onDark = tone === 'dark';
  const grid = { 3: 'grid-cols-3', 4: 'grid-cols-2 short:grid-cols-4 sm:grid-cols-4', 5: 'grid-cols-3 md:grid-cols-5', 6: 'grid-cols-3 md:grid-cols-6' }[cols] || 'grid-cols-3 md:grid-cols-6';
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
              sizes={resultStripSizes(cols, it.image, ratio)}
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
