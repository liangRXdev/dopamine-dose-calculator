'use strict';
// 零相依的最小 DOM 模擬：只實作 index.html 內嵌腳本實際用到的 API，
// 讓 node --test 能直接驅動整頁邏輯（按鈕、輸入、結果區），不需 jsdom / 瀏覽器。

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ENTITIES = { '&middot;': '·', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&nbsp;': ' ' };
function decode(s) { return s.replace(/&[a-z]+;/g, (m) => ENTITIES[m] || m); }

function parseAttrs(src) {
  const attrs = {};
  const re = /([\w:-]+)(?:\s*=\s*"([^"]*)")?/g;
  let m;
  while ((m = re.exec(src))) attrs[m[1]] = m[2] === undefined ? '' : m[2];
  return attrs;
}

function parseStyle(s) {
  const style = {};
  (s || '').split(';').forEach((decl) => {
    const i = decl.indexOf(':');
    if (i < 0) return;
    const k = decl.slice(0, i).trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    style[k] = decl.slice(i + 1).trim();
  });
  return style;
}

class ClassList {
  constructor(el) { this.el = el; }
  _list() { return this.el.className.split(/\s+/).filter(Boolean); }
  contains(c) { return this._list().includes(c); }
  add(c) { const l = this._list(); if (!l.includes(c)) l.push(c); this.el.className = l.join(' '); }
  remove(c) { this.el.className = this._list().filter((x) => x !== c).join(' '); }
  toggle(c, force) {
    const want = force === undefined ? !this.contains(c) : !!force;
    if (want) this.add(c); else this.remove(c);
    return want;
  }
}

class El {
  constructor(tag, attrs, text) {
    attrs = attrs || {};
    this.tagName = tag.toUpperCase();
    this.attrs = attrs;
    this.id = attrs.id || '';
    this.className = attrs.class || '';
    this.classList = new ClassList(this);
    this.dataset = {};
    Object.keys(attrs).forEach((k) => {
      if (k.startsWith('data-')) this.dataset[k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = attrs[k];
    });
    this.style = parseStyle(attrs.style);
    this.value = attrs.value || '';
    this.placeholder = attrs.placeholder || '';
    this.step = attrs.step || '';
    this.textContent = text || '';
    this.children = [];
    this._innerHTML = '';
    this._listeners = {};
  }
  get innerHTML() { return this._innerHTML; }
  set innerHTML(v) { this._innerHTML = v; this.children = []; }
  appendChild(c) { this.children.push(c); return c; }
  addEventListener(type, fn) { (this._listeners[type] = this._listeners[type] || []).push(fn); }
}

function buildDocument(html) {
  const byId = {};
  const all = [];
  const body = html.slice(html.indexOf('<body'));
  const tagRe = /<([a-zA-Z][\w-]*)((?:\s+[\w:-]+(?:\s*=\s*"[^"]*")?)*)\s*\/?>([^<]*)/g;
  let m;
  while ((m = tagRe.exec(body))) {
    const attrs = parseAttrs(m[2]);
    if (!attrs.id && !attrs.class) continue;
    const el = new El(m[1], attrs, decode(m[3]).trim());
    all.push(el);
    if (attrs.id) byId[attrs.id] = el;
  }
  return {
    getElementById: (id) => byId[id] || null,
    querySelectorAll: (sel) => {
      if (!/^\.[\w-]+$/.test(sel)) throw new Error('fake DOM 僅支援 .class 選擇器: ' + sel);
      return all.filter((e) => e.classList.contains(sel.slice(1)));
    },
    createElement: (tag) => new El(tag),
  };
}

function loadPage(htmlPath, opts) {
  opts = opts || {};
  const html = opts.html !== undefined ? opts.html : fs.readFileSync(htmlPath, 'utf8');
  const baseDir = opts.baseDir || path.dirname(htmlPath);
  const document = buildDocument(html);
  const ctx = { document, console };
  ctx.window = ctx;
  vm.createContext(ctx);

  const scriptRe = /<script([^>]*)>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = scriptRe.exec(html))) {
    const attrs = parseAttrs(m[1]);
    if (attrs.src) {
      const file = path.join(baseDir, attrs.src);
      vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
    } else {
      vm.runInContext(m[2], ctx, { filename: htmlPath + '#inline' });
    }
  }

  const $ = (id) => {
    const el = document.getElementById(id);
    if (!el) throw new Error('找不到元素 #' + id);
    return el;
  };
  const runAttr = (el, name) => {
    if (el.attrs[name]) vm.runInContext('(function(){' + el.attrs[name] + '\n})', ctx).call(el);
  };
  const page = {
    ctx, document, $,
    click(el) { runAttr(el, 'onclick'); },
    clickConc(idx) { page.click(document.querySelectorAll('.conc-btn')[idx]); },
    setMode(m) { page.click($(m === 'rate' ? 'btn-rate' : 'btn-dose')); },
    type(id, value) {
      const el = $(id);
      el.value = String(value);
      runAttr(el, 'oninput');
      (el._listeners.input || []).forEach((fn) => fn.call(el, { target: el }));
    },
    snapshot() {
      const shown = $('result-area').style.display === 'block';
      const snap = {
        concDisplay: $('conc-display').textContent,
        resultShown: shown,
        emptyHintShown: $('empty-hint').style.display !== 'none',
      };
      if (!shown) return snap;
      const warnShown = $('warn-box').style.display === 'block';
      Object.assign(snap, {
        resVal: $('res-val').textContent,
        resUnit: $('res-unit').textContent,
        pillClass: $('zone-pill').className,
        zoneName: $('zone-name').textContent,
        zoneEffect: $('zone-effect').textContent,
        warnShown,
        warnText: warnShown ? $('warn-text').textContent : null,
        refRows: $('ref-rows').children.map((tr) => ({ cls: tr.className, html: tr.innerHTML })),
      });
      return snap;
    },
  };
  return page;
}

module.exports = { loadPage };
