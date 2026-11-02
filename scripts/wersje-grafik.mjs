/**
 * Wersja w adresach grafik: dopisuje „?v=<skrót treści pliku>” do każdego '/graphics/…' w src/lib/media.js.
 *
 * Po co: /graphics ma w przeglądarce cache 7 dni (next.config.mjs). Podmienione zdjęcie o tej samej
 * nazwie (np. nowe zdjęcia od Kariny z 30.10.2026) przeglądarka pokazywałaby dopiero po tygodniu –
 * nowy skrót w adresie wymusza pobranie nowej wersji, a niezmienione pliki zostają w cache.
 *
 * Uruchamiać po każdej zmianie grafik (po scripts/przygotuj-grafiki.py i aktualizacji media.js):
 *   node scripts/wersje-grafik.mjs
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'src/lib/media.js';
let src = readFileSync(FILE, 'utf8');
let count = 0;
src = src.replace(/'\/graphics\/([^'?]+)(?:\?v=[0-9a-f]+)?'/g, (_, name) => {
  const hash = createHash('md5').update(readFileSync(`public/graphics/${name}`)).digest('hex').slice(0, 8);
  count += 1;
  return `'/graphics/${name}?v=${hash}'`;
});
writeFileSync(FILE, src);
console.log(`media.js: ${count} adresów z wersją`);
