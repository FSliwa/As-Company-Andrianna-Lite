'use client';

/**
 * Lupa na zdjęciu (Magic UI „lens”, przeniesiona bez biblioteki „motion”): przy najechaniu MYSZĄ
 * w kole o średnicy `size` widać powiększenie `zoom` miejsca pod kursorem – napisy na opakowaniach
 * (nazwy odcieni, pojemności) da się przeczytać. Dotyk i klawiatura – zwykłe zdjęcie (lupa to tylko
 * dodatek). Warstwa z powiększeniem jest kopią treści z aria-hidden (czytnik czyta zdjęcie raz).
 */

import React, { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export default function Lens({ children, zoom = 2, size = 180, className }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(null);
  const move = useCallback((e) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);
  const mask = pos ? `radial-gradient(circle ${size / 2}px at ${pos.x}px ${pos.y}px, #000 99%, transparent 100%)` : undefined;
  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)} onPointerMove={move} onPointerLeave={() => setPos(null)}>
      {children}
      {pos && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ WebkitMaskImage: mask, maskImage: mask }}>
          <div className="absolute inset-0" style={{ transform: `scale(${zoom})`, transformOrigin: `${pos.x}px ${pos.y}px` }}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
