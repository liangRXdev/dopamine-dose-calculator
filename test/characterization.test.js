'use strict';
// 鎖住重構前（2d24599）整頁輸出。任何與 golden 不同的情境都必須明列於
// fixtures/intended-changes.json（key = 情境名稱，value = 對應的 bug 編號與原因），
// 且清單中的情境必須真的有變化——兩個方向都嚴格比對。

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { loadPage } = require('./helpers/dom-harness');
const { buildScenarios, runScenario } = require('./helpers/scenarios');
const golden = require('./fixtures/characterization.json');
const intended = require('./fixtures/intended-changes.json');

const HTML = path.join(__dirname, '..', 'index.html');
const scenarios = buildScenarios();

test('情境矩陣與 golden 一一對應', () => {
  assert.deepEqual(scenarios.map((s) => s.name).sort(), Object.keys(golden).sort());
  for (const name of Object.keys(intended)) assert.ok(name in golden, '未知情境: ' + name);
});

// B1（小數值精度）只允許「數字更精確」：版面與其他欄位不變，且新值落在舊值的捨入區間內
const NUM = /\d+(?:\.\d+)?(?:e[-+]?\d+)?/g;
function textOfNumbers(snap) {
  return [snap.resVal].concat(snap.refRows.map((r) => r.html)).join('|');
}
function assertOnlyPrecisionRefined(actual, old) {
  const strip = (o) => Object.assign({}, o, { resVal: null, refRows: o.refRows.map((r) => ({ cls: r.cls, html: r.html.replace(NUM, '#') })) });
  assert.deepEqual(strip(actual), strip(old), 'B1 變更不得影響數字以外的輸出');
  const nNew = textOfNumbers(actual).match(NUM);
  const nOld = textOfNumbers(old).match(NUM);
  assert.equal(nNew.length, nOld.length);
  let changed = 0;
  nNew.forEach((n, i) => {
    if (n === nOld[i]) return;
    changed++;
    const decimals = (nOld[i].split('.')[1] || '').length;
    // 新值須落在舊值的捨入區間內（不直接比 toFixed，避免 0.35→0.3 的雙重捨入誤判）
    const halfStep = 0.5 * Math.pow(10, -decimals) + 0.5 * Math.pow(10, -decimals - 2);
    assert.ok(Math.abs(Number(n) - Number(nOld[i])) <= halfStep, `${n} 應在舊值 ${nOld[i]} 的捨入區間內`);
    assert.ok(Number(n) < Math.pow(10, 1 - decimals), `${n} 不在 B1 門檻內`);
  });
  assert.ok(changed > 0);
}

for (const s of scenarios) {
  test('characterization: ' + s.name, () => {
    const actual = runScenario(loadPage(HTML), s.steps);
    if (s.name in intended && intended[s.name].startsWith('B1')) {
      assertOnlyPrecisionRefined(actual, golden[s.name]);
    } else if (s.name in intended) {
      assert.notDeepEqual(actual, golden[s.name], `列為刻意變更但輸出與 golden 相同（${intended[s.name]}）`);
    } else {
      assert.deepEqual(actual, golden[s.name]);
    }
  });
}
