'use strict';
// UI 狀態轉換：切換濃度 / 模式 / 清空欄位後不得殘留以舊濃度算出的結果
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { loadPage } = require('./helpers/dom-harness');

const HTML = path.join(__dirname, '..', 'index.html');
const CUSTOM_PROMPT = '自訂 · 請輸入藥量與溶液量';

function withRateResult() {
  const p = loadPage(HTML);
  p.clickConc(0); p.setMode('rate'); p.type('val-a', '10'); p.type('wt', '60');
  assert.equal(p.snapshot().resVal, '8.33'); // 600/200 前提
  return p;
}

function assertNoResult(p, header) {
  const s = p.snapshot();
  assert.equal(s.resultShown, false, '結果區應隱藏，實得 ' + s.resVal);
  assert.equal(s.emptyHintShown, true);
  if (header) assert.equal(s.concDisplay, header);
}

test('B2 切到「自訂」但欄位空白：不得沿用 3 mg/mL 的舊結果', () => {
  const p = withRateResult();
  p.clickConc(3);
  assertNoResult(p, CUSTOM_PROMPT);
});

test('B2 自訂只填藥量：濃度未定，不顯示結果', () => {
  const p = withRateResult();
  p.clickConc(3); p.type('c-mg', '400');
  assertNoResult(p, CUSTOM_PROMPT);
});

test('B2 自訂藥量 0 mg（濃度 0）：不顯示結果、無除以零', () => {
  const p = withRateResult();
  p.clickConc(3); p.type('c-mg', '0'); p.type('c-ml', '100');
  assertNoResult(p, CUSTOM_PROMPT);
});

test('B2 自訂體積 0 / 負值：不顯示結果', () => {
  for (const ml of ['0', '-100']) {
    const p = withRateResult();
    p.clickConc(3); p.type('c-mg', '400'); p.type('c-ml', ml);
    assertNoResult(p, CUSTOM_PROMPT);
  }
});

test('B2 自訂濃度清空其中一欄：撤回結果（不可停留在 4 mg/mL）', () => {
  const p = withRateResult();
  p.clickConc(3); p.type('c-mg', '400'); p.type('c-ml', '100');
  assert.equal(p.snapshot().resVal, '11.11');
  p.type('c-ml', '');
  assertNoResult(p, CUSTOM_PROMPT);
});

test('B2 補齊自訂濃度後恢復計算', () => {
  const p = withRateResult();
  p.clickConc(3); p.type('c-mg', '400');
  p.type('c-ml', '100');
  const s = p.snapshot();
  assert.equal(s.resultShown, true);
  assert.equal(s.resVal, '11.11');
  assert.equal(s.concDisplay, '自訂 · 4.000 mg/mL');
});

test('自訂 → 預設：立即改用預設濃度', () => {
  const p = withRateResult();
  p.clickConc(3); p.type('c-mg', '400'); p.type('c-ml', '100');
  p.clickConc(1);
  const s = p.snapshot();
  assert.equal(s.concDisplay, '400 mg / 250 mL · 1.600 mg/mL');
  assert.equal(s.resVal, '4.44');
});

test('切換換算方向：清空輸入並隱藏結果', () => {
  const p = withRateResult();
  p.setMode('dose');
  assert.equal(p.$('val-a').value, '');
  assertNoResult(p);
  p.type('val-a', '5');
  assert.equal(p.snapshot().resVal, '6.0');
  assert.equal(p.snapshot().resUnit, 'mL / hr');
});

test('清空體重或劑量：隱藏結果', () => {
  let p = withRateResult(); p.type('wt', ''); assertNoResult(p);
  p = withRateResult(); p.type('val-a', ''); assertNoResult(p);
});
