/* ============================================================
 * i18n/index.js — 多语言入口：t() 取词、语言探测与切换
 * 对应原单文件 §2「多语言」的编排层。
 * 词表数据按语言拆分在 zh.js / en.js / ja.js / es.js。
 * ============================================================ */
import { L_ZH } from './zh.js';
import { L_EN } from './en.js';
import { L_JA } from './ja.js';
import { L_ES } from './es.js';
import { save, saveAll } from '../systems/storage.js';
import { $ } from '../ui/dom.js';
import { sClick } from '../audio/sfx.js';

const I18N = { zh: L_ZH, en: L_EN, ja: L_JA, es: L_ES };

/** 语言下拉候选列表 */
export const LANGS = [
  { c: 'zh', n: '简体中文' },
  { c: 'en', n: 'English' },
  { c: 'ja', n: '日本語' },
  { c: 'es', n: 'Español' },
];

let LANG = 'zh';

/** 取词：先查当前语言，缺词回退中文，再回退 key；支持 {name} 占位替换 */
export function t(k, p) {
  let s = (I18N[LANG] && I18N[LANG][k] != null) ? I18N[LANG][k] : (I18N.zh[k] != null ? I18N.zh[k] : k);
  if (p) {
    for (const key in p) s = s.split('{' + key + '}').join(String(p[key]));
  }
  return s;
}

function applyI18n() {
  document.title = t('title');
  document.documentElement.lang = LANG;
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    el.textContent = t(el.dataset.i18n);
  });
}

function setLang(l) {
  LANG = l;
  save.lang = l;
  saveAll();
  applyI18n();
  renderLangList();
}

/** 渲染语言选择列表（#mLang 弹窗内容） */
export function renderLangList() {
  const box = $('langList');
  if (!box) return;
  box.innerHTML = '';
  for (const L of LANGS) {
    const b = document.createElement('button');
    b.className = 'btn ghost' + (LANG === L.c ? ' sel' : '');
    b.textContent = L.n;
    b.onclick = function () { sClick(); setLang(L.c); };
    box.appendChild(b);
  }
}

/** 启动引导：无存档语言时按浏览器语言探测，随后应用并刷新页面词条 */
export function initLang() {
  if (!save.lang) {
    const nav = (navigator.language || 'en').toLowerCase();
    save.lang = nav.indexOf('zh') === 0 ? 'zh' : nav.indexOf('ja') === 0 ? 'ja' : nav.indexOf('es') === 0 ? 'es' : 'en';
  }
  LANG = save.lang;
  applyI18n();
  renderLangList();
}
