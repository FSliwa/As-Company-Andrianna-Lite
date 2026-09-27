'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Sygnet AS COMPANY POLAND — korona, monogram „AS”, podpis.
 * Odwzorowany wektorowo, dzięki czemu skaluje się bez utraty jakości
 * i przyjmuje kolor z `tone`.
 */
export default function Logo({ tone = 'gold', className, compact = false }) {
  const color =
    tone === 'light' ? '#F6F1E8' : tone === 'ink' ? '#241B14' : '#B89768';

  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <svg
        viewBox="0 0 120 120"
        width="44"
        height="44"
        fill="none"
        role="img"
        aria-label="AS Company Poland"
        className="shrink-0"
      >
        {/* korona */}
        <path
          d="M40 34 L46.5 22 L53 31 L60 18 L67 31 L73.5 22 L80 34 Z"
          fill={color}
          fillOpacity="0.92"
        />
        <circle cx="60" cy="14" r="2.6" fill={color} />
        <circle cx="41.5" cy="19.5" r="2" fill={color} />
        <circle cx="78.5" cy="19.5" r="2" fill={color} />

        {/* delikatna ramka */}
        <rect
          x="32.5"
          y="40.5"
          width="55"
          height="44"
          stroke={color}
          strokeOpacity="0.55"
          strokeWidth="1"
        />

        {/* monogram AS */}
        <text
          x="60"
          y="72"
          textAnchor="middle"
          fill={color}
          fontFamily="var(--font-display), 'Bodoni Moda', Didot, Georgia, serif"
          fontSize="30"
          fontStyle="italic"
          letterSpacing="0.5"
        >
          AS
        </text>

        {/* podpis */}
        <text
          x="60"
          y="99"
          textAnchor="middle"
          fill={color}
          fontFamily="var(--font-sans), Jost, system-ui, sans-serif"
          fontSize="11"
          letterSpacing="3.2"
        >
          COMPANY
        </text>
        <line x1="40" y1="106" x2="80" y2="106" stroke={color} strokeOpacity="0.5" strokeWidth="0.8" />
        <text
          x="60"
          y="116"
          textAnchor="middle"
          fill={color}
          fillOpacity="0.8"
          fontFamily="var(--font-sans), Jost, system-ui, sans-serif"
          fontSize="7"
          letterSpacing="3"
        >
          POLAND
        </text>
      </svg>

      {!compact && (
        <span className="hidden flex-col leading-none sm:flex">
          <span
            className="font-display text-lg tracking-[0.02em]"
            style={{ color: tone === 'light' ? '#F6F1E8' : '#241B14' }}
          >
            AS COMPANY
          </span>
          <span
            className="as-label mt-1.5"
            style={{ color: tone === 'light' ? 'rgba(235,225,210,0.6)' : 'rgba(36,27,20,0.5)' }}
          >
            Loveliness PMU
          </span>
        </span>
      )}
    </span>
  );
}
