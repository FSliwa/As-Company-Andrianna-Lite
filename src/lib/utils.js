import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/* tailwind-merge 2.x = zgodny z Tailwind 3 (3.x rozumie klasy jak w Tailwind 4:
   np. wycinał „outline” obok „outline-2”, więc znikały obrysy fokusu). */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Polska norma typograficzna: jednoliterowy spójnik lub przyimek (a, i, o, u, w, z)
 * nie zostaje na końcu wiersza – spację po nim zamieniamy na twardą (U+00A0).
 * Tylko dla tekstu (string); elementy React zwraca bez zmian. Pętla zamiast
 * lookbehind: kolejne jednoliterowe wyrazy („w i z”) łapie następny przebieg,
 * a starsze Safari nie parsuje wyrażeń z lookbehind.
 */
export function nbspShort(value) {
  if (typeof value !== "string") return value
  let out = value
  let prev
  do {
    prev = out
    out = out.replace(/(^|[\s(„"])([aiouwzAIOUWZ]) /g, "$1$2 ")
  } while (out !== prev)
  return out
}


/* Nazwy technik i kursów nie łamią się w środku znaku marki („Super Natural / Brows”
   zostawiało samotne „Brows” w nagłówkach kart) – twarda spacja w „Natural Brows”. */
export function nbspBrand(value) {
  if (typeof value !== "string") return value
  return nbspShort(value).replace(/Natural Brows/g, "Natural\u00a0Brows")
}

export const isIframe = typeof window !== 'undefined' ? window.self !== window.top : false;
