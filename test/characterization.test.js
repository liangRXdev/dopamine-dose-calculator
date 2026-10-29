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

for (const s of scenarios) {
  test('characterization: ' + s.name, () => {
    const actual = runScenario(loadPage(HTML), s.steps);
    if (s.name in intended) {
      assert.notDeepEqual(actual, golden[s.name], `列為刻意變更但輸出與 golden 相同（${intended[s.name]}）`);
    } else {
      assert.deepEqual(actual, golden[s.name]);
    }
  });
}
