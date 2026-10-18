/**
 * Etykieta „Sprzedaż przedpremierowa” (słowa Kariny z 14.10.2026) – Magic UI „animated-shiny-text”
 * przeniesiony do CSS (.as-shiny w src/index.css, bez biblioteki „motion”). Ramka 1 px w złocie,
 * kapitaliki jak .as-badge; połysk zatrzymuje się przy prefers-reduced-motion.
 */

import React from 'react';
import { cn } from '@/lib/utils';

export default function PresaleBadge({ children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center border border-gold-dark/50 px-2 py-1 text-[0.6875rem] font-medium uppercase leading-none tracking-[0.12em]',
        className
      )}
    >
      <span className="as-shiny">{children}</span>
    </span>
  );
}
