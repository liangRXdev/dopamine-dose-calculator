'use strict';
// Characterization 情境矩陣：每個情境是一串 UI 操作，執行後擷取 snapshot。
// 名稱即為 fixture 的 key，請勿任意更名（會讓 golden 對不上）。

const RATE_VALUES = ['0.1', '1', '5', '10', '25', '60'];
const DOSE_VALUES = ['0.5', '1', '2', '5', '7.5', '10', '20', '25', '50'];
const WEIGHTS = ['0.5', '0.8', '2.5', '60', '70', '150', '250', '350'];

function buildScenarios() {
  const list = [];
  const add = (name, steps) => list.push({ name, steps });

  for (const conc of [0, 1, 2]) {
    for (const wt of WEIGHTS) {
      for (const v of RATE_VALUES) {
        add(`preset${conc}|rate|a=${v}|wt=${wt}`,
          [['conc', conc], ['mode', 'rate'], ['type', 'val-a', v], ['type', 'wt', wt]]);
      }
      for (const v of DOSE_VALUES) {
        add(`preset${conc}|dose|a=${v}|wt=${wt}`,
          [['conc', conc], ['mode', 'dose'], ['type', 'val-a', v], ['type', 'wt', wt]]);
      }
    }
  }

  // 自訂濃度（藥量 mg / 體積 mL）
  for (const [mg, ml] of [['250', '250'], ['200', '250'], ['1000', '50'], ['40', '50']]) {
    for (const wt of ['0.8', '60']) {
      add(`custom${mg}/${ml}|rate|a=5|wt=${wt}`,
        [['conc', 3], ['type', 'c-mg', mg], ['type', 'c-ml', ml], ['mode', 'rate'], ['type', 'val-a', '5'], ['type', 'wt', wt]]);
      add(`custom${mg}/${ml}|dose|a=5|wt=${wt}`,
        [['conc', 3], ['type', 'c-mg', mg], ['type', 'c-ml', ml], ['mode', 'dose'], ['type', 'val-a', '5'], ['type', 'wt', wt]]);
    }
  }

  // 無效輸入：空白、0、負值
  for (const mode of ['rate', 'dose']) {
    for (const a of ['', '0', '-1']) add(`invalid|${mode}|a=${a}|wt=60`, [['mode', mode], ['type', 'val-a', a], ['type', 'wt', '60']]);
    for (const wt of ['', '0', '-5']) add(`invalid|${mode}|a=5|wt=${wt}`, [['mode', mode], ['type', 'val-a', '5'], ['type', 'wt', wt]]);
  }

  // 狀態轉換：結果是否殘留
  const base = [['conc', 0], ['mode', 'rate'], ['type', 'val-a', '10'], ['type', 'wt', '60']];
  add('state|initial', []);
  add('state|switch-to-custom-empty', [...base, ['conc', 3]]);
  add('state|custom-mg-only', [...base, ['conc', 3], ['type', 'c-mg', '400']]);
  add('state|custom-zero-mg', [...base, ['conc', 3], ['type', 'c-mg', '0'], ['type', 'c-ml', '100']]);
  add('state|custom-cleared', [...base, ['conc', 3], ['type', 'c-mg', '400'], ['type', 'c-ml', '100'], ['type', 'c-ml', '']]);
  add('state|custom-then-preset', [...base, ['conc', 3], ['type', 'c-mg', '400'], ['type', 'c-ml', '100'], ['conc', 1]]);
  add('state|preset-then-custom-again', [...base, ['conc', 3], ['type', 'c-mg', '400'], ['type', 'c-ml', '100'], ['conc', 0], ['conc', 3]]);
  add('state|mode-switch-clears', [...base, ['mode', 'dose']]);
  add('state|mode-switch-then-type', [...base, ['mode', 'dose'], ['type', 'val-a', '5']]);
  add('state|clear-weight', [...base, ['type', 'wt', '']]);
  add('state|clear-value', [...base, ['type', 'val-a', '']]);

  // 浮點極端：合法 <input type=number> 字串造成溢位
  add('extreme|rate-overflow', [['mode', 'rate'], ['type', 'val-a', '1e308'], ['type', 'wt', '0.0001']]);
  add('extreme|dose-overflow', [['mode', 'dose'], ['type', 'val-a', '1e308'], ['type', 'wt', '1e10']]);

  // 區間邊界
  for (const v of ['4.99', '5', '9.99', '10', '20']) {
    add(`boundary|dose|a=${v}|wt=60`, [['conc', 0], ['mode', 'dose'], ['type', 'val-a', v], ['type', 'wt', '60']]);
  }
  add('boundary|rate|a=5.995|wt=60', [['conc', 0], ['mode', 'rate'], ['type', 'val-a', '5.995'], ['type', 'wt', '60']]);

  return list;
}

function runScenario(page, steps) {
  for (const [op, a, b] of steps) {
    if (op === 'conc') page.clickConc(a);
    else if (op === 'mode') page.setMode(a);
    else if (op === 'type') page.type(a, b);
    else throw new Error('unknown step ' + op);
  }
  return page.snapshot();
}

module.exports = { buildScenarios, runScenario };
