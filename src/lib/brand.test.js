/**
 * Marka serwisu: Babushkina Academy. Nazwa dawnej firmy klientki nie może pojawić się
 * nigdzie na stronie (prośba klientki z 30.09.2026) – node --test:
 *  - cały kod i treści w src/ (widoki, komponenty, dane, dokumenty, metadane tras) bez tej nazwy,
 *    jej domeny i identyfikatorów – także zapisanej z twardą spacją jako sekwencja (\u00a0, &nbsp;),
 *    z JSX-owym {' '} albo złamanej między wierszami (tak, jak zobaczy ją czytelnik),
 *  - reguły synchronizacji pigmentów (scripts/sync-pigments.mjs) usuwają znane zwroty
 *    z opisów sklepu, a to, czego nie obejmują, wyłapuje FORMER_BRAND_RE (blokada zapisu).
 * Wzorce i dane testowe zapisane bez dosłownej nazwy – wyszukiwanie w repozytorium jej nie znajduje.
 * Nazwy produktów (AS OPIUM, AS PRINCESS) zostają – to towary, które klientka sprzedaje.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { FORMER_BRAND_RE, htmlToLine, htmlToText, stripFormerBrand } from '../../scripts/sync-pigments.mjs';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXT = /\.(?:m?js|jsx|tsx?|json|css|md|svg|html|txt)$/;
/* nazwa (też z łącznikiem, bez spacji i w zapisie cyrylicą) oraz dawna domena sklepu */
const FORMER = /\bAS[\s_-]*COMPANY|LOVE\s*LINESS|АС[\s_-]*КОМПАН/iu;

/** Pliki tekstowe katalogu (rekurencyjnie). */
function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return files(full);
    return EXT.test(entry.name) ? [full] : [];
  });
}

/**
 * Tekst źródła tak, jak zobaczy go czytelnik strony: sekwencje \u00a0, \u{…}, \xa0 i encje
 * twardej spacji → znaki, JSX-owe {' '} → spacja. Bez tego nazwa zapisana z \u00a0 przechodziła
 * i test, i wyszukiwanie w repozytorium, a na stronie stała w całości. Znaki sterujące → spacja,
 * żeby nie przesuwać numerów wierszy.
 */
function readable(source) {
  const char = (hex, raw) => {
    const cp = parseInt(hex, 16);
    if (cp > 0x10ffff) return raw;
    return cp < 0x20 ? ' ' : String.fromCodePoint(cp);
  };
  return source
    .replace(/\\u\{([0-9a-f]{1,6})\}|\\u([0-9a-f]{4})|\\x([0-9a-f]{2})/gi, (raw, a, b, c) => char(a ?? b ?? c, raw))
    .replace(/&(?:nbsp|#160|#x0*a0);/gi, ' ')
    .replace(/\{[^\S\n]*(['"`])[^\S\n]*\1[^\S\n]*\}/g, ' ');
}

const FORMER_ALL = new RegExp(FORMER.source, 'giu');

/** Trafienia nazwy w pliku jako „wiersz: fragment” – `[\s_-]*` łapie też nazwę złamaną między wierszami. */
function formerHits(source) {
  const text = readable(source);
  const lines = text.split('\n');
  return [...text.matchAll(FORMER_ALL)].map((m) => {
    const line = text.slice(0, m.index).split('\n').length;
    return `${line}: „${lines[line - 1].trim().slice(0, 120)}”`;
  });
}

/* Nazwa złożona z części, żeby nie stała dosłownie w źródle. */
const FIRM = ['AS', 'COMPANY'].join(' ');
const [FIRM_A, FIRM_B] = FIRM.split(' ');

describe('marka Babushkina Academy', () => {
  test('kod i treści w src/ bez nazwy dawnej firmy klientki', () => {
    const hits = files(SRC).flatMap((file) =>
      formerHits(readFileSync(file, 'utf8')).map((hit) => `${path.relative(SRC, file)}:${hit}`)
    );
    assert.deepEqual(hits, [], `nazwa dawnej firmy klientki (${hits.length})`);
  });

  test('skan źródeł: twarda spacja jako sekwencja lub encja, {\' \'} i nazwa złamana między wierszami', () => {
    for (const source of [
      `'${FIRM_A}\\u00a0${FIRM_B}.'`,
      `${FIRM_A}\\u{A0}${FIRM_B}`,
      `${FIRM_A}\\xa0${FIRM_B}`,
      `${FIRM_A}&nbsp;${FIRM_B}`,
      `${FIRM_A}&#160;${FIRM_B}`,
      `${FIRM_A}{' '}${FIRM_B}`,
      `<p>\n  ${FIRM_A}\n  ${FIRM_B}\n</p>`,
    ])
      assert.equal(formerHits(source).length, 1, source);
    assert.deepEqual(formerHits(`wiersz\n${FIRM_A}\\u00a0${FIRM_B}`), [`2: „${FIRM_A}\u00a0${FIRM_B}”`]);
    for (const source of ['AS\\u00a0OPIUM', 'AS&nbsp;PRINCESS', `h${FIRM_A.toLowerCase()}\\u00a0${FIRM_B.toLowerCase()}`])
      assert.deepEqual(formerHits(source), [], source);
  });

  test('wzorzec łapie warianty nazwy, a nie zwykłe słowa', () => {
    for (const text of [FIRM, `${FIRM}™`, FIRM.toLowerCase().replace(' ', '-'), `${FIRM} LOVE${'LINESS'}`, ['АС', 'Компани'].join(' ')])
      assert.match(text, FORMER_BRAND_RE, text);
    // nazwa sklejona z poprzedzającą literą (zwykłe angielskie „h…”) – bez trafienia (granica słowa)
    for (const text of [`The salon h${FIRM.toLowerCase()} events`, 'AS OPIUM', 'AS PRINCESS', 'Babushkina Academy'])
      assert.doesNotMatch(text, FORMER_BRAND_RE, text);
    assert.equal(String(FORMER_BRAND_RE), String(FORMER), 'ten sam wzorzec w teście i w synchronizacji');
  });
});

describe('synchronizacja pigmentów: zwroty z nazwą dawnej firmy', () => {
  test('znane zwroty z opisów sklepu → poprawne zdania bez nazwy', () => {
    assert.equal(stripFormerBrand(`Pigmenty do makijażu permanentnego firmy ${FIRM}.`), 'Pigmenty do makijażu permanentnego.');
    assert.equal(
      stripFormerBrand(`Unikatowe pigmenty, niespotykane na rynku, pochodzą od firmy ${FIRM}.`),
      'Unikatowe pigmenty, niespotykane na rynku.'
    );
    assert.equal(
      stripFormerBrand(`Opracowano we współpracy z ${FIRM}™ i Anastasią Spiridonową`),
      'Opracowano we współpracy z Anastasią Spiridonową'
    );
    assert.equal(stripFormerBrand('Opium Colors – ulepszona wersja, nowe kolory!'), 'Opium Colors – ulepszona wersja, nowe kolory!');
  });

  test('HTML ze sklepu: reguły działają po zdjęciu tagów i encji, akapity zostają', () => {
    assert.equal(
      htmlToText(`<p>Pigmenty do makijażu permanentnego firmy ${FIRM}.</p><p>Opium Colors&nbsp;– nowe kolory!</p>`),
      'Pigmenty do makijażu permanentnego.\n\nOpium Colors – nowe kolory!'
    );
    assert.equal(htmlToLine(`<strong>Opracowano we współpracy z ${FIRM}&trade; i Anastasią Spiridonową</strong>`), 'Opracowano we współpracy z Anastasią Spiridonową');
  });

  test('nieznany zwrot zostaje w tekście – wyłapuje go blokada zapisu', () => {
    const text = stripFormerBrand(`Nowa paleta ${FIRM} na sezon.`);
    assert.match(text, FORMER_BRAND_RE);
  });
});
