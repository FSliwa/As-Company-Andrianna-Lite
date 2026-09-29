/**
 * Role zdjęć w serwisie — jedno miejsce na każdy plik.
 *
 * Portrety z sesji wizerunkowej to jedyny materiał klasy premium, więc każdy
 * kadr ma dokładnie jedną rolę (strona nie może wyglądać jak lookbook jednej
 * sesji). Widoki importują portrety WYŁĄCZNIE przez ROLES, makra WYŁĄCZNIE
 * przez MACROS, grupy z akademii WYŁĄCZNIE przez GROUPS.
 *
 * Rezerwa (poza stroną): studio-01, -06, -07, -09, -15; studio-02 = obraz OG.
 * Wycofane: academy-02 (balony, baner), -05 (choinka), -07; lips-04, lips-01-p2,
 * brows-02*, brows-18*, brows-01-*, pliki zbiorcze (sklejki), plakaty COURSE
 * i grafiki CENNIK jako elementy layoutu.
 *
 * Źródło: src/lib/media.js (generowany przez scripts/przygotuj-grafiki.py).
 */

import { BY_NAME } from './media';

const pick = (name) => {
  const img = BY_NAME[name];
  if (!img && process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(`[roles] brak pliku ${name} w media.js`);
  }
  return img;
};

/* Portrety — { image, position } */
export const ROLES = {
  heroHome: { image: pick('studio-05'), position: '50% 20%' },
  aboutHome: { image: pick('studio-14'), position: '50% 30%' }, // jedyny poziomy kadr 3:2
  productsHome: { image: pick('studio-04'), position: '50% 12%' }, // biała marynarka — „biznes"
  closingHome: { image: pick('studio-16'), position: '60% 30%' },
  heroAbout: { image: pick('studio-11'), position: '50% 15%' },
  storyAbout: { image: pick('studio-08'), position: '50% 15%' },
  heroTreatments: { image: pick('studio-13'), position: '50% 20%' },
  heroTraining: { image: pick('studio-03'), position: '50% 12%' },
  heroContact: { image: pick('studio-10'), position: '50% 30%' },
  heroPackages: { image: pick('studio-12'), position: '50% 20%' },
};

export const OG_IMAGE = '/graphics/studio-02.jpg';

/* Zdjęcia grupowe z akademii — każdy plik raz w serwisie */
export const GROUPS = {
  trainingHome: { image: pick('academy-04'), position: '50% 30%' }, // home, 16:9 (21:9 ucinał szyld)
  graduatesMain: { image: pick('academy-01'), position: '50% 30%' }, // /szkolenia, 3:2
  graduatesA: { image: pick('academy-03'), position: '50% 25%' }, // /szkolenia, 4:5
  graduatesB: { image: pick('academy-08'), position: '50% 25%' }, // /szkolenia, 4:5
  contactVenue: { image: pick('academy-06'), position: '50% 30%' }, // /kontakt, 3:2
};

/* Makra — biała lista. Renderować ≤ 360 px, zoom={false}.
   Limity: home 2, /uslugi 4, /pigmenty 1, pozostałe trasy 0.
   `ratio` + `position` wycinają znaki wodne i napisy ze sklejek.
   Podpisy tylko faktyczne: technikę znamy wyłącznie dla brows-12/13 (napis
   „Supernatural brows" w sklejce źródłowej).
   Sprawdzone renderem: brows-14 to duplikat brows-09, lips-01-p1 ma znak wodny
   w każdym kadrze ≤ 3:2 — oba poza listą. */
export const MACROS = {
  brows09: { image: pick('brows-09'), ratio: '4 / 5', position: '50% 45%', caption: 'Brwi — makijaż permanentny' },
  brows15: { image: pick('brows-15'), ratio: '4 / 5', position: '50% 45%', caption: 'Brwi — makijaż permanentny' },
  brows08: { image: pick('brows-08'), ratio: '4 / 5', position: '50% 45%', caption: 'Brwi — makijaż permanentny' },
  brows17: { image: pick('brows-17'), ratio: '4 / 5', position: '50% 40%', caption: 'Brwi — makijaż permanentny' },
  brows13p3: { image: pick('brows-13-p3'), ratio: '1 / 1', position: '50% 50%', caption: 'Super Natural Brows' },
  brows12p3: { image: pick('brows-12-p3'), ratio: '1 / 1', position: '50% 50%', caption: 'Super Natural Brows' },
  lips03p3: { image: pick('lips-03-p3'), ratio: '4 / 5', position: '50% 60%', caption: 'Usta — makijaż permanentny' },
  lips05: { image: pick('lips-05'), ratio: '4 / 5', position: '45% 50%', caption: 'Usta — makijaż permanentny' },
};
