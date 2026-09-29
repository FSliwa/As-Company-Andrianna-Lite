/**
 * Typografia: w serwisie nie ma długiego myślnika (U+2014) – wszędzie półpauza „–” (U+2013),
 * we wszystkich językach (decyzja Filipa, 29.09). Wyjątek: src/data/pigments.json (dane ze sklepu;
 * zamiana przy odczycie w src/lib/pigments.js – sprawdzane poniżej).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = fileURLToPath(new URL('..', import.meta.url));
const SKIP = new Set(['data/pigments.json']);
const EXT = /\.(js|jsx|mjs|json|css|md)$/;
const EM_DASH = '\u2014';

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? files(p) : EXT.test(name) ? [p] : [];
  });
}

test('brak długiego myślnika w src/ (poza danymi sklepu)', () => {
  const bad = files(SRC)
    .filter((p) => !SKIP.has(relative(SRC, p).split('\\').join('/')))
    .filter((p) => readFileSync(p, 'utf8').includes(EM_DASH))
    .map((p) => relative(SRC, p));
  assert.deepEqual(bad, [], `Zamień długi myślnik (U+2014) na „–” w: ${bad.join(', ')}`);
});

test('opisy pigmentów po odczycie mają półpauzę, nie długi myślnik', async () => {
  const src = readFileSync(join(SRC, 'lib/pigments.js'), 'utf8');
  assert.ok(src.includes('withEnDash'), 'lib/pigments.js powinien normalizować myślniki przy odczycie');
  const raw = JSON.parse(readFileSync(join(SRC, 'data/pigments.json'), 'utf8'));
  const texts = raw.products.flatMap((p) => [p.shortDesc, p.description]).filter(Boolean);
  const normalized = texts.map((t) => t.replace(/\u2014/g, '\u2013'));
  assert.ok(normalized.every((t) => !t.includes(EM_DASH)));
});
