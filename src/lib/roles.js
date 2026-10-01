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
  heroHome: { image: pick('studio-05'), position: '50% 4%' }, // zdjęcie na tle hero (Home ustawia własne pozycje: ekran pionowy / poziomy)
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
   ratio = proporcja RENDEROWANA w widoku (/uslugi ResultStrip: 1:1; /uslugi
   techniki 02: panel w poziomej proporcji 12:5).
   Limity: /uslugi 6 (4 w pasie efektów 03 + 2 przy technikach 02: brows13p2,
   lips03p3), pozostałe trasy 0 (home: portret zamiast makra – makro z telefonu
   nie pasowało jakością ani kolorem do sesji studyjnej; /pigmenty od katalogu
   produktów bez makra – brows12p3 wolne; brows13p3 w rezerwie).
   `ratio` + `position` wycinają znaki wodne i napisy ze sklejek.
   Podpisy tylko faktyczne: technikę znamy wyłącznie dla brows-13 (napis
   „Supernatural brows” w sklejce źródłowej) i lips-03 (napis „Perfect lips”
   w panelu „Sketch” tej sklejki). Sklejka brows-12 takiego napisu NIE ma
   (sprawdzone na pliku z /Graphics – tylko znak BABUSHKINA ACADEMY), więc
   brows12p3 ma podpis neutralny; nazwę techniki można wpisać dopiero po
   potwierdzeniu przez klientkę.
   Sprawdzone renderem: brows-14 to duplikat brows-09, lips-01-p1 ma znak wodny
   w każdym kadrze ≤ 3:2 – oba poza listą. */
export const MACROS = {
  brows09: { image: pick('brows-09'), ratio: '4 / 5', position: '50% 45%', caption: 'Brwi – makijaż permanentny' },
  brows15: { image: pick('brows-15'), ratio: '1 / 1', position: '50% 20%', caption: 'Brwi – makijaż permanentny' },
  brows08: { image: pick('brows-08'), ratio: '1 / 1', position: '50% 45%', caption: 'Brwi – makijaż permanentny' },
  brows17: { image: pick('brows-17'), ratio: '1 / 1', position: '58% 40%', // X 55–62%: kolczyk poza kadrem, prawe oko w kadrze
    caption: 'Brwi – makijaż permanentny' },
  /* Rezerwa – nieużywane (wiersz SNB na /uslugi 02 bierze brows13p2). Tylko 4:5: przy 4:5 X 60–69% (kadr 507 px
     z 1638) mieści się między napisem „Supernatural brows” (lewy górny róg, do x ≈ 668)
     a „ACADEMY” (od x ≈ 1297); 1:1 (634 px) zawsze łapie któryś napis. */
  brows13p3: { image: pick('brows-13-p3'), ratio: '4 / 5', position: '64% 50%', caption: 'Super Natural Brows' },
  /* /uslugi 02, wiersz Super Natural Brows – panel brwi z okiem (1638 × 840) w 12:5 od góry
     (Y ≤ 35%): kadr kończy się nad napisami „Supernatural brows” / „BABUSHKINA” (od y ≈ 754),
     które przy 2:1 były ucięte w pół. Pasek brwi bez oka (brows13p3) w kadrze 4:5
     pokazywał na telefonie głównie skórę. */
  brows13p2: { image: pick('brows-13-p2'), ratio: '12 / 5', position: '50% 35%', caption: 'Super Natural Brows' },
  brows12p3: { image: pick('brows-12-p3'), ratio: '1 / 1', position: '50% 50%', // 50% = skrajna pozycja w prawo (znak wodny tuż za kadrem) – nie poszerzać proporcji
    caption: 'Brwi – makijaż permanentny' }, // technika niepotwierdzona – patrz komentarz nad listą
  /* /uslugi 02, wiersz Perfect Lips – cały panel „After” (1206 × 494 ≈ 2,44:1) w 12:5:
     napis „After” i znak „Perfect lips” zostają (znak = nazwa techniki, marka klientki),
     za to widać całe usta, a nie wycinek łuku Kupidyna. */
  lips03p3: { image: pick('lips-03-p3'), ratio: '12 / 5', position: '50% 50%', caption: 'Perfect Lips' },
  lips05: { image: pick('lips-05'), ratio: '1 / 1', position: '45% 50%', // przy 1:1 X ≤ 57% – dalej wchodzi pionowy znak wodny
    caption: 'Usta – makijaż permanentny' },
};
