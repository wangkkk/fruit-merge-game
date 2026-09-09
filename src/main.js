/* ============================================================
 * main.js — 入口引导（boot）
 * 对应原单文件 §18「启动」IIFE 与全局错误兜底。
 * ES Module 依赖图中，各模块文件按 import 顺序先完成自身求值：
 * - ui/panels / ui/dialogs / ui/input 在顶层完成 DOM 按钮接线，
 *   因此 boot() 只需做：语言初始化 -> HUD/库存初始渲染 -> 开局
 *   -> 首次帮助弹窗 -> 启动主循环。
 * ============================================================ */
import { inject } from '@vercel/analytics';
import { initLang } from './i18n/index.js';
import { $, toast, showModal } from './ui/dom.js';
import { renderBag } from './ui/tools.js';
import { resetRun } from './core/game.js';
import { save, saveAll } from './systems/storage.js';
import { frame } from './core/loop.js';

/* 依赖各模块顶层的按钮接线（顺序无硬性要求，均先于本文件求值） */
import './ui/panels.js';
import './ui/dialogs.js';
import './ui/input.js';

/* 原 §18：全局错误兜底 toast（避免白屏无反馈） */
window.addEventListener('error', function (e) {
  try { toast('⚠️ ' + e.message, 3000); } catch (_) { /* 异常时不再递归 */ }
});

/* Initialize Vercel Web Analytics */
inject();

function boot() {
  /* 语言：无存档时按浏览器探测（initLang 内部已处理）并刷新界面词条 */
  initLang();

  $('btnMute').textContent = save.mute ? '🔇' : '🔊';
  renderBag();
  resetRun();
  saveAll();

  if (!save.seen) {
    save.seen = 1;
    saveAll();
    showModal('mHelp');
  }

  requestAnimationFrame(frame);
}

boot();
