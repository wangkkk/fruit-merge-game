/* ============================================================
 * dom.js — DOM 快捷函数、toast 与弹窗开关记账
 * 对应原单文件 §5 工具函数中的 $ / toast / showModal / hideModal。
 * ============================================================ */
import { S } from '../core/state.js';

/** 按 id 取元素 */
export function $(id) {
  return document.getElementById(id);
}

/** 轻提示浮层 */
export function toast(s, ms) {
  const d = document.createElement('div');
  d.className = 'toast';
  d.textContent = s;
  $('toasts').appendChild(d);
  requestAnimationFrame(function () { d.classList.add('on'); });
  setTimeout(function () {
    d.classList.remove('on');
    setTimeout(function () { d.remove(); }, 350);
  }, ms || 1800);
}

/* 弹窗开关带防重入保护：同一弹窗不会重复计数，未打开时不会误扣计数 */
export function showModal(id) {
  var el = $(id);
  if (el.classList.contains('on')) return;
  S.modalN++;
  el.classList.add('on');
}

export function hideModal(id) {
  var el = $(id);
  if (!el.classList.contains('on')) return;
  el.classList.remove('on');
  S.modalN = Math.max(0, S.modalN - 1);
}
