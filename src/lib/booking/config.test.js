import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { TREATMENTS, TREATMENT_IDS, getTreatment, shownDurationMin } from './config.js';
import { PRICING_PMU, PRICING_REFRESH, PRICING_REMOVAL } from '../site.js';

/* Dane zabiegów w rezerwacji po treściach z briefu klientki (decyzje D2, D5, D6). */
describe('zabiegi w rezerwacji – nazwy, ceny i warunki', () => {
  test('D2: nazwy wg briefu, identyfikatory bez zmian (linki ?zabieg= działają)', () => {
    assert.deepEqual(TREATMENT_IDS, [
      'super-natural-brows',
      'perfect-powder-brows',
      'perfect-lips',
      'perfect-eyeliners',
      'korekta',
      'odswiezenie',
      'usuwanie',
    ]);
    assert.equal(getTreatment('perfect-powder-brows').name, 'Perfect Brows');
    assert.equal(getTreatment('perfect-eyeliners').name, 'Perfect Eyes');
    assert.equal(getTreatment('perfect-eyeliners').hint, 'Pigmentacja linii rzęs');
    for (const t of TREATMENTS) assert.doesNotMatch(t.name, /Eyeliner|Powder/);
  });

  test('ceny technik = cennik PMU (po id pozycji)', () => {
    for (const item of PRICING_PMU.items) {
      assert.equal(getTreatment(item.id).price, item.price, item.id);
    }
  });

  test('D5: usuwanie – cena wyjściowa bez stawki „dla moich klientek”, stawka 100 zł osobno z warunkiem', () => {
    const own = PRICING_REMOVAL.items.filter((i) => i.forOwnClients);
    assert.equal(own.length, 1);
    assert.equal(own[0].price, '100 zł');
    const t = getTreatment('usuwanie');
    assert.equal(t.price, 'od 200 zł');
    assert.match(t.priceNote, /100 zł – usuwanie brwi dla naszych klientek/);
  });

  test('D5: odświeżenie – warunek „dla klientek, którym wykonałyśmy makijaż permanentny” przy cenie', () => {
    const t = getTreatment('odswiezenie');
    assert.equal(t.price, 'od 850 zł');
    assert.ok(t.priceNote.startsWith(PRICING_REFRESH.condition));
    assert.match(PRICING_REFRESH.condition, /którym wykonałyśmy makijaż permanentny/);
  });

  test('D5: korekta – termin z briefu (od miesiąca do 3 miesięcy)', () => {
    assert.equal(getTreatment('korekta').priceNote, 'Od miesiąca do 3 miesięcy od zabiegu');
  });

  test('D6: klientka widzi tylko czas ze źródła (Super Natural Brows), reszta to robocze blokady', () => {
    const shown = TREATMENTS.filter((t) => shownDurationMin(t) !== null).map((t) => t.id);
    assert.deepEqual(shown, ['super-natural-brows']);
    assert.equal(shownDurationMin(getTreatment('super-natural-brows')), 120);
    assert.equal(shownDurationMin(getTreatment('perfect-lips')), null);
    assert.equal(shownDurationMin(null), null);
    // blokady w kalendarzu nadal liczone z durationMin
    for (const t of TREATMENTS) assert.ok(t.durationMin > 0, t.id);
  });
});
