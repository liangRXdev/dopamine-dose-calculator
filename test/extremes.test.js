'use strict';
// 極端值：結果不得出現 NaN、Infinity、負值；無效輸入不顯示結果
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const C = require('../js/calc.js');
const { loadPage } = require('./helpers/dom-harness');

const HTML = path.join(__dirname, '..', 'index.html');

function run(mode, a, wt, concIdx = 0) {
  const p = loadPage(HTML);
  p.clickConc(concIdx); p.setMode(mode); p.type('val-a', a); p.type('wt', wt);
  return p.snapshot();
}

// 畫面上所有數字字串：主結果 + 對照表 mL/hr 欄
function shownNumbers(s) {
  const nums = [s.resVal];
  for (const r of s.refRows) {
    const cell = r.html.match(/<td>([^<]*)<\/td>$/)[1];
    nums.push(...cell.split(' – '));
  }
  return nums;
}

function assertSaneNumbers(s, label) {
  assert.equal(s.resultShown, true, label + ' 應顯示結果');
  for (const n of shownNumbers(s)) {
    assert.match(n, /^\d+(\.\d+)?$/, `${label}：非正常數字 "${n}"`);
    assert.ok(Number.isFinite(Number(n)) && Number(n) >= 0, `${label}：${n}`);
  }
}

test('體重 0 / 負值 / 空白：不顯示結果', () => {
  for (const mode of ['rate', 'dose'])
    for (const wt of ['0', '-5', '-0.5', ''])
      assert.equal(run(mode, '5', wt).resultShown, false, `${mode} wt=${wt}`);
});

test('劑量或速率 0 / 負值 / 空白：不顯示結果', () => {
  for (const mode of ['rate', 'dose'])
    for (const a of ['0', '-1', ''])
      assert.equal(run(mode, a, '60').resultShown, false, `${mode} a=${a}`);
});

test('濃度 0（自訂 0 mg 或 0 mL）：不顯示結果、compute 回傳 null', () => {
  assert.equal(C.compute('rate', 10, 60, 0), null);
  assert.equal(C.compute('dose', 5, 60, 0), null);
  for (const [mg, ml] of [['0', '100'], ['400', '0']]) {
    const p = loadPage(HTML);
    p.clickConc(3); p.type('c-mg', mg); p.type('c-ml', ml); p.setMode('dose'); p.type('val-a', '5'); p.type('wt', '60');
    assert.equal(p.snapshot().resultShown, false, `${mg}/${ml}`);
  }
});

test('體重 >300 kg：數值正常（是否警示屬待決）', () => {
  for (const wt of ['301', '350', '500']) {
    assertSaneNumbers(run('dose', '5', wt), `dose wt=${wt}`);
    assertSaneNumbers(run('rate', '10', wt), `rate wt=${wt}`);
  }
  assert.equal(run('dose', '5', '350').resVal, '35.0');
});

test('劑量 >20 mcg/kg/min：數值正常、歸 Alpha 區（上限警示屬待決）', () => {
  for (const a of ['20.5', '25', '50']) {
    const s = run('dose', a, '60');
    assertSaneNumbers(s, `dose=${a}`);
    assert.equal(s.pillClass, 'zone-pill zone-alpha');
  }
  assert.equal(run('dose', '50', '60').resVal, '60.0');
});

test('B3 浮點溢位（合法 number 字串）：不得顯示 Infinity', () => {
  assert.equal(C.compute('rate', 1e308, 0.0001, 3), null);
  assert.equal(C.compute('dose', 1e308, 1e10, 3), null);
  assert.equal(run('rate', '1e308', '0.0001').resultShown, false);
  assert.equal(run('dose', '1e308', '1e10').resultShown, false);
});
