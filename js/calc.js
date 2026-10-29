/*
 * Dopamine 劑量換算核心（純函式，無 DOM 相依）
 * 瀏覽器：<script src="js/calc.js"> → window.DopamineCalc
 * Node：  require('./js/calc.js')
 *
 * 單位：dose mcg/kg/min；rate mL/hr；wt kg；conc mg/mL（內部 ×1000 轉 mcg/mL）
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DopamineCalc = api;
})(this, function () {
  'use strict';

  var ZONES = [
    { min:0,  max:5,        cls:'zone-dopa',  name:'Dopamine 受體（利尿）',   effect:'腎血流↑、尿量↑',                warn:'低劑量 Dopamine 不建議單獨用於腎臟保護（缺乏充分臨床證據）。\n注意：部分文獻將 Dopa 受體切點設為 <2 mcg/kg/min，各來源定義不一；劑量區間為參考值，非絕對切點，仍應依個別病人臨床反應調整。' },
    { min:5,  max:10,       cls:'zone-beta',  name:'Beta-1 受體（強心）',     effect:'心跳↑、心收縮↑、CO↑、腎血流↑', warn:null },
    { min:10, max:Infinity, cls:'zone-alpha', name:'Alpha 受體（升壓）',      effect:'血管收縮、SVR↑、血壓↑',          warn:'高劑量升壓效果強，注意心律不整及末梢缺血風險' }
  ];

  var REF = [
    { label:'Dopa（利尿）',   lo:1,  hi:5  },
    { label:'Beta-1（強心）', lo:5,  hi:10 },
    { label:'Alpha（升壓）',  lo:10, hi:20 }
  ];

  // mL/hr = dose(mcg/kg/min) × kg × 60 ÷ (mg/mL × 1000)
  function mcgToMl(dose, wt, conc){ return (dose * wt * 60) / (conc * 1000); }
  // mcg/kg/min = mL/hr × (mg/mL × 1000) ÷ (kg × 60)
  function mlToMcg(rate, wt, conc){ return (rate * conc * 1000) / (wt * 60); }

  // 藥量 (mg) ÷ 體積 (mL)；任一非正數或非數字 → NaN（代表濃度無效）
  function concFromMgMl(mg, ml){
    mg = parseFloat(mg); ml = parseFloat(ml);
    return (mg > 0 && ml > 0) ? mg / ml : NaN;
  }

  function findZone(dose){
    for (var i = 0; i < ZONES.length; i++) {
      if (dose >= ZONES[i].min && dose < ZONES[i].max) return ZONES[i];
    }
    return ZONES[2];
  }

  /*
   * mode 'rate'：a = mL/hr → 求 mcg/kg/min
   * mode 'dose'：a = mcg/kg/min → 求 mL/hr
   * 輸入無效時回傳 null（UI 顯示「輸入數值後自動顯示結果」）
   */
  function compute(mode, a, wt, conc){
    if(!a || !wt || a <= 0 || wt <= 0 || !(conc > 0)) return null;

    var dose, displayVal, displayUnit;
    if(mode === 'rate'){
      dose = mlToMcg(a, wt, conc);
      displayVal  = dose.toFixed(2);
      displayUnit = 'mcg / kg / min';
    } else {
      dose = a;
      displayVal  = mcgToMl(a, wt, conc).toFixed(1);
      displayUnit = 'mL / hr';
    }

    var ref = REF.map(function(t){
      var lo = mcgToMl(t.lo, wt, conc), hi = mcgToMl(t.hi, wt, conc);
      return {
        label: t.label,
        doseText: t.lo + '–' + t.hi,
        rateText: lo.toFixed(1) + ' – ' + hi.toFixed(1),
        current: dose >= t.lo && dose < t.hi
      };
    });

    return { dose: dose, displayVal: displayVal, displayUnit: displayUnit, zone: findZone(dose), ref: ref };
  }

  return {
    ZONES: ZONES, REF: REF,
    mcgToMl: mcgToMl, mlToMcg: mlToMcg,
    concFromMgMl: concFromMgMl, findZone: findZone, compute: compute
  };
});
