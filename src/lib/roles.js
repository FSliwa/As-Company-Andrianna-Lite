/**
 * Role zdjęć w serwisie – jedno miejsce na każdy plik.
 *
 * Portrety z sesji wizerunkowej to jedyny materiał klasy premium, więc każdy
 * kadr ma dokładnie jedną rolę (strona nie może wyglądać jak lookbook jednej
 * sesji). Widoki importują portrety WYŁĄCZNIE przez ROLES, makra WYŁĄCZNIE
 * przez MACROS, grupy z akademii WYŁĄCZNIE przez GROUPS.
 *
 * Rezerwa (poza stroną): studio-03, -06, -07, -09, -11, -15. Obraz OG: public/og.jpg.
 * Kolejne klatki tej samej serii (ta sama poza i mimika, np. studio-02 / -11) liczą
 * się jak jeden plik – w serwisie stoi tylko jedna z nich.
 * position działa tylko wtedy, gdy proporcja kadru ≠ proporcji pliku; przy 2:3 w 2:3
 * albo 3:2 w 3:2 wpisujemy '50% 50%'.
 * Scena absolwentek w dwóch miejscach (home + /szkolenia), nie pięciu.
 * Na home trzy różne pozy: tiul (hero), marynarka (O nas), kadr poziomy (zaproszenie).
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

/* Portrety – { image, position } */
export const ROLES = {
  heroHome: { image: pick('studio-05'), position: '50% 4%' }, // 4:5 < lg – powietrze nad włosami
  aboutHome: { image: pick('studio-04'), position: '50% 12%' }, // biała marynarka – „firma", inna poza niż hero
  closingHome: { image: pick('studio-14'), position: '50% 50%' }, // jedyny poziomy kadr; 3:2 w 3:2 – position bez efektu
  treatmentsHome: { image: pick('studio-02'), position: '50% 22%' }, // ciasno na twarz – brwi i usta, sekcja zabiegów
  heroAbout: { image: pick('studio-01'), position: '50% 50%' }, // dłoń na ramieniu, głowa przechylona; 2:3 w 2:3 (studio-11 = ta sama poza co studio-02)
  storyAbout: { image: pick('studio-08'), position: '50% 5%' },
  heroTreatments: { image: pick('studio-13'), position: '50% 20%' },
  heroTraining: { image: pick('studio-10'), position: '50% 50%' }, // marynarka, inna poza niż O nas na home (studio-04); 2:3 w 2:3
  contactSection: { image: pick('studio-16'), position: '50% 30%' }, // /kontakt „Jak umówić wizytę" (zamiast sceny absolwentek)
  statementPackages: { image: pick('studio-12'), position: '50% 8%' }, // /pakiety – Statement: od lg prawa połowa pasa (≈1:1), poniżej lg pełny spad
};

export const OG_IMAGE = '/og.jpg'; // 1200×630, kadr ze studio-12 (ten sam plik co statementPackages – dozwolone, OG jest poza stroną)

/* Zdjęcia grupowe z akademii – każdy plik raz w serwisie */
export const GROUPS = {
  trainingHome: { image: pick('academy-04'), position: '50% 26%' }, // home 3:2 – szyld z zapasem, twarze w środku, certyfikaty prawie całe
  graduatesMain: { image: pick('academy-01'), position: '50% 30%' }, // /szkolenia, 4:5 (stykówka)
  graduatesA: { image: pick('academy-06'), position: '50% 25%' }, // /szkolenia, 4:5 (academy-03 ma ikonę Instagrama w kadrze)
  graduatesB: { image: pick('academy-08'), position: '50% 70%' }, // /szkolenia, 4:5 – tnie sufit, nie buty
};

/* Makra – biała lista. Renderować ≤ 360 px, zoom={false}.
   ratio = proporcja RENDEROWANA w widoku (/uslugi ResultStrip i /pigmenty: 1:1).
   Limity: /uslugi 4, /pigmenty 1, pozostałe trasy 0 (home: portret zamiast makra –
   makro z telefonu nie pasowało jakością ani kolorem do sesji studyjnej).
   `ratio` + `position` wycinają znaki wodne i napisy ze sklejek.
   Podpisy tylko faktyczne: technikę znamy wyłącznie dla brows-12/13 (napis
   „Supernatural brows" w sklejce źródłowej).
   Sprawdzone renderem: brows-14 to duplikat brows-09, lips-01-p1 ma znak wodny
   w każdym kadrze ≤ 3:2 – oba poza listą. */
export const MACROS = {
  brows09: { image: pick('brows-09'), ratio: '4 / 5', position: '50% 45%', caption: 'Brwi – makijaż permanentny' },
  brows15: { image: pick('brows-15'), ratio: '1 / 1', position: '50% 20%', caption: 'Brwi – makijaż permanentny' },
  brows08: { image: pick('brows-08'), ratio: '1 / 1', position: '50% 45%', caption: 'Brwi – makijaż permanentny' },
  brows17: { image: pick('brows-17'), ratio: '1 / 1', position: '58% 40%', // X 55–62%: kolczyk poza kadrem, prawe oko w kadrze
    caption: 'Brwi – makijaż permanentny' },
  brows13p3: { image: pick('brows-13-p3'), ratio: '1 / 1', position: '50% 50%', caption: 'Super Natural Brows' },
  brows12p3: { image: pick('brows-12-p3'), ratio: '1 / 1', position: '50% 50%', // 50% = skrajna pozycja w prawo (znak wodny tuż za kadrem) – nie poszerzać proporcji
    caption: 'Super Natural Brows' },
  lips03p3: { image: pick('lips-03-p3'), ratio: '4 / 5', position: '50% 60%', caption: 'Usta – makijaż permanentny' },
  lips05: { image: pick('lips-05'), ratio: '1 / 1', position: '45% 50%', // przy 1:1 X ≤ 57% – dalej wchodzi pionowy znak wodny
    caption: 'Usta – makijaż permanentny' },
};
