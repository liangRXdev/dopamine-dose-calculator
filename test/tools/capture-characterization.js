'use strict';
// 產生 characterization golden：對指定版本的 index.html 跑完整情境矩陣。
// 用法：
//   git show 2d24599:index.html > /tmp/orig.html
//   node test/tools/capture-characterization.js /tmp/orig.html > test/fixtures/characterization.json
// golden 必須由重構前（2d24599）的 index.html 產生，之後不應重新擷取。

const path = require('path');
const { loadPage } = require('../helpers/dom-harness');
const { buildScenarios, runScenario } = require('../helpers/scenarios');

const htmlPath = path.resolve(process.argv[2] || path.join(__dirname, '..', '..', 'index.html'));
const out = {};
for (const s of buildScenarios()) {
  out[s.name] = runScenario(loadPage(htmlPath, { baseDir: path.join(__dirname, '..', '..') }), s.steps);
}
process.stdout.write(JSON.stringify(out, null, 1) + '\n');
