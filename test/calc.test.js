'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../js/calc.js');

const close = (a, b, rel = 1e-12) => assert.ok(Math.abs(a - b) <= rel * Math.max(1, Math.abs(b)), `${a} ≉ ${b}`);

test('mcgToMl：手算對照（5 mcg/kg/min × 60 kg × 60 ÷ 3000 mcg/mL = 6 mL/hr）', () => {
  assert.equal(C.mcgToMl(5, 60, 3), 6);
  assert.equal(C.mcgToMl(10, 70, 1.6), 26.25);
  close(C.mcgToMl(2, 0.8, 3.2), 0.03);
});

test('mlToMcg：手算對照（10 mL/hr × 3000 ÷ (60 × 60) = 8.333…）', () => {
  close(C.mlToMcg(10, 60, 3), 25 / 3);
  close(C.mlToMcg(26.25, 70, 1.6), 10);
});

test('正反向一致：dose → rate → dose 回到原值', () => {
  for (const conc of [0.8, 1.6, 3, 3.2, 20])
    for (const wt of [0.4, 0.8, 3, 60, 150, 300, 350])
      for (const dose of [0.5, 2, 5, 10, 20, 50]) {
        close(C.mlToMcg(C.mcgToMl(dose, wt, conc), wt, conc), dose);
        close(C.mcgToMl(C.mlToMcg(dose, wt, conc), wt, conc), dose);
      }
});

test('濃度：mg/mL 經 ×1000 轉 mcg/mL（1 mg/mL、1 kg、1 mcg/kg/min → 0.06 mL/hr）', () => {
  close(C.mcgToMl(1, 1, 1), 0.06);
  assert.equal(C.concFromMgMl('600', '200'), 3);
  assert.equal(C.concFromMgMl(400, 250), 1.6);
  assert.equal(C.concFromMgMl(800, 250), 3.2);
});

test('concFromMgMl：0、負值、空白、非數字 → NaN', () => {
  for (const [mg, ml] of [[0, 100], [400, 0], [-1, 100], [400, -5], ['', '100'], ['400', ''], ['abc', '1']])
    assert.ok(Number.isNaN(C.concFromMgMl(mg, ml)), `${mg}/${ml}`);
});

test('findZone：[min, max) 半開區間', () => {
  assert.equal(C.findZone(4.99).cls, 'zone-dopa');
  assert.equal(C.findZone(5).cls, 'zone-beta');
  assert.equal(C.findZone(10).cls, 'zone-alpha');
  assert.equal(C.findZone(50).cls, 'zone-alpha');
});

test('compute：無效輸入回傳 null', () => {
  for (const [a, wt] of [[NaN, 60], [0, 60], [-1, 60], [5, NaN], [5, 0], [5, -5]]) {
    assert.equal(C.compute('rate', a, wt, 3), null);
    assert.equal(C.compute('dose', a, wt, 3), null);
  }
  assert.equal(C.compute('dose', 5, 60, 0), null);
  assert.equal(C.compute('dose', 5, 60, -1), null);
});
