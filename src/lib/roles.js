/**
 * Role zdjęć w serwisie – jedno miejsce na każdy plik.
 *
 * Portrety z sesji wizerunkowej to jedyny materiał klasy premium, więc każdy
 * kadr ma dokładnie jedną rolę (strona nie może wyglądać jak lookbook jednej
 * sesji). Widoki importują portrety WYŁĄCZNIE przez ROLES, makra WYŁĄCZNIE
 * przez MACROS, grupy z akademii WYŁĄCZNIE przez GROUPS.
 *
 * Rezerwa (poza stroną): studio-03, -06, -07, -09, -11, -13 (studio-13 – ta sama poza co hero
 * strony głównej, studio-05; klientka 30.09: „aby na każdej podstronie było inne”). Obraz OG: public/og.jpg.
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
  closingHome: { image: pick('studio-14'), position: '50% 50%' }, // jedyny poziomy kadr – tło sekcji 06 na home (Home ustawia pozycje: pion / poziom)
  treatmentsHome: { image: pick('studio-02'), position: '50% 22%' }, // ciasno na twarz – brwi i usta, sekcja zabiegów
  heroAbout: { image: pick('studio-01'), position: '50% 18%' }, // dłoń na ramieniu, głowa przechylona; tło PageHero – w poziomie kadr szerszy niż 2:3, 18% trzyma głowę w kadrze (studio-11 = ta sama poza co studio-02)
  storyAbout: { image: pick('studio-08'), position: '50% 5%' },
  heroTreatments: { image: pick('studio-15'), position: '50% 6%' }, // siedząca poza w tiulu – inna niż hero home (studio-05) i /o-nas (studio-01); w poziomie kadr ok. 1:1 – 6% trzyma czubek głowy pod nagłówkiem (22% ucinało 36–71 px)
  heroTraining: { image: pick('studio-10'), position: '50% 30%' }, // marynarka, inna poza niż O nas na home (studio-04); tło PageHero – cała postać
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
   ratio = proporcja RENDEROWANA w widoku (/uslugi: pas efektów 03 i zdjęcia
   technik 02 – wszystkie 1:1).
   Limity: /uslugi 8 (4 w pasie efektów 03: brows15, brows08, powder01Wide, lips05
   + 4 przy technikach 02: snb01, powder01, lips03p3, eyes01), /o-nas 3, pozostałe
   trasy 0 (home: portret zamiast makra – makro z telefonu nie pasowało jakością ani
   kolorem do sesji studyjnej; /pigmenty od katalogu produktów bez makra –
   brows12p3 wolne). W rezerwie: brows13p2, brows13p3, brows17 (do 30.09.2026
   trzecie w pasie 03 – klientka 1.10: „na miejscu tego zdjęcia zdjęcie techniki
   pudrowej”), brows09.
   /o-nas 3 = kolaż w sekcji 05 (SalonCollage, src/views/About.jsx): snbCollage,
   powderCollage, lipsCollage (work-snb-01, work-powder-01, lips-02-p2) – proporcje
   kafli i opis kadrów przy COLLAGE w About.jsx.
   Powtórzenia w serwisie: work-powder-01 to jedyne zdjęcie techniki pudrowej, więc
   stoi trzy razy (/uslugi: wiersz Perfect Brows i pas 03; /o-nas: kolaż),
   work-snb-01 dwa razy (/uslugi 02, /o-nas). Drugie zdjęcie techniki pudrowej –
   do uzyskania od klientki (wtedy do pasa 03 zamiast powder01Wide).
   `ratio` + `position` wycinają znaki wodne i napisy ze sklejek. Opcjonalne
   `scale` + `origin` (transform obrazu w kadrze, origin w % kadru) dociskają kadr
   tam, gdzie samo przesunięcie zostawia w nim coś obcego (ucho z kolczykami przy
   snb01, rozmazany pas przy prawej krawędzi work-powder-01 przy powder01).
   Obsługuje je wyłącznie TechniquePhoto (Treatments.jsx) – ResultStrip nie skaluje.
   Podpisy tylko faktyczne: technikę znamy dla brows-13 (napis „Supernatural
   brows” w sklejce źródłowej), lips-03 (napis „Perfect lips” w panelu „Sketch”
   tej sklejki) i prac z 29.09.2026 (WORKS w media.js: włos maszynowy SNB, technika
   pudrowa, linia rzęs – opis klientki przy plikach). Sklejka brows-12 takiego
   napisu NIE ma (sprawdzone na pliku z /Graphics – tylko znak BABUSHKINA
   ACADEMY), więc brows12p3 ma podpis neutralny; nazwę techniki można wpisać
   dopiero po potwierdzeniu przez klientkę.
   Sprawdzone renderem: brows-14 to duplikat brows-09, lips-01-p1 ma znak wodny
   w każdym kadrze ≤ 3:2 – oba poza listą. */
export const MACROS = {
  brows09: { image: pick('brows-09'), ratio: '4 / 5', position: '50% 45%', caption: 'Brwi – makijaż permanentny' },
  brows15: { image: pick('brows-15'), ratio: '1 / 1', position: '50% 20%', caption: 'Brwi – makijaż permanentny' },
  brows08: { image: pick('brows-08'), ratio: '1 / 1', position: '50% 45%', caption: 'Brwi – makijaż permanentny' },
  /* Rezerwa od 1.10.2026 (dawniej trzecie w pasie 03 na /uslugi – zastąpione powder01Wide) */
  brows17: { image: pick('brows-17'), ratio: '1 / 1', position: '58% 40%', // X 55–62%: kolczyk poza kadrem, prawe oko w kadrze
    caption: 'Brwi – makijaż permanentny' },
  /* Rezerwa – nieużywane. Tylko 4:5: przy 4:5 X 60–69% (kadr 507 px
     z 1638) mieści się między napisem „Supernatural brows” (lewy górny róg, do x ≈ 668)
     a „ACADEMY” (od x ≈ 1297); 1:1 (634 px) zawsze łapie któryś napis. */
  brows13p3: { image: pick('brows-13-p3'), ratio: '4 / 5', position: '64% 50%', caption: 'Super Natural Brows' },
  /* Rezerwa od 1.10.2026 (do tego dnia wiersz SNB na /uslugi 02; teraz snb01). Panel brwi
     z okiem (1638 × 840) tylko w 12:5 od góry (Y ≤ 35%): kadr kończy się nad napisami
     „Supernatural brows” / „BABUSHKINA” (od y ≈ 754); 1:1 łapie napisy. */
  brows13p2: { image: pick('brows-13-p2'), ratio: '12 / 5', position: '50% 35%', caption: 'Super Natural Brows' },
  brows12p3: { image: pick('brows-12-p3'), ratio: '1 / 1', position: '50% 50%', // 50% = skrajna pozycja w prawo (znak wodny tuż za kadrem) – nie poszerzać proporcji
    caption: 'Brwi – makijaż permanentny' }, // technika niepotwierdzona – patrz komentarz nad listą
  /* /uslugi 02 – zdjęcia technik w kwadracie (dobrane renderem: brew / oko / usta na środku,
     bez napisów i znaków wodnych). */
  /* Super Natural Brows – work-snb-01 (599 × 797). Kwadrat na całą szerokość łapie
     u góry ucho z kolczykami, a u dołu drugie oko; × 1,45 wokół brwi z okiem – czysto. */
  snb01: { image: pick('work-snb-01'), ratio: '1 / 1', position: '50% 10%', scale: 1.45, origin: '62% 45%',
    caption: 'Super Natural Brows' },
  /* Perfect Brows (technika pudrowa) – work-powder-01 (614 × 960): cała brew (w pliku
     y ≈ 295–820) z okiem i rzęsami po lewej. Widoczne okno pliku: x ≈ 31–589, y ≈ 277–835 –
     ok. 15–20 px zapasu nad głową i pod ogonem brwi, rozmazany pas przy prawej krawędzi
     pliku (x ≥ 592) za kadrem. Ciaśniej się nie da: przy × 1,25 brew była ucięta z obu końców,
     a oko – z lewej. Brew ma ok. 525 px wysokości przy 614 px szerokości pliku, więc każdy
     kwadrat z całą brwią to prawie cała szerokość pliku – kadr różni się od powder01Wide
     (pas 03) tylko powiększeniem (× 1,1 wobec × 1) i niższym oknem; innej kompozycji z całą
     brwią ten plik nie daje. */
  /* Propozycja usl-03-c: work-powder-01-r – ten sam plik obrócony o 90° w lewo (zdjęcie
     zrobiono przy kliencie w pozycji leżącej: brew stała pionowo, oko po lewej). W kadrze 1:1
     (okno 587 px z 960) przy X 74% cała brew z marginesem po obu stronach i oko pod nią;
     rozmazany pas z krawędzi pliku odcięty już w skrypcie, więc bez powiększenia. */
  powder01: { image: pick('work-powder-01-r'), ratio: '1 / 1', position: '74% 50%',
    caption: 'Perfect Brows' },
  /* Perfect Lips – panel „After” (1206 × 494) w kwadracie: środek ust z łukiem Kupidyna.
     Przy X > 45% wchodzi znak „Perfect lips” (prawy górny róg), przy X < 40% napis „After”.
     Całe usta mieszczą się w kwadracie tylko na lips-05 (pas 03) – inne pliki ust nie mają
     napisu z nazwą techniki. */
  lips03p3: { image: pick('lips-03-p3'), ratio: '1 / 1', position: '45% 50%', caption: 'Perfect Lips' },
  /* Perfect Eyes (linia rzęs) – work-eyes-01 (768 × 615): tęczówka i górna linia rzęs w środku */
  eyes01: { image: pick('work-eyes-01'), ratio: '1 / 1', position: '85% 50%', caption: 'Perfect Eyes' },
  /* /uslugi 03, pas efektów (trzecie zdjęcie – prośba klientki 1.10.2026: technika pudrowa).
     Cała szerokość pliku (okno y ≈ 215–829): brew z okiem, więcej skóry wokół niż powder01
     w wierszu techniki. Przy prawej krawędzi kadru zostaje wąski, ledwie widoczny rozmazany pas
     pliku (ok. 3,5 % szerokości) – ResultStrip nie skaluje, więc tu go nie schowamy. */
  powder01Wide: { image: pick('work-powder-01-r'), ratio: '1 / 1', position: '74% 50%', // usl-03-c – patrz powder01
    caption: 'Brwi pudrowe – makijaż permanentny' },
  lips05: { image: pick('lips-05'), ratio: '1 / 1', position: '45% 50%', // przy 1:1 X ≤ 57% – dalej wchodzi pionowy znak wodny
    caption: 'Usta – makijaż permanentny' },
  /* /o-nas 05 – kolaż prac (SalonCollage w About.jsx; proporcje kafli tam). Bez podpisów –
     techniki nazywa lista 01–03 pod kolażem. */
  snbCollage: { image: pick('work-snb-01'), position: '50% 50%' },
  powderCollage: { image: pick('work-powder-01'), position: '0% 50%' },
  lipsCollage: { image: pick('lips-02-p2'), position: '50% 82%' }, // Y 82%: bez napisu „Healed” i szarego paska (opis w About.jsx)
};
