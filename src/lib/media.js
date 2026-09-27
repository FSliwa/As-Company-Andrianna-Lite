// Manifest grafik — WSZYSTKIE zdjęcia pochodzą z firmowego folderu /Graphics
// (zoptymalizowane do public/graphics przez skrypt build-time).
// Nie dodawaj tu zdjęć z zewnętrznych źródeł (Unsplash itp.).

/** Sesja wizerunkowa Andriany Babushkiny (16 ujęć, jasne/kremowe tło) */
export const STUDIO = [
  { src: '/graphics/studio-01.jpg', w: 1068, h: 1600 },
  { src: '/graphics/studio-02.jpg', w: 1068, h: 1600 },
  { src: '/graphics/studio-03.jpg', w: 1068, h: 1600 },
  { src: '/graphics/studio-04.jpg', w: 1068, h: 1600 },
  { src: '/graphics/studio-05.jpg', w: 1068, h: 1600 },
  { src: '/graphics/studio-06.jpg', w: 1068, h: 1600 },
  { src: '/graphics/studio-07.jpg', w: 1068, h: 1600 },
  { src: '/graphics/studio-08.jpg', w: 1068, h: 1600 },
  { src: '/graphics/studio-09.jpg', w: 1068, h: 1600 },
  { src: '/graphics/studio-10.jpg', w: 1068, h: 1600 },
  { src: '/graphics/studio-11.jpg', w: 1068, h: 1600 },
  { src: '/graphics/studio-12.jpg', w: 1068, h: 1600 },
  { src: '/graphics/studio-13.jpg', w: 1068, h: 1600 },
  { src: '/graphics/studio-14.jpg', w: 1600, h: 1068 },
  { src: '/graphics/studio-15.jpg', w: 1068, h: 1600 },
  { src: '/graphics/studio-16.jpg', w: 1068, h: 1600 },
];

/** Grupy kursantek z certyfikatami — Babushkina Academy (8 ujęć) */
export const ACADEMY = [
  { src: '/graphics/academy-01.jpg', w: 1206, h: 1574 },
  { src: '/graphics/academy-02.jpg', w: 1206, h: 1471 },
  { src: '/graphics/academy-03.jpg', w: 1206, h: 1580 },
  { src: '/graphics/academy-04.jpg', w: 1206, h: 1588 },
  { src: '/graphics/academy-05.jpg', w: 1206, h: 1592 },
  { src: '/graphics/academy-06.jpg', w: 1206, h: 1506 },
  { src: '/graphics/academy-07.jpg', w: 1180, h: 1600 },
  { src: '/graphics/academy-08.jpg', w: 1206, h: 1582 },
];

/** Materiały kursowe / grafiki programów szkoleń (7 ujęć) */
export const COURSE = [
  { src: '/graphics/course-01.jpg', w: 900, h: 1600 },
  { src: '/graphics/course-02.jpg', w: 900, h: 1600 },
  { src: '/graphics/course-03.jpg', w: 900, h: 1600 },
  { src: '/graphics/course-04.jpg', w: 586, h: 1040 },
  { src: '/graphics/course-05.jpg', w: 586, h: 1040 },
  { src: '/graphics/course-06.jpg', w: 586, h: 1040 },
  { src: '/graphics/course-07.jpg', w: 586, h: 1040 },
];

/** Efekty PMU brwi — przed/po, wygojone (18 ujęć) */
export const BROWS = [
  { src: '/graphics/brows-01.jpg', w: 1440, h: 1800 },
  { src: '/graphics/brows-02.jpg', w: 829, h: 1800 },
  { src: '/graphics/brows-03.jpg', w: 1800, h: 1350 },
  { src: '/graphics/brows-04.jpg', w: 1800, h: 1350 },
  { src: '/graphics/brows-05.jpg', w: 1012, h: 1800 },
  { src: '/graphics/brows-06.jpg', w: 1012, h: 1800 },
  { src: '/graphics/brows-07.jpg', w: 1800, h: 1012 },
  { src: '/graphics/brows-08.jpg', w: 1350, h: 1800 },
  { src: '/graphics/brows-09.jpg', w: 1350, h: 1800 },
  { src: '/graphics/brows-10.jpg', w: 1440, h: 1800 },
  { src: '/graphics/brows-11.jpg', w: 1800, h: 1350 },
  { src: '/graphics/brows-12.jpg', w: 1440, h: 1800 },
  { src: '/graphics/brows-13.jpg', w: 1440, h: 1800 },
  { src: '/graphics/brows-14.jpg', w: 1350, h: 1800 },
  { src: '/graphics/brows-15.jpg', w: 1440, h: 1800 },
  { src: '/graphics/brows-16.jpg', w: 1800, h: 1012 },
  { src: '/graphics/brows-17.jpg', w: 1800, h: 1350 },
  { src: '/graphics/brows-18.jpg', w: 1440, h: 1800 },
];

/** Efekty PMU ust — przed/po, wygojone (5 ujęć) */
export const LIPS = [
  { src: '/graphics/lips-01.jpg', w: 1206, h: 1497 },
  { src: '/graphics/lips-02.jpg', w: 1204, h: 1515 },
  { src: '/graphics/lips-03.jpg', w: 1206, h: 1497 },
  { src: '/graphics/lips-04.jpg', w: 1487, h: 1181 },
  { src: '/graphics/lips-05.jpg', w: 1613, h: 1206 },
];

/** Grafiki cennikowe (oryginalne materiały marki) */
export const CENNIK = {
  pmu: { src: '/graphics/cennik-pmu.jpg', w: 900, h: 1600 },
  refresh: { src: '/graphics/cennik-refresh.jpg', w: 900, h: 1600 },
  usuwanie: { src: '/graphics/cennik-usuwanie.jpg', w: 900, h: 1600 },
};

/** Skrót: pierwsze ujęcie danej grupy */
export const pick = (arr, i) => arr[i % arr.length];
